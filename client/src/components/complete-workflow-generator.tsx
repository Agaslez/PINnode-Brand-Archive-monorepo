import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Rocket, Zap, Palette, FileText, Globe, Package } from "lucide-react";

interface ProjectStructure {
  assetsData: any;
  brandPackage: any;
  files: Record<string, string>;
}

interface WorkflowResponse {
  success: boolean;
  message: string;
  projectStructure: ProjectStructure;
  nextSteps: string[];
}

export function CompleteWorkflowGenerator() {
  const [prompt, setPrompt] = useState('');
  const [projectStructure, setProjectStructure] = useState<ProjectStructure | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateWorkflowMutation = useMutation({
    mutationFn: async (data: { prompt: string; preferences?: any }) => {
      const response = await fetch('/api/complete-project-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate workflow');
      }
      
      return response.json() as Promise<WorkflowResponse>;
    },
    onSuccess: (data) => {
      setProjectStructure(data.projectStructure);
      toast({
        title: "🎉 Projekt wygenerowany!",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Błąd generowania",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deployMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch('/api/auto-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deploy');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setDeploymentUrl(data.deploymentUrl);
      toast({
        title: "🚀 Deploy gotowy!",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Błąd deploy",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const downloadZipMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch('/api/ai-branding-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate ZIP');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.assetsData.brandName}_complete.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "📦 ZIP pobrany!",
        description: "Kompletny pakiet brandingowy został pobrany",
      });
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "⚠️ Brak promptu",
        description: "Wprowadź opis projektu lub pomysł",
        variant: "destructive",
      });
      return;
    }
    
    generateWorkflowMutation.mutate({ prompt });
  };

  const handleDeploy = () => {
    if (!projectStructure) return;
    deployMutation.mutate(projectStructure);
  };

  const handleDownloadZip = () => {
    if (!projectStructure) return;
    downloadZipMutation.mutate(projectStructure);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="w-6 h-6" />
            Generator Kompletnego Projektu
          </CardTitle>
          <CardDescription>
            Wprowadź pomysł lub hasło – system automatycznie wygeneruje kompletny projekt z brandingiem, stroną i aplikacją
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-prompt">💭 Opisz swój pomysł:</Label>
            <Textarea
              id="project-prompt"
              placeholder="Np. 'Talism.ai — magiczny asystent AI' lub 'SpellBay.shop — sklep z zaklęciami AI, kolor złoty, ciemny styl'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] mt-2"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleGenerate}
              disabled={generateWorkflowMutation.isPending || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generateWorkflowMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Generuj Projekt
            </Button>
            
            {projectStructure && (
              <>
                <Button 
                  onClick={handleDownloadZip}
                  disabled={downloadZipMutation.isPending}
                  variant="outline"
                >
                  {downloadZipMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Pobierz ZIP
                </Button>
                
                <Button 
                  onClick={handleDeploy}
                  disabled={deployMutation.isPending}
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50"
                >
                  {deployMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-2" />
                  )}
                  Deploy Vercel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {projectStructure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Package className="w-5 h-5" />
              Wygenerowany Projekt: {projectStructure.assetsData.brandName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="w-4 h-4 text-purple-600" />
                  Kolory
                </div>
                <div className="flex gap-1">
                  {projectStructure.assetsData.colors?.slice(0, 3).map((color: string, index: number) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Branża
                </div>
                <Badge variant="secondary">
                  {projectStructure.assetsData.industry || 'Technology'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="w-4 h-4 text-green-600" />
                  Pliki
                </div>
                <div className="text-sm text-gray-600">
                  {Object.keys(projectStructure.files).length} plików
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="w-4 h-4 text-orange-600" />
                  Status
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Gotowy
                </Badge>
              </div>
            </div>

            {deploymentUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🚀 Deployment Ready</h4>
                <p className="text-sm text-green-700">
                  Twój projekt jest gotowy do wdrożenia: 
                  <a 
                    href={deploymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 underline font-medium"
                  >
                    {deploymentUrl}
                  </a>
                </p>
              </div>
            )}

            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium">
                📁 Podgląd struktury plików
              </summary>
              <div className="p-3 border-t bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(projectStructure.files).map(([filename, content]) => (
                    <div key={filename} className="space-y-1">
                      <div className="font-medium text-gray-700">{filename}</div>
                      <div className="text-gray-500 text-xs">
                        {typeof content === 'string' ? `${content.length} znaków` : 'Binarny'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-amber-800">🎯 Przykłady promptów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium">Proste:</div>
              <div className="text-gray-600 italic">"Talism.ai — magiczny asystent AI"</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Szczegółowe:</div>
              <div className="text-gray-600 italic">"SpellBay.shop — sklep z zaklęciami AI, kolor złoty, ciemny styl, demo wideo"</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Z brandingiem:</div>
              <div className="text-gray-600 italic">"HealthTrack.app — monitoring zdrowia, styl medyczny, kolor niebieski"</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">E-commerce:</div>
              <div className="text-gray-600 italic">"TechGadgets.store — sklep z gadżetami, nowoczesny design, plansze produktowe"</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}