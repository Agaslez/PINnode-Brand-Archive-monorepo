import { ArchivedEntry } from '@shared/schema';
import { AssistantAction } from './assistant-context';
import { assistantAPI } from './assistant-api';

/**
 * Helper functions for assistant actions
 * Each function handles a specific type of assistant interaction
 */

export class AssistantActions {

  /**
   * Search archive with intelligent filtering
   */
  static async searchArchive(query: string, context: any): Promise<{
    entries: ArchivedEntry[];
    response: string;
    actions: AssistantAction[];
    suggestions: string[];
  }> {
    try {
      const result = await assistantAPI.intelligentSearch(query, {
        contentType: this.detectContentType(query)
      });

      const response = this.formatSearchResponse(result);
      const actions = this.generateSearchActions(result.entries);
      const suggestions = result.suggestions;

      return { entries: result.entries, response, actions, suggestions };
    } catch (error) {
      return {
        entries: [],
        response: `❌ Błąd wyszukiwania: ${error}`,
        actions: [],
        suggestions: ['Spróbuj prostszego zapytania', 'Sprawdź kategorię wpisów']
      };
    }
  }

  /**
   * Extract content from archive entries
   */
  static async extractContent(entryIds: number[], extractionType: string): Promise<{
    response: string;
    downloadUrl?: string;
    actions: AssistantAction[];
  }> {
    try {
      const result = await assistantAPI.extractContent({
        entryIds,
        extractionType: extractionType as any,
        format: 'markdown'
      });

      const response = `✅ Wyodrębniono treść z ${entryIds.length} wpisów:

${result.extractedContent.substring(0, 500)}${result.extractedContent.length > 500 ? '...' : ''}

💡 Insights:
${result.insights.map(insight => `• ${insight}`).join('\n')}`;

      return {
        response,
        downloadUrl: result.downloadUrl,
        actions: result.suggestedActions
      };
    } catch (error) {
      return {
        response: `❌ Błąd wyodrębniania: ${error}`,
        actions: []
      };
    }
  }

  /**
   * Auto-heal damaged entries
   */
  static async healEntries(options: { dryRun?: boolean } = {}): Promise<{
    response: string;
    actions: AssistantAction[];
  }> {
    try {
      const result = await assistantAPI.autoHealEntries(options);

      const response = `🔧 ${options.dryRun ? 'Symulacja' : 'Zakończono'} naprawę wpisów:

📊 Statystyki:
• Naprawiono: ${result.healed} wpisów
• Niepowodzenia: ${result.failed} wpisów

${result.summary}

🎯 Szczegóły napraw:
${result.reports.slice(0, 3).map(report => 
  `• ${report.type}: ${report.confidence > 0.8 ? 'wysoka pewność' : 'średnia pewność'}`
).join('\n')}`;

      const actions: AssistantAction[] = [];
      
      if (options.dryRun) {
        actions.push({
          id: 'heal-confirm',
          label: 'Wykonaj naprawę',
          type: 'heal',
          data: { dryRun: false }
        });
      }

      if (result.healed > 0) {
        actions.push({
          id: 'export-healed',
          label: 'Eksportuj naprawione',
          type: 'export',
          data: { healedEntries: true }
        });
      }

      return { response, actions };
    } catch (error) {
      return {
        response: `❌ Błąd naprawy: ${error}`,
        actions: []
      };
    }
  }

  /**
   * Generate export suggestions
   */
  static async generateExportSuggestions(entryIds: number[]): Promise<{
    response: string;
    actions: AssistantAction[];
  }> {
    try {
      const result = await assistantAPI.generateExportSuggestions(entryIds);

      const response = `📦 Sugestie eksportu dla ${entryIds.length} wpisów:

🎯 Rekomendowany format: ${result.recommendedFormat}

📋 Dostępne opcje:
${result.suggestions.map(suggestion => 
  `• ${suggestion.title} - ${suggestion.estimatedSize}\n  ${suggestion.description}`
).join('\n\n')}

💡 Insights:
${result.insights.map(insight => `• ${insight}`).join('\n')}`;

      const actions = result.suggestions.map(suggestion => suggestion.action);

      return { response, actions };
    } catch (error) {
      return {
        response: `❌ Błąd generowania sugestii: ${error}`,
        actions: []
      };
    }
  }

  /**
   * Analyze chat conversation
   */
  static async analyzeChatConversation(entryId: number): Promise<{
    response: string;
    actions: AssistantAction[];
  }> {
    try {
      const result = await assistantAPI.analyzeChatConversation(entryId);

      const response = `🔍 Analiza rozmowy:

📊 Statystyki:
• Wiadomości użytkownika: ${result.userMessages}
• Odpowiedzi asystenta: ${result.assistantMessages}
• Bloki kodu: ${result.codeBlocks}

🏷️ Tematy: ${result.topics.join(', ')}

💎 Wyodrębniana treść:
${result.extractableContent.slice(0, 3).map(content => 
  `• ${content.type}: ${content.content.substring(0, 100)}... (${(content.confidence * 100).toFixed(0)}% pewności)`
).join('\n')}

💡 Sugestie:
${result.suggestions.map(s => `• ${s}`).join('\n')}`;

      const actions: AssistantAction[] = result.extractableContent.map((content, index) => ({
        id: `extract-${index}`,
        label: `Wyodrębnij ${content.type}`,
        type: 'extract',
        data: { entryId, contentType: content.type, content: content.content }
      }));

      return { response, actions };
    } catch (error) {
      return {
        response: `❌ Błąd analizy: ${error}`,
        actions: []
      };
    }
  }

  /**
   * Get assistant analytics
   */
  static async getAnalytics(): Promise<{
    response: string;
    actions: AssistantAction[];
  }> {
    try {
      const result = await assistantAPI.getAssistantAnalytics();

      const response = `📈 Analityka Asystenta Archiwum:

📊 Statystyki użycia:
• Całkowite zapytania: ${result.totalQueries}
• Wskaźnik sukcesu: ${(result.successRate * 100).toFixed(1)}%

🔝 Najpopularniejsze zapytania:
${result.topQueries.slice(0, 5).map(query => `• "${query}"`).join('\n')}

🧠 Insights uczenia się:
${result.learningInsights.map(insight => `• ${insight}`).join('\n')}

💡 Sugestie poprawy:
${result.improvementSuggestions.map(suggestion => `• ${suggestion}`).join('\n')}`;

      const actions: AssistantAction[] = [
        {
          id: 'export-analytics',
          label: 'Eksportuj analitykę',
          type: 'export',
          data: { type: 'analytics' }
        }
      ];

      return { response, actions };
    } catch (error) {
      return {
        response: `❌ Błąd pobierania analityki: ${error}`,
        actions: []
      };
    }
  }

  // Helper methods

  private static detectContentType(query: string): 'code' | 'text' | 'ideas' | undefined {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('kod') || lowerQuery.includes('function') || lowerQuery.includes('script')) {
      return 'code';
    }
    
    if (lowerQuery.includes('pomysł') || lowerQuery.includes('idea') || lowerQuery.includes('nazwa')) {
      return 'ideas';
    }
    
    return 'text';
  }

  private static formatSearchResponse(result: {
    entries: ArchivedEntry[];
    insights: string[];
    confidence: number;
  }): string {
    const { entries, insights, confidence } = result;

    if (entries.length === 0) {
      return `🔍 Nie znalazłem wpisów pasujących do zapytania.

💡 Sugestie:
• Spróbuj innych słów kluczowych
• Sprawdź kategorię wpisów
• Użyj bardziej ogólnych terminów`;
    }

    return `🎯 Znalazłem ${entries.length} ${entries.length === 1 ? 'wpis' : 'wpisów'} (${(confidence * 100).toFixed(0)}% pewności):

📋 Wyniki:
${entries.slice(0, 5).map(entry => 
  `• ${entry.filename} - ${entry.category || 'Bez kategorii'}`
).join('\n')}
${entries.length > 5 ? `\n... i ${entries.length - 5} więcej` : ''}

💡 Insights:
${insights.map(insight => `• ${insight}`).join('\n')}`;
  }

  private static generateSearchActions(entries: ArchivedEntry[]): AssistantAction[] {
    if (entries.length === 0) return [];

    const actions: AssistantAction[] = [
      {
        id: 'extract-all',
        label: `Wyodrębnij z wszystkich (${entries.length})`,
        type: 'extract',
        data: { entryIds: entries.map(e => e.id!) }
      },
      {
        id: 'export-found',
        label: 'Eksportuj znalezione',
        type: 'export',
        data: { entryIds: entries.map(e => e.id!) }
      }
    ];

    // Add category-specific actions
    const categories = [...new Set(entries.map(e => e.category).filter(Boolean))];
    if (categories.length > 1) {
      categories.forEach(category => {
        const categoryEntries = entries.filter(e => e.category === category);
        actions.push({
          id: `filter-${category}`,
          label: `Pokaż tylko ${category} (${categoryEntries.length})`,
          type: 'search',
          data: { category, entryIds: categoryEntries.map(e => e.id!) }
        });
      });
    }

    return actions;
  }

  /**
   * Execute specific action based on type
   */
  static async executeAction(action: AssistantAction, context?: any): Promise<{
    response: string;
    nextActions?: AssistantAction[];
    downloadUrl?: string;
  }> {
    try {
      switch (action.type) {
        case 'extract':
          return await this.handleExtractAction(action);
        case 'export':
          return await this.handleExportAction(action);
        case 'heal':
          return await this.handleHealAction(action);
        case 'search':
          return await this.handleSearchAction(action);
        case 'tag':
          return await this.handleTagAction(action);
        case 'project':
          return await this.handleProjectAction(action);
        default:
          return {
            response: `❌ Nieznany typ akcji: ${action.type}`,
            nextActions: []
          };
      }
    } catch (error) {
      return {
        response: `❌ Błąd wykonania akcji "${action.label}": ${error}`,
        nextActions: []
      };
    }
  }

  private static async handleExtractAction(action: AssistantAction) {
    const { entryIds, contentType } = action.data;
    const result = await this.extractContent(entryIds, contentType || 'text');
    return result;
  }

  private static async handleExportAction(action: AssistantAction) {
    const { entryIds } = action.data;
    const result = await this.generateExportSuggestions(entryIds);
    return result;
  }

  private static async handleHealAction(action: AssistantAction) {
    const options = action.data || {};
    const result = await this.healEntries(options);
    return result;
  }

  private static async handleSearchAction(action: AssistantAction) {
    const { query, category } = action.data;
    const searchQuery = category ? `category:${category}` : query;
    const result = await this.searchArchive(searchQuery, {});
    return {
      response: result.response,
      nextActions: result.actions
    };
  }

  private static async handleTagAction(action: AssistantAction) {
    // Implementation for tag-related actions
    return {
      response: `🏷️ Akcja tagowania zostanie zaimplementowana`,
      nextActions: []
    };
  }

  private static async handleProjectAction(action: AssistantAction) {
    // Implementation for project-related actions
    return {
      response: `📁 Akcja projektowa zostanie zaimplementowana`,
      nextActions: []
    };
  }
}