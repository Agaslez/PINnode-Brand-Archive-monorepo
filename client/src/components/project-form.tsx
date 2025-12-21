import React, { useState } from 'react';
import { Palette, Sparkles, Building2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PinpalLogo } from './pinpal-logo';

interface ProjectFormProps {
  onProjectCreated: () => void;
}

export function ProjectForm({ onProjectCreated }: ProjectFormProps) {
  const [projectName, setProjectName] = useState('');
  const [industry, setIndustry] = useState('');
  const [generatedLogo, setGeneratedLogo] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Real Estate', 'Food & Beverage', 'Fashion', 'Travel', 'Entertainment',
    'Consulting', 'Non-profit', 'Manufacturing', 'Other'
  ];

  const handleGenerateLogo = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź nazwę projektu przed generowaniem logo",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingLogo(true);
    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, industry })
      });

      if (!response.ok) throw new Error('Failed to generate logo');
      
      const data = await response.json();
      setGeneratedLogo(data.logo);
      
      toast({
        title: "Sukces",
        description: "Logo zostało wygenerowane!"
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować logo",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Błąd", 
        description: "Wprowadź nazwę projektu przed generowaniem opisu",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, industry })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error.includes('DeepSeek API key')) {
          toast({
            title: "Wymagany klucz API",
            description: "Skonfiguruj klucz DeepSeek API w zmiennych środowiskowych",
            variant: "destructive"
          });
          return;
        }
        throw new Error('Failed to generate description');
      }
      
      const data = await response.json();
      setGeneratedDescription(data.description);
      
      toast({
        title: "Sukces",
        description: "Opis został wygenerowany przez AI!"
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować opisu",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź nazwę projektu",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          industry: industry || undefined,
          description: generatedDescription || undefined,
          logo: generatedLogo || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to save project');
      
      toast({
        title: "Sukces",
        description: "Projekt został zapisany!"
      });
      
      // Reset form
      setProjectName('');
      setIndustry('');
      setGeneratedLogo('');
      setGeneratedDescription('');
      
      onProjectCreated();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać projektu",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <PinpalLogo size="sm" />
          <span className="text-xl font-bold text-gray-900">Nowy Projekt Brandingowy</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              <Type className="inline w-4 h-4 text-primary mr-2" />
              Nazwa Projektu
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="np. TechStartup Pro"
              className="rounded-xl border-blue-200"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              <Building2 className="inline w-4 h-4 text-primary mr-2" />
              Branża
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
            >
              <option value="">Wybierz branżę...</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Generation Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleGenerateLogo}
            disabled={isGeneratingLogo || !projectName.trim()}
            className="flex items-center gap-2 rounded-xl"
          >
            <Palette className="w-4 h-4" />
            {isGeneratingLogo ? 'Generowanie...' : 'Generuj Logo'}
          </Button>
          
          <Button
            onClick={handleGenerateDescription}
            disabled={isGeneratingDescription || !projectName.trim()}
            variant="secondary"
            className="flex items-center gap-2 rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingDescription ? 'Generowanie...' : 'AI Opis'}
          </Button>
        </div>

        {/* Generated Content */}
        {generatedLogo && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">Wygenerowane Logo:</h3>
            <div 
              className="bg-gray-50 rounded-xl p-4 border border-blue-100"
              dangerouslySetInnerHTML={{ __html: generatedLogo }}
            />
          </div>
        )}

        {generatedDescription && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">Wygenerowany Opis:</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-gray-700 leading-relaxed">{generatedDescription}</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            onClick={handleSaveProject}
            disabled={isSaving || !projectName.trim()}
            className="w-full rounded-xl py-3 text-lg font-semibold"
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz Projekt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}