import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Settings, Trash2, Brain, Search, Code, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
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

interface SimpleAssistantProps {
  entriesCount: number;
}

export function SimpleAssistant({ entriesCount }: SimpleAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `🤖 Witaj! Jestem Asystentem Archiwum PINnode.

Mogę pomóc Ci z:
🗂️ Przeszukiwaniem archiwum z inteligentnym wyszukiwaniem
🧾 Izolowaniem fragmentów treści (kod, pomysły, funkcje)
🧽 Automatycznym naprawianiem uszkodzonych wpisów
📥 Generowaniem sugestii eksportu
🧠 Uczeniem się na podstawie Twojego użycia

**Przykłady zapytań:**
- "Znajdź kod R z ggplot"
- "Pokaż czaty z kategorii PINpall"
- "Napraw wpisy bez tagów"
- "Wyodrębnij funkcje JavaScript"

Jak mogę Ci pomóc?`,
      timestamp: new Date(),
      suggestions: [
        "Znajdź kod R z ggplot",
        "Pokaż czaty bez kategorii",
        "Napraw uszkodzone wpisy",
        "Eksportuj najnowsze pliki"
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

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentMessage,
          context: { 
            conversationHistory: [], 
            preferences: {}, 
            timestamp: new Date().toISOString() 
          }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const result = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        actions: result.actions || [],
        suggestions: result.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Wystąpił błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = async (action: any) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/assistant/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error(`Action failed: ${response.statusText}`);

      const result = await response.json();
      
      const resultMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        actions: result.nextActions || []
      };

      setMessages(prev => [...prev, resultMessage]);

      toast({
        title: "Akcja wykonana",
        description: `${action.label} została wykonana pomyślnie`
      });

    } catch (error) {
      toast({
        title: "Błąd",
        description: `Nie udało się wykonać akcji: ${action.label}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const clearHistory = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  const quickActions = [
    { label: 'Znajdź kod', query: 'Pokaż wszystkie wpisy z kodem', icon: Code },
    { label: 'Napraw wpisy', query: 'Napraw wszystkie uszkodzone wpisy', icon: Settings },
    { label: 'Analiza archiwum', query: 'Pokaż statystyki archiwum', icon: Brain },
    { label: 'Pomysły brandów', query: 'Znajdź pomysły na nazwy brandów', icon: Lightbulb }
  ];

  return (
    <Card className="glass-effect rounded-2xl border border-blue-100 h-[700px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Asystent Archiwum
            <Badge variant="secondary" className="ml-2">
              {entriesCount} wpisów
            </Badge>
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-gray-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {/* Message Header */}
                <div className="flex items-start gap-2 mb-2">
                  {message.type === 'assistant' ? (
                    <Bot className="w-4 h-4 mt-1 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4 mt-1" />
                  )}
                  <div className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs opacity-75">Akcje:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(action)}
                          className={`text-xs flex items-center gap-1 ${
                            message.type === 'user' ? 'border-white/30 text-white hover:bg-white/20' : ''
                          }`}
                        >
                          <Search className="w-3 h-3" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs opacity-75">Sugestie:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`text-xs flex items-center gap-1 ${
                            message.type === 'user' ? 'border-white/30 text-white hover:bg-white/20' : ''
                          }`}
                        >
                          <Lightbulb className="w-3 h-3" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
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
                  <span className="text-sm text-gray-600">Asystent analizuje...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 py-2 border-t border-gray-200">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(action.query)}
              className="text-xs flex items-center gap-1"
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </Button>
          ))}
        </div>
        
        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Zapytaj asystenta o archiwum, wyodrębnianie treści lub naprawę wpisów..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isProcessing}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}