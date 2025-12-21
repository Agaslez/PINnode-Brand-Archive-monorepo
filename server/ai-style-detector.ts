import { BrandDatabase } from "./brand-database";
import { callDeepSeek } from "./deepseek-api";

// AI-powered style and palette detection from prompts
export class AIStyleDetector {

  // Extract brand information and style from natural language prompts
  static async analyzePrompt(prompt: string): Promise<{
    brandName: string;
    industry: string;
    styleTheme: string;
    colors: string[];
    fonts: string[];
    mood: string[];
    logoStyle: string;
    recommendations: string[];
  }> {
    
    // Enhanced keyword detection with context
    const styleKeywords = {
      mystical: ['magiczny', 'mystyczny', 'tajemniczy', 'duchowy', 'ezoteryczny', 'mistyczny'],
      modern: ['nowoczesny', 'współczesny', 'minimalistyczny', 'clean', 'prosty'],
      luxury: ['luksusowy', 'premium', 'ekskluzywny', 'elegancki', 'wysokiej jakości'],
      playful: ['zabawny', 'kolorowy', 'przyjazny', 'młodzieżowy', 'energiczny'],
      corporate: ['profesjonalny', 'biznesowy', 'korporacyjny', 'formalny'],
      creative: ['kreatywny', 'artystyczny', 'innowacyjny', 'nietypowy'],
      tech: ['technologiczny', 'AI', 'cyfrowy', 'smart', 'automatyczny'],
      wellness: ['wellness', 'zdrowie', 'naturalny', 'organiczny', 'holistyczny'],
      financial: ['finansowy', 'inwestycyjny', 'bankowy', 'ekonomiczny']
    };

    const industryKeywords = {
      technology: ['AI', 'asystent', 'technologia', 'aplikacja', 'software', 'platform'],
      healthcare: ['zdrowie', 'medyczny', 'wellness', 'fitness', 'terapia'],
      finance: ['finansowy', 'inwestycje', 'banking', 'crypto', 'płatności'],
      education: ['edukacja', 'nauka', 'kurs', 'szkolenie', 'akademia'],
      retail: ['sklep', 'e-commerce', 'sprzedaż', 'produkty'],
      consulting: ['konsulting', 'doradztwo', 'ekspert', 'pomoc']
    };

    // Extract brand name (look for patterns like "dla produktu X" or quoted names)
    let brandName = 'Brand';
    const brandNameMatch = prompt.match(/dla produktu\s+([^\s—]+)|„([^"]+)"|"([^"]+)"/i);
    if (brandNameMatch) {
      brandName = brandNameMatch[1] || brandNameMatch[2] || brandNameMatch[3];
    }

    // Detect industry
    let detectedIndustry = 'technology';
    let maxIndustryScore = 0;
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const score = keywords.filter(keyword => 
        prompt.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      if (score > maxIndustryScore) {
        maxIndustryScore = score;
        detectedIndustry = industry;
      }
    });

    // Detect style theme
    let detectedStyle = 'modern';
    let maxStyleScore = 0;
    
    Object.entries(styleKeywords).forEach(([style, keywords]) => {
      const score = keywords.filter(keyword => 
        prompt.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      if (score > maxStyleScore) {
        maxStyleScore = score;
        detectedStyle = style;
      }
    });

    // Get base brand package for industry
    const brandPackage = BrandDatabase.generateBrandPackage(detectedIndustry, detectedStyle);
    
    // Style-specific color customization
    let colors = brandPackage.colors;
    let logoStyle = 'geometric';
    
    switch (detectedStyle) {
      case 'mystical':
        colors = ['#1a1a2e', '#e94560', '#0f3460', '#16213e', '#533483'];
        logoStyle = 'abstract';
        break;
      case 'luxury':
        colors = ['#000000', '#c9b037', '#ffffff', '#8b7355', '#2c2c2c'];
        logoStyle = 'minimal';
        break;
      case 'playful':
        colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        logoStyle = 'playful';
        break;
      case 'tech':
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        logoStyle = 'tech';
        break;
      case 'wellness':
        colors = ['#56ab2f', '#a8edea', '#fed6e3', '#ffecd2', '#fcb69f'];
        logoStyle = 'minimal';
        break;
    }

    // Extract mood indicators
    const moodWords = prompt.toLowerCase().match(/\b(zachęcający|profesjonalny|przyjazny|innowacyjny|bezpieczny|energiczny|spokojny|elegancki|nowoczesny)\b/g) || [];
    
    // Generate recommendations based on analysis
    const recommendations = [
      `Wykryto styl: ${detectedStyle} - ${this.getStyleDescription(detectedStyle)}`,
      `Branża: ${detectedIndustry} - zastosowano odpowiednie kolory i fonty`,
      `Paleta kolorów dopasowana do ${detectedStyle} aesthetic`,
      ...brandPackage.recommendations.brandPersonality.slice(0, 2).map(word => `Uwzględniono keyword: "${word}"`)
    ];

    return {
      brandName,
      industry: detectedIndustry,
      styleTheme: detectedStyle,
      colors,
      fonts: brandPackage.fonts,
      mood: moodWords,
      logoStyle,
      recommendations,
      features: this.generateProductFeatures(detectedStyle, detectedIndustry),
      appDescription: this.generateAppDescription(brandName, detectedStyle, this.generateProductFeatures(detectedStyle, detectedIndustry))
    };
  }

  // Generate AI-enhanced brand strategy using DeepSeek
  static async generateAIBrandStrategy(prompt: string): Promise<{
    analysis: any;
    enhancedStrategy: string;
    logoSuggestions: string[];
    contentRecommendations: string[];
  }> {
    // First get basic analysis
    const analysis = await this.analyzePrompt(prompt);
    
    // Use DeepSeek for enhanced strategy if available
    try {
      const aiPrompt = `Jesteś ekspertem brandingu. Przeanalizuj ten prompt i wygeneruj strategię brandingową:

"${prompt}"

Wykryłem już:
- Nazwa: ${analysis.brandName}
- Branża: ${analysis.industry}
- Styl: ${analysis.styleTheme}
- Kolory: ${analysis.colors.join(', ')}

Podaj:
1. Ulepszoną strategię brandingu (2-3 zdania)
2. 3 konkretne sugestie logo
3. 3 rekomendacje treści/komunikacji

Odpowiedz w formacie JSON z polami: strategy, logoSuggestions, contentRecommendations.`;

      const aiResponse = await callDeepSeek(aiPrompt);
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          analysis,
          enhancedStrategy: parsed.strategy || aiResponse,
          logoSuggestions: parsed.logoSuggestions || [`Logo ${analysis.styleTheme} z elementami ${analysis.industry}`],
          contentRecommendations: parsed.contentRecommendations || ['Podkreśl unikalność produktu', 'Użyj emocjonalnego przekazu']
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          analysis,
          enhancedStrategy: aiResponse,
          logoSuggestions: [
            `Logo ${analysis.styleTheme} z symbolem ${analysis.industry}`,
            `Minimalistyczny design z akcenty w kolorach ${analysis.colors[0]}`,
            `Abstrakcyjny symbol reprezentujący ${analysis.brandName}`
          ],
          contentRecommendations: [
            'Podkreśl innowacyjność i jakość',
            'Użyj emocjonalnego przekazu dopasowanego do target group',
            'Zachowaj spójność z wybranymi kolorami i stylem'
          ]
        };
      }
    } catch (error) {
      console.log('DeepSeek enhancement failed, using local analysis');
      
      // Fallback to local recommendations
      return {
        analysis,
        enhancedStrategy: `Strategia ${analysis.styleTheme} dla ${analysis.industry} skupiająca się na ${analysis.mood.join(', ') || 'profesjonalizmie'}. Wykorzystuje palę ${analysis.colors.slice(0,2).join(' i ')} dla budowania odpowiedniego nastroju marki.`,
        logoSuggestions: [
          `Symbol ${analysis.logoStyle} w kolorach ${analysis.colors[0]} i ${analysis.colors[1]}`,
          `Typografia ${analysis.fonts[0]} z akcentem graficznym`,
          `Minimalistyczny znak z elementami ${analysis.styleTheme}`
        ],
        contentRecommendations: [
          `Podkreśl aspekty ${analysis.industry} w komunikacji`,
          `Użyj tonacji ${analysis.styleTheme} w opisach`,
          'Zachowaj spójność wizualną we wszystkich materiałach'
        ]
      };
    }
  }

  // Get style description for recommendations
  private static getStyleDescription(style: string): string {
    const descriptions: Record<string, string> = {
      mystical: 'tajemniczy i magiczny z ciemnymi kolorami',
      modern: 'czysty i minimalistyczny z neutralnymi kolorami',
      luxury: 'elegancki i premium z złotymi akcentami',
      playful: 'kolorowy i energiczny z jasnymi barwami',
      corporate: 'profesjonalny i stabilny z tonami biznesowymi',
      creative: 'artystyczny i nietypowy z ekspresyjnymi kolorami',
      tech: 'futurystyczny i innowacyjny z gradientami',
      wellness: 'naturalny i spokojny z ziemistymi kolorami'
    };
    
    return descriptions[style] || 'uniwersalny i zrównoważony';
  }

  // Generate complete brand package from prompt
  static async generateFromPrompt(prompt: string): Promise<{
    brandData: any;
    strategy: any;
    htmlTemplate: string;
    logoSvg: string;
  }> {
    const strategy = await this.generateAIBrandStrategy(prompt);
    const analysis = strategy.analysis;
    
    // Generate logo SVG based on detected style
    const logoSvg = this.generateLogoSVG(analysis);
    
    // Generate HTML template with brand data
    const htmlTemplate = this.generateHTMLTemplate(analysis, strategy.enhancedStrategy);
    
    return {
      brandData: {
        brandName: analysis.brandName,
        styleTheme: analysis.styleTheme,
        colors: analysis.colors,
        fonts: analysis.fonts,
        industry: analysis.industry,
        logoStyle: analysis.logoStyle
      },
      strategy,
      htmlTemplate,
      logoSvg
    };
  }

  // Generate SVG logo based on style analysis
  private static generateLogoSVG(analysis: any): string {
    const { brandName, styleTheme, colors, logoStyle } = analysis;
    const primaryColor = colors[0];
    const secondaryColor = colors[1] || colors[0];
    
    switch (logoStyle) {
      case 'mystical':
      case 'abstract':
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="mysticalGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${secondaryColor};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="35" cy="40" r="15" fill="${secondaryColor}" opacity="0.7"/>
  <circle cx="85" cy="40" r="20" fill="url(#mysticalGrad)"/>
  <path d="M35 25 Q60 10 85 25 Q60 55 35 25" fill="${primaryColor}" opacity="0.6"/>
  <text x="60" y="70" font-family="Inter, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="${primaryColor}">${brandName.substring(0, 8)}</text>
</svg>`;

      case 'tech':
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor}" />
      <stop offset="100%" style="stop-color:${secondaryColor}" />
    </linearGradient>
  </defs>
  <rect x="30" y="20" width="60" height="40" rx="8" fill="url(#techGrad)"/>
  <circle cx="45" cy="40" r="8" fill="white" opacity="0.9"/>
  <circle cx="75" cy="40" r="8" fill="white" opacity="0.9"/>
  <rect x="58" y="35" width="4" height="10" fill="white"/>
  <text x="60" y="75" font-family="Inter, sans-serif" font-size="10" font-weight="600" text-anchor="middle" fill="${primaryColor}">${brandName.toUpperCase()}</text>
</svg>`;

      case 'minimal':
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="40" r="25" stroke="${primaryColor}" stroke-width="2" fill="none"/>
  <circle cx="60" cy="40" r="8" fill="${primaryColor}"/>
  <text x="60" y="70" font-family="Inter, sans-serif" font-size="11" font-weight="300" text-anchor="middle" fill="${primaryColor}">${brandName}</text>
</svg>`;

      case 'playful':
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="35" r="12" fill="${colors[0]}"/>
  <circle cx="80" cy="35" r="12" fill="${colors[1]}"/>
  <circle cx="60" cy="50" r="10" fill="${colors[2] || colors[0]}"/>
  <path d="M35 55 Q60 70 85 55" stroke="${primaryColor}" stroke-width="3" fill="none"/>
  <text x="60" y="75" font-family="Poppins, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="${primaryColor}">${brandName}</text>
</svg>`;

      default:
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor}" />
      <stop offset="100%" style="stop-color:${secondaryColor}" />
    </linearGradient>
  </defs>
  <rect x="25" y="25" width="70" height="30" rx="5" fill="url(#defaultGrad)"/>
  <text x="60" y="45" font-family="Inter, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${brandName}</text>
</svg>`;
    }
  }

  // Generate enhanced HTML template with complete product landing page
  private static generateHTMLTemplate(analysis: any, strategy: string): string {
    const { brandName, colors, fonts, styleTheme, industry } = analysis;
    
    // Generate product features based on industry and style
    const features = this.generateProductFeatures(styleTheme, industry);
    const appDescription = this.generateAppDescription(brandName, styleTheme, features);
    
    return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brandName} - ${strategy.split('.')[0]}</title>
    <meta name="description" content="${appDescription.slice(0, 150)}...">
    <link href="https://fonts.googleapis.com/css2?family=${fonts[0].replace(' ', '+')}:wght@300;400;600;700&family=${fonts[1].replace(' ', '+')}:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
</head>
<body>
    <!-- Hero Section with Logo -->
    <header class="hero">
        <div class="container">
            <div class="logo-container">
                <img src="logo.svg" alt="${brandName} Logo" width="120" height="80" />
            </div>
            <h1>Poznaj ${brandName}</h1>
            <p class="hero-tagline">${strategy}</p>
            <div class="hero-cta">
                <a href="#subscribe" class="btn-primary">Rozpocznij za darmo</a>
                <a href="#demo" class="btn-secondary">Zobacz demo</a>
            </div>
        </div>
    </header>
    
    <!-- Description Section -->
    <section class="description">
        <div class="container">
            <div class="section-header">
                <h2>🔍 Dlaczego ${brandName}?</h2>
                <p class="section-subtitle">Zaawansowana platforma ${styleTheme}, która łączy automatyzację, kreatywność i inteligencję maszyn dostosowaną do branży ${industry}.</p>
            </div>
            <div class="description-content">
                <div class="description-text">
                    <p>Odkryj nową generację narzędzi AI, które nie tylko automatyzują procesy, ale także inspirują do kreatywnych rozwiązań. ${brandName} wykorzystuje najnowsze technologie sztucznej inteligencji, aby dostarczyć spersonalizowane doświadczenie dostosowane do Twoich unikalnych potrzeb.</p>
                    <p>Nasza platforma została zaprojektowana z myślą o ${industry === 'technology' ? 'innowatorach i twórcach technologii' : industry === 'healthcare' ? 'profesjonalistach zdrowia' : 'specjalistach branży ' + industry}, którzy cenią sobie połączenie efektywności z ${styleTheme} estetyką.</p>
                </div>
                <div class="description-stats">
                    <div class="stat-item">
                        <span class="stat-number">10k+</span>
                        <span class="stat-label">Aktywnych użytkowników</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">99.9%</span>
                        <span class="stat-label">Dostępność</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">24/7</span>
                        <span class="stat-label">Wsparcie AI</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features">
        <div class="container">
            <div class="section-header">
                <h2>✨ Kluczowe Funkcje</h2>
                <p class="section-subtitle">Odkryj możliwości, które wyróżniają ${brandName} na tle konkurencji</p>
            </div>
            <div class="features-grid">
                ${features.map(feature => `
                <div class="feature-card">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Demo Video Section -->
    <section id="demo" class="demo">
        <div class="container">
            <div class="section-header">
                <h2>🎥 Zobacz ${brandName} w akcji</h2>
                <p class="section-subtitle">Przekonaj się, jak nasze rozwiązania mogą zmienić Twój sposób pracy</p>
            </div>
            <div class="demo-content">
                <div class="video-container">
                    <video controls width="100%" poster="demo-thumbnail.jpg">
                        <source src="demo.mp4" type="video/mp4">
                        <p>Twoja przeglądarka nie obsługuje wideo HTML5. <a href="demo.mp4">Pobierz video</a>.</p>
                    </video>
                </div>
                <div class="demo-description">
                    <h3>Kompletny przegląd funkcji</h3>
                    <ul class="demo-highlights">
                        <li>✓ Interfejs dostosowany do ${styleTheme} estetyki</li>
                        <li>✓ Integracja z popularnymi narzędziami</li>
                        <li>✓ AI personalizacja w czasie rzeczywistym</li>
                        <li>✓ Zaawansowane możliwości ${industry}</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Subscription Plans -->
    <section id="subscribe" class="subscription">
        <div class="container">
            <div class="section-header">
                <h2>🛒 Wybierz swój plan</h2>
                <p class="section-subtitle">Dopasowane rozwiązania dla każdego poziomu potrzeb</p>
            </div>
            <div class="plans-grid">
                <div class="plan-card free">
                    <div class="plan-header">
                        <h3>Darmowy</h3>
                        <div class="plan-price">
                            <span class="price">0 zł</span>
                            <span class="period">/miesiąc</span>
                        </div>
                    </div>
                    <div class="plan-features">
                        <ul>
                            <li>✓ Podstawowe funkcje AI</li>
                            <li>✓ 100 zapytań/miesiąc</li>
                            <li>✓ Standardowe szablony</li>
                            <li>✓ Wsparcie społeczności</li>
                        </ul>
                    </div>
                    <div class="plan-cta">
                        <a href="#downloads" class="btn-outline">Pobierz aplikację</a>
                    </div>
                </div>

                <div class="plan-card pro featured">
                    <div class="plan-badge">Najpopularniejszy</div>
                    <div class="plan-header">
                        <h3>Pro</h3>
                        <div class="plan-price">
                            <span class="price">49 zł</span>
                            <span class="period">/miesiąc</span>
                        </div>
                    </div>
                    <div class="plan-features">
                        <ul>
                            <li>✓ Wszystkie funkcje AI</li>
                            <li>✓ Unlimited zapytania</li>
                            <li>✓ Personalizowane szablony</li>
                            <li>✓ Integracje premium</li>
                            <li>✓ Priorytetowe wsparcie</li>
                            <li>✓ Eksport zaawansowany</li>
                        </ul>
                    </div>
                    <div class="plan-cta">
                        <form action="https://buy.stripe.com/test_pro_plan" method="POST">
                            <button type="submit" class="btn-primary">Wybierz Pro</button>
                        </form>
                        <div class="payment-methods">
                            <span>Płatność przez:</span>
                            <div class="payment-icons">
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzYyNTNGRiIvPgo8cGF0aCBkPSJNMTEuNSAxNS41SDE2LjVNMTEuNSAxMkg5VjE1LjVIMTMuNVYxMkgxNi41VjE1LjVIMTkuNVYxMkgxNy41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvcGc+Cg==" alt="Stripe" />
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwMzA4NyIvPgo8cGF0aCBkPSJNOSAxNUgxNVY5SDlWMTVaTTEyIDEyLjVDMTIgMTEuNjcgMTEuMzMgMTEgMTAuNSAxMUMxMC4xNyAxMSA5Ljg5IDExLjEzIDkuNjkgMTEuMzEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==" alt="PayPal" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="plan-card enterprise">
                    <div class="plan-header">
                        <h3>Enterprise</h3>
                        <div class="plan-price">
                            <span class="price">Indywidualnie</span>
                        </div>
                    </div>
                    <div class="plan-features">
                        <ul>
                            <li>✓ Wszystko z Pro</li>
                            <li>✓ Dedykowane wdrożenie</li>
                            <li>✓ Custom integracje</li>
                            <li>✓ SLA 99.99%</li>
                            <li>✓ Dedykowany manager</li>
                            <li>✓ White-label opcje</li>
                        </ul>
                    </div>
                    <div class="plan-cta">
                        <a href="mailto:enterprise@${brandName.toLowerCase().replace('.', '')}.com" class="btn-outline">Skontaktuj się</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- App Downloads -->
    <section id="downloads" class="downloads">
        <div class="container">
            <div class="section-header">
                <h2>📥 Pobierz aplikację ${brandName}</h2>
                <p class="section-subtitle">Dostępna na wszystkich platformach - pracuj wszędzie</p>
            </div>
            <div class="downloads-grid">
                <div class="download-item">
                    <div class="download-icon">🖥️</div>
                    <h3>Windows</h3>
                    <p>Wersja desktop dla Windows 10+</p>
                    <a href="downloads/${brandName.toLowerCase().replace('.', '')}-setup.exe" class="download-btn">
                        <span>Pobierz dla Windows</span>
                        <small>64-bit • 127 MB</small>
                    </a>
                </div>
                <div class="download-item">
                    <div class="download-icon">🍎</div>
                    <h3>macOS</h3>
                    <p>Natywna aplikacja dla Mac</p>
                    <a href="downloads/${brandName.toLowerCase().replace('.', '')}.dmg" class="download-btn">
                        <span>Pobierz dla macOS</span>
                        <small>Universal • 98 MB</small>
                    </a>
                </div>
                <div class="download-item">
                    <div class="download-icon">🤖</div>
                    <h3>Android</h3>
                    <p>Mobilna wersja na telefony i tablety</p>
                    <a href="https://play.google.com/store/apps/details?id=com.${brandName.toLowerCase().replace('.', '')}" class="download-btn">
                        <span>Google Play</span>
                        <small>Android 8.0+ • 45 MB</small>
                    </a>
                </div>
                <div class="download-item">
                    <div class="download-icon">📱</div>
                    <h3>iOS</h3>
                    <p>Aplikacja na iPhone i iPad</p>
                    <a href="https://apps.apple.com/app/${brandName.toLowerCase().replace('.', '')}" class="download-btn">
                        <span>App Store</span>
                        <small>iOS 14.0+ • 52 MB</small>
                    </a>
                </div>
            </div>
            <div class="download-note">
                <p><strong>Darmowa wersja</strong> dostępna na wszystkich platformach. <strong>Funkcje Pro</strong> wymagają aktywnej subskrypcji.</p>
            </div>
        </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter">
        <div class="container">
            <div class="newsletter-content">
                <h2>📩 Bądź na bieżąco</h2>
                <p>Otrzymuj aktualizacje o nowych funkcjach, tips & tricks oraz ekskluzywne oferty</p>
                <form class="newsletter-form" action="#" method="POST">
                    <input type="email" placeholder="Twój adres email" required>
                    <button type="submit" class="btn-primary">Zapisz się</button>
                </form>
                <p class="newsletter-note">Nie wysyłamy spamu. Możesz anulować subskrypcję w każdej chwili.</p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-logo">
                        <img src="logo.svg" alt="${brandName}" width="60" height="40" />
                        <span>${brandName}</span>
                    </div>
                    <p>Zaawansowane rozwiązania AI dla nowoczesnych profesjonalistów. Tworzone z pasją w Polsce.</p>
                </div>
                <div class="footer-section">
                    <h4>Produkt</h4>
                    <ul>
                        <li><a href="#features">Funkcje</a></li>
                        <li><a href="#subscribe">Cennik</a></li>
                        <li><a href="#downloads">Pobierz</a></li>
                        <li><a href="#demo">Demo</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Wsparcie</h4>
                    <ul>
                        <li><a href="help.html">Centrum pomocy</a></li>
                        <li><a href="api-docs.html">Dokumentacja API</a></li>
                        <li><a href="mailto:support@${brandName.toLowerCase().replace('.', '')}.com">Kontakt</a></li>
                        <li><a href="status.html">Status systemu</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Firma</h4>
                    <ul>
                        <li><a href="about.html">O nas</a></li>
                        <li><a href="privacy.html">Polityka prywatności</a></li>
                        <li><a href="terms.html">Regulamin</a></li>
                        <li><a href="security.html">Bezpieczeństwo</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ${brandName}. Wszystkie prawa zastrzeżone. Powered by Advanced AI Technology.</p>
                <div class="footer-social">
                    <a href="#" aria-label="Twitter">🐦</a>
                    <a href="#" aria-label="LinkedIn">💼</a>
                    <a href="#" aria-label="GitHub">🔗</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;
  }

  // Generate product features based on style and industry
  private static generateProductFeatures(styleTheme: string, industry: string): Array<{icon: string, title: string, description: string}> {
    const baseFeatures: Record<string, Array<{icon: string, title: string, description: string}>> = {
      mystical: [
        { icon: "🔮", title: "Magiczne kreatory", description: "Generuj unikalne treści i zaklęcia marketingowe dzięki zaawansowanym algorytmom AI" },
        { icon: "✨", title: "Personalizacja", description: "System uczy się Twojego stylu i dostosowuje generowane treści do Twoich preferencji" },
        { icon: "🧠", title: "Inteligentne szablony", description: "Biblioteka mystycznych wzorców i formatów dostosowanych do różnych celów" },
        { icon: "⚡", title: "Natychmiastowe efekty", description: "Błyskawiczne generowanie treści z zachowaniem mistycznej estetyki" },
        { icon: "🌙", title: "Nocny tryb", description: "Specjalny interfejs dostosowany do pracy w ciemnych warunkach" },
        { icon: "📦", title: "Archiwum zaklęć", description: "Przechowuj i organizuj swoje najlepsze kreacje w bezpiecznym repozytorium" }
      ],
      modern: [
        { icon: "💎", title: "Czysty design", description: "Minimalistyczny interfejs skupiony na funkcjonalności i prostocie użytkowania" },
        { icon: "⚡", title: "Wydajność", description: "Zoptymalizowane algorytmy zapewniające błyskawiczne przetwarzanie danych" },
        { icon: "🔧", title: "Integracje", description: "Seamless połączenia z popularnymi narzędziami takimi jak Slack, Notion, Trello" },
        { icon: "📊", title: "Analytics", description: "Zaawansowane metryki i raporty pozwalające śledzić efektywność pracy" },
        { icon: "🚀", title: "Automatyzacja", description: "Workflow automation redukujący powtarzalne zadania do minimum" },
        { icon: "💡", title: "Smart suggestions", description: "AI-powered rekomendacje bazujące na analizie wzorców użytkowania" }
      ],
      luxury: [
        { icon: "👑", title: "Premium experience", description: "Ekskluzywny interfejs zaprojektowany dla najbardziej wymagających użytkowników" },
        { icon: "💼", title: "White glove service", description: "Dedykowane wsparcie i personalne doradztwo w ramach subskrypcji premium" },
        { icon: "🔐", title: "Enterprise security", description: "Najwyższe standardy bezpieczeństwa z certyfikatami SOC2 i ISO 27001" },
        { icon: "⚙️", title: "Custom solutions", description: "Możliwość dostosowania platformy do specyficznych potrzeb organizacji" },
        { icon: "🎯", title: "Priority support", description: "Wsparcie techniczne dostępne 24/7 z gwarantowanym czasem odpowiedzi" },
        { icon: "📈", title: "Advanced reporting", description: "Szczegółowe raporty i dashboard'y dla zarządzania na poziomie enterprise" }
      ],
      tech: [
        { icon: "🤖", title: "AI-powered", description: "Zaawansowane modele uczenia maszynowego dostarczające inteligentne rozwiązania" },
        { icon: "⚡", title: "Real-time processing", description: "Przetwarzanie danych w czasie rzeczywistym z wykorzystaniem najnowszych technologii" },
        { icon: "🔗", title: "API-first", description: "Kompleksowe API umożliwiające integrację z dowolnymi systemami zewnętrznymi" },
        { icon: "🛡️", title: "DevOps ready", description: "Przygotowane do wdrożenia w środowiskach CI/CD z monitoringiem i logowaniem" },
        { icon: "📡", title: "Cloud native", description: "Architektura chmurowa zapewniająca skalowalność i wysoką dostępność" },
        { icon: "⚙️", title: "Microservices", description: "Modularna architektura umożliwiająca elastyczne skalowanie poszczególnych komponentów" }
      ],
      wellness: [
        { icon: "🌿", title: "Naturalne podejście", description: "Interfejs inspirowany naturą, wspierający zdrowe nawyki pracy" },
        { icon: "⏰", title: "Work-life balance", description: "Funkcje monitorowania czasu pracy i przypomnienia o przerwach" },
        { icon: "🧘", title: "Mindful workflows", description: "Workflow'y zaprojektowane z myślą o redukcji stresu i zwiększeniu koncentracji" },
        { icon: "📊", title: "Wellness metrics", description: "Śledzenie metryk związanych z produktywnością i samopoczuciem" },
        { icon: "🌅", title: "Circadian design", description: "Automatyczne dostosowanie interfejsu do pory dnia i rytmu circadowego" },
        { icon: "💚", title: "Eco-friendly", description: "Optymalizacja zużycia energii i carbon-neutral hosting" }
      ]
    };

    const industryFeatures: Record<string, Array<{icon: string, title: string, description: string}>> = {
      technology: [
        { icon: "🔬", title: "R&D Support", description: "Narzędzia wspierające proces research and development w zespołach technologicznych" },
        { icon: "📱", title: "Cross-platform", description: "Działanie na wszystkich platformach - web, desktop, mobile" }
      ],
      healthcare: [
        { icon: "🏥", title: "HIPAA Compliance", description: "Pełna zgodność z regulacjami ochrony danych medycznych" },
        { icon: "👩‍⚕️", title: "Medical workflows", description: "Specjalizowane przepływy pracy dla branży medycznej" }
      ],
      finance: [
        { icon: "🔒", title: "Bank-grade security", description: "Bezpieczeństwo na poziomie instytucji finansowych" },
        { icon: "📊", title: "Financial reporting", description: "Zaawansowane narzędzia do raportowania finansowego" }
      ]
    };

    let features = baseFeatures[styleTheme] || baseFeatures.modern;
    const industrySpecific = industryFeatures[industry] || [];
    
    // Combine style features with industry-specific ones
    features = [...features.slice(0, 4), ...industrySpecific, ...features.slice(4)].slice(0, 6);
    
    return features;
  }

  // Generate app description for stores and documentation
  private static generateAppDescription(brandName: string, styleTheme: string, features: Array<{icon: string, title: string, description: string}>): string {
    const styleDescriptions: Record<string, string> = {
      mystical: "magiczny asystent AI łączący technologię z ezoteryczną estetyką",
      modern: "nowoczesna platforma AI zaprojektowana dla efektywnej pracy",
      luxury: "ekskluzywne rozwiązanie AI dla najbardziej wymagających profesjonalistów",
      tech: "zaawansowana platforma technologiczna powered by cutting-edge AI",
      wellness: "zrównoważone narzędzie AI wspierające healthy work-life balance",
      playful: "kreatywna aplikacja AI z przyjaznym i intuicyjnym interfejsem",
      corporate: "profesjonalne rozwiązanie AI dla środowisk biznesowych",
      creative: "innowacyjna platforma AI dla kreatywnych profesjonalistów"
    };

    const mainDescription = styleDescriptions[styleTheme] || styleDescriptions.modern;
    const keyFeatures = features.slice(0, 4).map(f => `• ${f.title}: ${f.description.split('.')[0]}`).join('\n');

    return `🚀 ${brandName} – ${mainDescription}

Opis aplikacji:
${brandName} to ${mainDescription}, która rewolucjonizuje sposób pracy z wykorzystaniem sztucznej inteligencji. Dzięki ${styleTheme} designowi i zaawansowanym funkcjom AI, nasza platforma dostarcza narzędzia niezbędne do zwiększenia produktywności i kreatywności.

Kluczowe funkcje:
${keyFeatures}

Wersje dostępne:
• Darmowa - podstawowe funkcje AI
• Pro (49 zł/miesiąc) - pełen dostęp + personalizacja
• Enterprise - dedykowane rozwiązania dla firm

Platformy:
• Windows 10+ (desktop)
• macOS (Universal Binary)
• Android 8.0+ (mobile/tablet)
• iOS 14.0+ (iPhone/iPad)
• Web (wszystkie nowoczesne przeglądarki)

Słowa kluczowe: ai assistant, ${styleTheme}, productivity, automation, ${brandName.toLowerCase()}, artificial intelligence, workflow optimization`;
  }
}