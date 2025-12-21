import sharp from "sharp";

// Enhanced graphic quality assessment and asset generation
export async function generateBrandAssets(svg: string, brandName: string = "Brand") {
  const baseSvg = Buffer.from(svg);

  try {
    // Generate multiple format exports
    const assets = {
      "logo.png": await sharp(baseSvg).resize(512, 512).png({ quality: 90 }).toBuffer(),
      "logo.webp": await sharp(baseSvg).resize(512, 512).webp({ quality: 90 }).toBuffer(),
      "logo_256.png": await sharp(baseSvg).resize(256, 256).png({ quality: 90 }).toBuffer(),
      "logo_128.png": await sharp(baseSvg).resize(128, 128).png({ quality: 90 }).toBuffer(),
      "favicon.ico": await sharp(baseSvg).resize(32, 32).png().toBuffer(), // ICO format fallback
      "apple-touch-icon.png": await sharp(baseSvg).resize(180, 180).png({ quality: 90 }).toBuffer()
    };

    // Advanced SVG quality assessment
    const qualityMetrics = assessSVGQuality(svg);
    const feedback = generateQualityFeedback(qualityMetrics, brandName);

    return {
      assets,
      feedback,
      qualityMetrics,
      recommendations: generateRecommendations(qualityMetrics)
    };
    
  } catch (error) {
    console.error("Asset generation error:", error);
    return {
      assets: {},
      feedback: "Błąd podczas generowania zasobów graficznych. Sprawdź format SVG.",
      qualityMetrics: { score: 0, issues: ["Invalid SVG format"] },
      recommendations: ["Sprawdź poprawność kodu SVG", "Upewnij się, że SVG zawiera poprawne elementy graficzne"]
    };
  }
}

// Comprehensive SVG quality assessment
function assessSVGQuality(svg: string): {
  score: number;
  complexity: number;
  scalability: number;
  optimization: number;
  issues: string[];
  strengths: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  
  // Count graphic elements for complexity assessment
  const pathCount = (svg.match(/<path/g) || []).length;
  const circleCount = (svg.match(/<circle/g) || []).length;
  const rectCount = (svg.match(/<rect/g) || []).length;
  const polygonCount = (svg.match(/<polygon/g) || []).length;
  const totalElements = pathCount + circleCount + rectCount + polygonCount;
  
  // Complexity scoring (0-10)
  let complexity = Math.min(10, totalElements * 0.5);
  if (complexity < 2) {
    issues.push("Logo może być zbyt prosty - rozważ dodanie więcej elementów");
  } else if (complexity > 8) {
    issues.push("Logo może być zbyt złożony - może źle skalować się na małych ekranach");
  } else {
    strengths.push("Odpowiednia złożoność graficzna");
  }
  
  // Scalability assessment
  let scalability = 10;
  if (svg.includes('font-size="') && !svg.includes('em') && !svg.includes('%')) {
    scalability -= 2;
    issues.push("Używa stałych rozmiarów fontów - może źle skalować");
  }
  if (svg.includes('stroke-width="') && parseFloat(svg.match(/stroke-width="([^"]+)"/)?.[1] || '1') < 0.5) {
    scalability -= 1;
    issues.push("Bardzo cienkie linie mogą znikać przy małych rozmiarach");
  }
  if (!svg.includes('viewBox=')) {
    scalability -= 3;
    issues.push("Brak viewBox - problemy ze skalowaniem");
  } else {
    strengths.push("Poprawne użycie viewBox dla skalowania");
  }
  
  // Optimization assessment
  let optimization = 10;
  if (svg.includes('<!--') || svg.includes('<?xml')) {
    optimization -= 1;
  }
  if (svg.includes('xmlns:') && svg.includes('adobe')) {
    optimization -= 1;
    issues.push("Zawiera metadane Adobe - można zoptymalizować");
  }
  if (svg.includes('style=') && svg.split('style=').length > 3) {
    optimization -= 1;
    issues.push("Dużo inline stylów - rozważ konsolidację");
  } else if (svg.includes('<style>') || svg.includes('<defs>')) {
    strengths.push("Dobrze zorganizowane style");
  }
  
  // Color assessment
  const colorMatches = svg.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/g) || [];
  const uniqueColors = new Set(colorMatches).size;
  if (uniqueColors > 6) {
    issues.push("Dużo kolorów - może utrudniać reprodukcję");
  } else if (uniqueColors >= 2) {
    strengths.push("Odpowiednia paleta kolorów");
  }
  
  // Text elements check
  if (svg.includes('<text')) {
    if (svg.includes('font-family=')) {
      strengths.push("Zawiera tekst z określonymi fontami");
    } else {
      issues.push("Tekst bez określonych fontów - może się różnie wyświetlać");
    }
  }
  
  // Calculate final score
  const score = Math.round((complexity * 0.3 + scalability * 0.4 + optimization * 0.3) / 10 * 100) / 10;
  
  return {
    score,
    complexity,
    scalability,
    optimization,
    issues,
    strengths
  };
}

// Generate detailed feedback based on quality metrics
function generateQualityFeedback(metrics: any, brandName: string): string {
  let feedback = `🎨 **Analiza jakości logo "${brandName}"**\n\n`;
  
  feedback += `📊 **Ogólna ocena: ${metrics.score}/10**\n`;
  
  if (metrics.score >= 8) {
    feedback += "✅ Doskonała jakość! Logo spełnia wysokie standardy profesjonalne.\n\n";
  } else if (metrics.score >= 6) {
    feedback += "👍 Dobra jakość z drobnymi obszarami do poprawy.\n\n";
  } else if (metrics.score >= 4) {
    feedback += "⚠️ Średnia jakość - zalecane są poprawki przed finalnym użyciem.\n\n";
  } else {
    feedback += "❌ Niska jakość - wymagane znaczące poprawki.\n\n";
  }
  
  // Detailed metrics
  feedback += `**Szczegółowa ocena:**\n`;
  feedback += `• Złożoność: ${metrics.complexity}/10\n`;
  feedback += `• Skalowalność: ${metrics.scalability}/10\n`;
  feedback += `• Optymalizacja: ${metrics.optimization}/10\n\n`;
  
  // Strengths
  if (metrics.strengths.length > 0) {
    feedback += `**✅ Mocne strony:**\n`;
    metrics.strengths.forEach((strength: string) => {
      feedback += `• ${strength}\n`;
    });
    feedback += '\n';
  }
  
  // Issues
  if (metrics.issues.length > 0) {
    feedback += `**⚠️ Obszary do poprawy:**\n`;
    metrics.issues.forEach((issue: string) => {
      feedback += `• ${issue}\n`;
    });
  }
  
  return feedback;
}

// Generate actionable recommendations
function generateRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.scalability < 7) {
    recommendations.push("Dodaj viewBox do SVG dla lepszego skalowania");
    recommendations.push("Używaj relative units (em, %) zamiast fixed sizes");
  }
  
  if (metrics.complexity < 3) {
    recommendations.push("Rozważ dodanie więcej elementów wizualnych");
    recommendations.push("Dodaj subtelne detale aby zwiększyć rozpoznawalność");
  }
  
  if (metrics.complexity > 8) {
    recommendations.push("Uprość design dla lepszej czytelności w małych rozmiarach");
    recommendations.push("Rozważ wersję uproszczoną dla favicon/małych zastosowań");
  }
  
  if (metrics.optimization < 7) {
    recommendations.push("Usuń niepotrzebne metadane i komentarze");
    recommendations.push("Konsoliduj style i kolory");
    recommendations.push("Zoptymalizuj ścieżki SVG");
  }
  
  recommendations.push("Przetestuj logo w różnych rozmiarach (16px, 64px, 256px)");
  recommendations.push("Sprawdź czytelność na jasnym i ciemnym tle");
  
  return recommendations;
}

// Enhanced color palette extraction from SVG
export function extractColorPalette(svg: string): {
  primary: string[];
  secondary: string[];
  accent: string[];
  analysis: string;
} {
  const colorMatches = svg.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/g) || [];
  const colors = Array.from(new Set(colorMatches));
  
  // Simple color categorization (this could be enhanced with color theory)
  const primary = colors.slice(0, 2);
  const secondary = colors.slice(2, 4);
  const accent = colors.slice(4, 6);
  
  let analysis = `Wykryto ${colors.length} unikalnych kolorów. `;
  if (colors.length <= 2) {
    analysis += "Minimalistyczna paleta - doskonała dla clean brandingu.";
  } else if (colors.length <= 4) {
    analysis += "Zrównoważona paleta - dobra dla większości zastosowań.";
  } else {
    analysis += "Bogata paleta - upewnij się o spójność w różnych mediach.";
  }
  
  return { primary, secondary, accent, analysis };
}

// Generate brand assets manifest
export function generateAssetsManifest(brandName: string, qualityMetrics: any): object {
  return {
    brand: brandName,
    generated: new Date().toISOString(),
    qualityScore: qualityMetrics.score,
    assets: {
      "logo.svg": "Oryginalny wektor - użyj dla druków i skalowania",
      "logo.png": "512x512px - główna ikona aplikacji/strony",
      "logo.webp": "512x512px - zoptymalizowany web format",
      "logo_256.png": "256x256px - ikony aplikacji, social media",
      "logo_128.png": "128x128px - małe ikony, toolbary",
      "favicon.ico": "32x32px - ikona przeglądarki",
      "apple-touch-icon.png": "180x180px - iOS home screen icon"
    },
    usageGuide: {
      web: "Użyj logo.webp lub logo.png",
      print: "Użyj logo.svg dla nieskończonej skalowalności",
      mobile: "logo_128.png lub logo_256.png",
      favicon: "favicon.ico w folderze root strony"
    },
    recommendations: qualityMetrics.recommendations || []
  };
}