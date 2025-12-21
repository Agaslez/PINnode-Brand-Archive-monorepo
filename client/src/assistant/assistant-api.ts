import { ArchivedEntry } from '@shared/schema';
import { AssistantAction } from './assistant-context';

export interface AssistantQuery {
  query: string;
  context: {
    conversationHistory: string[];
    preferences: any;
    timestamp: string;
  };
}

export interface AssistantResponse {
  response: string;
  actions?: AssistantAction[];
  suggestions?: string[];
  metadata?: {
    foundEntries?: number;
    confidence?: number;
    category?: string;
    processingTime?: number;
  };
}

export interface ActionExecutionResult {
  response: string;
  nextActions?: AssistantAction[];
  metadata?: any;
  downloadUrl?: string;
}

export class AssistantAPI {
  private baseUrl = '/api';

  /**
   * Send query to assistant
   */
  async sendQuery(query: AssistantQuery): Promise<AssistantResponse> {
    const response = await fetch(`${this.baseUrl}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Assistant query failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute assistant action
   */
  async executeAction(action: AssistantAction): Promise<ActionExecutionResult> {
    const response = await fetch(`${this.baseUrl}/assistant/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    if (!response.ok) {
      throw new Error(`Action execution failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get assistant conversation history
   */
  async getConversationHistory(sessionId?: string): Promise<any[]> {
    const url = sessionId 
      ? `${this.baseUrl}/assistant/history?sessionId=${sessionId}`
      : `${this.baseUrl}/assistant/history`;
      
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get conversation history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update assistant learning preferences
   */
  async updateLearningData(interactionData: {
    query: string;
    action: string;
    result: 'success' | 'failure';
    feedback?: string;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/assistant/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interactionData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update learning data: ${response.statusText}`);
    }
  }

  /**
   * Search archive with assistant intelligence
   */
  async intelligentSearch(query: string, filters?: {
    category?: string;
    tags?: string[];
    dateRange?: [Date, Date];
    contentType?: 'code' | 'text' | 'ideas';
  }): Promise<{
    entries: ArchivedEntry[];
    insights: string[];
    suggestions: string[];
    confidence: number;
  }> {
    const response = await fetch(`${this.baseUrl}/assistant/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters })
    });

    if (!response.ok) {
      throw new Error(`Intelligent search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Auto-heal problematic entries
   */
  async autoHealEntries(options?: {
    dryRun?: boolean;
    categories?: string[];
    maxEntries?: number;
  }): Promise<{
    healed: number;
    failed: number;
    reports: any[];
    summary: string;
  }> {
    const response = await fetch(`${this.baseUrl}/assistant/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {})
    });

    if (!response.ok) {
      throw new Error(`Auto-heal failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Extract content from entries
   */
  async extractContent(request: {
    entryIds: number[];
    extractionType: 'code' | 'functions' | 'ideas' | 'text';
    format: 'markdown' | 'json' | 'zip';
    filters?: string[];
  }): Promise<{
    extractedContent: string;
    downloadUrl?: string;
    insights: string[];
    suggestedActions: AssistantAction[];
  }> {
    const response = await fetch(`${this.baseUrl}/assistant/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Content extraction failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate export suggestions
   */
  async generateExportSuggestions(entryIds: number[]): Promise<{
    suggestions: Array<{
      title: string;
      description: string;
      format: string;
      estimatedSize: string;
      action: AssistantAction;
    }>;
    recommendedFormat: string;
    insights: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/assistant/export-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryIds })
    });

    if (!response.ok) {
      throw new Error(`Export suggestions failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get assistant analytics
   */
  async getAssistantAnalytics(): Promise<{
    totalQueries: number;
    successRate: number;
    topQueries: string[];
    learningInsights: string[];
    userPreferences: any;
    improvementSuggestions: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/assistant/analytics`);

    if (!response.ok) {
      throw new Error(`Analytics fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Chat conversation analysis
   */
  async analyzeChatConversation(entryId: number): Promise<{
    userMessages: number;
    assistantMessages: number;
    topics: string[];
    codeBlocks: number;
    suggestions: string[];
    extractableContent: Array<{
      type: 'code' | 'idea' | 'solution';
      content: string;
      confidence: number;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/assistant/analyze-chat/${entryId}`);

    if (!response.ok) {
      throw new Error(`Chat analysis failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const assistantAPI = new AssistantAPI();