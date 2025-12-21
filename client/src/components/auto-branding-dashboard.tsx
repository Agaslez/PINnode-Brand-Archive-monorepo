import React, { useState, useEffect } from 'react';
import { Play, Settings, Calendar, TrendingUp, Zap, Download, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BrandProject } from '@shared/schema';
import { autoBrandingGenerator, GeneratedBrandingSuggestion, WeeklyReport, AutoBrandingConfig } from '@/lib/auto-branding-generator';

interface AutoBrandingDashboardProps {
  projects: BrandProject[];
}

export function AutoBrandingDashboard({ projects }: AutoBrandingDashboardProps) {
  const [config, setConfig] = useState<AutoBrandingConfig>(autoBrandingGenerator.getConfig());
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastReport, setLastReport] = useState<WeeklyReport | null>(null);
  const [suggestions, setSuggestions] = useState<GeneratedBrandingSuggestion[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GeneratedBrandingSuggestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load generation history on component mount
    setGenerationHistory(autoBrandingGenerator.getGenerationHistory());
    const reports = autoBrandingGenerator.getWeeklyReports();
    if (reports.length > 0) {
      setLastReport(reports[reports.length - 1]);
    }
  }, []);

  const handleRunGeneration = async () => {
    if (projects.length < config.minProjectsForLearning) {
      toast({
        title: "Niewystarczająca ilość danych",
        description: `Potrzebujesz minimum ${config.minProjectsForLearning} projektów do uruchomienia auto-generacji`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await autoBrandingGenerator.runWeeklyGeneration(projects);
      
      if (result.success) {
        setSuggestions(result.suggestions);
        setLastReport(result.report);
        setGenerationHistory(autoBrandingGenerator.getGenerationHistory());
        
        toast({
          title: "Generacja zakończona",
          description: `Wygenerowano ${result.suggestions.length} sugestii brandingowych`
        });
      } else {
        toast({
          title: "Błąd generacji",
          description: "Nie udało się wygenerować sugestii",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas generacji",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigUpdate = (key: keyof AutoBrandingConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    autoBrandingGenerator.configure(newConfig);
    
    toast({
      title: "Konfiguracja zaktualizowana",
      description: `${key} została zmieniona`
    });
  };

  const handleSendToDeepSeek = async (suggestion: GeneratedBrandingSuggestion) => {
    try {
      const result = await autoBrandingGenerator.sendToDeepSeekAPI(suggestion);
      
      if (result.success) {
        toast({
          title: "Wysłano do DeepSeek",
          description: `Sugestia "${suggestion.name}" została wysłana do AI`
        });
      } else {
        toast({
          title: "Błąd wysyłania",
          description: result.error || "Nie udało się wysłać do DeepSeek",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas wysyłania",
        variant: "destructive"
      });
    }
  };

  const downloadSuggestions = () => {
    const data = {
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
        colors: s.colorSuggestions,
        visualMotifs: s.visualMotifs
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-branding-suggestions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Pobrano sugestie",
      description: "Automatyczne sugestie brandingowe zostały pobrane"
    });
  };

  const canRunGeneration = projects.length >= config.minProjectsForLearning;
  const shouldRunAuto = autoBrandingGenerator.shouldRunGeneration();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="glass-effect rounded-2xl border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Auto-Branding Generator
            <Badge variant={config.enabled ? "default" : "secondary"} className="ml-auto">
              {config.enabled ? 'Aktywny' : 'Nieaktywny'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Włącz auto-generację</span>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => handleConfigUpdate('enabled', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Częstotliwość</label>
              <Select
                value={config.frequency}
                onValueChange={(value) => handleConfigUpdate('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Codziennie</SelectItem>
                  <SelectItem value="weekly">Tygodniowo</SelectItem>
                  <SelectItem value="monthly">Miesięcznie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min. projektów</label>
              <Select
                value={config.minProjectsForLearning.toString()}
                onValueChange={(value) => handleConfigUpdate('minProjectsForLearning', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 projekty</SelectItem>
                  <SelectItem value="5">5 projektów</SelectItem>
                  <SelectItem value="10">10 projektów</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              onClick={handleRunGeneration}
              disabled={isGenerating || !canRunGeneration}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isGenerating ? 'Generuję...' : 'Uruchom generację'}
            </Button>

            {shouldRunAuto && config.enabled && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Gotowy do auto-generacji
              </Badge>
            )}

            {!canRunGeneration && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Potrzebujesz więcej projektów ({projects.length}/{config.minProjectsForLearning})
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Report */}
      {lastReport && (
        <Card className="glass-effect rounded-2xl border border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Raport tygodniowy: {lastReport.week}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastReport.totalSuggestions}</div>
                <div className="text-sm text-gray-600">Sugestii</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastReport.industryTrends.length}</div>
                <div className="text-sm text-gray-600">Analizowanych branż</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{lastReport.recommendations.length}</div>
                <div className="text-sm text-gray-600">Rekomendacji</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Najlepszy wzorzec:</h4>
                <p className="text-sm text-gray-600">{lastReport.topPerformingPattern}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">💡 Rekomendacje:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {lastReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📈 Focus na następny tydzień:</h4>
                <div className="flex flex-wrap gap-2">
                  {lastReport.nextWeekFocus.map((focus, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Suggestions */}
      {suggestions.length > 0 && (
        <Card className="glass-effect rounded-2xl border border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Wygenerowane sugestie ({suggestions.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSuggestions}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Pobierz JSON
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{suggestion.name}</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {suggestion.industry}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        {suggestion.estimatedSuccess.toFixed(0)}% sukces
                      </div>
                      <div className="text-xs text-gray-500">
                        {(suggestion.confidence * 100).toFixed(0)}% pewności
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {suggestion.description.substring(0, 150)}...
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-gray-600">
                      <strong>Kolory:</strong> {suggestion.colorSuggestions.join(', ')}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Słowa kluczowe:</strong> {suggestion.keywords.slice(0, 4).join(', ')}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSendToDeepSeek(suggestion)}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Send className="w-3 h-3" />
                      Wyślij do AI
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(suggestion.aiPrompt);
                        toast({ title: "Skopiowano prompt", description: "Prompt AI został skopiowany do schowka" });
                      }}
                      className="text-xs"
                    >
                      Kopiuj prompt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <Card className="glass-effect rounded-2xl border border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Historia generacji ({generationHistory.length} sugestii)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generationHistory.slice(-10).reverse().map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{suggestion.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({suggestion.industry})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {suggestion.generatedAt.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-green-600">
                      {suggestion.estimatedSuccess.toFixed(0)}% sukces
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}