import { PINnodeCrypto } from './crypto';

// Core auto-archiving engine with optimized performance
export class AutoArchiveEngine {
  private static readonly BATCH_SIZE = 10;
  private static readonly PROCESSING_DELAY = 1000;
  private static readonly MAX_RETRIES = 3;

  // Enhanced category detection with machine learning-like scoring
  static detectCategory(filename: string, content?: string): {
    category: string;
    confidence: number;
    tags: string[];
    source: string;
  } {
    const f = filename.toLowerCase();
    const c = content?.toLowerCase() || '';
    
    const patterns = [
      {
        category: 'Branding',
        patterns: ['brand', 'logo', 'identity', 'design', 'visual'],
        contentPatterns: ['logo', 'brand', 'color', 'palette', 'typography'],
        weight: 1.0
      },
      {
        category: 'Development',
        patterns: ['.js', '.ts', '.py', '.r', '.sql', 'code', 'script'],
        contentPatterns: ['function', 'class', 'import', 'def ', 'const ', 'var '],
        weight: 1.0
      },
      {
        category: 'PINpall',
        patterns: ['chat', 'deepseek', 'gpt', 'claude', 'conversation'],
        contentPatterns: ['user:', 'assistant:', 'human:', 'ai:'],
        weight: 1.0
      },
      {
        category: 'Ideas',
        patterns: ['idea', 'concept', 'feedback', 'brainstorm', 'note'],
        contentPatterns: ['idea:', 'concept:', 'todo:', 'plan:'],
        weight: 0.8
      },
      {
        category: 'Documentation',
        patterns: ['.md', '.txt', 'doc', 'manual', 'guide', 'readme'],
        contentPatterns: ['# ', '## ', 'documentation', 'guide', 'tutorial'],
        weight: 0.7
      },
      {
        category: 'SecureArchive',
        patterns: ['secure', 'archive', 'backup', 'encrypted'],
        contentPatterns: ['encrypted', 'secure', 'backup'],
        weight: 0.9
      }
    ];

    let bestMatch = { category: 'Uncategorized', confidence: 0, tags: [] as string[], source: 'Unknown' };

    patterns.forEach(pattern => {
      let score = 0;
      
      // Filename pattern matching
      pattern.patterns.forEach(p => {
        if (f.includes(p)) score += pattern.weight;
      });
      
      // Content pattern matching (if available)
      if (content) {
        pattern.contentPatterns.forEach(p => {
          if (c.includes(p)) score += pattern.weight * 0.5;
        });
      }
      
      if (score > bestMatch.confidence) {
        bestMatch = {
          category: pattern.category,
          confidence: score,
          tags: this.generateTags(filename, content),
          source: this.detectSource(filename)
        };
      }
    });

    return bestMatch;
  }

  // Advanced tag generation with context awareness
  static generateTags(filename: string, content?: string): string[] {
    const tags = new Set<string>();
    const f = filename.toLowerCase();
    const c = content?.toLowerCase() || '';

    // File extension tags
    const extMap = {
      '.js': ['JavaScript', 'Frontend'],
      '.ts': ['TypeScript', 'Frontend'],
      '.py': ['Python', 'Backend'],
      '.r': ['R', 'DataScience', 'Statistics'],
      '.sql': ['SQL', 'Database'],
      '.md': ['Markdown', 'Documentation'],
      '.txt': ['Text', 'Notes'],
      '.json': ['JSON', 'Data'],
      '.csv': ['CSV', 'Data', 'Export']
    };

    Object.entries(extMap).forEach(([ext, extTags]) => {
      if (f.endsWith(ext)) {
        extTags.forEach(tag => tags.add(tag));
      }
    });

    // Content-based intelligent tagging
    if (content) {
      const contentPatterns = [
        { patterns: ['react', 'jsx', 'component'], tags: ['React', 'Component'] },
        { patterns: ['vue', 'vuex'], tags: ['Vue', 'VueJS'] },
        { patterns: ['angular', 'ng-'], tags: ['Angular'] },
        { patterns: ['ggplot', 'dplyr', 'tidyverse'], tags: ['DataVisualization', 'Tidyverse'] },
        { patterns: ['api', 'endpoint', 'rest'], tags: ['API', 'REST'] },
        { patterns: ['database', 'sql', 'select'], tags: ['Database', 'Query'] },
        { patterns: ['chat', 'conversation', 'message'], tags: ['Chat', 'Conversation'] },
        { patterns: ['brand', 'logo', 'design'], tags: ['Branding', 'Design'] },
        { patterns: ['color', 'palette', '#'], tags: ['ColorScheme', 'Design'] },
        { patterns: ['font', 'typography', 'text'], tags: ['Typography', 'Design'] },
        { patterns: ['function', 'def ', 'class'], tags: ['Functions', 'Code'] },
        { patterns: ['async', 'await', 'promise'], tags: ['Async', 'Promise'] },
        { patterns: ['test', 'spec', 'describe'], tags: ['Testing', 'QA'] }
      ];

      contentPatterns.forEach(({ patterns, tags: patternTags }) => {
        patterns.forEach(pattern => {
          if (c.includes(pattern)) {
            patternTags.forEach(tag => tags.add(tag));
          }
        });
      });
    }

    // Filename-based tagging
    const filenamePatterns = [
      { patterns: ['chat', 'conversation'], tags: ['ChatExport'] },
      { patterns: ['export', 'backup'], tags: ['Export', 'Backup'] },
      { patterns: ['config', 'settings'], tags: ['Configuration'] },
      { patterns: ['template', 'boilerplate'], tags: ['Template'] },
      { patterns: ['utils', 'helpers'], tags: ['Utilities'] },
      { patterns: ['components', 'widgets'], tags: ['Components'] }
    ];

    filenamePatterns.forEach(({ patterns, tags: patternTags }) => {
      patterns.forEach(pattern => {
        if (f.includes(pattern)) {
          patternTags.forEach(tag => tags.add(tag));
        }
      });
    });

    // Auto tag for automated processing
    tags.add('auto');

    return Array.from(tags);
  }

  // Enhanced source detection
  static detectSource(filename: string): string {
    const f = filename.toLowerCase();
    
    const sources = [
      { patterns: ['deepseek'], source: 'DeepSeek Chat' },
      { patterns: ['chatgpt', 'gpt'], source: 'ChatGPT' },
      { patterns: ['claude'], source: 'Claude' },
      { patterns: ['copilot'], source: 'GitHub Copilot' },
      { patterns: ['github'], source: 'GitHub' },
      { patterns: ['stackoverflow'], source: 'StackOverflow' },
      { patterns: ['export', 'download'], source: 'Manual Export' },
      { patterns: ['userscript'], source: 'UserScript Auto' },
      { patterns: ['backup'], source: 'Backup System' }
    ];

    for (const { patterns, source } of sources) {
      if (patterns.some(pattern => f.includes(pattern))) {
        return source;
      }
    }

    return 'Unknown';
  }

  // Optimized batch processing with retry logic
  static async processBatch(
    files: Array<{ filename: string; content: string }>,
    masterKey: string,
    onProgress?: (processed: number, total: number) => void
  ): Promise<Array<{ filename: string; success: boolean; error?: string; metadata?: any }>> {
    const results: Array<{ filename: string; success: boolean; error?: string; metadata?: any }> = [];
    
    for (let i = 0; i < files.length; i += this.BATCH_SIZE) {
      const batch = files.slice(i, i + this.BATCH_SIZE);
      
      const batchPromises = batch.map(async ({ filename, content }) => {
        let attempts = 0;
        
        while (attempts < this.MAX_RETRIES) {
          try {
            const detection = this.detectCategory(filename, content);
            const encrypted = masterKey ? PINnodeCrypto.encrypt(content, masterKey) : content;
            
            const entry = {
              filename,
              content: encrypted,
              encrypted: !!masterKey,
              category: detection.category,
              tags: detection.tags,
              source: detection.source,
              fileSize: content.length,
              createdAt: new Date().toISOString(),
              metadata: {
                autoArchived: true,
                confidence: detection.confidence,
                detectedLanguage: this.detectLanguage(content),
                complexity: this.calculateComplexity(content),
                processingTime: Date.now()
              }
            };

            const response = await fetch('/api/archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry)
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return {
              filename,
              success: true,
              metadata: {
                category: detection.category,
                tags: detection.tags,
                confidence: detection.confidence
              }
            };

          } catch (error) {
            attempts++;
            if (attempts >= this.MAX_RETRIES) {
              return {
                filename,
                success: false,
                error: `Failed after ${this.MAX_RETRIES} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, this.PROCESSING_DELAY * Math.pow(2, attempts - 1)));
          }
        }
        
        return { filename, success: false, error: 'Max retries exceeded' };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (onProgress) {
        onProgress(Math.min(i + this.BATCH_SIZE, files.length), files.length);
      }
      
      // Small delay between batches to avoid overwhelming the system
      if (i + this.BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, this.PROCESSING_DELAY));
      }
    }

    return results;
  }

  // Enhanced language detection with confidence scoring
  static detectLanguage(content: string): { language: string; confidence: number } {
    const c = content.toLowerCase();
    const languagePatterns = [
      { language: 'JavaScript', patterns: ['function', 'const ', 'let ', '=>', 'console.log'], weight: 1.0 },
      { language: 'TypeScript', patterns: ['interface', 'type ', ': string', ': number', 'export type'], weight: 1.0 },
      { language: 'Python', patterns: ['def ', 'import ', 'from ', '__init__', 'if __name__'], weight: 1.0 },
      { language: 'R', patterns: ['library(', '<-', 'ggplot', 'data.frame', '%>%'], weight: 1.0 },
      { language: 'SQL', patterns: ['select ', 'from ', 'where ', 'join ', 'group by'], weight: 1.0 },
      { language: 'HTML', patterns: ['<html', '<div', '<span', '<body', '</'], weight: 0.9 },
      { language: 'CSS', patterns: ['body {', '.class', '#id', 'margin:', 'padding:'], weight: 0.9 },
      { language: 'JSON', patterns: ['{', '}', '":', '[]', 'null'], weight: 0.8 },
      { language: 'Markdown', patterns: ['# ', '## ', '```', '- ', '* '], weight: 0.7 },
      { language: 'Text', patterns: [], weight: 0.1 }
    ];

    let bestMatch = { language: 'Text', confidence: 0 };

    languagePatterns.forEach(({ language, patterns, weight }) => {
      let score = 0;
      patterns.forEach(pattern => {
        const matches = (c.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
        score += matches * weight;
      });
      
      if (score > bestMatch.confidence) {
        bestMatch = { language, confidence: score };
      }
    });

    return bestMatch;
  }

  // Advanced complexity calculation
  static calculateComplexity(content: string): number {
    let score = 0;
    
    // Length factor (normalized)
    score += Math.min(content.length / 2000, 3);
    
    // Structural complexity
    const brackets = (content.match(/[{}()[\]]/g) || []).length;
    score += Math.min(brackets / 50, 3);
    
    // Code patterns complexity
    const codePatterns = [
      /function\s+\w+/g, // Functions
      /class\s+\w+/g, // Classes
      /import\s+.+from/g, // Imports
      /if\s*\(/g, // Conditionals
      /for\s*\(/g, // Loops
      /while\s*\(/g, // While loops
      /try\s*{/g, // Error handling
      /async\s+/g, // Async operations
      /\/\*[\s\S]*?\*\//g, // Comments
      /\/\/.*$/gm // Line comments
    ];
    
    codePatterns.forEach(pattern => {
      const matches = (content.match(pattern) || []).length;
      score += matches * 0.1;
    });
    
    // Nesting depth approximation
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of content) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth--;
      }
    }
    score += maxDepth * 0.2;
    
    return Math.min(Math.round(score), 10);
  }
}

// Export simplified interface functions
export const detectCategory = AutoArchiveEngine.detectCategory.bind(AutoArchiveEngine);
export const generateTags = AutoArchiveEngine.generateTags.bind(AutoArchiveEngine);
export const detectSource = AutoArchiveEngine.detectSource.bind(AutoArchiveEngine);
export const processBatch = AutoArchiveEngine.processBatch.bind(AutoArchiveEngine);
export const detectLanguage = AutoArchiveEngine.detectLanguage.bind(AutoArchiveEngine);
export const calculateComplexity = AutoArchiveEngine.calculateComplexity.bind(AutoArchiveEngine);