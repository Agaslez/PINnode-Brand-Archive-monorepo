import React, { useState, useMemo } from 'react';
import { Wand2, Sparkles, Target, Brain, Copy, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BrandProject } from '@shared/schema';

interface AITemplateGeneratorProps {
  projects: BrandProject[];
}

interface BrandTemplate {
  id: string;
  name: string;
  industry: string;
  confidence: number;
  description: string;
  colorScheme: string[];
  fontSuggestions: string[];
  keywords: string[];
  successRate: number;
  prompt: string;
}

export function AITemplateGenerator({ projects }: AITemplateGeneratorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const { toast } = useToast();

  const templates = useMemo(() => {
    return generateTemplatesFromProjects(projects);
  }, [projects]);

  const filteredTemplates = useMemo(() => {
    if (selectedIndustry === 'all') return templates;
    return templates.filter(t => t.industry.toLowerCase() === selectedIndustry.toLowerCase());
  }, [templates, selectedIndustry]);

  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(projects.map(p => p.industry).filter(Boolean))];
    return uniqueIndustries;
  }, [projects]);

  const generateSmartPrompt = (template: BrandTemplate) => {
    const prompt = `Stwórz projekt brandingowy dla branży ${template.industry} używając wzorca AI:

📊 ANALIZA WZORCA (${(template.confidence * 100).toFixed(0)}% pewności):
${template.description}

🎨 REKOMENDOWANE ELEMENTY:
• Kolory: ${template.colorScheme.join(', ')}
• Fonty: ${template.fontSuggestions.join(', ')}
• Słowa kluczowe: ${template.keywords.join(', ')}

✨ PROMPT DLA AI:
"${template.prompt}"

💡 SUCCESS RATE: ${template.successRate.toFixed(0)}% projektów z tym wzorcem osiąga 4+ ⭐

🎯 TEMPLATE INSTRUKCJA:
1. Użyj kolory: ${template.colorScheme[0]} jako główny, ${template.colorScheme[1]} jako accent
2. Zawrzyj słowa: ${template.keywords.slice(0, 3).join(', ')} w opisie
3. Styl: ${template.name.includes('Minimalist') ? 'minimalistyczny' : 'nowoczesny'}
4. Logo: SVG, proste kształty, max 500 znaków
5. Hasło: zawiera element "${template.keywords[0]}"`;

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Skopiowano",
      description: "Template został skopiowany do schowka"
    });
  };

  const exportTemplate = (template: BrandTemplate) => {
    const exportData = {
      template,
      generatedAt: new Date().toISOString(),
      baseAnalysis: `Wzorzec wygenerowany z ${projects.length} projektów`,
      usage: `Użyj tego template'u do tworzenia brandingów w branży ${template.industry}`
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branding-template-${template.industry.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template wyeksportowany",
      description: `Zapisano template dla branży ${template.industry}`
    });
  };

  if (projects.length === 0) {
    return (
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardContent className="p-8 text-center">
          <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI Template Generator</h3>
          <p className="text-gray-600">Utwórz projekty, aby wygenerować inteligentne template'y brandingowe</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Template Generator - Bot uczący się brandingów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz branżę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie branże</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry!.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <p className="text-sm text-gray-600">
            🧠 AI analizuje {projects.length} projektów i generuje template'y oparte na wzorcach sukcesu
          </p>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="glass-effect rounded-2xl border border-blue-100 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.industry}</p>
                </div>
                <Badge variant={template.confidence > 0.7 ? "default" : "secondary"}>
                  {(template.confidence * 100).toFixed(0)}% pewności
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{template.description}</p>

              {/* Color Scheme */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Paleta kolorów:</h4>
                <div className="flex gap-2">
                  {template.colorScheme.map((color, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-600">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Kluczowe słowa:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.keywords.slice(0, 6).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Success Rate */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Success Rate</span>
                <span className="text-lg font-bold text-green-600">{template.successRate.toFixed(0)}%</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => generateSmartPrompt(template)}
                  size="sm"
                  className="flex-1 flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Generuj Prompt
                </Button>
                <Button
                  onClick={() => exportTemplate(template)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <Card className="glass-effect rounded-2xl border border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Sparkles className="w-5 h-5" />
              Wygenerowany AI Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              className="min-h-[300px] mb-4 bg-white"
              placeholder="Wygenerowany prompt pojawi się tutaj..."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => copyToClipboard(generatedPrompt)}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Kopiuj Prompt
              </Button>
              <Button
                onClick={() => {
                  const blob = new Blob([generatedPrompt], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'ai-branding-prompt.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Pobierz jako TXT
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Template Generation Logic
function generateTemplatesFromProjects(projects: BrandProject[]): BrandTemplate[] {
  if (projects.length === 0) return [];

  const templates: BrandTemplate[] = [];

  // Group by industry
  const industryGroups = groupByIndustry(projects);

  Object.entries(industryGroups).forEach(([industry, industryProjects]) => {
    if (industryProjects.length < 1) return;

    const successfulProjects = industryProjects.filter(p => (p.rating || 0) >= 4);
    const exportedProjects = industryProjects.filter(p => p.exported);
    
    // Calculate metrics
    const avgRating = industryProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / industryProjects.length;
    const exportRate = (exportedProjects.length / industryProjects.length) * 100;
    const successRate = (successfulProjects.length / industryProjects.length) * 100;

    // Extract common patterns
    const keywords = extractCommonKeywords(industryProjects);
    const colors = extractColorPatterns(industryProjects);
    
    // Generate template based on patterns
    if (industry.toLowerCase().includes('fintech') || industry.toLowerCase().includes('finance')) {
      templates.push({
        id: `fintech-${Date.now()}`,
        name: 'Fintech Trust Builder',
        industry,
        confidence: Math.min(0.9, industryProjects.length * 0.2 + 0.4),
        description: 'Template dla branży fintech z elementami budowania zaufania i bezpieczeństwa',
        colorScheme: ['#1e40af', '#3b82f6', '#dbeafe'],
        fontSuggestions: ['Inter', 'Roboto', 'Open Sans'],
        keywords: ['trust', 'secure', 'reliable', 'finance', 'payment', ...keywords.slice(0, 3)],
        successRate,
        prompt: `Stwórz logo dla firmy fintech, które buduje zaufanie. Użyj niebieskiej palety kolorów, prostych kształtów geometrycznych i zawrzyj elementy bezpieczeństwa. Hasło powinno zawierać słowa "trust" lub "secure".`
      });
    }

    if (keywords.some(k => ['minimal', 'clean', 'simple'].includes(k.toLowerCase()))) {
      templates.push({
        id: `minimalist-${Date.now()}`,
        name: 'Minimalist Pro',
        industry,
        confidence: 0.75,
        description: 'Template minimalistyczny z czystymi liniami i prostymi kształtami',
        colorScheme: ['#000000', '#ffffff', '#6b7280'],
        fontSuggestions: ['Helvetica', 'Arial', 'Montserrat'],
        keywords: ['minimal', 'clean', 'simple', 'modern', ...keywords.slice(0, 2)],
        successRate,
        prompt: `Zaprojektuj minimalistyczne logo o czystych liniach. Użyj maksymalnie 2 kolory, proste geometryczne kształty i nowoczesną typografię. Logo powinno być skalowalne i czytelne w małych rozmiarach.`
      });
    }

    // Generic industry template
    templates.push({
      id: `${industry.toLowerCase()}-${Date.now()}`,
      name: `${industry} Standard`,
      industry,
      confidence: Math.min(0.8, industryProjects.length * 0.15 + 0.3),
      description: `Standardowy template dla branży ${industry} oparty na analizie ${industryProjects.length} projektów`,
      colorScheme: colors.length > 0 ? colors : ['#3b82f6', '#1e40af', '#dbeafe'],
      fontSuggestions: ['Inter', 'Roboto', 'Open Sans'],
      keywords: keywords.slice(0, 8),
      successRate,
      prompt: `Zaprojektuj profesjonalne logo dla branży ${industry}. Uwzględnij specyfikę branży, użyj odpowiedniej palety kolorów i zawrzyj kluczowe elementy: ${keywords.slice(0, 3).join(', ')}.`
    });
  });

  return templates.sort((a, b) => b.confidence - a.confidence);
}

function groupByIndustry(projects: BrandProject[]): Record<string, BrandProject[]> {
  return projects.reduce((groups, project) => {
    const industry = project.industry || 'Ogólne';
    if (!groups[industry]) groups[industry] = [];
    groups[industry].push(project);
    return groups;
  }, {} as Record<string, BrandProject[]>);
}

function extractCommonKeywords(projects: BrandProject[]): string[] {
  const allText = projects
    .map(p => `${p.name} ${p.description || ''}`)
    .join(' ')
    .toLowerCase();

  const words = allText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'jest', 'może'].includes(word));

  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function extractColorPatterns(projects: BrandProject[]): string[] {
  // Simple color extraction - in real implementation, 
  // this would parse color palettes from project data
  const commonColors = ['#3b82f6', '#1e40af', '#dbeafe']; // Blue theme as default
  
  // Check if projects mention specific colors
  const allText = projects.map(p => p.description || '').join(' ').toLowerCase();
  
  if (allText.includes('red') || allText.includes('czerwony')) {
    return ['#dc2626', '#ef4444', '#fecaca'];
  }
  if (allText.includes('green') || allText.includes('zielony')) {
    return ['#059669', '#10b981', '#d1fae5'];
  }
  if (allText.includes('purple') || allText.includes('fioletowy')) {
    return ['#7c3aed', '#8b5cf6', '#e9d5ff'];
  }
  
  return commonColors;
}