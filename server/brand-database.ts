import * as palettes from "../shared/brand-assets/palettes.json";
import * as fonts from "../shared/brand-assets/fonts.json";
import * as logos from "../shared/brand-assets/logos-sample.json";
import * as industries from "../shared/brand-assets/industries.json";

// Enhanced brand database with professional asset management
export class BrandDatabase {
  
  // Get color palette by theme with fallback
  static getPaletteByTheme(theme: string): string[] {
    const availablePalettes = palettes as Record<string, string[]>;
    return availablePalettes[theme.toLowerCase()] || availablePalettes["tech"] || ["#667eea", "#764ba2", "#f093fb"];
  }

  // Get fonts by industry with smart matching
  static getFontsByIndustry(industry: string): string[] {
    const availableFonts = fonts as Record<string, string[]>;
    const normalizedIndustry = industry.toLowerCase().replace(/[^a-z]/g, '_');
    
    // Try exact match first
    if (availableFonts[normalizedIndustry]) {
      return availableFonts[normalizedIndustry];
    }
    
    // Try partial matching
    const partialMatch = Object.keys(availableFonts).find(key => 
      key.includes(normalizedIndustry) || normalizedIndustry.includes(key)
    );
    
    if (partialMatch) {
      return availableFonts[partialMatch];
    }
    
    // Default fallback
    return availableFonts["tech"] || ["Inter", "Roboto", "Open Sans"];
  }

  // Get sample logos by style
  static getSampleLogos(style: string): string[] {
    const availableLogos = logos as Record<string, string[]>;
    return availableLogos[style.toLowerCase()] || availableLogos["minimal"] || [];
  }

  // Get industry information with comprehensive data
  static getIndustryInfo(industry: string): {
    tone: string;
    style: string;
    keywords: string[];
    palette: string;
    fonts: string;
    colors: string[];
    fontList: string[];
  } {
    const industryData = industries as Record<string, any>;
    const normalizedIndustry = industry.toLowerCase().replace(/[^a-z]/g, '');
    
    // Find matching industry
    let matchedIndustry = industryData[normalizedIndustry];
    
    if (!matchedIndustry) {
      // Try partial matching
      const partialMatch = Object.keys(industryData).find(key => 
        key.includes(normalizedIndustry) || normalizedIndustry.includes(key)
      );
      matchedIndustry = partialMatch ? industryData[partialMatch] : industryData["technology"];
    }

    // Get associated colors and fonts
    const colors = this.getPaletteByTheme(matchedIndustry.palette);
    const fontList = this.getFontsByIndustry(matchedIndustry.fonts);

    return {
      tone: matchedIndustry.tone,
      style: matchedIndustry.style,
      keywords: matchedIndustry.keywords,
      palette: matchedIndustry.palette,
      fonts: matchedIndustry.fonts,
      colors,
      fontList
    };
  }

  // Generate comprehensive brand asset package
  static generateBrandPackage(industry: string, style: string = "modern"): {
    industry: any;
    colors: string[];
    fonts: string[];
    logoSamples: string[];
    recommendations: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      primaryFont: string;
      secondaryFont: string;
      logoStyle: string;
      brandPersonality: string[];
    };
  } {
    const industryInfo = this.getIndustryInfo(industry);
    const colors = industryInfo.colors;
    const fontList = industryInfo.fontList;
    const logoSamples = this.getSampleLogos(style);

    const recommendations = {
      primaryColor: colors[0] || "#667eea",
      secondaryColor: colors[1] || "#764ba2", 
      accentColor: colors[2] || "#f093fb",
      primaryFont: fontList[0] || "Inter",
      secondaryFont: fontList[1] || "Open Sans",
      logoStyle: style,
      brandPersonality: industryInfo.keywords
    };

    return {
      industry: industryInfo,
      colors,
      fonts: fontList,
      logoSamples,
      recommendations
    };
  }

  // Smart color harmony analysis
  static analyzeColorHarmony(colors: string[]): {
    harmony: string;
    temperature: string;
    mood: string;
    accessibility: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Simple color analysis (could be enhanced with actual color theory algorithms)
    const hasWarm = colors.some(color => 
      color.toLowerCase().includes('f') || color.toLowerCase().includes('e') || 
      color.toLowerCase().includes('d') || color.toLowerCase().includes('c')
    );
    
    const hasCool = colors.some(color =>
      color.toLowerCase().includes('3') || color.toLowerCase().includes('4') ||
      color.toLowerCase().includes('5') || color.toLowerCase().includes('6')
    );

    let harmony = "balanced";
    if (hasWarm && !hasCool) harmony = "warm";
    if (hasCool && !hasWarm) harmony = "cool";

    let temperature = hasWarm ? "warm" : "cool";
    if (hasWarm && hasCool) temperature = "balanced";

    let mood = "professional";
    if (harmony === "warm") mood = "energetic";
    if (harmony === "cool") mood = "calming";

    // Accessibility check (basic)
    const hasLightColor = colors.some(color => 
      color.toLowerCase().includes('f') || color.toLowerCase().includes('e')
    );
    const hasDarkColor = colors.some(color =>
      color.toLowerCase().includes('2') || color.toLowerCase().includes('3')
    );

    let accessibility = "good";
    if (!hasLightColor || !hasDarkColor) {
      accessibility = "needs_improvement";
      recommendations.push("Dodaj kontrastowe kolory dla lepszej dostępności");
    }

    if (colors.length > 5) {
      recommendations.push("Rozważ ograniczenie palety do 3-5 głównych kolorów");
    }

    if (colors.length < 2) {
      recommendations.push("Dodaj drugi kolor dla większej uniwersalności");
    }

    return {
      harmony,
      temperature,
      mood,
      accessibility,
      recommendations
    };
  }

  // Generate industry-specific recommendations
  static getIndustryRecommendations(industry: string): {
    mustHave: string[];
    avoid: string[];
    trending: string[];
    bestPractices: string[];
  } {
    const industrySpecific: Record<string, any> = {
      healthcare: {
        mustHave: ["Trust indicators", "Clean design", "Accessibility compliance"],
        avoid: ["Aggressive colors", "Complex imagery", "Playful fonts"],
        trending: ["Telemedicine icons", "Wellness symbols", "Minimalist approach"],
        bestPractices: ["Use calming blues/greens", "Ensure high contrast", "Include care symbols"]
      },
      technology: {
        mustHave: ["Modern aesthetics", "Scalable design", "Technical precision"],
        avoid: ["Outdated styles", "Complex gradients", "Traditional serif fonts"],
        trending: ["Geometric shapes", "AI/ML symbols", "Gradient overlays"],
        bestPractices: ["Use tech-forward colors", "Implement responsive design", "Include innovation symbols"]
      },
      finance: {
        mustHave: ["Professional appearance", "Security indicators", "Trust symbols"],
        avoid: ["Playful elements", "Bright colors", "Casual fonts"],
        trending: ["Cryptocurrency symbols", "Digital banking icons", "Minimalist charts"],
        bestPractices: ["Use conservative colors", "Emphasize security", "Include growth symbols"]
      }
    };

    const normalizedIndustry = industry.toLowerCase();
    const specific = industrySpecific[normalizedIndustry];

    if (specific) {
      return specific;
    }

    // Default recommendations
    return {
      mustHave: ["Professional design", "Clear messaging", "Brand consistency"],
      avoid: ["Generic templates", "Poor contrast", "Inconsistent styling"],
      trending: ["Minimalist approach", "Custom illustrations", "Bold typography"],
      bestPractices: ["Research target audience", "Test across devices", "Maintain consistency"]
    };
  }

  // Get all available themes and styles
  static getAvailableOptions(): {
    palettes: string[];
    industries: string[];
    logoStyles: string[];
    fontCategories: string[];
  } {
    const paletteData = palettes as Record<string, string[]>;
    const industryData = industries as Record<string, any>;
    const logoData = logos as Record<string, string[]>;
    const fontData = fonts as Record<string, string[]>;

    return {
      palettes: Object.keys(paletteData),
      industries: Object.keys(industryData),
      logoStyles: Object.keys(logoData),
      fontCategories: Object.keys(fontData)
    };
  }
}