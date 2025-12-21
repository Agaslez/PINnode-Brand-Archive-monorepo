import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Tag, FileText, Sparkles, Brain, Lightbulb, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArchivedEntry } from '@shared/schema';
import { selfHealingSystem, ContentCurationRequest, CurationResult } from '@/lib/self-healing-system';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionOptions?: string[];
  curationResult?: CurationResult;
}

interface ContentCuratorProps {
  entries: ArchivedEntry[];
  masterKey: string;
}

export function ContentCurator({ entries, masterKey }: ContentCuratorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `🧠 Witaj w AI Content Curator! 

Analizuję ${entries.length} wpisów w archiwum. Mogę pomóc Ci:

• Wyciągnąć konkretne fragmenty treści z czatów
• Znaleźć pomysły na nazwy brandów
• Ekstraktować kod i funkcje
• Identyfikować wzorce w projektach
• Naprawić uszkodzone wpisy automatycznie

**Przykłady zapytań:**
- "Wyciągnij mi wszystkie pomysły na nazwy brandów AI"
- "Znajdź kod używający React hooks"
- "Pokaż mi wpisy związane z fintechiem"
- "Napraw wszystkie wpisy bez kategorii"

Jak mogę Ci pomóc?`,
      timestamp: new Date(),
      suggestions: [
        "Wyciągnij pomysły na nazwy brandów AI",
        "Znajdź kod React",
        "Napraw uszkodzone wpisy",
        "Pokaż trendy w projektach"
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      const botResponse = await processUserQuery(message);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Wystąpił błąd podczas przetwarzania: ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserQuery = async (query: string): Promise<Message> => {
    const lowerQuery = query.toLowerCase();

    // Self-healing requests
    if (lowerQuery.includes('napraw') || lowerQuery.includes('fix') || lowerQuery.includes('heal')) {
      return await handleHealingRequest(query);
    }

    // Content extraction requests
    if (lowerQuery.includes('wyciągnij') || lowerQuery.includes('extract') || lowerQuery.includes('znajdź')) {
      return await handleExtractionRequest(query);
    }

    // Analysis requests
    if (lowerQuery.includes('analiza') || lowerQuery.includes('wzorce') || lowerQuery.includes('trendy')) {
      return await handleAnalysisRequest(query);
    }

    // Default conversation
    return await handleGeneralQuery(query);
  };

  const handleHealingRequest = async (query: string): Promise<Message> => {
    const problematicEntries = entries.filter(entry => 
      !entry.category || !entry.tags || entry.tags.length === 0
    );

    if (problematicEntries.length === 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: '✅ Wszystkie wpisy są w porządku! Nie znalazłem uszkodzonych elementów.',
        timestamp: new Date(),
        suggestions: ['Sprawdź statystyki archiwum', 'Analizuj wzorce w treściach']
      };
    }

    const healingReports = await selfHealingSystem.runBatchHealing(problematicEntries);
    const successCount = healingReports.filter(r => r.status === 'success').length;

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `🔧 **Zakończono proces samoleczenia!**

📊 **Statystyki:**
• Naprawiono: ${successCount}/${problematicEntries.length} wpisów
• Dodano kategorie: ${healingReports.filter(r => r.type === 'category_fix').length}
• Wyciągnięto tagi: ${healingReports.filter(r => r.type === 'tags_extraction').length}
• Naprawiono treści: ${healingReports.filter(r => r.type === 'content_repair').length}

🎯 **Przykłady napraw:**
${healingReports.slice(0, 3).map(r => 
  `• ${r.type === 'category_fix' ? 'Dodano kategorię' : 'Wyciągnięto tagi'}: ${r.confidence > 0.8 ? 'wysoka pewność' : 'średnia pewność'}`
).join('\n')}`,
      timestamp: new Date(),
      actionOptions: ['Eksportuj naprawione wpisy', 'Pokaż szczegóły napraw', 'Uruchom ponownie']
    };
  };

  const handleExtractionRequest = async (query: string): Promise<Message> => {
    // Parse extraction request
    const request: ContentCurationRequest = {
      query,
      scope: [],
      format: determineFormat(query),
      filters: parseFilters(query)
    };

    const result = await selfHealingSystem.curateContent(entries, request);

    if (!result.extractedContent.trim()) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `🔍 Nie znalazłem treści pasujących do zapytania "${query}".

**Sugestie:**
• Spróbuj bardziej ogólnych słów kluczowych
• Sprawdź czy masz wpisy z tej kategorii
• Użyj synonimów lub alternatywnych fraz`,
        timestamp: new Date(),
        suggestions: await generateSearchSuggestions(query, entries)
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `🎯 **Wyciągnąłem treści dla zapytania: "${query}"**

📊 **Statystyki:**
• Przeanalizowano: ${result.sourceEntries.length} wpisów
• Wyciągnięto: ${result.extractedContent.split('\n').length} linii treści
• Pewność: ${(result.confidence * 100).toFixed(0)}%

💡 **Insights:**
${result.insights.map(insight => `• ${insight}`).join('\n')}

📝 **Wyciągnięta treść:**
\`\`\`${result.format}
${result.extractedContent.substring(0, 500)}${result.extractedContent.length > 500 ? '...' : ''}
\`\`\``,
      timestamp: new Date(),
      curationResult: result,
      actionOptions: ['Pobierz pełną treść', 'Utwórz nowy projekt', 'Dodaj do archiwum', 'Wyślij do AI']
    };
  };

  const handleAnalysisRequest = async (query: string): Promise<Message> => {
    const categories = [...new Set(entries.map(e => e.category).filter(Boolean))];
    const sources = [...new Set(entries.map(e => e.source).filter(Boolean))];
    const totalTags = entries.flatMap(e => e.tags || []);
    const topTags = getTopTags(totalTags, 10);

    const recentEntries = entries
      .filter(e => e.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `📊 **Analiza archiwum - ${entries.length} wpisów**

📈 **Statystyki kategorii:**
${categories.map(cat => {
  const count = entries.filter(e => e.category === cat).length;
  return `• ${cat}: ${count} wpisów (${(count/entries.length*100).toFixed(1)}%)`;
}).join('\n')}

🔗 **Źródła treści:**
${sources.map(src => {
  const count = entries.filter(e => e.source === src).length;
  return `• ${src}: ${count} wpisów`;
}).join('\n')}

🏷️ **Najpopularniejsze tagi:**
${topTags.slice(0, 8).map(([tag, count]) => `• ${tag} (${count}x)`).join('\n')}

📅 **Ostatnia aktywność:**
${recentEntries.slice(0, 3).map(e => 
  `• ${e.filename} - ${new Date(e.createdAt!).toLocaleDateString()}`
).join('\n')}

🧠 **AI Insights:**
• Średni rozmiar wpisu: ${Math.round(entries.reduce((sum, e) => sum + (e.fileSize || 0), 0) / entries.length)} bajtów
• Wpisy z tagami: ${entries.filter(e => e.tags && e.tags.length > 0).length}/${entries.length}
• Zaszyfrowane wpisy: ${entries.filter(e => e.encrypted).length}/${entries.length}`,
      timestamp: new Date(),
      suggestions: ['Znajdź wzorce w kodzie', 'Analizuj treści z ChatGPT', 'Pokaż trendy czasowe']
    };
  };

  const handleGeneralQuery = async (query: string): Promise<Message> => {
    const suggestions = await selfHealingSystem.askUserForContentExtraction(entries, query);

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: `🤔 Rozumiem, że szukasz informacji związanych z "${query}".

🔍 **Znalazłem ${suggestions.suggestions.length} powiązanych elementów:**

${suggestions.suggestions.map(s => `• ${s}`).join('\n')}

📋 **Podgląd treści:**
${suggestions.previewContent}

Co chciałbyś zrobić dalej?`,
      timestamp: new Date(),
      actionOptions: suggestions.actionOptions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleActionClick = async (action: string, result?: CurationResult) => {
    switch (action) {
      case 'Pobierz pełną treść':
        if (result) {
          downloadCuratedContent(result);
        }
        break;
      case 'Utwórz nowy projekt':
        toast({
          title: "Funkcja w przygotowaniu",
          description: "Przekierowanie do formularza tworzenia projektu"
        });
        break;
      default:
        toast({
          title: "Akcja wykonana",
          description: `Wykonano: ${action}`
        });
    }
  };

  const downloadCuratedContent = (result: CurationResult) => {
    const content = `# Wyciągnięta treść
Wygenerowano: ${new Date().toLocaleString()}
Confidence: ${(result.confidence * 100).toFixed(0)}%
Źródła: ${result.sourceEntries.length} wpisów

## Insights
${result.insights.map(insight => `- ${insight}`).join('\n')}

## Zawartość
${result.extractedContent}

## Sugerowane tagi
${result.suggestedTags.join(', ')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curated-content-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Pobrano treść",
      description: "Wyciągnięta treść została pobrana jako plik Markdown"
    });
  };

  // Helper functions
  const determineFormat = (query: string): 'markdown' | 'code' | 'text' | 'json' => {
    if (query.includes('kod') || query.includes('code') || query.includes('function')) return 'code';
    if (query.includes('json') || query.includes('api')) return 'json';
    if (query.includes('markdown') || query.includes('format')) return 'markdown';
    return 'text';
  };

  const parseFilters = (query: string) => {
    const filters: any = {};
    
    if (query.includes('chatgpt')) filters.tags = ['ChatGPT'];
    if (query.includes('deepseek')) filters.tags = ['DeepSeek'];
    if (query.includes('pinpall')) filters.category = 'PINpall';
    if (query.includes('talism')) filters.category = 'Talism.ai';
    
    return Object.keys(filters).length > 0 ? filters : undefined;
  };

  const generateSearchSuggestions = async (query: string, entries: ArchivedEntry[]): Promise<string[]> => {
    const allWords = entries.flatMap(e => 
      e.content.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    );
    
    const wordFreq = new Map<string, number>();
    allWords.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => `Znajdź treści zawierające "${word}"`);
  };

  const getTopTags = (tags: string[], limit: number): [string, number][] => {
    const tagFreq = new Map<string, number>();
    tags.forEach(tag => {
      tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
    });
    
    return Array.from(tagFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100 h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Content Curator
          <Badge variant="secondary" className="ml-auto">
            {entries.length} wpisów
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {message.type === 'bot' ? (
                    <Bot className="w-4 h-4 mt-1 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4 mt-1" />
                  )}
                  <div className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs opacity-75">Sugestie:</div>
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs mr-2 mb-2"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Action Options */}
                {message.actionOptions && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs opacity-75">Akcje:</div>
                    {message.actionOptions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick(action, message.curationResult)}
                        className="text-xs mr-2 mb-2"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-sm text-gray-600">AI analizuje...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Zapytaj AI o wyciąganie treści, naprawę wpisów lub analizę wzorców..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(currentMessage);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(currentMessage)}
            disabled={!currentMessage.trim() || isProcessing}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Napraw wszystkie uszkodzone wpisy")}
            className="text-xs"
          >
            <Search className="w-3 h-3 mr-1" />
            Auto-Repair
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Pokaż statystyki archiwum")}
            className="text-xs"
          >
            <FileText className="w-3 h-3 mr-1" />
            Analiza
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Wyciągnij pomysły na nazwy brandów")}
            className="text-xs"
          >
            <Tag className="w-3 h-3 mr-1" />
            Nazwy brandów
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}