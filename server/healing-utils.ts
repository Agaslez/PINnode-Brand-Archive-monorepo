import { storage } from "./storage";
// Note: AutoArchiveEngine would be imported from a shared location in production
// For now, we'll implement simplified detection locally

// Advanced healing utilities for archive maintenance
export class ArchiveHealingSystem {
  
  // Main healing function for missing tags and categories
  static async healMissingTags(): Promise<{
    healed: number;
    errors: number;
    details: Array<{ filename: string; action: string; success: boolean }>;
  }> {
    const entries = await storage.getAllArchiveEntries();
    let healed = 0;
    let errors = 0;
    const details: Array<{ filename: string; action: string; success: boolean }> = [];

    for (const entry of entries) {
      try {
        let needsUpdate = false;
        const updates: Partial<typeof entry> = {};

        // Fix missing or empty tags
        if (!entry.tags || entry.tags.length === 0) {
          const newTags = this.extractIntelligentKeywords(entry.content, entry.filename);
          updates.tags = newTags;
          needsUpdate = true;
          
          details.push({
            filename: entry.filename,
            action: `Added tags: ${newTags.join(', ')}`,
            success: true
          });
        }

        // Fix missing or 'Uncategorized' category
        if (!entry.category || entry.category === 'Uncategorized') {
          const category = this.detectSimpleCategory(entry.filename, entry.content);
          updates.category = category;
          needsUpdate = true;
          
          details.push({
            filename: entry.filename,
            action: `Set category: ${category}`,
            success: true
          });
        }

        // Fix missing source information
        if (!entry.source) {
          updates.source = this.detectSimpleSource(entry.filename);
          needsUpdate = true;
        }

        // Update entry if needed
        if (needsUpdate) {

          await storage.updateArchiveEntry(entry.id!, updates);
          healed++;
        }

      } catch (error) {
        errors++;
        details.push({
          filename: entry.filename,
          action: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          success: false
        });
      }
    }

    return { healed, errors, details };
  }

  // Simplified category detection (local version)
  static detectSimpleCategory(filename: string, content: string): string {
    const f = filename.toLowerCase();
    const c = content.toLowerCase();
    
    if (f.includes('brand') || f.includes('logo') || c.includes('brand')) return 'Branding';
    if (f.includes('.js') || f.includes('.ts') || f.includes('.py') || f.includes('.r') || c.includes('function')) return 'Development';
    if (f.includes('chat') || f.includes('conversation') || c.includes('user:') || c.includes('assistant:')) return 'PINpall';
    if (f.includes('idea') || f.includes('concept') || c.includes('idea:')) return 'Ideas';
    if (f.includes('.md') || f.includes('doc') || c.includes('# ')) return 'Documentation';
    if (f.includes('secure') || f.includes('archive')) return 'SecureArchive';
    
    return 'Uncategorized';
  }

  // Simplified source detection (local version)
  static detectSimpleSource(filename: string): string {
    const f = filename.toLowerCase();
    
    if (f.includes('deepseek')) return 'DeepSeek Chat';
    if (f.includes('chatgpt') || f.includes('gpt')) return 'ChatGPT';
    if (f.includes('claude')) return 'Claude';
    if (f.includes('github')) return 'GitHub';
    if (f.includes('download')) return 'Manual Download';
    if (f.includes('export')) return 'Data Export';
    
    return 'Unknown';
  }

  // Smart keyword extraction using multiple algorithms
  static extractIntelligentKeywords(content: string, filename: string): string[] {
    const keywords = new Set<string>();
    
    // 1. Extract from filename
    const filenameParts = filename
      .toLowerCase()
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(part => part.length > 2);
    
    filenameParts.forEach(part => keywords.add(part));

    // 2. Technology detection
    const techPatterns = [
      { pattern: /react|jsx|component/gi, keyword: 'React' },
      { pattern: /vue|vuex/gi, keyword: 'Vue' },
      { pattern: /angular|ng-/gi, keyword: 'Angular' },
      { pattern: /python|pandas|numpy/gi, keyword: 'Python' },
      { pattern: /ggplot|dplyr|tidyverse/gi, keyword: 'R' },
      { pattern: /sql|select|database/gi, keyword: 'SQL' },
      { pattern: /api|rest|endpoint/gi, keyword: 'API' },
      { pattern: /chat|conversation|gpt/gi, keyword: 'AI-Chat' },
      { pattern: /logo|brand|design/gi, keyword: 'Design' },
      { pattern: /export|backup/gi, keyword: 'Backup' }
    ];

    techPatterns.forEach(({ pattern, keyword }) => {
      if (pattern.test(content)) {
        keywords.add(keyword);
      }
    });

    // 3. Important words extraction (TF-IDF like)
    const words = content
      .toLowerCase()
      .match(/\b[a-zA-Z]{4,}\b/g) || [];
    
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top frequent words, excluding common words
    const commonWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 
      'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 
      'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
      'such', 'take', 'than', 'them', 'well', 'were'
    ]);

    const importantWords = Object.entries(wordFreq)
      .filter(([word, freq]) => freq > 1 && !commonWords.has(word))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    importantWords.forEach(word => keywords.add(word));

    // 4. Code-specific patterns
    if (content.includes('function') || content.includes('def ') || content.includes('class ')) {
      keywords.add('Code');
    }
    
    if (content.includes('import ') || content.includes('require(')) {
      keywords.add('Dependencies');
    }

    // Convert to array and limit
    return Array.from(keywords).slice(0, 8);
  }

  // Detect and fix encoding issues (simplified)
  static async fixEncodingIssues(): Promise<{
    fixed: number;
    errors: number;
  }> {
    const entries = await storage.getAllArchiveEntries();
    let fixed = 0;
    let errors = 0;

    for (const entry of entries) {
      try {
        let content = entry.content;
        let needsUpdate = false;

        // Fix common encoding issues
        if (content.includes('â€™')) {
          content = content.replace(/â€™/g, "'");
          needsUpdate = true;
        }

        if (needsUpdate) {
          await storage.updateArchiveEntry(entry.id!, { content });
          fixed++;
        }

      } catch (error) {
        errors++;
        console.error(`Encoding fix failed for ${entry.filename}:`, error);
      }
    }

    return { fixed, errors };
  }

  // Consolidate duplicate entries (simplified)
  static async consolidateDuplicates(): Promise<{
    removed: number;
    consolidated: number;
  }> {
    const entries = await storage.getAllArchiveEntries();
    let removed = 0;
    let consolidated = 0;

    // Simple duplicate detection by filename
    const seen = new Map<string, any>();
    
    for (const entry of entries) {
      const key = entry.filename;
      if (seen.has(key)) {
        // Remove duplicate
        await storage.deleteArchivedEntry(entry.id!);
        removed++;
      } else {
        seen.set(key, entry);
      }
    }

    return { removed, consolidated };
  }

  // Generate healing report
  static async generateHealingReport(): Promise<{
    totalEntries: number;
    healthyEntries: number;
    issuesFound: Array<{
      type: 'missing_tags' | 'missing_category' | 'encoding_issues' | 'duplicates';
      count: number;
      severity: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
  }> {
    const entries = await storage.getAllArchiveEntries();
    const issues: Array<{
      type: 'missing_tags' | 'missing_category' | 'encoding_issues' | 'duplicates';
      count: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Check for missing tags
    const missingTags = entries.filter(e => !e.tags || e.tags.length === 0).length;
    if (missingTags > 0) {
      issues.push({
        type: 'missing_tags',
        count: missingTags,
        severity: missingTags > entries.length * 0.5 ? 'high' : 'medium'
      });
    }

    // Check for missing categories
    const missingCategories = entries.filter(e => !e.category || e.category === 'Uncategorized').length;
    if (missingCategories > 0) {
      issues.push({
        type: 'missing_category',
        count: missingCategories,
        severity: missingCategories > entries.length * 0.3 ? 'high' : 'medium'
      });
    }

    // Check for encoding issues
    const encodingIssues = entries.filter(e => 
      e.content.includes('â€') || e.content.includes('â€™')
    ).length;
    if (encodingIssues > 0) {
      issues.push({
        type: 'encoding_issues',
        count: encodingIssues,
        severity: 'low'
      });
    }

    const healthyEntries = entries.length - issues.reduce((sum, issue) => sum + issue.count, 0);

    const recommendations = [
      ...(missingTags > 0 ? ['Uruchom automatyczne tagowanie dla poprawy wyszukiwania'] : []),
      ...(missingCategories > 0 ? ['Skategoryzuj niesklasyfikowane pliki'] : []),
      ...(encodingIssues > 0 ? ['Napraw problemy z kodowaniem znaków'] : []),
      'Regularnie uruchamiaj system self-healing',
      'Monitoruj jakość danych podczas archiwizacji'
    ];

    return {
      totalEntries: entries.length,
      healthyEntries,
      issuesFound: issues,
      recommendations
    };
  }
}