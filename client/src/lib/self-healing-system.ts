import { ArchivedEntry, BrandProject } from '@shared/schema';

export interface HealingReport {
  id: string;
  timestamp: Date;
  type: 'category_fix' | 'tags_extraction' | 'content_repair' | 'metadata_enhancement';
  entryId: number;
  before: Partial<ArchivedEntry>;
  after: Partial<ArchivedEntry>;
  confidence: number;
  status: 'success' | 'failed' | 'pending';
  aiAnalysis?: string;
}

export interface ContentCurationRequest {
  query: string;
  scope: string[];
  format: 'markdown' | 'code' | 'text' | 'json';
  filters?: {
    category?: string;
    dateRange?: [Date, Date];
    tags?: string[];
  };
}

export interface CurationResult {
  extractedContent: string;
  sourceEntries: number[];
  insights: string[];
  suggestedTags: string[];
  confidence: number;
  format: string;
}

/**
 * Self-healing system that automatically repairs and enhances archived content
 * Implements intelligent content curation and analysis
 */
export class SelfHealingSystem {
  private healingQueue: ArchivedEntry[] = [];
  private healingReports: HealingReport[] = [];

  /**
   * Main healing entry point - analyzes and repairs archived entries
   */
  public async healArchiveEntry(entry: ArchivedEntry): Promise<HealingReport> {
    const report: HealingReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      type: this.determineHealingType(entry),
      entryId: entry.id!,
      before: { ...entry },
      after: {},
      confidence: 0,
      status: 'pending'
    };

    try {
      let healed = { ...entry };

      // 1. Fix missing category
      if (!entry.category || entry.category === 'undefined') {
        healed = await this.healMissingCategory(healed);
        report.type = 'category_fix';
      }

      // 2. Extract missing tags
      if (!entry.tags || entry.tags.length === 0) {
        healed = await this.healMissingTags(healed);
        report.type = 'tags_extraction';
      }

      // 3. Enhance metadata
      healed = await this.enhanceMetadata(healed);

      // 4. Repair content issues
      healed = await this.repairContentIssues(healed);

      report.after = healed;
      report.confidence = this.calculateHealingConfidence(entry, healed);
      report.status = 'success';
      report.aiAnalysis = await this.generateAIAnalysis(entry, healed);

      this.healingReports.push(report);
      return report;

    } catch (error) {
      report.status = 'failed';
      report.aiAnalysis = `Healing failed: ${error}`;
      this.healingReports.push(report);
      return report;
    }
  }

  /**
   * Intelligent content curation - extracts specific content based on user queries
   */
  public async curateContent(
    entries: ArchivedEntry[], 
    request: ContentCurationRequest
  ): Promise<CurationResult> {
    
    const filteredEntries = this.filterEntriesByRequest(entries, request);
    const extractedContent = await this.extractContentByQuery(filteredEntries, request);
    const insights = this.generateContentInsights(filteredEntries, extractedContent);
    const suggestedTags = this.extractRelevantTags(filteredEntries, request.query);
    
    return {
      extractedContent,
      sourceEntries: filteredEntries.map(e => e.id!),
      insights,
      suggestedTags,
      confidence: this.calculateCurationConfidence(filteredEntries, request),
      format: request.format
    };
  }

  /**
   * Automated batch healing for all problematic entries
   */
  public async runBatchHealing(entries: ArchivedEntry[]): Promise<HealingReport[]> {
    const problematicEntries = entries.filter(entry => this.needsHealing(entry));
    const reports: HealingReport[] = [];

    console.log(`🔧 Starting batch healing for ${problematicEntries.length} entries`);

    for (const entry of problematicEntries) {
      try {
        const report = await this.healArchiveEntry(entry);
        reports.push(report);
        
        // Add delay to prevent API rate limiting
        await this.delay(500);
        
      } catch (error) {
        console.error(`Failed to heal entry ${entry.id}:`, error);
      }
    }

    return reports;
  }

  /**
   * Interactive content extraction for conversational UI
   */
  public async askUserForContentExtraction(
    entries: ArchivedEntry[],
    query: string
  ): Promise<{
    suggestions: string[];
    previewContent: string;
    actionOptions: string[];
  }> {
    
    const relevantEntries = entries.filter(entry => 
      this.isRelevantToQuery(entry, query)
    );

    const suggestions = await this.generateExtractionSuggestions(relevantEntries, query);
    const previewContent = await this.generateContentPreview(relevantEntries, query);
    const actionOptions = this.generateActionOptions(relevantEntries);

    return {
      suggestions,
      previewContent,
      actionOptions
    };
  }

  // Private helper methods

  private async healMissingCategory(entry: ArchivedEntry): Promise<ArchivedEntry> {
    const content = entry.content.toLowerCase();
    let category = 'General';

    // AI-powered category detection
    if (content.includes('pinpall') || content.includes('pin pall')) {
      category = 'PINpall';
    } else if (content.includes('talism') || content.includes('ai model')) {
      category = 'Talism.ai';
    } else if (content.includes('avatar') || content.includes('character')) {
      category = 'Avatar';
    } else if (content.includes('devops') || content.includes('deployment') || content.includes('docker')) {
      category = 'DevOps';
    } else if (content.includes('code') || content.includes('function') || content.includes('api')) {
      category = 'Development';
    } else if (content.includes('design') || content.includes('brand') || content.includes('logo')) {
      category = 'Branding';
    }

    return { ...entry, category };
  }

  private async healMissingTags(entry: ArchivedEntry): Promise<ArchivedEntry> {
    const content = entry.content.toLowerCase();
    const tags: string[] = [];

    // Extract technical tags
    const techKeywords = ['react', 'typescript', 'nodejs', 'python', 'api', 'database', 'css', 'html'];
    techKeywords.forEach(keyword => {
      if (content.includes(keyword)) tags.push(keyword);
    });

    // Extract topic tags
    const topicKeywords = ['tutorial', 'guide', 'example', 'documentation', 'bug', 'feature', 'idea'];
    topicKeywords.forEach(keyword => {
      if (content.includes(keyword)) tags.push(keyword);
    });

    // Extract AI/Chat specific tags
    if (content.includes('chatgpt')) tags.push('ChatGPT');
    if (content.includes('deepseek')) tags.push('DeepSeek');
    if (content.includes('claude')) tags.push('Claude');
    if (content.includes('conversation') || content.includes('chat')) tags.push('AI-Chat');

    // Extract domain-specific tags
    if (content.includes('fintech') || content.includes('banking')) tags.push('FinTech');
    if (content.includes('healthcare') || content.includes('medical')) tags.push('Healthcare');
    if (content.includes('education') || content.includes('learning')) tags.push('Education');

    return { ...entry, tags: [...new Set([...(entry.tags || []), ...tags])] };
  }

  private async enhanceMetadata(entry: ArchivedEntry): Promise<ArchivedEntry> {
    let enhanced = { ...entry };

    // Detect and set source if missing
    if (!enhanced.source) {
      const content = entry.content.toLowerCase();
      if (content.includes('chatgpt') || content.includes('openai')) {
        enhanced.source = 'ChatGPT';
      } else if (content.includes('deepseek')) {
        enhanced.source = 'DeepSeek';
      } else if (content.includes('claude')) {
        enhanced.source = 'Claude';
      } else {
        enhanced.source = 'Manual upload';
      }
    }

    // Calculate file size if missing
    if (!enhanced.fileSize) {
      enhanced.fileSize = new Blob([entry.content]).size;
    }

    return enhanced;
  }

  private async repairContentIssues(entry: ArchivedEntry): Promise<ArchivedEntry> {
    let content = entry.content;

    // Fix common encoding issues
    content = content.replace(/â€™/g, "'");
    content = content.replace(/â€œ/g, '"');
    content = content.replace(/â€/g, '"');

    // Remove excessive whitespace
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.trim();

    // Fix markdown formatting if detected
    if (content.includes('```') || content.includes('##')) {
      content = this.repairMarkdownFormatting(content);
    }

    return { ...entry, content };
  }

  private repairMarkdownFormatting(content: string): string {
    // Fix unclosed code blocks
    const codeBlockCount = (content.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      content += '\n```';
    }

    // Fix malformed headers
    content = content.replace(/^#{7,}/gm, '######');

    return content;
  }

  private filterEntriesByRequest(entries: ArchivedEntry[], request: ContentCurationRequest): ArchivedEntry[] {
    let filtered = entries;

    // Filter by scope
    if (request.scope.length > 0) {
      filtered = filtered.filter(entry => 
        request.scope.includes(entry.id!.toString()) ||
        request.scope.includes(entry.filename)
      );
    }

    // Filter by category
    if (request.filters?.category) {
      filtered = filtered.filter(entry => 
        entry.category?.toLowerCase().includes(request.filters!.category!.toLowerCase())
      );
    }

    // Filter by tags
    if (request.filters?.tags && request.filters.tags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.tags?.some(tag => 
          request.filters!.tags!.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    // Filter by date range
    if (request.filters?.dateRange) {
      const [startDate, endDate] = request.filters.dateRange;
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.createdAt!);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    return filtered;
  }

  private async extractContentByQuery(entries: ArchivedEntry[], request: ContentCurationRequest): Promise<string> {
    const query = request.query.toLowerCase();
    let extractedParts: string[] = [];

    for (const entry of entries) {
      const content = entry.content;

      if (query.includes('extract all') && query.includes('code')) {
        // Extract code blocks
        const codeMatches = content.match(/```[\s\S]*?```/g) || [];
        extractedParts.push(...codeMatches);
      } else if (query.includes('function') || query.includes('method')) {
        // Extract function definitions
        const functionMatches = content.match(/function\s+\w+[\s\S]*?}/g) || [];
        const methodMatches = content.match(/\w+\s*\([^)]*\)\s*{[\s\S]*?}/g) || [];
        extractedParts.push(...functionMatches, ...methodMatches);
      } else if (query.includes('ideas') || query.includes('suggestions')) {
        // Extract bullet points and suggestions
        const ideaMatches = content.match(/[•\-\*]\s+.+/g) || [];
        extractedParts.push(...ideaMatches);
      } else {
        // General keyword search
        const sentences = content.split(/[.!?]\s+/);
        const relevantSentences = sentences.filter(sentence =>
          query.split(' ').some(keyword =>
            sentence.toLowerCase().includes(keyword)
          )
        );
        extractedParts.push(...relevantSentences);
      }
    }

    // Format based on request
    let result = extractedParts.join('\n\n');

    switch (request.format) {
      case 'markdown':
        result = this.formatAsMarkdown(result, query);
        break;
      case 'code':
        result = this.formatAsCode(result);
        break;
      case 'json':
        result = JSON.stringify({ extracted: extractedParts }, null, 2);
        break;
      default:
        // Plain text - no additional formatting
        break;
    }

    return result;
  }

  private formatAsMarkdown(content: string, query: string): string {
    return `# Extracted Content: ${query}

${content}

---
*Extracted by PINnode Self-Healing System*`;
  }

  private formatAsCode(content: string): string {
    return `\`\`\`
${content}
\`\`\``;
  }

  private generateContentInsights(entries: ArchivedEntry[], extractedContent: string): string[] {
    const insights: string[] = [];

    insights.push(`Analyzed ${entries.length} entries`);
    insights.push(`Extracted ${extractedContent.split('\n').length} lines of content`);

    const sources = [...new Set(entries.map(e => e.source).filter(Boolean))];
    if (sources.length > 0) {
      insights.push(`Sources: ${sources.join(', ')}`);
    }

    const categories = [...new Set(entries.map(e => e.category).filter(Boolean))];
    if (categories.length > 0) {
      insights.push(`Categories: ${categories.join(', ')}`);
    }

    if (extractedContent.includes('function') || extractedContent.includes('def ')) {
      insights.push('Contains executable code');
    }

    if (extractedContent.includes('TODO') || extractedContent.includes('FIXME')) {
      insights.push('Contains action items');
    }

    return insights;
  }

  private extractRelevantTags(entries: ArchivedEntry[], query: string): string[] {
    const allTags = entries.flatMap(entry => entry.tags || []);
    const tagFrequency = new Map<string, number>();

    allTags.forEach(tag => {
      tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
    });

    // Sort by frequency and filter by relevance to query
    return Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag)
      .filter(tag => 
        query.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(query.toLowerCase())
      );
  }

  private calculateCurationConfidence(entries: ArchivedEntry[], request: ContentCurationRequest): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence with more entries
    confidence += Math.min(0.3, entries.length * 0.05);

    // Higher confidence with specific queries
    if (request.query.includes('extract all') || request.query.includes('function')) {
      confidence += 0.2;
    }

    // Higher confidence with filters
    if (request.filters) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }

  private needsHealing(entry: ArchivedEntry): boolean {
    return !entry.category || 
           !entry.tags || 
           entry.tags.length === 0 || 
           !entry.source ||
           entry.content.includes('â€') || // encoding issues
           entry.content.includes('undefined');
  }

  private determineHealingType(entry: ArchivedEntry): HealingReport['type'] {
    if (!entry.category) return 'category_fix';
    if (!entry.tags || entry.tags.length === 0) return 'tags_extraction';
    if (entry.content.includes('â€')) return 'content_repair';
    return 'metadata_enhancement';
  }

  private calculateHealingConfidence(before: ArchivedEntry, after: ArchivedEntry): number {
    let improvements = 0;
    let totalChecks = 0;

    // Check category improvement
    totalChecks++;
    if (!before.category && after.category) improvements++;

    // Check tags improvement
    totalChecks++;
    if ((!before.tags || before.tags.length === 0) && after.tags && after.tags.length > 0) {
      improvements++;
    }

    // Check source improvement
    totalChecks++;
    if (!before.source && after.source) improvements++;

    return improvements / totalChecks;
  }

  private async generateAIAnalysis(before: ArchivedEntry, after: ArchivedEntry): Promise<string> {
    const changes: string[] = [];

    if (before.category !== after.category) {
      changes.push(`Category: "${before.category || 'none'}" → "${after.category}"`);
    }

    if ((before.tags?.length || 0) !== (after.tags?.length || 0)) {
      changes.push(`Tags: ${before.tags?.length || 0} → ${after.tags?.length || 0} tags`);
    }

    if (before.source !== after.source) {
      changes.push(`Source: "${before.source || 'unknown'}" → "${after.source}"`);
    }

    return changes.length > 0 
      ? `AI healing applied: ${changes.join(', ')}`
      : 'No significant changes required';
  }

  private generateReportId(): string {
    return `heal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isRelevantToQuery(entry: ArchivedEntry, query: string): boolean {
    const searchText = `${entry.filename} ${entry.content} ${entry.tags?.join(' ') || ''}`.toLowerCase();
    const queryWords = query.toLowerCase().split(' ');
    
    return queryWords.some(word => searchText.includes(word));
  }

  private async generateExtractionSuggestions(entries: ArchivedEntry[], query: string): Promise<string[]> {
    const suggestions: string[] = [];

    if (query.toLowerCase().includes('code')) {
      suggestions.push('Wyciągnij wszystkie bloki kodu');
      suggestions.push('Znajdź definicje funkcji');
      suggestions.push('Ekstraktuj przykłady API');
    }

    if (query.toLowerCase().includes('idea') || query.toLowerCase().includes('nazwa')) {
      suggestions.push('Zbierz sugestie nazw brandów');
      suggestions.push('Wyodrębnij koncepcje kreatywne');
      suggestions.push('Znajdź inspiracje designu');
    }

    if (entries.some(e => e.category === 'PINpall')) {
      suggestions.push('Ekstraktuj materiały związane z PINpall');
    }

    if (entries.some(e => e.source === 'ChatGPT')) {
      suggestions.push('Znajdź rozmowy z ChatGPT na ten temat');
    }

    return suggestions;
  }

  private async generateContentPreview(entries: ArchivedEntry[], query: string): Promise<string> {
    const relevantEntries = entries.slice(0, 3); // Preview first 3 entries
    const previews = relevantEntries.map(entry => {
      const content = entry.content.substring(0, 200) + '...';
      return `**${entry.filename}**\n${content}`;
    });

    return previews.join('\n\n---\n\n');
  }

  private generateActionOptions(entries: ArchivedEntry[]): string[] {
    return [
      'Utwórz nowy projekt brandingowy',
      'Dodaj jako tagi do istniejącego projektu',
      'Eksportuj jako ZIP',
      'Zapisz jako nowy wpis archiwum',
      'Wyślij do AI do dalszej analizy'
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const selfHealingSystem = new SelfHealingSystem();