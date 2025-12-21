// DeepSeek API integration for intelligent responses
export async function callDeepSeek(query: string, context?: any): Promise<string> {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  
  if (!DEEPSEEK_API_KEY) {
    return "❌ DeepSeek API key nie jest skonfigurowany. Sprawdź zmienne środowiskowe.";
  }

  try {
    const systemPrompt = `Jesteś asystentem archiwum PINnode - systemu do zarządzania plikami, kodem i czatami AI. 

Odpowiadaj w języku polskim, używając prostego języka. Możesz:
- Wyszukiwać pliki według kategorii, tagów, języków programowania
- Analizować zawartość archiwum i generować statystyki  
- Pomagać w organizacji i kategoryzacji plików
- Sugerować akcje eksportu i archiwizacji
- Naprawiać uszkodzone dane (self-healing)

Kontekst archiwum: ${context?.archiveStats || 'Podstawowy system archiwizacji'}
Data: ${new Date().toLocaleDateString('pl-PL')}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, response.statusText);
      
      if (response.status === 401) {
        return "❌ Błąd autoryzacji DeepSeek API. Sprawdź klucz API.";
      } else if (response.status === 429) {
        return "⏱️ Przekroczono limit zapytań DeepSeek API. Spróbuj ponownie za chwilę.";
      } else {
        return `❌ Błąd DeepSeek API (${response.status}). Spróbuj ponownie.`;
      }
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      return "❌ Nie otrzymałem odpowiedzi od DeepSeek API. Spróbuj ponownie.";
    }

    return aiResponse.trim();

  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    return `❌ Błąd połączenia z DeepSeek API: ${error instanceof Error ? error.message : 'Nieznany błąd'}`;
  }
}

// Enhanced assistant query with DeepSeek fallback
export async function enhancedAssistantQuery(
  query: string, 
  archiveContext: {
    totalFiles: number;
    categories: Record<string, number>;
    recentActivity: string[];
  }
): Promise<{
  response: string;
  source: 'local' | 'deepseek';
  confidence: number;
}> {
  const lowerQuery = query.toLowerCase();

  // Try local processing first for specific patterns
  const localPatterns = [
    'statystyki', 'stats', 'podsumowanie',
    'znajdź', 'szukaj', 'search',
    'napraw', 'naprawa', 'fix', 'heal',
    'eksport', 'export', 'pobierz'
  ];

  const hasLocalPattern = localPatterns.some(pattern => lowerQuery.includes(pattern));
  
  if (hasLocalPattern) {
    // Local processing handled by AdvancedAssistantHandler
    return {
      response: "Zapytanie przekazane do lokalnego procesora.",
      source: 'local',
      confidence: 0.9
    };
  }

  // For complex queries, use DeepSeek with context
  const contextInfo = `
Statystyki archiwum:
- Łącznie plików: ${archiveContext.totalFiles}
- Kategorie: ${Object.entries(archiveContext.categories).map(([cat, count]) => `${cat}: ${count}`).join(', ')}
- Ostatnia aktywność: ${archiveContext.recentActivity.slice(0, 3).join(', ')}
  `;

  const aiResponse = await callDeepSeek(query, { archiveStats: contextInfo });
  
  return {
    response: aiResponse,
    source: 'deepseek',
    confidence: 0.8
  };
}