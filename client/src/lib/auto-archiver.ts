import { PINnodeCrypto } from './crypto';
import { AutoArchiveEngine } from './auto-archive-engine';

// Interface for auto-archiving functionality
export interface AutoArchiveConfig {
  enabled: boolean;
  watchDownloads: boolean;
  autoDetectCategory: boolean;
  defaultEncryption: boolean;
  categoryRules: CategoryRule[];
}

export interface CategoryRule {
  pattern: string;
  category: string;
  tags: string[];
  priority: number;
}

// Use optimized engine for category detection
export function detectCategory(filename: string, content?: string): string {
  return AutoArchiveEngine.detectCategory(filename, content).category;
}

// Generate smart tags based on filename and content
export function generateTags(filename: string, content: string): string[] {
  const tags: string[] = [];
  const f = filename.toLowerCase();
  const c = content.toLowerCase();
  
  // File type tags
  if (f.endsWith('.js') || f.endsWith('.ts')) tags.push('JavaScript', 'TypeScript');
  if (f.endsWith('.py')) tags.push('Python');
  if (f.endsWith('.r')) tags.push('R');
  if (f.endsWith('.sql')) tags.push('SQL');
  
  // Content-based tags
  if (c.includes('react')) tags.push('React');
  if (c.includes('vue')) tags.push('Vue');
  if (c.includes('angular')) tags.push('Angular');
  if (c.includes('ggplot') || c.includes('dplyr')) tags.push('DataVisualization');
  if (c.includes('function') || c.includes('def ')) tags.push('Functions');
  if (c.includes('api') || c.includes('endpoint')) tags.push('API');
  if (c.includes('database') || c.includes('sql')) tags.push('Database');
  
  // Branding tags
  if (c.includes('logo') || c.includes('brand')) tags.push('LogoDesign');
  if (c.includes('color') || c.includes('palette')) tags.push('ColorScheme');
  if (c.includes('font') || c.includes('typography')) tags.push('Typography');
  
  // AI/Chat tags
  if (c.includes('deepseek') || c.includes('chatgpt') || c.includes('claude')) tags.push('AI', 'ChatExport');
  if (c.includes('prompt')) tags.push('Prompts');
  
  // Remove duplicates and return
  return [...new Set(tags)];
}

// Detect source based on filename patterns
export function detectSource(filename: string): string {
  const f = filename.toLowerCase();
  
  if (f.includes('deepseek')) return 'DeepSeek Chat';
  if (f.includes('chatgpt') || f.includes('gpt')) return 'ChatGPT';
  if (f.includes('claude')) return 'Claude';
  if (f.includes('github')) return 'GitHub';
  if (f.includes('download')) return 'Manual Download';
  if (f.includes('export')) return 'Data Export';
  
  return 'Unknown';
}

// Main auto-archiving function
export async function autoArchiveDownloads(
  downloadedFiles: string[], 
  masterKey: string,
  config: Partial<AutoArchiveConfig> = {}
): Promise<Array<{ filename: string; success: boolean; error?: string }>> {
  const results: Array<{ filename: string; success: boolean; error?: string }> = [];
  
  const defaultConfig: AutoArchiveConfig = {
    enabled: true,
    watchDownloads: true,
    autoDetectCategory: true,
    defaultEncryption: true,
    categoryRules: []
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.enabled) {
    console.log('Auto-archiving is disabled');
    return results;
  }

  for (const filename of downloadedFiles) {
    try {
      console.log(`🔄 Processing: ${filename}`);
      
      // Fetch file content
      const content = await fetchLocalFileContent(filename);
      
      // Auto-detect metadata
      const category = finalConfig.autoDetectCategory ? detectCategory(filename) : 'Uncategorized';
      const tags = generateTags(filename, content);
      const source = detectSource(filename);
      
      // Encrypt and store
      await encryptAndStoreFile(filename, content, category, tags, source, masterKey);
      
      results.push({ filename, success: true });
      console.log(`✅ Zarchiwizowano: ${filename} jako [${category}] z tagami: ${tags.join(', ')}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.push({ filename, success: false, error: errorMsg });
      console.error(`❌ Błąd archiwizacji ${filename}: ${errorMsg}`);
    }
  }
  
  return results;
}

// Enhanced file storage with full metadata
async function encryptAndStoreFile(
  filename: string, 
  content: string, 
  category: string,
  tags: string[],
  source: string,
  masterKey: string
): Promise<void> {
  const encrypted = masterKey ? PINnodeCrypto.encrypt(content, masterKey) : false;
  
  const entry = {
    filename,
    content: encrypted ? encrypted : content,
    encrypted: !!encrypted,
    category,
    tags,
    source,
    fileSize: content.length,
    createdAt: new Date().toISOString(),
    metadata: {
      autoArchived: true,
      originalPath: `/downloads/${filename}`,
      detectedLanguage: detectLanguage(content),
      complexity: calculateComplexity(content)
    }
  };

  // Store in archive via API
  const response = await fetch('/api/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });

  if (!response.ok) {
    throw new Error(`Failed to store ${filename}: ${response.statusText}`);
  }
}

// Helper function to detect programming language
function detectLanguage(content: string): string {
  const c = content.toLowerCase();
  
  if (c.includes('function') && c.includes('const ')) return 'JavaScript';
  if (c.includes('def ') && c.includes('import ')) return 'Python';
  if (c.includes('library(') || c.includes('ggplot')) return 'R';
  if (c.includes('select ') && c.includes('from ')) return 'SQL';
  if (c.includes('<html') || c.includes('<div')) return 'HTML';
  if (c.includes('body {') || c.includes('.class')) return 'CSS';
  
  return 'Text';
}

// Calculate content complexity score
function calculateComplexity(content: string): number {
  let score = 0;
  
  // Length factor
  score += Math.min(content.length / 1000, 5);
  
  // Code patterns
  if (content.includes('function')) score += 2;
  if (content.includes('class ')) score += 3;
  if (content.includes('import ')) score += 1;
  if (content.includes('```')) score += 1;
  
  // Nesting (simple count of brackets)
  const brackets = (content.match(/[{}()[\]]/g) || []).length;
  score += brackets / 20;
  
  return Math.min(Math.round(score), 10);
}

// Przykładowa funkcja pomocnicza do odczytu pliku w środowisku Replit/PWA
async function fetchLocalFileContent(filename: string): Promise<string> {
  try {
    // First try the downloads directory
    let response = await fetch(`/downloads/${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      // Try without downloads prefix
      response = await fetch(`/${encodeURIComponent(filename)}`);
    }
    
    if (!response.ok) {
      throw new Error(`File not found: ${filename}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch ${filename}: ${error}`);
  }
}

// Watch downloads directory for new files (PWA/ServiceWorker approach)
export function initAutoArchiveWatcher(
  masterKey: string, 
  config: Partial<AutoArchiveConfig> = {}
): () => void {
  let watchInterval: NodeJS.Timeout;
  let lastFileList: string[] = [];
  
  const checkNewFiles = async () => {
    try {
      // This would need to be implemented based on your file system access
      const currentFiles = await getDownloadsList();
      const newFiles = currentFiles.filter(file => !lastFileList.includes(file));
      
      if (newFiles.length > 0) {
        console.log(`🔍 Znaleziono ${newFiles.length} nowych plików do archiwizacji`);
        await autoArchiveDownloads(newFiles, masterKey, config);
      }
      
      lastFileList = currentFiles;
    } catch (error) {
      console.error('Auto-archive watcher error:', error);
    }
  };
  
  // Check every 30 seconds
  watchInterval = setInterval(checkNewFiles, 30000);
  
  // Return cleanup function
  return () => {
    if (watchInterval) {
      clearInterval(watchInterval);
    }
  };
}

// Get recently downloaded files from various sources
export async function getRecentlyDownloadedFilenames(): Promise<string[]> {
  const files: string[] = [];
  
  try {
    // Method 1: Check IndexedDB for UserScript downloads
    const userScriptFiles = await getFromIndexedDB('userScriptDownloads');
    if (userScriptFiles?.length) {
      files.push(...userScriptFiles);
    }
    
    // Method 2: Check localStorage for download tracking
    const trackedDownloads = localStorage.getItem('recentDownloads');
    if (trackedDownloads) {
      const parsed = JSON.parse(trackedDownloads);
      files.push(...parsed);
    }
    
    // Method 3: File API access (if available in PWA)
    if ('showDirectoryPicker' in window) {
      const downloadsFiles = await checkDownloadsDirectory();
      files.push(...downloadsFiles);
    }
    
    // Remove duplicates and return
    return [...new Set(files)];
    
  } catch (error) {
    console.error('Error getting recent downloads:', error);
    return [];
  }
}

// IndexedDB helper for UserScript integration
async function getFromIndexedDB(storeName: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PINnodeDownloads', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        const filenames = records.map(record => record.filename || record.name).filter(Boolean);
        resolve(filenames);
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// File API helper for downloads directory access
async function checkDownloadsDirectory(): Promise<string[]> {
  try {
    // This requires user permission and modern browser support
    const dirHandle = await (window as any).showDirectoryPicker();
    const files: string[] = [];
    
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        // Check if file is recent (last 24 hours)
        const file = await handle.getFile();
        const isRecent = (Date.now() - file.lastModified) < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          files.push(name);
        }
      }
    }
    
    return files;
  } catch (error) {
    // User cancelled or no permission
    return [];
  }
}

// Track new downloads for auto-processing
export function trackDownload(filename: string, content?: string): void {
  try {
    // Store in localStorage for quick access
    const tracked = JSON.parse(localStorage.getItem('recentDownloads') || '[]');
    
    const newEntry = {
      filename,
      timestamp: Date.now(),
      processed: false,
      content: content?.substring(0, 1000) // Store preview for detection
    };
    
    tracked.push(newEntry);
    
    // Keep only last 50 entries
    const limited = tracked.slice(-50);
    localStorage.setItem('recentDownloads', JSON.stringify(limited));
    
    // Also store in IndexedDB for persistence
    storeInIndexedDB('userScriptDownloads', newEntry);
    
    console.log(`📥 Tracked download: ${filename}`);
    
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

// IndexedDB storage helper
function storeInIndexedDB(storeName: string, data: any): void {
  const request = indexedDB.open('PINnodeDownloads', 1);
  
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.add(data);
  };
  
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    }
  };
}

// Mark files as processed to avoid re-archiving
export function markFilesAsProcessed(filenames: string[]): void {
  try {
    const tracked = JSON.parse(localStorage.getItem('recentDownloads') || '[]');
    
    const updated = tracked.map((entry: any) => ({
      ...entry,
      processed: filenames.includes(entry.filename) ? true : entry.processed
    }));
    
    localStorage.setItem('recentDownloads', JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking files as processed:', error);
  }
}

// Get only unprocessed files for auto-archiving
export async function getUnprocessedDownloads(): Promise<string[]> {
  try {
    const tracked = JSON.parse(localStorage.getItem('recentDownloads') || '[]');
    const unprocessed = tracked
      .filter((entry: any) => !entry.processed)
      .map((entry: any) => entry.filename);
    
    return unprocessed;
  } catch (error) {
    console.error('Error getting unprocessed downloads:', error);
    return [];
  }
}

// Export configuration management
export const AutoArchiveSettings = {
  save: (config: AutoArchiveConfig) => {
    localStorage.setItem('autoArchiveConfig', JSON.stringify(config));
  },
  
  load: (): AutoArchiveConfig => {
    const stored = localStorage.getItem('autoArchiveConfig');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      enabled: true,
      watchDownloads: false, // Disabled by default for performance
      autoDetectCategory: true,
      defaultEncryption: true,
      categoryRules: []
    };
  }
};