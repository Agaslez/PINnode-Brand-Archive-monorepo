import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Settings, Trash2, Brain, Search, Sparkles, FileText, Code, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAssistant, AssistantMessage, AssistantAction } from './assistant-context-simple';

interface AssistantPanelProps {
  entriesCount: number;
  onActionExecuted?: (action: AssistantAction, result: any) => void;
}

export function AssistantPanel({ entriesCount, onActionExecuted }: AssistantPanelProps) {
  const {
    messages,
    isProcessing,
    sendMessage,
    executeAction,
    clearHistory
  } = useAssistant();

  const [currentMessage, setCurrentMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const preferences = { autoHeal: true, quickActions: true, learningMode: true };
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
    
    await sendMessage(currentMessage);
    setCurrentMessage('');
  };

  const handleActionClick = async (action: AssistantAction) => {
    try {
      await executeAction(action);
      
      if (onActionExecuted) {
        onActionExecuted(action, { success: true });
      }

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
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const quickActions = [
    {
      label: 'Znajdź kod',
      query: 'Pokaż wszystkie wpisy z kodem',
      icon: Code
    },
    {
      label: 'Napraw wpisy',
      query: 'Napraw wszystkie uszkodzone wpisy',
      icon: Settings
    },
    {
      label: 'Analiza archiwum',
      query: 'Pokaż statystyki archiwum',
      icon: Brain
    },
    {
      label: 'Pomysły brandów',
      query: 'Znajdź pomysły na nazwy brandów',
      icon: Lightbulb
    }
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-gray-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="text-sm text-gray-600">
              • Auto-naprawa: włączona
              • Tryb uczenia: włączony  
              • Szybkie akcje: włączone
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onActionClick={handleActionClick}
              onSuggestionClick={handleSuggestionClick}
            />
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
        {preferences.quickActions && (
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
        )}
        
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

interface ChatMessageProps {
  message: AssistantMessage;
  onActionClick: (action: AssistantAction) => void;
  onSuggestionClick: (suggestion: string) => void;
}

function ChatMessage({ message, onActionClick, onSuggestionClick }: ChatMessageProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'extract': return <FileText className="w-3 h-3" />;
      case 'export': return <Download className="w-3 h-3" />;
      case 'heal': return <Settings className="w-3 h-3" />;
      case 'search': return <Search className="w-3 h-3" />;
      case 'tag': return <Lightbulb className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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
          {message.metadata?.confidence && (
            <div className="text-xs opacity-75">
              {(message.metadata.confidence * 100).toFixed(0)}% pewności
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {/* Metadata */}
        {message.metadata && message.type === 'assistant' && (
          <div className="mt-2 text-xs opacity-75">
            {message.metadata.foundEntries && (
              <span>• Znaleziono: {message.metadata.foundEntries} wpisów</span>
            )}
            {message.metadata.category && (
              <span> • Kategoria: {message.metadata.category}</span>
            )}
          </div>
        )}
        
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
                  onClick={() => onActionClick(action)}
                  className={`text-xs flex items-center gap-1 ${
                    message.type === 'user' ? 'border-white/30 text-white hover:bg-white/20' : ''
                  }`}
                >
                  {getActionIcon(action.type)}
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
                  onClick={() => onSuggestionClick(suggestion)}
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
  );
}