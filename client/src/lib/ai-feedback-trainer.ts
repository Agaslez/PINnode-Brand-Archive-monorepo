import { BrandProject } from '@shared/schema';

// Enhanced scoring system based on your feedback model
export interface ProjectScore {
  project: BrandProject;
  totalScore: number;
  breakdown: {
    exportScore: number;
    editScore: number;
    contentScore: number;
    visualScore: number;
    industryScore: number;
    ratingScore: number;
  };
  insights: string[];
}

export interface PromptSeed {
  industry: string;
  tone: string;
  visualMotifs: string[];
  keywords: string[];
  colorScheme: string[];
  confidence: number;
  successPattern: string;
  recommendations: string[];
}

export interface AILearningPattern {
  patternName: string;
  confidence: number;
  projectCount: number;
  successRate: number;
  avgRating: number;
  exportRate: number;
  conditions: string[];
  recommendations: string[];
}

export class AIFeedbackTrainer {
  
  /**
   * Enhanced project scoring algorithm
   * Analyzes multiple dimensions of project success
   */
  public scoreProject(project: BrandProject): ProjectScore {
    const breakdown = {
      exportScore: this.calculateExportScore(project),
      editScore: this.calculateEditScore(project),
      contentScore: this.calculateContentScore(project),
      visualScore: this.calculateVisualScore(project),
      industryScore: this.calculateIndustryScore(project),
      ratingScore: this.calculateRatingScore(project)
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const insights = this.generateProjectInsights(project, breakdown);

    return {
      project,
      totalScore,
      breakdown,
      insights
    };
  }

  /**
   * Advanced prompt seed generation based on successful patterns
   */
  public updatePromptSeed(projects: BrandProject[]): PromptSeed {
    const scoredProjects = projects
      .map(p => this.scoreProject(p))
      .sort((a, b) => b.totalScore - a.totalScore);

    const topProjects = scoredProjects.slice(0, Math.max(5, Math.ceil(projects.length * 0.3)));
    
    const industries = this.extractTopIndustries(topProjects);
    const tones = this.extractSuccessfulTones(topProjects);
    const motifs = this.extractVisualMotifs(topProjects);
    const keywords = this.extractPowerKeywords(topProjects);
    const colors = this.extractSuccessfulColors(topProjects);
    
    const confidence = this.calculateSeedConfidence(topProjects, projects);
    const successPattern = this.identifySuccessPattern(topProjects);
    const recommendations = this.generateRecommendations(topProjects);

    return {
      industry: industries[0] || "general",
      tone: tones.join(", ") || "professional",
      visualMotifs: motifs,
      keywords,
      colorScheme: colors,
      confidence,
      successPattern,
      recommendations
    };
  }

  /**
   * Self-learning pattern recognition
   * Identifies recurring success patterns in brandng projects
   */
  public identifyLearningPatterns(projects: BrandProject[]): AILearningPattern[] {
    const patterns: AILearningPattern[] = [];

    // Pattern 1: Fintech + Trust keywords
    patterns.push(this.analyzeFinTechTrustPattern(projects));
    
    // Pattern 2: Minimalist design + Blue colors
    patterns.push(this.analyzeMinimalistBluePattern(projects));
    
    // Pattern 3: Industry-specific keywords
    patterns.push(this.analyzeIndustryKeywordPattern(projects));
    
    // Pattern 4: High rating correlation with export success
    patterns.push(this.analyzeRatingExportPattern(projects));
    
    // Pattern 5: Logo complexity vs success
    patterns.push(this.analyzeLogoComplexityPattern(projects));

    return patterns
      .filter(pattern => pattern.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generates AI-powered project suggestions
   */
  public generateProjectSuggestion(seed: PromptSeed, targetIndustry?: string): string {
    const industry = targetIndustry || seed.industry;
    
    return `Stwórz projekt brandingowy dla branży ${industry} wykorzystując wzorce sukcesu:

🎯 ANALIZA AI (${(seed.confidence * 100).toFixed(0)}% pewności):
${seed.successPattern}

🎨 REKOMENDOWANE ELEMENTY:
• Kolory: ${seed.colorScheme.join(', ')}
• Ton komunikacji: ${seed.tone}
• Motywy wizualne: ${seed.visualMotifs.join(', ')}
• Kluczowe słowa: ${seed.keywords.join(', ')}

💡 PROMPT DLA AI:
"Zaprojektuj ${seed.visualMotifs.includes('minimal') ? 'minimalistyczne' : 'nowoczesne'} logo dla firmy z branży ${industry}. 
Użyj kolorów ${seed.colorScheme.slice(0, 2).join(' i ')}, 
zawrzyj elementy ${seed.visualMotifs.join(', ')}, 
i hasło zawierające słowa: ${seed.keywords.slice(0, 3).join(', ')}."

📊 WZORCE SUKCESU:
${seed.recommendations.map(rec => `• ${rec}`).join('\n')}`;
  }

  // Private helper methods
  private calculateExportScore(project: BrandProject): number {
    return project.exported ? 25 : 0;
  }

  private calculateEditScore(project: BrandProject): number {
    // Moderate editing is positive, excessive editing might indicate problems
    return project.edited ? 15 : 0;
  }

  private calculateContentScore(project: BrandProject): number {
    const description = project.description?.toLowerCase() || '';
    let score = 0;
    
    // Power keywords
    if (description.includes('innovation')) score += 8;
    if (description.includes('trust')) score += 10;
    if (description.includes('reliable')) score += 8;
    if (description.includes('secure')) score += 8;
    if (description.includes('professional')) score += 6;
    if (description.includes('modern')) score += 5;
    if (description.includes('minimal')) score += 7;
    
    // Industry-specific keywords
    if (description.includes('fintech') || description.includes('finance')) score += 5;
    if (description.includes('tech') || description.includes('digital')) score += 4;
    
    return Math.min(score, 20); // Cap at 20 points
  }

  private calculateVisualScore(project: BrandProject): number {
    const logo = project.logo?.toLowerCase() || '';
    let score = 0;
    
    if (logo.includes('circle')) score += 5;
    if (logo.includes('blue')) score += 8;
    if (logo.includes('minimal')) score += 7;
    if (logo.includes('gradient')) score += 4;
    if (logo.length < 500) score += 5; // Simple logos
    
    return Math.min(score, 15);
  }

  private calculateIndustryScore(project: BrandProject): number {
    // Bonus for specific industries that tend to perform well
    const industry = project.industry?.toLowerCase() || '';
    
    if (industry.includes('fintech')) return 10;
    if (industry.includes('tech')) return 8;
    if (industry.includes('design')) return 7;
    if (industry.includes('consulting')) return 6;
    
    return 3; // Base score for having an industry
  }

  private calculateRatingScore(project: BrandProject): number {
    const rating = project.rating || 0;
    return rating * 5; // 0-25 points based on 0-5 star rating
  }

  private generateProjectInsights(project: BrandProject, breakdown: any): string[] {
    const insights: string[] = [];
    
    if (breakdown.exportScore > 0 && breakdown.ratingScore >= 20) {
      insights.push('🎯 Wzorcowy projekt: wysoka ocena + eksport');
    }
    
    if (breakdown.contentScore >= 15) {
      insights.push('💬 Mocne słowa kluczowe w opisie');
    }
    
    if (breakdown.visualScore >= 10) {
      insights.push('🎨 Skuteczne elementy wizualne');
    }
    
    if (project.industry?.toLowerCase().includes('fintech') && breakdown.contentScore >= 10) {
      insights.push('🏦 Dobry match: fintech + profesjonalna komunikacja');
    }

    return insights;
  }

  private extractTopIndustries(projects: ProjectScore[]): string[] {
    const industryMap = new Map<string, number>();
    
    projects.forEach(({ project, totalScore }) => {
      if (project.industry) {
        industryMap.set(project.industry, (industryMap.get(project.industry) || 0) + totalScore);
      }
    });
    
    return Array.from(industryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([industry]) => industry);
  }

  private extractSuccessfulTones(projects: ProjectScore[]): string[] {
    const tones = new Set<string>();
    
    projects.forEach(({ project }) => {
      const desc = project.description?.toLowerCase() || '';
      if (desc.includes('trust')) tones.add('trustworthy');
      if (desc.includes('innovation')) tones.add('innovative');
      if (desc.includes('professional')) tones.add('professional');
      if (desc.includes('modern')) tones.add('modern');
      if (desc.includes('minimal')) tones.add('minimalist');
    });
    
    return Array.from(tones);
  }

  private extractVisualMotifs(projects: ProjectScore[]): string[] {
    const motifs = new Set<string>();
    
    projects.forEach(({ project }) => {
      const logo = project.logo?.toLowerCase() || '';
      if (logo.includes('circle')) motifs.add('circular shapes');
      if (logo.includes('minimal')) motifs.add('minimalist design');
      if (logo.includes('gradient')) motifs.add('gradient effects');
      if (logo.includes('blue')) motifs.add('blue color scheme');
      if (logo.length < 500) motifs.add('simple geometry');
    });
    
    return Array.from(motifs);
  }

  private extractPowerKeywords(projects: ProjectScore[]): string[] {
    const keywordMap = new Map<string, number>();
    
    projects.forEach(({ project, totalScore }) => {
      const text = `${project.name} ${project.description || ''}`.toLowerCase();
      
      const keywords = ['trust', 'secure', 'innovation', 'professional', 'modern', 'reliable', 'advanced', 'smart', 'efficient'];
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + totalScore);
        }
      });
    });
    
    return Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([keyword]) => keyword);
  }

  private extractSuccessfulColors(projects: ProjectScore[]): string[] {
    const colorMap = new Map<string, number>();
    
    projects.forEach(({ project, totalScore }) => {
      const colors = ['blue', 'green', 'purple', 'orange', 'red', 'black', 'white'];
      const text = `${project.logo || ''} ${project.colorPalette || ''}`.toLowerCase();
      
      colors.forEach(color => {
        if (text.includes(color)) {
          colorMap.set(color, (colorMap.get(color) || 0) + totalScore);
        }
      });
    });
    
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([color]) => color);
  }

  private calculateSeedConfidence(topProjects: ProjectScore[], allProjects: BrandProject[]): number {
    if (allProjects.length === 0) return 0;
    
    const sampleSize = topProjects.length / allProjects.length;
    const avgScore = topProjects.reduce((sum, p) => sum + p.totalScore, 0) / topProjects.length;
    const maxPossibleScore = 100; // Based on scoring breakdown
    
    return Math.min(0.95, (sampleSize * 0.3) + (avgScore / maxPossibleScore * 0.7));
  }

  private identifySuccessPattern(projects: ProjectScore[]): string {
    const patterns: string[] = [];
    
    const hasFintech = projects.some(p => p.project.industry?.toLowerCase().includes('fintech'));
    const hasTrustKeywords = projects.some(p => p.breakdown.contentScore >= 15);
    const hasBlueColors = projects.some(p => p.breakdown.visualScore >= 10);
    const highExportRate = projects.filter(p => p.project.exported).length / projects.length;
    
    if (hasFintech && hasTrustKeywords) {
      patterns.push('Projekty fintech z elementami zaufania mają wysoką skuteczność');
    }
    
    if (hasBlueColors && highExportRate > 0.6) {
      patterns.push('Niebieska paleta kolorów koreluje z wysokim wskaźnikiem eksportu');
    }
    
    patterns.push(`Wskaźnik eksportu: ${(highExportRate * 100).toFixed(0)}%`);
    
    return patterns.join('. ');
  }

  private generateRecommendations(projects: ProjectScore[]): string[] {
    const recommendations: string[] = [];
    
    const avgRating = projects.reduce((sum, p) => sum + (p.project.rating || 0), 0) / projects.length;
    const exportRate = projects.filter(p => p.project.exported).length / projects.length;
    
    if (avgRating >= 4) {
      recommendations.push('Utrzymaj wysoką jakość treści - średnia ocena przekracza 4 gwiazdki');
    }
    
    if (exportRate >= 0.7) {
      recommendations.push('Wzorzec sukcesu potwierdza się - 70%+ projektów zostaje wyeksportowanych');
    }
    
    recommendations.push('Kontynuuj użycie słów kluczowych związanych z zaufaniem i innowacją');
    recommendations.push('Minimalistyczny design z niebieskimi akcentami daje najlepsze rezultaty');
    
    return recommendations;
  }

  // Pattern analysis methods
  private analyzeFinTechTrustPattern(projects: BrandProject[]): AILearningPattern {
    const fintechProjects = projects.filter(p => 
      p.industry?.toLowerCase().includes('fintech') ||
      p.description?.toLowerCase().includes('trust') ||
      p.description?.toLowerCase().includes('secure')
    );
    
    if (fintechProjects.length < 2) {
      return this.createEmptyPattern('FinTech Trust Pattern');
    }
    
    const exportRate = fintechProjects.filter(p => p.exported).length / fintechProjects.length;
    const avgRating = fintechProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / fintechProjects.length;
    
    return {
      patternName: 'FinTech Trust Pattern',
      confidence: Math.min(0.9, fintechProjects.length / projects.length + 0.4),
      projectCount: fintechProjects.length,
      successRate: (fintechProjects.filter(p => (p.rating || 0) >= 4).length / fintechProjects.length) * 100,
      avgRating,
      exportRate: exportRate * 100,
      conditions: ['Industry: FinTech', 'Keywords: trust, secure, reliable'],
      recommendations: [
        `Projekty fintech z elementami zaufania mają ${(exportRate * 100).toFixed(0)}% wskaźnik eksportu`,
        'Używaj słów kluczowych: "trust", "secure", "reliable" w opisach',
        'Niebieska paleta kolorów wzmacnia przekaz zaufania'
      ]
    };
  }

  private analyzeMinimalistBluePattern(projects: BrandProject[]): AILearningPattern {
    const minimalBlueProjects = projects.filter(p => 
      (p.description?.toLowerCase().includes('minimal') || p.logo?.toLowerCase().includes('minimal')) &&
      (p.logo?.toLowerCase().includes('blue') || p.colorPalette?.toLowerCase().includes('blue'))
    );
    
    if (minimalBlueProjects.length < 2) {
      return this.createEmptyPattern('Minimalist Blue Pattern');
    }
    
    const exportRate = minimalBlueProjects.filter(p => p.exported).length / minimalBlueProjects.length;
    const avgRating = minimalBlueProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / minimalBlueProjects.length;
    
    return {
      patternName: 'Minimalist Blue Pattern',
      confidence: 0.8,
      projectCount: minimalBlueProjects.length,
      successRate: (minimalBlueProjects.filter(p => (p.rating || 0) >= 4).length / minimalBlueProjects.length) * 100,
      avgRating,
      exportRate: exportRate * 100,
      conditions: ['Design: Minimalist', 'Color: Blue palette'],
      recommendations: [
        `Minimalistyczne projekty z niebieskimi akcentami osiągają ${avgRating.toFixed(1)}/5 ⭐`,
        'Proste geometryczne kształty zwiększają czytelność',
        'Niebieskie gradienty dodają profesjonalizmu'
      ]
    };
  }

  private analyzeIndustryKeywordPattern(projects: BrandProject[]): AILearningPattern {
    const projectsWithKeywords = projects.filter(p => {
      const desc = p.description?.toLowerCase() || '';
      return desc.includes('innovation') || desc.includes('professional') || desc.includes('modern');
    });
    
    if (projectsWithKeywords.length < 2) {
      return this.createEmptyPattern('Industry Keyword Pattern');
    }
    
    const exportRate = projectsWithKeywords.filter(p => p.exported).length / projectsWithKeywords.length;
    const avgRating = projectsWithKeywords.reduce((sum, p) => sum + (p.rating || 0), 0) / projectsWithKeywords.length;
    
    return {
      patternName: 'Industry Keyword Pattern',
      confidence: 0.75,
      projectCount: projectsWithKeywords.length,
      successRate: (projectsWithKeywords.filter(p => (p.rating || 0) >= 4).length / projectsWithKeywords.length) * 100,
      avgRating,
      exportRate: exportRate * 100,
      conditions: ['Keywords: innovation, professional, modern'],
      recommendations: [
        'Słowa kluczowe "innovation", "professional", "modern" zwiększają skuteczność',
        'Branżowe słownictwo poprawia pozycjonowanie projektu',
        'Kombinacja 2-3 kluczowych słów daje najlepsze rezultaty'
      ]
    };
  }

  private analyzeRatingExportPattern(projects: BrandProject[]): AILearningPattern {
    const highRatedProjects = projects.filter(p => (p.rating || 0) >= 4);
    
    if (highRatedProjects.length < 2) {
      return this.createEmptyPattern('Rating Export Pattern');
    }
    
    const exportRate = highRatedProjects.filter(p => p.exported).length / highRatedProjects.length;
    const avgRating = highRatedProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / highRatedProjects.length;
    
    return {
      patternName: 'Rating Export Pattern',
      confidence: 0.9,
      projectCount: highRatedProjects.length,
      successRate: 100, // By definition, all are high-rated
      avgRating,
      exportRate: exportRate * 100,
      conditions: ['Rating: 4+ stars'],
      recommendations: [
        `Projekty z oceną 4+ gwiazdek mają ${(exportRate * 100).toFixed(0)}% wskaźnik eksportu`,
        'Wysoka ocena silnie koreluje z sukcesem komercyjnym',
        'Inwestuj w jakość, by osiągnąć oceny 4+'
      ]
    };
  }

  private analyzeLogoComplexityPattern(projects: BrandProject[]): AILearningPattern {
    const simpleLogos = projects.filter(p => p.logo && p.logo.length < 500);
    
    if (simpleLogos.length < 2) {
      return this.createEmptyPattern('Logo Complexity Pattern');
    }
    
    const exportRate = simpleLogos.filter(p => p.exported).length / simpleLogos.length;
    const avgRating = simpleLogos.reduce((sum, p) => sum + (p.rating || 0), 0) / simpleLogos.length;
    
    return {
      patternName: 'Logo Complexity Pattern',
      confidence: 0.7,
      projectCount: simpleLogos.length,
      successRate: (simpleLogos.filter(p => (p.rating || 0) >= 4).length / simpleLogos.length) * 100,
      avgRating,
      exportRate: exportRate * 100,
      conditions: ['Logo: Simple (< 500 characters)'],
      recommendations: [
        `Proste logo (< 500 znaków SVG) mają ${avgRating.toFixed(1)}/5 ⭐ średnią`,
        'Prostota = skuteczność w brandingu',
        'Unikaj nadmiernej złożoności wizualnej'
      ]
    };
  }

  private createEmptyPattern(name: string): AILearningPattern {
    return {
      patternName: name,
      confidence: 0,
      projectCount: 0,
      successRate: 0,
      avgRating: 0,
      exportRate: 0,
      conditions: [],
      recommendations: []
    };
  }
}

// Export singleton instance
export const aiFeedbackTrainer = new AIFeedbackTrainer();