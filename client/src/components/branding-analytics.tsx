import React, { useMemo } from 'react';
import { TrendingUp, Brain, Target, Award, BarChart3, Lightbulb } from 'lucide-react';
import { aiFeedbackTrainer } from '@/lib/ai-feedback-trainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrandProject } from '@shared/schema';

interface BrandingAnalyticsProps {
  projects: BrandProject[];
}

interface BrandingPattern {
  pattern: string;
  confidence: number;
  projects: number;
  exportRate: number;
  avgRating: number;
  recommendation: string;
}

interface IndustryInsight {
  industry: string;
  count: number;
  avgRating: number;
  exportRate: number;
  topKeywords: string[];
}

export function BrandingAnalytics({ projects }: BrandingAnalyticsProps) {
  const analytics = useMemo(() => {
    if (projects.length === 0) return null;

    // Use AI Feedback Trainer for professional analysis
    const learningPatterns = aiFeedbackTrainer.identifyLearningPatterns(projects);
    const promptSeed = aiFeedbackTrainer.updatePromptSeed(projects);
    const scoredProjects = projects.map(p => aiFeedbackTrainer.scoreProject(p));

    // Industry Analysis using professional scoring
    const industryMap = new Map<string, { projects: BrandProject[], scores: number[], exports: number }>();
    
    scoredProjects.forEach(scored => {
      const industry = scored.project.industry || 'Nieokreślona';
      if (!industryMap.has(industry)) {
        industryMap.set(industry, { projects: [], scores: [], exports: 0 });
      }
      const data = industryMap.get(industry)!;
      data.projects.push(scored.project);
      data.scores.push(scored.totalScore);
      if (scored.project.exported) data.exports++;
    });

    const industryInsights: IndustryInsight[] = Array.from(industryMap.entries()).map(([industry, data]) => ({
      industry,
      count: data.projects.length,
      avgRating: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      exportRate: (data.exports / data.projects.length) * 100,
      topKeywords: promptSeed.keywords.slice(0, 5)
    }));

    // Convert learning patterns to display format
    const patterns: BrandingPattern[] = learningPatterns.map(pattern => ({
      pattern: pattern.patternName,
      confidence: pattern.confidence,
      projects: pattern.projectCount,
      exportRate: pattern.exportRate,
      avgRating: pattern.avgRating,
      recommendation: pattern.recommendations[0] || 'Kontynuuj obecny trend'
    }));

    // Enhanced success metrics
    const totalExports = projects.filter(p => p.exported).length;
    const avgRating = projects.reduce((sum, p) => sum + (p.rating || 0), 0) / projects.length;
    const highRatedProjects = projects.filter(p => (p.rating || 0) >= 4).length;
    
    return {
      industryInsights: industryInsights.sort((a, b) => b.avgRating - a.avgRating),
      patterns: patterns.sort((a, b) => b.confidence - a.confidence),
      learningPatterns,
      promptSeed,
      scoredProjects: scoredProjects.sort((a, b) => b.totalScore - a.totalScore),
      metrics: {
        totalProjects: projects.length,
        totalExports,
        exportRate: (totalExports / projects.length) * 100,
        avgRating,
        highRatedProjects,
        successRate: (highRatedProjects / projects.length) * 100,
        avgScore: scoredProjects.reduce((sum, p) => sum + p.totalScore, 0) / scoredProjects.length
      }
    };
  }, [projects]);

  if (!analytics) {
    return (
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analityka brandingów</h3>
          <p className="text-gray-600">Utwórz projekty, aby zobaczyć wzorce i insights AI</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Metrics */}
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Metryki sukcesu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.metrics.totalProjects}</div>
              <div className="text-sm text-gray-600">Projektów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.metrics.exportRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Eksportów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{analytics.metrics.avgRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Średnia ocena</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.metrics.avgScore?.toFixed(1) || '0'}</div>
              <div className="text-sm text-gray-600">Średni wynik AI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Patterns */}
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Wzorce AI - Bot uczący się brandingów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.patterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{pattern.pattern}</h4>
                  <Badge variant="secondary" className="ml-2">
                    {(pattern.confidence * 100).toFixed(0)}% pewności
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{pattern.projects} projektów</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{pattern.exportRate.toFixed(1)}% eksportów</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{pattern.avgRating.toFixed(1)} ⭐ średnia</span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <Progress value={pattern.confidence * 100} className="h-2" />
                </div>
                
                <div className="flex items-start gap-2 bg-white/50 rounded p-3">
                  <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 font-medium">{pattern.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Insights */}
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analiza branżowa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.industryInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-white/50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.industry}</h4>
                  <Badge variant="outline">{insight.count} projektów</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-600">Średnia ocena: </span>
                    <span className="font-semibold text-yellow-600">{insight.avgRating.toFixed(1)} ⭐</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Export rate: </span>
                    <span className="font-semibold text-green-600">{insight.exportRate.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Kluczowe słowa: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {insight.topKeywords.slice(0, 5).map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Analysis Functions
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['jest', 'może', 'które', 'this', 'that', 'with', 'from'].includes(word));
  
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function analyzeFintech(projects: BrandProject[]): BrandingPattern {
  const fintechProjects = projects.filter(p => 
    (p.industry?.toLowerCase().includes('fintech') || 
     p.industry?.toLowerCase().includes('finance') ||
     p.description?.toLowerCase().includes('payment') ||
     p.description?.toLowerCase().includes('banking'))
  );
  
  if (fintechProjects.length < 2) {
    return { pattern: '', confidence: 0, projects: 0, exportRate: 0, avgRating: 0, recommendation: '' };
  }
  
  const exportRate = (fintechProjects.filter(p => p.exported).length / fintechProjects.length) * 100;
  const avgRating = fintechProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / fintechProjects.length;
  
  return {
    pattern: 'Fintech + słowa kluczowe "trust", "secure"',
    confidence: Math.min(fintechProjects.length / projects.length + 0.3, 0.9),
    projects: fintechProjects.length,
    exportRate,
    avgRating,
    recommendation: `Projekty fintech z elementami zaufania mają ${exportRate.toFixed(0)}% eksportów. Użyj słów: "bezpieczny", "zaufany", "stabilny".`
  };
}

function analyzeMinimalism(projects: BrandProject[]): BrandingPattern {
  const minimalProjects = projects.filter(p => 
    p.description?.toLowerCase().includes('minimal') ||
    p.description?.toLowerCase().includes('clean') ||
    p.description?.toLowerCase().includes('simple')
  );
  
  if (minimalProjects.length < 2) {
    return { pattern: '', confidence: 0, projects: 0, exportRate: 0, avgRating: 0, recommendation: '' };
  }
  
  const exportRate = (minimalProjects.filter(p => p.exported).length / minimalProjects.length) * 100;
  const avgRating = minimalProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / minimalProjects.length;
  
  return {
    pattern: 'Styl minimalistyczny + odcienie niebieskiego',
    confidence: 0.75,
    projects: minimalProjects.length,
    exportRate,
    avgRating,
    recommendation: `Minimalistyczne projekty z niebieskimi akcentami otrzymują ${avgRating.toFixed(1)}/5 ⭐. Kontynuuj ten trend.`
  };
}

function analyzeTrustKeywords(projects: BrandProject[]): BrandingPattern {
  const trustProjects = projects.filter(p => 
    p.description?.toLowerCase().includes('trust') ||
    p.description?.toLowerCase().includes('reliable') ||
    p.description?.toLowerCase().includes('secure') ||
    p.name?.toLowerCase().includes('trust')
  );
  
  if (trustProjects.length < 1) {
    return { pattern: '', confidence: 0, projects: 0, exportRate: 0, avgRating: 0, recommendation: '' };
  }
  
  const exportRate = (trustProjects.filter(p => p.exported).length / trustProjects.length) * 100;
  const avgRating = trustProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / trustProjects.length;
  
  return {
    pattern: 'Hasła zawierające "trust", "secure", "reliable"',
    confidence: 0.85,
    projects: trustProjects.length,
    exportRate,
    avgRating,
    recommendation: `Projekty z hasłami zaufania mają ${exportRate.toFixed(0)}% eksportów. Skuteczne słowa: "trust", "secure", "reliable".`
  };
}

function analyzeColorPatterns(projects: BrandProject[]): BrandingPattern {
  const blueProjects = projects.filter(p => 
    p.colorPalette?.includes('blue') ||
    p.description?.toLowerCase().includes('blue') ||
    p.description?.toLowerCase().includes('niebieski')
  );
  
  if (blueProjects.length < 2) {
    return { pattern: '', confidence: 0, projects: 0, exportRate: 0, avgRating: 0, recommendation: '' };
  }
  
  const exportRate = (blueProjects.filter(p => p.exported).length / blueProjects.length) * 100;
  const avgRating = blueProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / blueProjects.length;
  
  return {
    pattern: 'Paleta kolorów z odcieniami niebieskiego',
    confidence: 0.7,
    projects: blueProjects.length,
    exportRate,
    avgRating,
    recommendation: `Niebieskie palety kolorów osiągają ${avgRating.toFixed(1)}/5 ⭐ średniej oceny. Niebieski buduje zaufanie.`
  };
}

function analyzeSVGComplexity(projects: BrandProject[]): BrandingPattern {
  const simpleLogos = projects.filter(p => 
    p.logo && p.logo.length < 500 // Prosta metryka złożoności SVG
  );
  
  if (simpleLogos.length < 2) {
    return { pattern: '', confidence: 0, projects: 0, exportRate: 0, avgRating: 0, recommendation: '' };
  }
  
  const exportRate = (simpleLogos.filter(p => p.exported).length / simpleLogos.length) * 100;
  const avgRating = simpleLogos.reduce((sum, p) => sum + (p.rating || 0), 0) / simpleLogos.length;
  
  return {
    pattern: 'SVG o niskiej złożoności (< 500 znaków)',
    confidence: 0.6,
    projects: simpleLogos.length,
    exportRate,
    avgRating,
    recommendation: `Proste logo SVG (< 500 znaków) mają ${avgRating.toFixed(1)}/5 ⭐. Prostota = skuteczność.`
  };
}