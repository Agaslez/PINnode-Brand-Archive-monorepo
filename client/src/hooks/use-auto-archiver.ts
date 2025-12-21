import { useEffect, useState, useCallback } from 'react';
import { 
  getRecentlyDownloadedFilenames, 
  getUnprocessedDownloads,
  autoArchiveDownloads, 
  markFilesAsProcessed,
  AutoArchiveConfig,
  AutoArchiveSettings 
} from '@/lib/auto-archiver';
import { useToast } from '@/hooks/use-toast';

interface UseAutoArchiverProps {
  masterKey: string;
  enabled?: boolean;
  onFilesArchived?: (results: Array<{ filename: string; success: boolean }>) => void;
}

interface UseAutoArchiverReturn {
  isWatching: boolean;
  isProcessing: boolean;
  recentFiles: string[];
  processedCount: number;
  config: AutoArchiveConfig;
  
  startWatching: () => void;
  stopWatching: () => void;
  processNow: () => Promise<void>;
  updateConfig: (newConfig: Partial<AutoArchiveConfig>) => void;
}

export function useAutoArchiver({ 
  masterKey, 
  enabled = true, 
  onFilesArchived 
}: UseAutoArchiverProps): UseAutoArchiverReturn {
  const [isWatching, setIsWatching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [config, setConfig] = useState<AutoArchiveConfig>(AutoArchiveSettings.load());
  const { toast } = useToast();

  // Auto-process function
  const processUnprocessedFiles = useCallback(async () => {
    if (!enabled || !masterKey || isProcessing) return;

    try {
      setIsProcessing(true);
      
      const unprocessedFiles = await getUnprocessedDownloads();
      
      if (unprocessedFiles.length === 0) {
        return; // No new files to process
      }

      console.log(`🔄 Auto-archiving ${unprocessedFiles.length} files`);
      
      const results = await autoArchiveDownloads(unprocessedFiles, masterKey, config);
      
      // Mark successful files as processed
      const successfulFiles = results
        .filter(r => r.success)
        .map(r => r.filename);
      
      if (successfulFiles.length > 0) {
        markFilesAsProcessed(successfulFiles);
        setProcessedCount(prev => prev + successfulFiles.length);
        
        toast({
          title: "Auto-archiwizacja",
          description: `Zarchiwizowano ${successfulFiles.length} plików automatycznie`
        });
      }

      // Handle failed files
      const failedFiles = results.filter(r => !r.success);
      if (failedFiles.length > 0) {
        console.warn('Failed to archive:', failedFiles);
      }

      if (onFilesArchived) {
        onFilesArchived(results);
      }

    } catch (error) {
      console.error('Auto-archiver error:', error);
      toast({
        title: "Błąd auto-archiwizacji",
        description: error instanceof Error ? error.message : 'Nieznany błąd',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [enabled, masterKey, isProcessing, config, onFilesArchived, toast]);

  // Update recent files list
  const updateRecentFiles = useCallback(async () => {
    try {
      const files = await getRecentlyDownloadedFilenames();
      setRecentFiles(files);
    } catch (error) {
      console.error('Error updating recent files:', error);
    }
  }, []);

  // Start watching for new files
  const startWatching = useCallback(() => {
    if (!masterKey) {
      toast({
        title: "Brak klucza",
        description: "Podaj Master Key przed włączeniem auto-archiwizacji",
        variant: "destructive"
      });
      return;
    }

    setIsWatching(true);
    toast({
      title: "Auto-archiwizacja włączona",
      description: "System będzie automatycznie przetwarzać nowe pliki"
    });
  }, [masterKey, toast]);

  // Stop watching
  const stopWatching = useCallback(() => {
    setIsWatching(false);
    toast({
      title: "Auto-archiwizacja wyłączona",
      description: "Automatyczne przetwarzanie plików zatrzymane"
    });
  }, [toast]);

  // Manual processing trigger
  const processNow = useCallback(async () => {
    await updateRecentFiles();
    await processUnprocessedFiles();
  }, [updateRecentFiles, processUnprocessedFiles]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AutoArchiveConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    AutoArchiveSettings.save(updated);
  }, [config]);

  // Watch for new files when enabled
  useEffect(() => {
    if (!isWatching || !enabled) return;

    const interval = setInterval(() => {
      updateRecentFiles();
      processUnprocessedFiles();
    }, 30000); // Check every 30 seconds

    // Initial check
    updateRecentFiles();
    processUnprocessedFiles();

    return () => clearInterval(interval);
  }, [isWatching, enabled, updateRecentFiles, processUnprocessedFiles]);

  // Listen for custom download events (from UserScript)
  useEffect(() => {
    const handleDownloadEvent = (event: CustomEvent) => {
      const { filename, content } = event.detail;
      console.log(`📥 New download detected: ${filename}`);
      
      // Add small delay to allow file to be written
      setTimeout(() => {
        if (isWatching) {
          processUnprocessedFiles();
        }
      }, 1000);
    };

    window.addEventListener('pinnode-download' as any, handleDownloadEvent);
    
    return () => {
      window.removeEventListener('pinnode-download' as any, handleDownloadEvent);
    };
  }, [isWatching, processUnprocessedFiles]);

  // Update recent files on mount
  useEffect(() => {
    updateRecentFiles();
  }, [updateRecentFiles]);

  return {
    isWatching,
    isProcessing,
    recentFiles,
    processedCount,
    config,
    startWatching,
    stopWatching,
    processNow,
    updateConfig
  };
}

// Global function for UserScript integration
declare global {
  interface Window {
    PINnodeAutoArchive?: {
      trackDownload: (filename: string, content?: string) => void;
      triggerProcessing: () => void;
    };
  }
}

// Initialize global API for UserScript
export function initializeAutoArchiveAPI(): void {
  window.PINnodeAutoArchive = {
    trackDownload: (filename: string, content?: string) => {
      // Track the download
      const tracked = JSON.parse(localStorage.getItem('recentDownloads') || '[]');
      
      tracked.push({
        filename,
        content: content?.substring(0, 1000),
        timestamp: Date.now(),
        processed: false
      });
      
      localStorage.setItem('recentDownloads', JSON.stringify(tracked.slice(-50)));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pinnode-download', {
        detail: { filename, content }
      }));
      
      console.log(`📥 PINnode tracked: ${filename}`);
    },
    
    triggerProcessing: () => {
      window.dispatchEvent(new CustomEvent('pinnode-process-now'));
    }
  };
  
  console.log('🔧 PINnode Auto-Archive API initialized');
}