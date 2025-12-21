import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ArchivedEntry } from '@shared/schema';

export interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AssistantAction[];
  suggestions?: string[];
  metadata?: {
    foundEntries?: number;
    confidence?: number;
    category?: string;
  };
}

export interface AssistantAction {
  id: string;
  label: string;
  type: 'extract' | 'export' | 'heal' | 'tag' | 'project' | 'search';
  data?: any;
  icon?: string;
}

export interface AssistantContext {
  messages: AssistantMessage[];
  isProcessing: boolean;
  currentQuery: string;
  conversationHistory: string[];
  preferences: AssistantPreferences;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  executeAction: (action: AssistantAction) => Promise<void>;
  clearHistory: () => void;
  updatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  
  // State
  setProcessing: (processing: boolean) => void;
  addMessage: (message: AssistantMessage) => void;
}

export interface AssistantPreferences {
  autoHeal: boolean;
  preferredCategories: string[];
  exportFormat: 'zip' | 'json' | 'markdown';
  learningMode: boolean;
  quickActions: boolean;
}

const defaultPreferences: AssistantPreferences = {
  autoHeal: true,
  preferredCategories: ['PINpall', 'Development', 'Branding'],
  exportFormat: 'zip',
  learningMode: true,
  quickActions: true
};

const AssistantContextProvider = createContext<AssistantContext | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `🤖 Witaj! Jestem Asystentem Archiwum PINnode.

Mogę pomóc Ci:
🗂️ Przeszukiwać archiwum z inteligentnym wyszukiwaniem
🧾 Izolować fragmenty treści (kod, pomysły, funkcje)
🧽 Automatycznie naprawiać uszkodzone wpisy
📥 Generować sugestie eksportu
🧠 Uczyć się na podstawie Twojego użycia

**Przykłady zapytań:**
- "Znajdź kod R z ggplot"
- "Pokaż czaty z kategorie PINpall"
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<AssistantPreferences>(defaultPreferences);

  const addMessage = useCallback((message: AssistantMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setCurrentQuery(message);
    setConversationHistory(prev => [...prev, message]);
    setIsProcessing(true);

    try {
      // Call assistant API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          context: {
            conversationHistory,
            preferences,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Assistant API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        actions: result.actions || [],
        suggestions: result.suggestions || [],
        metadata: result.metadata || {}
      };

      addMessage(assistantMessage);

    } catch (error) {
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Wystąpił błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, conversationHistory, preferences, addMessage]);

  const executeAction = useCallback(async (action: AssistantAction) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/assistant/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error(`Action execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      const resultMessage: AssistantMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        actions: result.nextActions || [],
        metadata: result.metadata || {}
      };

      addMessage(resultMessage);

    } catch (error) {
      const errorMessage: AssistantMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ Błąd wykonania akcji: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage]);

  const clearHistory = useCallback(() => {
    setMessages([messages[0]]); // Keep welcome message
    setConversationHistory([]);
    setCurrentQuery('');
  }, [messages]);

  const updatePreferences = useCallback((prefs: Partial<AssistantPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const contextValue: AssistantContext = {
    messages,
    isProcessing,
    currentQuery,
    conversationHistory,
    preferences,
    sendMessage,
    executeAction,
    clearHistory,
    updatePreferences,
    setProcessing: setIsProcessing,
    addMessage
  };

  return (
    <AssistantContextProvider.Provider value={contextValue}>
      {children}
    </AssistantContextProvider.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContextProvider);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}