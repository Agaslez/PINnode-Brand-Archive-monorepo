import { createContext, useContext, useState, ReactNode } from 'react';

export interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AssistantAction[];
  suggestions?: string[];
}

export interface AssistantAction {
  id: string;
  label: string;
  type: 'extract' | 'export' | 'heal' | 'tag' | 'project' | 'search';
  data?: any;
}

interface SimpleAssistantContext {
  messages: AssistantMessage[];
  isProcessing: boolean;
  sendMessage: (message: string) => Promise<void>;
  executeAction: (action: AssistantAction) => Promise<void>;
  clearHistory: () => void;
}

const AssistantContext = createContext<SimpleAssistantContext | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🤖 Witaj! Jestem Asystentem Archiwum PINnode.\n\nMogę pomóc Ci z:\n• Przeszukiwaniem archiwum\n• Wyodrębnianiem treści\n• Naprawianiem wpisów\n• Eksportowaniem danych\n\nJak mogę Ci pomóc?',
      timestamp: new Date(),
      suggestions: [
        "Znajdź kod R z ggplot",
        "Pokaż czaty bez kategorii", 
        "Napraw uszkodzone wpisy",
        "Eksportuj najnowsze pliki"
      ]
    }
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          context: { conversationHistory: [], preferences: {}, timestamp: new Date().toISOString() }
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const result = await response.json();
      
      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        actions: result.actions || [],
        suggestions: result.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Wystąpił błąd: ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = async (action: AssistantAction) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/assistant/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error(`Action failed: ${response.statusText}`);

      const result = await response.json();
      
      const resultMessage: AssistantMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        actions: result.nextActions || []
      };

      setMessages(prev => [...prev, resultMessage]);

    } catch (error) {
      const errorMessage: AssistantMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ Błąd wykonania akcji: ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearHistory = () => {
    setMessages([messages[0]]); // Keep welcome message
  };

  const contextValue: SimpleAssistantContext = {
    messages,
    isProcessing,
    sendMessage,
    executeAction,
    clearHistory
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}