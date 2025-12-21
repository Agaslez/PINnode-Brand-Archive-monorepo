import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot, User, Search, Wrench, Download, HelpCircle, Brain, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    id: string;
    label: string;
    type: string;
    data?: any;
  }>;
  suggestions?: string[];
}

export function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🤖 **Witaj w Asystencie Archiwum PINnode!**\n\nMogę pomóc Ci w:\n• 🔍 Wyszukiwaniu treści i kodu\n• 🧽 Naprawie i kategoryzacji\n• 📊 Analizie i statystykach\n• 📦 Eksporcie danych\n• 🏷️ Tagowaniu i organizacji\n\n**Przykłady zapytań:**\n- "Znajdź kod R z ggplot"\n- "Napraw wpisy bez tagów"\n- "Pokaż statystyki archiwum"\n- "Eksportuj wszystkie czaty"',
      timestamp: new Date(),
      suggestions: [
        'Pokaż statystyki archiwum',
        'Znajdź kod Python',
        'Napraw uszkodzone wpisy',
        'Eksportuj najnowsze pliki'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input,
          context: {
            conversationHistory: messages.slice(-5).map(m => ({
              role: m.role,
              content: m.content
            })),
            preferences: {
              autoHeal: true,
              learningMode: true,
              quickActions: true
            },
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString() + '_bot',
        role: 'assistant',
        content: data.response || 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania.',
        timestamp: new Date(),
        actions: data.actions,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Assistant error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: '❌ Przepraszam, wystąpił błąd podczas komunikacji z asystentem. Spróbuj ponownie.',
        timestamp: new Date(),
        suggestions: ['Spróbuj ponownie', 'Sprawdź połączenie']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: any) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/assistant/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      
      const resultMessage: Message = {
        id: Date.now().toString() + '_action',
        role: 'assistant',
        content: data.response || 'Akcja została wykonana.',
        timestamp: new Date(),
        actions: data.actions,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Action error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_action_error',
        role: 'assistant',
        content: '❌ Błąd podczas wykonywania akcji. Spróbuj ponownie.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'extract': return <Wrench className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'search': return <Search className="h-4 w-4" />;
      case 'heal': return <Brain className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Asystent Archiwum
          <Badge variant="outline" className="ml-auto">
            <Database className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 px-6 pb-4"
          style={{ maxHeight: '500px' }}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 w-full',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessage(message.content) 
                    }}
                    className="text-sm leading-relaxed"
                  />
                  
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>

                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => executeAction(action)}
                          disabled={isLoading}
                          className="text-xs"
                        >
                          {getActionIcon(action.type)}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs opacity-70 mb-2">💡 Sugestie:</div>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            onClick={() => useSuggestion(suggestion)}
                            className="text-xs h-auto py-1 px-2 text-blue-600 hover:bg-blue-50"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Myślę...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Zadaj pytanie asystentowi archiwum..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Wyślij'
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            Asystent pomoże Ci w organizacji i wyszukiwaniu w archiwum. Używa AI do inteligentnej analizy.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}