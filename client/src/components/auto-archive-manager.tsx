import React, { useState, useEffect } from 'react';
import { Upload, Settings, Play, Pause, FileSearch, Shield, Tag, Folder, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { autoArchiveDownloads, AutoArchiveSettings, AutoArchiveConfig } from '@/lib/auto-archiver';
import { useAutoArchiver } from '@/hooks/use-auto-archiver';

interface AutoArchiveManagerProps {
  masterKey: string;
  onFilesArchived?: () => void;
}

export function AutoArchiveManager({ masterKey, onFilesArchived }: AutoArchiveManagerProps) {
  const {
    isWatching,
    isProcessing: autoProcessing,
    recentFiles,
    processedCount,
    config,
    startWatching,
    stopWatching,
    processNow,
    updateConfig
  } = useAutoArchiver({
    masterKey,
    enabled: true,
    onFilesArchived: (results) => {
      setRecentResults(results);
      if (onFilesArchived) onFilesArchived();
    }
  });

  const [manualFiles, setManualFiles] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentResults, setRecentResults] = useState<Array<{ filename: string; success: boolean; error?: string }>>([]);
  const { toast } = useToast();

  // Auto-save configuration changes
  const handleConfigChange = (changes: Partial<AutoArchiveConfig>) => {
    updateConfig(changes);
  };

  const handleManualArchive = async () => {
    if (!manualFiles.trim()) {
      toast({
        title: "Błąd",
        description: "Podaj nazwy plików do archiwizacji",
        variant: "destructive"
      });
      return;
    }

    if (!masterKey) {
      toast({
        title: "Brak klucza", 
        description: "Podaj Master Key do szyfrowania",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const files = manualFiles.split('\n').map(f => f.trim()).filter(Boolean);
      const results = await autoArchiveDownloads(files, masterKey, config);
      
      setRecentResults(results);
      setManualFiles('');
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      toast({
        title: "Archiwizacja zakończona",
        description: `Sukces: ${successful}, Błędy: ${failed}`
      });

      if (onFilesArchived) {
        onFilesArchived();
      }

    } catch (error) {
      toast({
        title: "Błąd archiwizacji",
        description: error instanceof Error ? error.message : 'Nieznany błąd',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessNow = async () => {
    try {
      await processNow();
      toast({
        title: "Przetwarzanie zakończone",
        description: "Sprawdzono i przetworzono nowe pliki"
      });
    } catch (error) {
      toast({
        title: "Błąd przetwarzania",
        description: error instanceof Error ? error.message : 'Nieznany błąd',
        variant: "destructive"
      });
    }
  };

  const handleToggleWatcher = () => {
    if (isWatching) {
      stopWatching();
    } else {
      startWatching();
    }
  };

  const categoryStats = [
    { name: 'Branding', pattern: 'brand, logo, identity', color: 'bg-blue-100 text-blue-800' },
    { name: 'Development', pattern: '.js, .py, .r, code', color: 'bg-green-100 text-green-800' },
    { name: 'PINpall', pattern: 'chat, deepseek, gpt', color: 'bg-purple-100 text-purple-800' },
    { name: 'Ideas', pattern: 'idea, feedback, concept', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Documentation', pattern: '.md, .txt, doc', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Auto-Archiver
          <Badge variant={isWatching ? "default" : "secondary"}>
            {isWatching ? "Aktywny" : "Nieaktywny"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Konfiguracja
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-detekcja kategorii</span>
              <Switch
                checked={config.autoDetectCategory}
                onCheckedChange={(checked) => handleConfigChange({ autoDetectCategory: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Domyślne szyfrowanie</span>
              <Switch
                checked={config.defaultEncryption}
                onCheckedChange={(checked) => handleConfigChange({ defaultEncryption: checked })}
              />
            </div>
          </div>
        </div>

        {/* Category Detection Rules */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Reguły kategoryzacji
          </h3>
          
          <div className="grid gap-2">
            {categoryStats.map(cat => (
              <div key={cat.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <Badge className={cat.color}>{cat.name}</Badge>
                  <span className="text-xs text-gray-600 ml-2">{cat.pattern}</span>
                </div>
                <FileSearch className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Manual Archive */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Archiwizacja manualna
          </h3>
          
          <textarea
            value={manualFiles}
            onChange={(e) => setManualFiles(e.target.value)}
            placeholder="Podaj nazwy plików (jeden w linii):&#10;chat_export_2024.txt&#10;brand_ideas.md&#10;script.py"
            className="w-full h-24 p-3 border rounded-lg resize-none text-sm"
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualArchive}
              disabled={isProcessing || !manualFiles.trim()}
              className="flex-1"
            >
              {isProcessing ? "Przetwarzanie..." : "Archiwizuj pliki"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleProcessNow}
              disabled={autoProcessing}
            >
              <FileSearch className="w-4 h-4" />
              {autoProcessing ? "..." : "Sprawdź"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleToggleWatcher}
              disabled={!masterKey}
            >
              {isWatching ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isWatching ? "Stop" : "Auto"}
            </Button>
          </div>
        </div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Ostatnie rezultaty
            </h3>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentResults.map((result, index) => (
                <div key={index} className={`p-2 rounded-lg text-sm ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.filename}</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✓" : "✗"}
                    </Badge>
                  </div>
                  {result.error && (
                    <div className="text-xs mt-1 opacity-75">{result.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Files & Status */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileSearch className="w-4 h-4" />
            Aktywność systemu
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">Przetworzone</div>
              <div className="text-lg font-bold text-green-900">{processedCount}</div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Najnowsze pliki</div>
              <div className="text-lg font-bold text-blue-900">{recentFiles.length}</div>
            </div>
          </div>
          
          {recentFiles.length > 0 && (
            <div className="text-xs text-gray-600 max-h-16 overflow-y-auto">
              <strong>Najnowsze:</strong> {recentFiles.slice(0, 3).join(', ')}
              {recentFiles.length > 3 && ` +${recentFiles.length - 3} więcej`}
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Status systemu</span>
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {masterKey ? (
              <>Master Key: ✓ Gotowy do szyfrowania</>
            ) : (
              <>Master Key: ✗ Wymagany do pełnej funkcjonalności</>
            )}
          </div>
          <div className="text-xs text-blue-700">
            Auto-detekcja: {config.autoDetectCategory ? "włączona" : "wyłączona"} | 
            Szyfrowanie: {config.defaultEncryption ? "domyślnie" : "opcjonalnie"}
          </div>
          <div className="text-xs text-blue-700">
            Monitoring: {isWatching ? "aktywny" : "nieaktywny"} | 
            Przetwarzanie: {autoProcessing ? "w toku" : "oczekuje"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}