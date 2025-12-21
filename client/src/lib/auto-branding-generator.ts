import { BrandProject } from '@shared/schema';
import { aiFeedbackTrainer, PromptSeed } from './ai-feedback-trainer';

export interface AutoBrandingConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetIndustries: string[];
  minProjectsForLearning: number;
  confidenceThreshold: number;
  autoExport: boolean;
  notifyUser: boolean;
}

export interface GeneratedBrandingSuggestion {
  id: string;
  industry: string;
  name: string;
  description: string;
  aiPrompt: string;
  confidence: number;
  basedOnPattern: string;
  generatedAt: Date;
  keywords: string[];
  colorSuggestions: string[];
  visualMotifs: string[];
  estimatedSuccess: number;
}

export interface WeeklyReport {
  week: string;
  totalSuggestions: number;
  topPerformingPattern: string;
  industryTrends: Array<{
    industry: string;
    trend: 'rising' | 'stable' | 'declining';
    projectCount: number;
    avgScore: number;
  }>;
  recommendations: string[];
  nextWeekFocus: string[];
}

/**
 * Professional auto-branding system that learns from project patterns
 * and generates weekly branding suggestions automatically
 */
export class AutoBrandingGenerator {
  private config: AutoBrandingConfig = {
    enabled: false,
    frequency: 'weekly',
    targetIndustries: ['fintech', 'tech', 'design', 'consulting'],
    minProjectsForLearning: 3,
    confidenceThreshold: 0.7,
    autoExport: false,
    notifyUser: true
  };

  private lastGenerationDate: Date | null = null;
  private generationHistory: GeneratedBrandingSuggestion[] = [];
  private weeklyReports: WeeklyReport[] = [];

  /**
   * Main entry point for weekly automatic branding generation
   */
  public async runWeeklyGeneration(projects: BrandProject[]): Promise<{
    suggestions: GeneratedBrandingSuggestion[];
    report: WeeklyReport;
    success: boolean;
  }> {
    console.log('🚀 Starting weekly auto-branding generation...');

    try {
      // Check if enough data for learning
      if (projects.length < this.config.minProjectsForLearning) {
        throw new Error(`Potrzebujesz minimum ${this.config.minProjectsForLearning} projektów do uruchomienia auto-generacji`);
      }

      // Generate AI prompt seed based on successful patterns
      const promptSeed = aiFeedbackTrainer.updatePromptSeed(projects);
      
      if (promptSeed.confidence < this.config.confidenceThreshold) {
        console.log(`⚠️ Confidence (${promptSeed.confidence}) below threshold (${this.config.confidenceThreshold})`);
      }

      // Generate suggestions for each target industry
      const suggestions: GeneratedBrandingSuggestion[] = [];
      
      for (const industry of this.config.targetIndustries) {
        const suggestion = await this.generateIndustrySuggestion(industry, promptSeed, projects);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }

      // Generate weekly report
      const report = this.generateWeeklyReport(projects, suggestions);

      // Store generation history
      this.generationHistory.push(...suggestions);
      this.weeklyReports.push(report);
      this.lastGenerationDate = new Date();

      // Auto-export if configured
      if (this.config.autoExport && suggestions.length > 0) {
        await this.autoExportSuggestions(suggestions);
      }

      console.log(`✅ Generated ${suggestions.length} branding suggestions`);

      return {
        suggestions,
        report,
        success: true
      };

    } catch (error) {
      console.error('❌ Auto-branding generation failed:', error);
      return {
        suggestions: [],
        report: this.generateErrorReport(error as Error),
        success: false
      };
    }
  }

  /**
   * Generate branding suggestion for specific industry using learned patterns
   */
  private async generateIndustrySuggestion(
    industry: string, 
    promptSeed: PromptSeed, 
    projects: BrandProject[]
  ): Promise<GeneratedBrandingSuggestion | null> {
    
    // Filter projects by industry for industry-specific learning
    const industryProjects = projects.filter(p => 
      p.industry?.toLowerCase().includes(industry.toLowerCase())
    );

    // Generate industry-specific prompt seed if enough data
    let industryPromptSeed = promptSeed;
    if (industryProjects.length >= 2) {
      industryPromptSeed = aiFeedbackTrainer.updatePromptSeed(industryProjects);
    }

    // Generate suggestion based on learned patterns
    const suggestion = this.createBrandingSuggestion(industry, industryPromptSeed);
    
    return suggestion;
  }

  /**
   * Create branding suggestion using AI prompt seed
   */
  private createBrandingSuggestion(
    industry: string, 
    promptSeed: PromptSeed
  ): GeneratedBrandingSuggestion {
    
    // Generate creative names based on industry and keywords
    const names = this.generateBrandNames(industry, promptSeed.keywords);
    const selectedName = names[Math.floor(Math.random() * names.length)];

    // Create comprehensive description
    const description = this.generateDescription(industry, promptSeed);

    // Generate AI prompt for external API
    const aiPrompt = aiFeedbackTrainer.generateProjectSuggestion(promptSeed, industry);

    // Calculate estimated success based on patterns
    const estimatedSuccess = this.calculateEstimatedSuccess(promptSeed, industry);

    return {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      industry,
      name: selectedName,
      description,
      aiPrompt,
      confidence: promptSeed.confidence,
      basedOnPattern: promptSeed.successPattern,
      generatedAt: new Date(),
      keywords: promptSeed.keywords,
      colorSuggestions: promptSeed.colorScheme,
      visualMotifs: promptSeed.visualMotifs,
      estimatedSuccess
    };
  }

  /**
   * Generate creative brand names using AI patterns
   */
  private generateBrandNames(industry: string, keywords: string[]): string[] {
    const industryPrefixes = {
      fintech: ['Pay', 'Fin', 'Trust', 'Secure', 'Swift'],
      tech: ['Tech', 'Byte', 'Code', 'Smart', 'Digital'],
      design: ['Studio', 'Creative', 'Visual', 'Art', 'Pixel'],
      consulting: ['Pro', 'Expert', 'Strategy', 'Advisory', 'Insight']
    };

    const suffixes = ['ly', 'io', 'ai', 'hub', 'lab', 'works', 'solutions', 'group'];
    const prefixes = industryPrefixes[industry.toLowerCase() as keyof typeof industryPrefixes] || ['Smart', 'Pro', 'Next'];

    const names: string[] = [];

    // Combine prefixes with suffixes
    prefixes.forEach(prefix => {
      suffixes.forEach(suffix => {
        names.push(`${prefix}${suffix}`);
      });
    });

    // Use keywords as inspiration
    keywords.slice(0, 3).forEach(keyword => {
      const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      names.push(`${capitalizedKeyword}Hub`, `${capitalizedKeyword}Lab`, `${capitalizedKeyword}Pro`);
    });

    return names.slice(0, 10);
  }

  /**
   * Generate comprehensive brand description
   */
  private generateDescription(industry: string, promptSeed: PromptSeed): string {
    const industryDescriptions = {
      fintech: 'Nowoczesna platforma finansowa',
      tech: 'Innowacyjne rozwiązanie technologiczne',
      design: 'Kreatywne studio designu',
      consulting: 'Profesjonalne doradztwo biznesowe'
    };

    const baseDescription = industryDescriptions[industry.toLowerCase() as keyof typeof industryDescriptions] || 
                           'Profesjonalna firma';

    const enhancedDescription = `${baseDescription} łącząca ${promptSeed.tone} z ${promptSeed.visualMotifs.join(' i ')}. 
Specjalizuje się w ${promptSeed.keywords.slice(0, 3).join(', ')} dla klientów poszukujących ${promptSeed.keywords[0]} rozwiązań. 
Wykorzystuje ${promptSeed.colorScheme.join(' i ')} w identyfikacji wizualnej, 
tworząc ${promptSeed.visualMotifs.includes('minimalist design') ? 'minimalistyczny' : 'nowoczesny'} wizerunek marki.`;

    return enhancedDescription;
  }

  /**
   * Calculate estimated success percentage based on learned patterns
   */
  private calculateEstimatedSuccess(promptSeed: PromptSeed, industry: string): number {
    let score = promptSeed.confidence * 0.4; // Base confidence score (0-40%)

    // Industry bonuses
    if (industry === 'fintech' && promptSeed.keywords.includes('trust')) score += 0.2;
    if (industry === 'tech' && promptSeed.keywords.includes('innovation')) score += 0.15;
    if (promptSeed.visualMotifs.includes('minimalist design')) score += 0.1;
    if (promptSeed.colorScheme.includes('blue')) score += 0.1;

    // Keyword quality bonus
    const powerKeywords = ['trust', 'secure', 'innovation', 'professional'];
    const matchingKeywords = promptSeed.keywords.filter(k => powerKeywords.includes(k));
    score += matchingKeywords.length * 0.05;

    return Math.min(95, Math.max(20, score * 100)); // Keep between 20-95%
  }

  /**
   * Generate comprehensive weekly report
   */
  private generateWeeklyReport(
    projects: BrandProject[], 
    suggestions: GeneratedBrandingSuggestion[]
  ): WeeklyReport {
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekString = `${weekStart.toISOString().slice(0, 10)} - ${new Date().toISOString().slice(0, 10)}`;

    // Analyze industry trends
    const industryStats = this.analyzeIndustryTrends(projects);
    
    // Find top performing pattern
    const learningPatterns = aiFeedbackTrainer.identifyLearningPatterns(projects);
    const topPattern = learningPatterns.length > 0 ? 
      learningPatterns[0].patternName : 
      'Brak wystarczających danych';

    // Generate recommendations
    const recommendations = this.generateWeeklyRecommendations(projects, suggestions);
    
    // Plan next week focus
    const nextWeekFocus = this.planNextWeekFocus(industryStats, suggestions);

    return {
      week: weekString,
      totalSuggestions: suggestions.length,
      topPerformingPattern: topPattern,
      industryTrends: industryStats,
      recommendations,
      nextWeekFocus
    };
  }

  private analyzeIndustryTrends(projects: BrandProject[]) {
    const industries = [...new Set(projects.map(p => p.industry).filter(Boolean))];
    
    return industries.map(industry => {
      const industryProjects = projects.filter(p => p.industry === industry);
      const avgScore = industryProjects.reduce((sum, p) => {
        const scored = aiFeedbackTrainer.scoreProject(p);
        return sum + scored.totalScore;
      }, 0) / industryProjects.length;

      return {
        industry: industry!,
        trend: avgScore > 60 ? 'rising' : avgScore > 40 ? 'stable' : 'declining',
        projectCount: industryProjects.length,
        avgScore
      };
    });
  }

  private generateWeeklyRecommendations(
    projects: BrandProject[], 
    suggestions: GeneratedBrandingSuggestion[]
  ): string[] {
    const recommendations: string[] = [];

    // Based on project analysis
    const exportRate = projects.filter(p => p.exported).length / projects.length;
    if (exportRate < 0.5) {
      recommendations.push('Zwiększ jakość projektów - tylko 50% jest eksportowanych');
    }

    const avgRating = projects.reduce((sum, p) => sum + (p.rating || 0), 0) / projects.length;
    if (avgRating < 3.5) {
      recommendations.push('Skoncentruj się na projektach otrzymujących oceny 4+ gwiazdek');
    }

    // Based on suggestions
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.8);
    if (highConfidenceSuggestions.length > 0) {
      recommendations.push(`Realizuj sugestie o wysokiej pewności: ${highConfidenceSuggestions.map(s => s.industry).join(', ')}`);
    }

    // Industry-specific recommendations
    const fintechProjects = projects.filter(p => p.industry?.toLowerCase().includes('fintech'));
    if (fintechProjects.length > 0 && fintechProjects.every(p => p.exported)) {
      recommendations.push('Fintech pokazuje 100% sukces - kontynuuj ten kierunek');
    }

    return recommendations.length > 0 ? recommendations : ['Kontynuuj obecną strategię brandingową'];
  }

  private planNextWeekFocus(industryStats: any[], suggestions: GeneratedBrandingSuggestion[]): string[] {
    const focus: string[] = [];

    // Focus on rising industries
    const risingIndustries = industryStats.filter(stat => stat.trend === 'rising');
    if (risingIndustries.length > 0) {
      focus.push(`Rozwijaj branże: ${risingIndustries.map(i => i.industry).join(', ')}`);
    }

    // Focus on high-potential suggestions
    const highPotentialSuggestions = suggestions.filter(s => s.estimatedSuccess > 70);
    if (highPotentialSuggestions.length > 0) {
      focus.push('Implementuj sugestie o wysokim potencjale sukcesu');
    }

    // Industry diversity recommendation
    const representedIndustries = [...new Set(suggestions.map(s => s.industry))];
    if (representedIndustries.length < 3) {
      focus.push('Zwiększ różnorodność branżową w projektach');
    }

    return focus.length > 0 ? focus : ['Zbieraj więcej danych projektowych'];
  }

  private generateErrorReport(error: Error): WeeklyReport {
    return {
      week: new Date().toISOString().slice(0, 10),
      totalSuggestions: 0,
      topPerformingPattern: 'Błąd analizy',
      industryTrends: [],
      recommendations: [`Błąd: ${error.message}`],
      nextWeekFocus: ['Napraw problemy systemu przed kolejną analizą']
    };
  }

  /**
   * Auto-export suggestions to file
   */
  private async autoExportSuggestions(suggestions: GeneratedBrandingSuggestion[]): Promise<void> {
    const exportData = {
      generatedAt: new Date().toISOString(),
      totalSuggestions: suggestions.length,
      suggestions: suggestions.map(s => ({
        industry: s.industry,
        name: s.name,
        description: s.description,
        aiPrompt: s.aiPrompt,
        confidence: s.confidence,
        estimatedSuccess: s.estimatedSuccess,
        keywords: s.keywords,
        colors: s.colorSuggestions
      }))
    };

    // In a real implementation, this would save to file or send to API
    console.log('📁 Auto-exported branding suggestions:', exportData);
  }

  // Configuration methods
  public configure(config: Partial<AutoBrandingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): AutoBrandingConfig {
    return { ...this.config };
  }

  public getGenerationHistory(): GeneratedBrandingSuggestion[] {
    return [...this.generationHistory];
  }

  public getWeeklyReports(): WeeklyReport[] {
    return [...this.weeklyReports];
  }

  public shouldRunGeneration(): boolean {
    if (!this.config.enabled) return false;
    if (!this.lastGenerationDate) return true;

    const now = new Date();
    const daysSinceLastGeneration = Math.floor(
      (now.getTime() - this.lastGenerationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (this.config.frequency) {
      case 'daily': return daysSinceLastGeneration >= 1;
      case 'weekly': return daysSinceLastGeneration >= 7;
      case 'monthly': return daysSinceLastGeneration >= 30;
      default: return false;
    }
  }

  /**
   * Send automated branding suggestion to DeepSeek API
   */
  public async sendToDeepSeekAPI(suggestion: GeneratedBrandingSuggestion): Promise<{
    success: boolean;
    response?: any;
    error?: string;
  }> {
    try {
      // This would integrate with your existing DeepSeek API call
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suggestion.name,
          industry: suggestion.industry,
          prompt: suggestion.aiPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        response: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const autoBrandingGenerator = new AutoBrandingGenerator();