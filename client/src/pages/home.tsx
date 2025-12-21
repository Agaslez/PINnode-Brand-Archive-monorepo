import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Archive, Shield, Plus, Brain, TrendingUp } from 'lucide-react';
import { ProjectForm } from '@/components/project-form';
import { ProjectList } from '@/components/project-list';
import { FileUpload } from '@/components/file-upload';
import { ArchiveViewer } from '@/components/archive-viewer';
import { ChatDownloader } from '@/components/chat-downloader';
import { ExportSystem } from '@/components/export-system';
import { BrandingAnalytics } from '@/components/branding-analytics';
import { AITemplateGenerator } from '@/components/ai-template-generator';
import { ContentCurator } from '@/components/content-curator';
import { AutoBrandingDashboard } from '@/components/auto-branding-dashboard';
import { PinpalLogo } from '@/components/pinpal-logo';
import { SimpleAssistant } from '@/components/simple-assistant';
import { AutoArchiveManager } from '@/components/auto-archive-manager';
import { AssistantPanel } from '@/components/assistant-panel';
import { CompleteWorkflowGenerator } from '@/components/complete-workflow-generator';
import { initializeAutoArchiveAPI } from '@/hooks/use-auto-archiver';
import { BrandProject, ArchivedEntry } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'branding' | 'archive' | 'analytics' | 'workflow'>('workflow');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const { toast } = useToast();

  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async (): Promise<BrandProject[]> => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });

  const { data: archivedEntries = [], isLoading: archiveLoading, refetch: refetchArchive } = useQuery({
    queryKey: ['/api/archive'],
    queryFn: async (): Promise<ArchivedEntry[]> => {
      const response = await fetch('/api/archive');
      if (!response.ok) throw new Error('Failed to fetch archived entries');
      return response.json();
    }
  });

  const handleProjectCreated = () => {
    refetchProjects();
    setShowCreateForm(false);
  };

  const handleFileUploaded = () => {
    refetchArchive();
  };

  // Initialize auto-archive API for UserScript integration
  React.useEffect(() => {
    initializeAutoArchiveAPI();
  }, []);

  if (projectsLoading || archiveLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <PinpalLogo size="lg" className="mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">PINnode System</h2>
          <p className="text-gray-600 text-lg">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="gradient-header shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PinpalLogo size="md" className="shadow-xl" />
              <div>
                <h1 className="text-3xl font-bold text-white">PINnode System</h1>
                <p className="text-blue-100 text-lg font-medium">
                  AI Branding + Bezpieczne Archiwum z Szyfrowaniem
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Master Key Input */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <Shield className="w-4 h-4 text-white" />
                <input
                  type="password"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Master Key..."
                  className="bg-transparent text-white placeholder-blue-200 border-none outline-none text-sm w-32"
                />
              </div>

              {activeTab === 'branding' && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
                >
                  <Plus className="w-5 h-5" />
                  {showCreateForm ? 'Anuluj' : 'Nowy Projekt'}
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => { setActiveTab('workflow'); setShowCreateForm(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'workflow'
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Auto Generator
            </button>
            
            <button
              onClick={() => { setActiveTab('branding'); setShowCreateForm(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'branding'
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Palette className="w-5 h-5" />
              AI Branding
            </button>
            
            <button
              onClick={() => { setActiveTab('archive'); setShowCreateForm(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'archive'
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Archive className="w-5 h-5" />
              Bezpieczne Archiwum
              {archivedEntries.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {archivedEntries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setShowCreateForm(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Brain className="w-5 h-5" />
              AI Analytics
              {projects.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  AI
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'workflow' ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                🚀 Automatyczny Generator Projektów
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Wprowadź pomysł lub hasło, a system wygeneruje kompletny projekt z brandingiem, stroną i aplikacją gotową do deploy
              </p>
            </div>
            
            <CompleteWorkflowGenerator />
          </div>
        ) : activeTab === 'branding' ? (
          showCreateForm ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Stwórz Nowy Projekt Brandingowy
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Wprowadź nazwę projektu i branżę, a nasza AI wygeneruje dla Ciebie logo i profesjonalny opis
                </p>
              </div>
              
              <ProjectForm onProjectCreated={handleProjectCreated} />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Twoje Projekty Brandingowe
                  </h2>
                  <p className="text-gray-600">
                    Zarządzaj swoimi projektami i eksportuj brandkity
                  </p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Palette className="w-4 h-4 mr-2" />
                  {projects.length === 0 
                    ? 'Brak projektów' 
                    : `${projects.length} ${projects.length === 1 ? 'projekt' : 'projektów'}`
                  }
                </div>
              </div>

              <ProjectList 
                projects={projects} 
                onProjectDeleted={() => refetchProjects()}
                onProjectUpdated={() => refetchProjects()}
              />
            </div>
          )
        ) : activeTab === 'archive' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bezpieczne Archiwum
                </h2>
                <p className="text-gray-600">
                  Przesyłaj, szyfruj i przeszukuj pliki z czatów AI i dokumentów
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 space-y-6">
                <FileUpload 
                  masterKey={masterKey}
                  onUploadComplete={handleFileUploaded}
                />
                
                <ChatDownloader 
                  masterKey={masterKey}
                  onDownloadComplete={handleFileUploaded}
                />
                
                <AutoArchiveManager
                  masterKey={masterKey}
                  onFilesArchived={handleFileUploaded}
                />
                
                <ExportSystem 
                  projects={projects}
                  archivedEntries={archivedEntries}
                  masterKey={masterKey}
                />
              </div>
              
              <div className="xl:col-span-2 space-y-6">
                <ArchiveViewer 
                  entries={archivedEntries}
                  masterKey={masterKey}
                  onRefresh={() => refetchArchive()}
                />
                
                <ContentCurator
                  entries={archivedEntries}
                  masterKey={masterKey}
                />
              </div>
              
              <div className="xl:col-span-3">
                <AssistantPanel />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Brain className="w-8 h-8 text-blue-600" />
                  AI Analytics & Template Generator
                </h2>
                <p className="text-gray-600">
                  Bot uczący się brandingów - analiza wzorców i generowanie inteligentnych template'ów
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analiza {projects.length} projektów
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                  <BrandingAnalytics projects={projects} />
                </div>
                
                <div>
                  <AITemplateGenerator projects={projects} />
                </div>
              </div>

              <AutoBrandingDashboard projects={projects} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
