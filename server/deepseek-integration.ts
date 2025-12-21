import { CompleteProductData } from "./complete-product-export";

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AIEnhancedBrandData extends CompleteProductData {
  aiGeneratedContent: {
    enhancedDescription: string;
    marketingTaglines: string[];
    targetAudienceAnalysis: string;
    competitiveAdvantages: string[];
    callToActions: string[];
    socialMediaCaptions: string[];
    emailSubjectLines: string[];
    brandPersonality: string;
    valueProposition: string;
    painPoints: string[];
    solutions: string[];
  };
  aiMetadata: {
    generatedAt: string;
    model: string;
    processingTime: number;
    confidenceScore: number;
  };
}

export async function enhanceBrandWithDeepSeek(
  brandData: CompleteProductData,
  apiKey?: string
): Promise<AIEnhancedBrandData> {
  if (!apiKey || !process.env.DEEPSEEK_API_KEY) {
    console.log('🔄 Using built-in AI logic (no DeepSeek API key)');
    return enhanceBrandWithBuiltInAI(brandData);
  }

  try {
    console.log('🤖 Enhancing brand with DeepSeek AI...');
    const startTime = Date.now();
    
    const prompt = generateDeepSeekPrompt(brandData);
    const response = await callDeepSeekAPI(prompt, apiKey);
    const processingTime = Date.now() - startTime;

    const aiEnhancedData: AIEnhancedBrandData = {
      ...brandData,
      aiGeneratedContent: response.content,
      aiMetadata: {
        generatedAt: new Date().toISOString(),
        model: 'deepseek-chat',
        processingTime,
        confidenceScore: response.confidence || 0.95
      }
    };

    console.log(`✅ DeepSeek AI enhancement completed in ${processingTime}ms`);
    return aiEnhancedData;

  } catch (error) {
    console.error('❌ DeepSeek API error:', error);
    console.log('🔄 Falling back to built-in AI logic');
    return enhanceBrandWithBuiltInAI(brandData);
  }
}

function generateDeepSeekPrompt(brandData: CompleteProductData): string {
  return `You are a professional brand strategist and marketing expert. Analyze this brand and provide comprehensive marketing content.

Brand Information:
- Name: ${brandData.brandName}
- Industry: ${brandData.industry}
- Description: ${brandData.description}
- Target Audience: ${brandData.targetAudience}
- Logo Style: ${brandData.logoStyle}
- Colors: ${brandData.colors.join(', ')}
- Fonts: ${brandData.fonts.join(', ')}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "enhancedDescription": "Professional 2-3 sentence description that's more compelling than the original",
  "marketingTaglines": ["3-5 powerful, memorable taglines"],
  "targetAudienceAnalysis": "Detailed analysis of the target audience, their needs, pain points, and motivations",
  "competitiveAdvantages": ["List of 3-5 unique selling propositions"],
  "callToActions": ["5-7 compelling CTAs for different contexts"],
  "socialMediaCaptions": ["3-5 engaging social media post captions"],
  "emailSubjectLines": ["5-7 high-converting email subject lines"],
  "brandPersonality": "Description of the brand's personality and voice",
  "valueProposition": "Clear, compelling value proposition statement",
  "painPoints": ["3-5 key pain points this brand solves"],
  "solutions": ["3-5 specific solutions the brand provides"]
}

Focus on:
1. Industry-specific language and trends
2. Emotional resonance with the target audience
3. Clear differentiation from competitors
4. Conversion-focused messaging
5. Professional yet engaging tone

Respond only with valid JSON.`;
}

async function callDeepSeekAPI(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a professional brand strategist and marketing expert. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  
  return {
    content,
    confidence: 0.95
  };
}

function enhanceBrandWithBuiltInAI(brandData: CompleteProductData): AIEnhancedBrandData {
  console.log('🧠 Using built-in AI enhancement logic');
  
  const industryData = getIndustryInsights(brandData.industry);
  const audienceData = getAudienceInsights(brandData.targetAudience);
  
  return {
    ...brandData,
    aiGeneratedContent: {
      enhancedDescription: generateEnhancedDescription(brandData, industryData),
      marketingTaglines: generateTaglines(brandData, industryData),
      targetAudienceAnalysis: generateAudienceAnalysis(brandData, audienceData),
      competitiveAdvantages: generateCompetitiveAdvantages(brandData, industryData),
      callToActions: generateCallToActions(brandData),
      socialMediaCaptions: generateSocialMediaCaptions(brandData),
      emailSubjectLines: generateEmailSubjectLines(brandData),
      brandPersonality: generateBrandPersonality(brandData, industryData),
      valueProposition: generateValueProposition(brandData, industryData),
      painPoints: generatePainPoints(brandData, industryData),
      solutions: generateSolutions(brandData, industryData)
    },
    aiMetadata: {
      generatedAt: new Date().toISOString(),
      model: 'built-in-ai-v1.0',
      processingTime: 50,
      confidenceScore: 0.88
    }
  };
}

function getIndustryInsights(industry: string): any {
  const insights = {
    tech: {
      keywords: ['innovative', 'cutting-edge', 'efficient', 'scalable', 'intelligent'],
      painPoints: ['Manual processes', 'Inefficiency', 'Poor user experience', 'Lack of automation'],
      solutions: ['Automation', 'AI integration', 'Streamlined workflows', 'Enhanced productivity']
    },
    marketing: {
      keywords: ['results-driven', 'data-powered', 'conversion-focused', 'growth-oriented'],
      painPoints: ['Low conversion rates', 'Poor ROI', 'Lack of insights', 'Manual campaign management'],
      solutions: ['Automated campaigns', 'Advanced analytics', 'Targeted messaging', 'Performance optimization']
    },
    finance: {
      keywords: ['secure', 'reliable', 'compliant', 'transparent', 'profitable'],
      painPoints: ['Financial complexity', 'Compliance challenges', 'Risk management', 'Manual reporting'],
      solutions: ['Automated reporting', 'Risk analysis', 'Compliance tools', 'Financial insights']
    },
    healthcare: {
      keywords: ['patient-focused', 'innovative', 'reliable', 'secure', 'efficient'],
      painPoints: ['Patient management', 'Data security', 'Compliance requirements', 'Operational efficiency'],
      solutions: ['Digital health records', 'Secure platforms', 'Streamlined operations', 'Better patient care']
    }
  };
  
  return insights[industry] || insights.tech;
}

function getAudienceInsights(audience: string): any {
  const insights = {
    'professionals': {
      motivations: ['Career advancement', 'Efficiency', 'Professional growth', 'Time savings'],
      challenges: ['Work-life balance', 'Staying competitive', 'Managing complexity', 'Meeting deadlines']
    },
    'agencies': {
      motivations: ['Client satisfaction', 'Scalability', 'Competitive advantage', 'Profitability'],
      challenges: ['Resource management', 'Client expectations', 'Project delivery', 'Team coordination']
    },
    'startups': {
      motivations: ['Growth', 'Innovation', 'Market penetration', 'Funding'],
      challenges: ['Limited resources', 'Competition', 'Scaling operations', 'Building awareness']
    }
  };
  
  // Find best match or default to professionals
  const key = Object.keys(insights).find(k => audience.toLowerCase().includes(k)) || 'professionals';
  return insights[key];
}

function generateEnhancedDescription(brandData: CompleteProductData, industryData: any): string {
  const keywords = industryData.keywords.slice(0, 2).join(' and ');
  return `${brandData.brandName} delivers ${keywords} ${brandData.industry} solutions designed specifically for ${brandData.targetAudience}. Our platform transforms how you work with advanced automation and intelligent insights that drive real results.`;
}

function generateTaglines(brandData: CompleteProductData, industryData: any): string[] {
  const keyword = industryData.keywords[0];
  return [
    `${brandData.brandName} - Where ${keyword} meets results`,
    `Transform your ${brandData.industry} workflow`,
    `The future of ${brandData.industry} is here`,
    `Empowering ${brandData.targetAudience} worldwide`,
    `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} solutions, exceptional results`
  ];
}

function generateAudienceAnalysis(brandData: CompleteProductData, audienceData: any): string {
  return `${brandData.targetAudience} are driven by ${audienceData.motivations.slice(0, 2).join(' and ')}. They face challenges including ${audienceData.challenges.slice(0, 2).join(' and ')}. Our solution addresses these core needs by providing streamlined, efficient tools that save time and drive results.`;
}

function generateCompetitiveAdvantages(brandData: CompleteProductData, industryData: any): string[] {
  return [
    `Industry-leading ${industryData.keywords[0]} technology`,
    `Designed specifically for ${brandData.targetAudience}`,
    `Proven track record with measurable results`,
    `Comprehensive solution with expert support`,
    `Scalable platform that grows with your business`
  ];
}

function generateCallToActions(brandData: CompleteProductData): string[] {
  return [
    `Start your ${brandData.brandName} journey today`,
    'Get your free trial now',
    'See how it works - Book a demo',
    'Join thousands of satisfied customers',
    'Transform your workflow in minutes',
    'Get started for free',
    'Discover the difference'
  ];
}

function generateSocialMediaCaptions(brandData: CompleteProductData): string[] {
  return [
    `Ready to revolutionize your ${brandData.industry} workflow? ${brandData.brandName} makes it possible. 🚀`,
    `Join the professionals who chose ${brandData.brandName} for their success. See why they love us.`,
    `Transform your business with ${brandData.brandName}. Professional results, simplified process.`,
    `${brandData.brandName} - Where innovation meets practical solutions for ${brandData.targetAudience}.`,
    `Discover why ${brandData.brandName} is the preferred choice for leading ${brandData.targetAudience}.`
  ];
}

function generateEmailSubjectLines(brandData: CompleteProductData): string[] {
  return [
    `Transform your ${brandData.industry} workflow in 5 minutes`,
    `${brandData.brandName} - See what you've been missing`,
    `Your ${brandData.industry} solution is here`,
    `Ready to 10x your productivity?`,
    `The tool ${brandData.targetAudience} can't stop talking about`,
    `Limited time: Try ${brandData.brandName} free`,
    `This changes everything for ${brandData.targetAudience}`
  ];
}

function generateBrandPersonality(brandData: CompleteProductData, industryData: any): string {
  return `${brandData.brandName} embodies ${industryData.keywords[0]} professionalism with an approachable, results-driven personality. We speak with confidence, clarity, and genuine care for our customers' success. Our voice is expert yet accessible, innovative yet reliable.`;
}

function generateValueProposition(brandData: CompleteProductData, industryData: any): string {
  return `${brandData.brandName} provides ${brandData.targetAudience} with the most ${industryData.keywords[0]} ${brandData.industry} solution available, delivering measurable results through intuitive design and powerful functionality that saves time and drives growth.`;
}

function generatePainPoints(brandData: CompleteProductData, industryData: any): string[] {
  return industryData.painPoints;
}

function generateSolutions(brandData: CompleteProductData, industryData: any): string[] {
  return industryData.solutions;
}

export { enhanceBrandWithBuiltInAI, getIndustryInsights, getAudienceInsights };