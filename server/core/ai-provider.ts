/**
 * AI Provider - Real DeepSeek API Integration
 * SOLID: Liskov Substitution Principle - swappable implementations
 * Purpose: Abstract AI service with real API + fallback
 */

import type { IAIProvider, AIResponse, IDeepSeekConfig } from './interfaces';
import { logger } from '../logger';
import { FaultDomain, executeInFaultDomain } from './error-handler';

/**
 * Real DeepSeek API Provider
 * Production-grade implementation with proper error handling
 */
export class DeepSeekProvider implements IAIProvider {
  name = 'DeepSeek';
  private config: IDeepSeekConfig;
  private faultDomain: FaultDomain;
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(config: IDeepSeekConfig) {
    this.config = {
      timeout: 30000,
      retryCount: 3,
      enableFallback: true,
      ...config
    };
    this.faultDomain = new FaultDomain('DeepSeekAPI');

    if (!this.config.apiKey) {
      logger.warn('DeepSeek API key not configured', { provider: this.name });
    }
  }

  async isAvailable(): Promise<boolean> {
    return (!!this.config.apiKey) && (await this.faultDomain.isHealthy());
  }

  /**
   * Generate brand content using DeepSeek API
   * Real API integration with proper error handling
   */
  async generateBrandContent(
    prompt: string,
    context?: any
  ): Promise<AIResponse> {
    const startTime = Date.now();

    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        if (!this.config.apiKey) {
          throw new Error('DeepSeek API key not configured');
        }

        const systemPrompt = this.buildSystemPrompt(context);
        const response = await this.callAPI(prompt, systemPrompt);
        
        return {
          content: response,
          source: 'api',
          confidence: 0.95,
          processingTime: Date.now() - startTime
        };
      },
      async () => {
        logger.info('Using fallback for brand content generation', { provider: this.name });
        return {
          content: this.generateFallbackContent(prompt, context),
          source: 'fallback',
          confidence: 0.7,
          processingTime: Date.now() - startTime
        };
      }
    );
  }

  /**
   * Enhance brand with AI analysis
   */
  async enhanceBrand(data: any): Promise<any> {
    const prompt = `Analyze and enhance this brand information:
Brand Name: ${data.name}
Industry: ${data.industry}
Description: ${data.description}
Target Audience: ${data.targetAudience}

Provide marketing content, taglines, and recommendations.`;

    const response = await this.generateBrandContent(prompt, {
      industry: data.industry,
      audience: data.targetAudience
    });

    return {
      ...data,
      aiEnhanced: response.content,
      confidenceScore: response.confidence,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Call DeepSeek API with retry logic
   */
  private async callAPI(prompt: string, systemPrompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= (this.config.retryCount || 3); attempt++) {
      try {
        logger.debug(`DeepSeek API call attempt ${attempt}/${this.config.retryCount}`, {
          provider: this.name
        });

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model || 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            max_tokens: this.config.maxTokens || 1500,
            temperature: this.config.temperature || 0.7,
            stream: false
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 401) {
            throw new Error('Invalid DeepSeek API key');
          } else if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          } else if (response.status === 500) {
            throw new Error('DeepSeek API server error');
          } else {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('Empty response from DeepSeek API');
        }

        logger.info('DeepSeek API call successful', {
          provider: this.name,
          processingTime: data.usage?.prompt_tokens || 0
        });

        return content.trim();

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`DeepSeek API attempt ${attempt} failed`, lastError, {
          provider: this.name,
          attempt
        });

        if (attempt < (this.config.retryCount || 3)) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('DeepSeek API call failed after retries');
  }

  /**
   * Build system prompt for context-aware responses
   */
  private buildSystemPrompt(context?: any): string {
    return `You are a professional brand strategist and marketing expert.
Your role is to analyze brands and provide strategic marketing content.
${context?.industry ? `Industry focus: ${context.industry}` : ''}
${context?.audience ? `Target audience: ${context.audience}` : ''}

Respond in Polish when appropriate. Be professional, clear, and actionable.
Always respond with valid JSON when requested.`;
  }

  /**
   * Fallback content generation (no API dependency)
   */
  private generateFallbackContent(prompt: string, context?: any): string {
    logger.info('Generating fallback brand content', { provider: this.name });
    
    // Extract key info from prompt for fallback
    const hasIndustry = prompt.toLowerCase().includes('industry');
    const hasAudience = prompt.toLowerCase().includes('audience');
    
    return JSON.stringify({
      status: 'fallback_mode',
      message: 'Generated using built-in AI logic',
      suggestions: [
        'Professional and modern branding approach',
        'Focus on target audience clarity',
        'Strong value proposition messaging',
        'Consistent visual identity'
      ],
      note: 'For full AI enhancement, ensure DeepSeek API key is configured'
    });
  }
}

/**
 * Fallback AI Provider (no external dependencies)
 */
export class FallbackAIProvider implements IAIProvider {
  name = 'FallbackAI';

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async generateBrandContent(
    prompt: string,
    context?: any
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    return {
      content: `Built-in AI response: ${prompt.slice(0, 100)}...`,
      source: 'fallback',
      confidence: 0.6,
      processingTime: Date.now() - startTime
    };
  }

  async enhanceBrand(data: any): Promise<any> {
    return {
      ...data,
      aiEnhanced: 'Built-in enhancement (no external API)',
      confidenceScore: 0.6,
      generatedAt: new Date().toISOString()
    };
  }
}
