import { storage } from './storage';
import { AutoArchiveEngine } from '../client/src/lib/auto-archive-engine';
import { callDeepSeek, enhancedAssistantQuery } from './deepseek-api';
import { ArchiveHealingSystem } from './healing-utils';

interface AssistantContext {
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  preferences: {
    autoHeal?: boolean;
    learningMode?: boolean;
    quickActions?: boolean;
  };
  timestamp: string;
}

interface AssistantResponse {
  response: string;
  actions?: Array<{
    id: string;
    label: string;
    type: 'extract' | 'export' | 'heal' | 'tag' | 'project' | 'search';
    data?: any;
  }>;
  suggestions?: string[];
}

export class AdvancedAssistantHandler {
  private static readonly QUERY_PATTERNS = [
    {
      patterns: ['kod r', 'r script', 'ggplot', 'shiny', 'tidyverse'],
      handler: 'handleRCodeQuery',
      category: 'code_search'
    },
    {
      patterns: ['kod python', 'python script', 'pandas', 'numpy', 'matplotlib'],
      handler: 'handlePythonCodeQuery',
      category: 'code_search'
    },
    {
      patterns: ['kod javascript', 'js code', 'react', 'vue', 'angular'],
      handler: 'handleJavaScriptCodeQuery',
      category: 'code_search'
    },
    {
      patterns: ['napraw', 'naprawa', 'fix', 'heal', 'samoleczenie'],
      handler: 'handleHealingQuery',
      category: 'healing'
    },
    {
      patterns: ['statystyki', 'stats', 'analiza', 'podsumowanie'],
      handler: 'handleStatsQuery',
      category: 'analytics'
    },
    {
      patterns: ['eksport', 'export', 'pobierz', 'zapisz'],
      handler: 'handleExportQuery',
      category: 'export'
    },
    {
      patterns: ['znajdź', 'szukaj', 'search', 'wyszukaj'],
      handler: 'handleSearchQuery',
      category: 'search'
    },
    {
      patterns: ['kategoria', 'tag', 'tagi', 'kategoryzuj'],
      handler: 'handleCategoryQuery',
      category: 'categorization'
    },
    {
      patterns: ['czat', 'chat', 'conversation', 'rozmowa'],
      handler: 'handleChatQuery',
      category: 'chat_search'
    },
    {
      patterns: ['brand', 'branding', 'logo', 'design'],
      handler: 'handleBrandingQuery',
      category: 'branding'
    }
  ];

  static async handleQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    const lowerQuery = query.toLowerCase();
    
    // Find matching pattern
    const matchedPattern = this.QUERY_PATTERNS.find(pattern =>
      pattern.patterns.some(p => lowerQuery.includes(p))
    );

    if (matchedPattern) {
      const handler = this[matchedPattern.handler as keyof typeof this] as Function;
      return await handler.call(this, query, context, lowerQuery);
    }

    // Default: general search or help
    return await this.handleGeneralQuery(query, context);
  }

  // Handle R code queries
  static async handleRCodeQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      const rEntries = entries.filter(entry => 
        entry.tags?.includes('R') || 
        entry.category === 'Development' ||
        entry.content.toLowerCase().includes('ggplot') ||
        entry.content.toLowerCase().includes('library(') ||
        entry.filename.toLowerCase().includes('.r')
      );

      if (rEntries.length === 0) {
        return {
          response: "❌ Nie znalazłem żadnych plików z kodem R w archiwum.\n\nCzy chcesz:\n• Dodać przykładowy kod R?\n• Przeszukać wszystkie pliki?",
          suggestions: [
            "Pokaż wszystkie pliki z kodem",
            "Dodaj przykład ggplot",
            "Wyszukaj funkcje R"
          ]
        };
      }

      const summary = rEntries.slice(0, 10).map(entry => 
        `📄 **${entry.filename}**\n   Kategoria: ${entry.category}\n   Tagi: ${entry.tags?.join(', ') || 'brak'}\n   Rozmiar: ${entry.fileSize || 'unknown'} znaków`
      ).join('\n\n');

      return {
        response: `🔍 Znalazłem **${rEntries.length}** plików z kodem R:\n\n${summary}${rEntries.length > 10 ? `\n\n...i ${rEntries.length - 10} więcej` : ''}`,
        actions: [
          {
            id: 'extract_r_functions',
            label: 'Wyodrębnij funkcje R',
            type: 'extract',
            data: { entries: rEntries.map(e => e.id), language: 'R' }
          },
          {
            id: 'export_r_code',
            label: 'Eksportuj kod R',
            type: 'export',
            data: { entries: rEntries.map(e => e.id), format: 'R' }
          }
        ],
        suggestions: [
          "Pokaż funkcje ggplot",
          "Znajdź data.frame operacje",
          "Eksportuj wszystkie skrypty R"
        ]
      };
    } catch (error) {
      return {
        response: `❌ Błąd podczas wyszukiwania kodu R: ${error}`,
        suggestions: ["Spróbuj ponownie", "Sprawdź połączenie"]
      };
    }
  }

  // Handle Python code queries
  static async handlePythonCodeQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      const pythonEntries = entries.filter(entry => 
        entry.tags?.includes('Python') || 
        entry.content.toLowerCase().includes('def ') ||
        entry.content.toLowerCase().includes('import ') ||
        entry.filename.toLowerCase().endsWith('.py')
      );

      if (pythonEntries.length === 0) {
        return {
          response: "❌ Nie znalazłem plików z kodem Python w archiwum.",
          suggestions: ["Pokaż wszystkie pliki", "Dodaj kod Python"]
        };
      }

      const summary = pythonEntries.slice(0, 8).map(entry => 
        `🐍 **${entry.filename}**\n   ${entry.tags?.join(', ') || 'Python'}`
      ).join('\n\n');

      return {
        response: `🔍 Znalazłem **${pythonEntries.length}** plików Python:\n\n${summary}`,
        actions: [
          {
            id: 'extract_python_functions',
            label: 'Wyodrębnij funkcje Python',
            type: 'extract',
            data: { entries: pythonEntries.map(e => e.id), language: 'Python' }
          }
        ]
      };
    } catch (error) {
      return { response: `❌ Błąd: ${error}` };
    }
  }

  // Handle JavaScript code queries
  static async handleJavaScriptCodeQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      const jsEntries = entries.filter(entry => 
        entry.tags?.includes('JavaScript') || 
        entry.tags?.includes('TypeScript') ||
        entry.content.toLowerCase().includes('function') ||
        entry.filename.toLowerCase().includes('.js') ||
        entry.filename.toLowerCase().includes('.ts')
      );

      const summary = jsEntries.slice(0, 8).map(entry => 
        `⚡ **${entry.filename}**\n   ${entry.tags?.join(', ') || 'JavaScript'}`
      ).join('\n\n');

      return {
        response: `🔍 Znalazłem **${jsEntries.length}** plików JavaScript/TypeScript:\n\n${summary}`,
        actions: [
          {
            id: 'extract_js_components',
            label: 'Wyodrębnij komponenty',
            type: 'extract',
            data: { entries: jsEntries.map(e => e.id), language: 'JavaScript' }
          }
        ]
      };
    } catch (error) {
      return { response: `❌ Błąd: ${error}` };
    }
  }

  // Handle healing/repair queries
  static async handleHealingQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      
      // Find entries that need healing
      const needsHealing = entries.filter(entry => 
        !entry.tags || entry.tags.length === 0 || 
        !entry.category || entry.category === 'Uncategorized'
      );

      if (needsHealing.length === 0) {
        return {
          response: "✅ Wszystkie wpisy w archiwum są prawidłowo skategoryzowane i otagowane!",
          suggestions: ["Pokaż statystyki archiwum", "Sprawdź jakość danych"]
        };
      }

      // Use advanced healing system
      const healingResult = await ArchiveHealingSystem.healMissingTags();
      const healed = healingResult.healed;

      return {
        response: `🧽 **Self-Healing System wykonany!**\n\n✅ Naprawiono: **${healed}** wpisów\n❓ Pozostało do naprawy: **${needsHealing.length - healed}**\n\nWpisy otrzymały nowe kategorie i tagi na podstawie analizy zawartości.`,
        actions: healed > 0 ? [
          {
            id: 'continue_healing',
            label: 'Kontynuuj naprawę',
            type: 'heal',
            data: { remaining: needsHealing.length - healed }
          }
        ] : [],
        suggestions: [
          "Pokaż naprawione wpisy",
          "Sprawdź statystyki kategorii",
          "Kontynuuj naprawę pozostałych"
        ]
      };
    } catch (error) {
      return { response: `❌ Błąd podczas naprawy: ${error}` };
    }
  }

  // Handle statistics queries
  static async handleStatsQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      
      const stats = {
        total: entries.length,
        categories: {} as Record<string, number>,
        languages: {} as Record<string, number>,
        sources: {} as Record<string, number>,
        encrypted: entries.filter(e => e.encrypted).length,
        autoArchived: entries.filter(e => e.metadata?.autoArchived).length
      };

      // Calculate category distribution
      entries.forEach(entry => {
        const cat = entry.category || 'Uncategorized';
        stats.categories[cat] = (stats.categories[cat] || 0) + 1;
        
        const source = entry.source || 'Unknown';
        stats.sources[source] = (stats.sources[source] || 0) + 1;
        
        const lang = entry.metadata?.detectedLanguage || 'Text';
        stats.languages[lang] = (stats.languages[lang] || 0) + 1;
      });

      const categoryList = Object.entries(stats.categories)
        .sort(([,a], [,b]) => b - a)
        .map(([cat, count]) => `• **${cat}**: ${count} plików`)
        .join('\n');

      const sourceList = Object.entries(stats.sources)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => `• **${source}**: ${count}`)
        .join('\n');

      return {
        response: `📊 **Statystyki Archiwum PINnode**\n\n🗂️ **Łącznie**: ${stats.total} plików\n🔒 **Zaszyfrowane**: ${stats.encrypted} (${Math.round(stats.encrypted/stats.total*100)}%)\n🤖 **Auto-archiwizowane**: ${stats.autoArchived}\n\n**📁 Kategorie:**\n${categoryList}\n\n**📥 Źródła:**\n${sourceList}`,
        actions: [
          {
            id: 'export_stats',
            label: 'Eksportuj statystyki',
            type: 'export',
            data: { type: 'statistics', stats }
          }
        ],
        suggestions: [
          "Pokaż szczegóły kategorii",
          "Analiza jakości danych",
          "Export raport CSV"
        ]
      };
    } catch (error) {
      return { response: `❌ Błąd podczas generowania statystyk: ${error}` };
    }
  }

  // Handle export queries
  static async handleExportQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      
      // Determine export type from query
      let exportType = 'all';
      if (query.includes('kod') || query.includes('code')) exportType = 'code';
      if (query.includes('chat') || query.includes('rozmow')) exportType = 'chats';
      if (query.includes('brand')) exportType = 'branding';

      const filteredEntries = exportType === 'all' ? entries : 
        entries.filter(entry => {
          switch (exportType) {
            case 'code': return entry.category === 'Development';
            case 'chats': return entry.category === 'PINpall';
            case 'branding': return entry.category === 'Branding';
            default: return true;
          }
        });

      return {
        response: `📦 **Gotowy do eksportu**\n\nTyp: ${exportType === 'all' ? 'Wszystkie pliki' : exportType}\nLiczba plików: **${filteredEntries.length}**\n\nDostępne formaty:\n• 📄 JSON (z metadanymi)\n• 📁 ZIP (pliki + struktura)\n• 📊 CSV (lista z tagami)\n• 📝 Markdown (czytelny format)`,
        actions: [
          {
            id: 'export_json',
            label: 'Eksportuj JSON',
            type: 'export',
            data: { entries: filteredEntries.map(e => e.id), format: 'json' }
          },
          {
            id: 'export_zip',
            label: 'Eksportuj ZIP',
            type: 'export',
            data: { entries: filteredEntries.map(e => e.id), format: 'zip' }
          },
          {
            id: 'export_csv',
            label: 'Eksportuj CSV',
            type: 'export',
            data: { entries: filteredEntries.map(e => e.id), format: 'csv' }
          }
        ]
      };
    } catch (error) {
      return { response: `❌ Błąd eksportu: ${error}` };
    }
  }

  // Handle search queries
  static async handleSearchQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    try {
      const entries = await storage.getAllArchiveEntries();
      const searchTerms = query.toLowerCase().split(' ').filter(term => 
        !['znajdź', 'szukaj', 'search', 'wyszukaj'].includes(term)
      );

      const results = entries.filter(entry => {
        const searchable = `${entry.filename} ${entry.content} ${entry.tags?.join(' ') || ''} ${entry.category}`.toLowerCase();
        return searchTerms.some(term => searchable.includes(term));
      });

      if (results.length === 0) {
        return {
          response: `❌ Nie znalazłem plików zawierających: "${searchTerms.join(', ')}"\n\nSpróbuj:\n• Użyć innych słów kluczowych\n• Sprawdzić pisownię\n• Wyszukać w konkretnej kategorii`,
          suggestions: [
            "Pokaż wszystkie kategorie",
            "Wyszukaj w Development",
            "Sprawdź najnowsze pliki"
          ]
        };
      }

      const summary = results.slice(0, 8).map(entry => 
        `📄 **${entry.filename}**\n   📁 ${entry.category} | 🏷️ ${entry.tags?.slice(0, 3).join(', ') || 'brak'}`
      ).join('\n\n');

      return {
        response: `🔍 **Wyniki wyszukiwania** dla: "${searchTerms.join(', ')}"\n\nZnaleziono: **${results.length}** plików\n\n${summary}${results.length > 8 ? `\n\n...i ${results.length - 8} więcej` : ''}`,
        actions: [
          {
            id: 'view_results',
            label: 'Pokaż szczegóły',
            type: 'search',
            data: { results: results.map(e => e.id), query: searchTerms.join(' ') }
          }
        ]
      };
    } catch (error) {
      return { response: `❌ Błąd wyszukiwania: ${error}` };
    }
  }

  // Handle general queries with DeepSeek integration
  static async handleGeneralQuery(query: string, context: AssistantContext): Promise<AssistantResponse> {
    const entries = await storage.getAllArchiveEntries();
    
    // Prepare archive context for AI
    const archiveContext = {
      totalFiles: entries.length,
      categories: entries.reduce((acc, entry) => {
        const cat = entry.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: entries
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 5)
        .map(e => e.filename)
    };

    // Try enhanced query processing
    try {
      const aiResult = await enhancedAssistantQuery(query, archiveContext);
      
      if (aiResult.source === 'deepseek' && aiResult.response.length > 50) {
        return {
          response: `🧠 **AI Assistant (DeepSeek)**\n\n${aiResult.response}\n\n📊 *Kontekst: ${entries.length} plików w archiwum*`,
          suggestions: [
            "Pokaż statystyki archiwum",
            "Znajdź kod w określonym języku",
            "Napraw uszkodzone wpisy",
            "Analiza kategorii plików"
          ]
        };
      }
    } catch (error) {
      console.error('DeepSeek query failed:', error);
    }

    // Fallback to local response
    return {
      response: `🤖 **Asystent Archiwum PINnode**\n\nMam dostęp do **${entries.length}** plików w archiwum.\n\n**Mogę pomóc z:**\n• 🔍 Wyszukiwaniem treści i kodu\n• 🧽 Naprawą i kategoryzacją\n• 📊 Analizą i statystykami\n• 📦 Eksportem danych\n• 🏷️ Tagowaniem i organizacją\n• 🧠 Odpowiedziami AI (DeepSeek)\n\n**Przykłady:**\n- "Znajdź kod R z ggplot"\n- "Napraw wpisy bez tagów"\n- "Pokaż statystyki archiwum"\n- "Jak zorganizować pliki?"`,
      suggestions: [
        "Pokaż statystyki archiwum",
        "Znajdź kod Python", 
        "Napraw uszkodzone wpisy",
        "Jak lepiej organizować pliki?"
      ]
    };
  }

  // Handle action execution
  static async executeAction(action: any): Promise<AssistantResponse> {
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
        default:
          return { response: `❌ Nieznany typ akcji: ${action.type}` };
      }
    } catch (error) {
      return { response: `❌ Błąd wykonania akcji: ${error}` };
    }
  }

  private static async handleExtractAction(action: any): Promise<AssistantResponse> {
    const entries = await storage.getArchiveEntriesByIds(action.data.entries);
    
    // Extract functions/components based on language
    const extracted = entries.map(entry => {
      let patterns: RegExp[];
      
      switch (action.data.language) {
        case 'R':
          patterns = [/\w+\s*<-\s*function\([^}]*\)/g, /library\([^)]+\)/g];
          break;
        case 'Python':
          patterns = [/def\s+\w+\([^:]*\):/g, /class\s+\w+[^:]*:/g];
          break;
        case 'JavaScript':
          patterns = [/function\s+\w+\([^}]*\)/g, /const\s+\w+\s*=\s*\([^}]*\)/g];
          break;
        default:
          patterns = [/\w+/g];
      }
      
      const matches = patterns.flatMap(pattern => 
        Array.from(entry.content.matchAll(pattern)).map(match => match[0])
      );
      
      return {
        filename: entry.filename,
        matches: matches.slice(0, 10) // Limit results
      };
    });

    const summary = extracted.map(item => 
      `📄 **${item.filename}**\n${item.matches.map(m => `   • ${m.substring(0, 60)}...`).join('\n')}`
    ).join('\n\n');

    return {
      response: `🔧 **Wyodrębnione elementy** (${action.data.language}):\n\n${summary}`,
      actions: [
        {
          id: 'export_extracted',
          label: 'Eksportuj wyodrębnione',
          type: 'export',
          data: { extracted, language: action.data.language }
        }
      ]
    };
  }

  private static async handleExportAction(action: any): Promise<AssistantResponse> {
    // This would implement actual export logic
    return {
      response: `📦 **Export przygotowany**\n\nFormat: ${action.data.format}\nPlików: ${action.data.entries?.length || 0}\n\n⬇️ Pobieranie rozpocznie się automatycznie...`,
      actions: []
    };
  }

  private static async handleHealAction(action: any): Promise<AssistantResponse> {
    // Continue healing remaining entries
    return {
      response: `🧽 **Kontynuacja naprawy**\n\nPozostało: ${action.data.remaining} plików\n\n🔄 Przetwarzanie...`,
      actions: []
    };
  }

  private static async handleSearchAction(action: any): Promise<AssistantResponse> {
    const entries = await storage.getArchiveEntriesByIds(action.data.results);
    
    const details = entries.map(entry => 
      `📄 **${entry.filename}**\n📅 ${new Date(entry.createdAt!).toLocaleDateString()}\n📊 ${entry.fileSize || 0} znaków\n🏷️ ${entry.tags?.join(', ') || 'brak tagów'}\n\n${entry.content.substring(0, 200)}...`
    ).join('\n\n---\n\n');

    return {
      response: `🔍 **Szczegóły wyników** dla: "${action.data.query}"\n\n${details}`,
      actions: [
        {
          id: 'export_search_results',
          label: 'Eksportuj wyniki',
          type: 'export',
          data: { entries: action.data.results, format: 'search_results' }
        }
      ]
    };
  }
}