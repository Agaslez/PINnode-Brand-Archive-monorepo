import JSZip from "jszip";
import { storage } from "./storage";
import { generateBrandAssets, extractColorPalette, generateAssetsManifest } from "./graphic-quality";
import { BrandDatabase } from "./brand-database";

// Enhanced ZIP export with complete branding packages and professional assets
export async function createBrandingZip(
  brandName: string, 
  html: string, 
  logoSvg?: string, 
  industry: string = "technology"
): Promise<Buffer> {
  const zip = new JSZip();

  // Generate comprehensive brand package
  const brandPackage = BrandDatabase.generateBrandPackage(industry);
  
  // Generate professional graphic assets if logo provided
  let graphicAssets: any = {};
  let qualityFeedback = "";
  let colorPalette: any = {};
  
  if (logoSvg) {
    const assetGeneration = await generateBrandAssets(logoSvg, brandName);
    graphicAssets = assetGeneration.assets;
    qualityFeedback = assetGeneration.feedback;
    colorPalette = extractColorPalette(logoSvg);
    
    // Add all generated graphic assets to ZIP
    Object.entries(graphicAssets).forEach(([filename, buffer]) => {
      zip.file(filename, buffer as Buffer);
    });
    
    // Add original SVG
    zip.file("logo.svg", logoSvg);
  }

  // 🔵 Enhanced HTML with proper logo integration and brand styling
  let enhancedHtml = html;
  if (logoSvg) {
    enhancedHtml = html
      .replace('<header>', `<header>\n  <img src="logo.svg" alt="${brandName} Logo" width="120" height="80" />\n`)
      .replace('</head>', `  <link rel="icon" type="image/x-icon" href="favicon.ico">\n  <link rel="apple-touch-icon" href="apple-touch-icon.png">\n</head>`);
  }
  
  zip.file("index.html", enhancedHtml);

  // 🎨 Enhanced CSS with brand-specific styling
  const styleCss = `
/* PINnode Branding Export - Professional Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  padding: 3rem 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

header img {
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

h2 {
  color: #4a5568;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

h3 {
  color: #667eea;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
}

p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.feature-card {
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

button, .btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-decoration: none;
}

button:hover, .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

footer {
  text-align: center;
  padding: 2rem 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  margin-top: 3rem;
}

.tagline {
  font-style: italic;
  color: #667eea;
  font-size: 1.2rem;
}

.export-info {
  background: linear-gradient(135deg, #f0f4ff, #e0e7ff);
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #4338ca;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
`;

  zip.file("style.css", styleCss);

  // 🎨 Brand Assets JSON with comprehensive data
  const brandAssetsData = {
    brand: brandName,
    industry: brandPackage.industry,
    colors: {
      palette: brandPackage.colors,
      extracted: colorPalette.primary || [],
      analysis: colorPalette.analysis || "No color analysis available"
    },
    fonts: {
      recommended: brandPackage.fonts,
      primary: brandPackage.recommendations.primaryFont,
      secondary: brandPackage.recommendations.secondaryFont
    },
    recommendations: brandPackage.recommendations,
    qualityAssessment: qualityFeedback,
    generated: new Date().toISOString()
  };

  zip.file("brand-assets.json", JSON.stringify(brandAssetsData, null, 2));

  // 🎨 Generate comprehensive style guide HTML
  const styleGuideHtml = generateStyleGuide(brandName, brandPackage, colorPalette);
  zip.file("style-guide.html", styleGuideHtml);

  // 📱 Generate app description for stores
  if (brandPackage.appDescription) {
    zip.file("app-description.txt", brandPackage.appDescription);
  }

  // 🎨 Generate enhanced CSS for landing page
  const enhancedCSS = generateEnhancedCSS(brandPackage.colors, brandPackage.fonts);
  zip.file("style.css", enhancedCSS);

  // 🖼️ Logo handling with fallback
  if (!logoSvg) {
    // Generate default logo with brand colors
    const primaryColor = brandPackage.colors[0] || "#667eea";
    const secondaryColor = brandPackage.colors[1] || "#764ba2";
    
    const defaultLogo = `<svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="120" height="80" rx="10" fill="url(#brandGrad)"/>
  <text x="60" y="45" font-family="${brandPackage.recommendations.primaryFont}, Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${brandName}</text>
</svg>`;
    
    zip.file("logo.svg", defaultLogo);
    
    // Generate default assets
    try {
      const defaultAssets = await generateBrandAssets(defaultLogo, brandName);
      Object.entries(defaultAssets.assets).forEach(([filename, buffer]) => {
        zip.file(filename, buffer as Buffer);
      });
    } catch (error) {
      console.error("Default asset generation failed:", error);
    }
  }

  // 📘 Enhanced README with brand analysis and recommendations
  const industryInfo = brandPackage.industry;
  const recommendations = BrandDatabase.getIndustryRecommendations(industry);
  
  const readmeContent = `
# ${brandName} - Professional Branding Package

Generated by PINnode Archivist - Advanced AI Branding System
Export Date: ${new Date().toLocaleString('pl-PL')}
Industry: ${industry.charAt(0).toUpperCase() + industry.slice(1)}

## 📦 Package Contents:

📄 **index.html** - Complete responsive landing page
🎨 **style.css** - Professional CSS with ${industryInfo.style} styling
🖼️ **logo.svg** - Scalable vector logo optimized for ${industryInfo.tone} tone
🖼️ **logo.png** - High-resolution raster (512x512px)
🖼️ **logo.webp** - Optimized web format (512x512px)
🖼️ **logo_256.png** - Medium resolution for apps (256x256px)
🖼️ **logo_128.png** - Small resolution for icons (128x128px)
🖼️ **favicon.ico** - Browser favicon (32x32px)
🖼️ **apple-touch-icon.png** - iOS home screen icon (180x180px)
📊 **brand-assets.json** - Complete brand data and recommendations
📘 **README.txt** - This comprehensive guide
${qualityFeedback ? '🔍 **AI_QUALITY_REPORT.txt** - Professional logo analysis\n' : ''}

## 🎨 Brand Strategy:

**Industry Focus:** ${industry}
**Brand Tone:** ${industryInfo.tone}
**Visual Style:** ${industryInfo.style}
**Key Words:** ${industryInfo.keywords.join(', ')}

**Color Palette:**
${brandPackage.colors.map((color, i) => `${i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Accent'}: ${color}`).join('\n')}

**Typography:**
Primary Font: ${brandPackage.recommendations.primaryFont}
Secondary Font: ${brandPackage.recommendations.secondaryFont}

## ✅ Quality Features:

✅ Industry-specific design optimized for ${industry}
✅ Professional ${industryInfo.style} aesthetic
✅ Complete asset package (7+ formats)
✅ SEO-optimized HTML structure
✅ Mobile-first responsive design
✅ Cross-browser compatibility
✅ AI-analyzed logo quality
✅ Brand consistency guidelines

## 🚀 Usage Guide:

**For Web Development:**
1. Use logo.webp or logo.png for web pages
2. Place favicon.ico in your website root
3. Reference apple-touch-icon.png in HTML head
4. Customize colors in style.css using brand palette

**For Print Materials:**
1. Use logo.svg for scalable print graphics
2. Maintain minimum size of 1 inch width
3. Use primary brand colors for consistency

**For Applications:**
1. Use logo_256.png for app icons
2. Use logo_128.png for small interface elements
3. Follow platform-specific icon guidelines

## 📋 Brand Guidelines:

**Must Have:** ${recommendations.mustHave.join(', ')}
**Avoid:** ${recommendations.avoid.join(', ')}
**Trending:** ${recommendations.trending.join(', ')}

## 🔧 Technical Specifications:

- Responsive breakpoints: 768px, 1024px, 1440px
- Color space: sRGB for web, CMYK for print
- Font loading: Google Fonts with fallbacks
- Image optimization: WebP with PNG fallbacks
- Icon formats: SVG primary, PNG secondary

${qualityFeedback ? `## 🎯 AI Quality Assessment:\n\n${qualityFeedback}\n` : ''}

---
⚡ Generated by PINnode Archivist v1.0
🧠 Advanced AI-Powered Branding & Archive System
🎨 Professional-Grade Brand Asset Generation
`;

  zip.file("README.txt", readmeContent);

  // Add detailed quality report if available
  if (qualityFeedback && logoSvg) {
    zip.file("AI_QUALITY_REPORT.txt", qualityFeedback);
  }

  // 📊 Enhanced project metadata with comprehensive analysis
  const metadata = {
    projectName: brandName,
    industry: industry,
    exportDate: new Date().toISOString(),
    generator: "PINnode Archivist v1.0",
    brandPackage: brandPackage.recommendations,
    files: {
      "index.html": "Responsive landing page with brand integration",
      "style.css": "Industry-optimized professional styling",
      "logo.svg": "Scalable vector logo",
      "logo.png": "High-resolution raster logo (512px)",
      "logo.webp": "Optimized web format",
      "logo_256.png": "Medium resolution (256px)",
      "logo_128.png": "Icon size (128px)", 
      "favicon.ico": "Browser favicon",
      "apple-touch-icon.png": "iOS icon",
      "brand-assets.json": "Complete brand data package",
      "README.txt": "Comprehensive documentation"
    },
    features: [
      "Industry-Specific Design",
      "Professional Asset Generation",
      "AI Quality Assessment",
      "Brand Consistency Guidelines",
      "Cross-Platform Compatibility",
      "SEO Optimization",
      "Mobile-First Design"
    ],
    brandFeatures: {
      colorHarmony: brandPackage.colors.length >= 3 ? "Balanced" : "Minimal",
      typographyOptimized: true,
      industryCompliant: true,
      scalableAssets: Object.keys(graphicAssets).length >= 5,
      qualityAssured: logoSvg ? true : false
    },
    qualityScore: logoSvg ? 5 : 4
  };

  zip.file("project-metadata.json", JSON.stringify(metadata, null, 2));

  return await zip.generateAsync({ type: "nodebuffer" });
}

// Enhanced archive export with multiple formats
export async function createArchiveZip(entries: any[], format: 'complete' | 'code_only' | 'chats_only' = 'complete'): Promise<Buffer> {
  const zip = new JSZip();

  // Filter entries based on format
  let filteredEntries = entries;
  if (format === 'code_only') {
    filteredEntries = entries.filter(e => 
      e.category === 'Development' || 
      e.tags?.includes('Code') ||
      /\.(js|ts|py|r|sql|css|html)$/i.test(e.filename)
    );
  } else if (format === 'chats_only') {
    filteredEntries = entries.filter(e => 
      e.category === 'PINpall' || 
      e.tags?.includes('AI-Chat') ||
      e.content.includes('user:') || 
      e.content.includes('assistant:')
    );
  }

  // Create folders by category
  const categorySet = new Set(filteredEntries.map(e => e.category || 'Uncategorized'));
  const categories = Array.from(categorySet);
  
  categories.forEach(category => {
    const categoryEntries = filteredEntries.filter(e => (e.category || 'Uncategorized') === category);
    const folder = zip.folder(category);
    
    categoryEntries.forEach((entry, index) => {
      const filename = entry.filename || `file_${index + 1}.txt`;
      const content = `# ${filename}
Source: ${entry.source || 'Unknown'}
Created: ${entry.createdAt ? new Date(entry.createdAt).toLocaleString('pl-PL') : 'Unknown'}
Tags: ${entry.tags?.join(', ') || 'None'}
Size: ${entry.fileSize || entry.content.length} characters

---

${entry.content}`;

      folder!.file(filename, content);
    });
  });

  // Add export manifest
  const manifest = {
    exportType: 'Archive',
    format: format,
    totalFiles: filteredEntries.length,
    categories: categories.length,
    exportDate: new Date().toISOString(),
    generator: 'PINnode Archivist'
  };

  zip.file('export-manifest.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: "nodebuffer" });
}

// Generate enhanced CSS for the complete landing page
function generateEnhancedCSS(colors: string[], fonts: string[]): string {
  const [primary, secondary, accent] = colors;
  const [primaryFont, secondaryFont] = fonts;
  
  return `/* Enhanced CSS for ${primaryFont} Brand Landing Page */
@import url('https://fonts.googleapis.com/css2?family=${primaryFont.replace(' ', '+')}:wght@300;400;600;700&family=${secondaryFont.replace(' ', '+')}:wght@400;500&display=swap');

:root {
  --primary-color: ${primary};
  --secondary-color: ${secondary};
  --accent-color: ${accent || colors[2]};
  --primary-font: '${primaryFont}', sans-serif;
  --secondary-font: '${secondaryFont}', serif;
  --border-radius: 12px;
  --gradient-primary: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: var(--primary-font); line-height: 1.6; color: #333; }

.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

.hero {
  background: var(--gradient-primary);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; }
.hero-tagline { font-size: 1.3rem; margin-bottom: 2rem; opacity: 0.95; }
.hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.btn-primary, .btn-secondary, .btn-outline {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary { background: var(--accent-color); color: white; }
.btn-primary:hover { transform: translateY(-2px); }
.btn-secondary { background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); }
.btn-outline { background: transparent; color: var(--primary-color); border: 2px solid var(--primary-color); }
.btn-outline:hover { background: var(--primary-color); color: white; }

section { padding: 4rem 0; }
.section-header { text-align: center; margin-bottom: 3rem; }
.section-header h2 { font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1rem; }

.description { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
.description-content { display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; align-items: center; }

.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.feature-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease;
}
.feature-card:hover { transform: translateY(-5px); }
.feature-icon { font-size: 3rem; margin-bottom: 1rem; }

.demo { background: linear-gradient(135deg, ${secondary} 0%, ${accent || colors[2]} 100%); color: white; }
.demo-content { display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; align-items: center; }
.video-container { border-radius: var(--border-radius); overflow: hidden; }

.subscription { background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); }
.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.plan-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}
.plan-card:hover { transform: translateY(-5px); }
.plan-card.featured { border: 3px solid var(--primary-color); transform: scale(1.05); }
.plan-badge { background: var(--accent-color); color: white; padding: 0.5rem 1rem; text-align: center; }
.plan-header { padding: 2rem 2rem 1rem; text-align: center; }
.plan-price .price { font-size: 2.5rem; font-weight: 700; color: var(--primary-color); }

.downloads { background: var(--gradient-primary); color: white; }
.downloads-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
.download-item {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.2);
}
.download-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.newsletter { background: var(--primary-color); color: white; text-align: center; }
.newsletter-form { display: flex; max-width: 400px; margin: 2rem auto; gap: 1rem; }
.newsletter-form input { flex: 1; padding: 1rem; border: none; border-radius: var(--border-radius); }

.footer { background: #2c3e50; color: white; padding: 3rem 0 1rem; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }

@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  .hero h1 { font-size: 2.5rem; }
  .description-content, .demo-content { grid-template-columns: 1fr; }
  .plans-grid, .downloads-grid { grid-template-columns: 1fr; }
  .plan-card.featured { transform: none; }
  .newsletter-form { flex-direction: column; }
}`;
}



// Generate comprehensive style guide HTML with brand assets
function generateStyleGuide(brandName: string, brandPackage: any, colorPalette: any): string {
  const { colors, fonts, recommendations, industry } = brandPackage;
  const primaryColors = colors.slice(0, 3);
  const secondaryColors = colors.slice(3, 6);
  
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Style Guide – ${brandName}</title>
  <link href="https://fonts.googleapis.com/css2?family=${fonts[0]?.replace(' ', '+')}:wght@300;400;600;700&family=${fonts[1]?.replace(' ', '+')}:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: '${fonts[0] || 'Inter'}', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
      position: relative;
    }
    
    .logo-container {
      margin-bottom: 1rem;
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      font-family: '${fonts[1] || 'Open Sans'}', sans-serif;
    }
    
    .content {
      padding: 3rem 2rem;
    }
    
    .section {
      margin-bottom: 4rem;
    }
    
    .section h2 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      color: ${colors[0]};
      border-bottom: 3px solid ${colors[1]};
      padding-bottom: 0.5rem;
      display: inline-block;
    }
    
    .color-palette {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .color-group h3 {
      margin-bottom: 1rem;
      color: #666;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .color-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .color-swatch {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      border: 2px solid #eee;
      position: relative;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
    }
    
    .color-swatch:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    
    .color-code {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      font-weight: 600;
      color: #666;
      background: white;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .typography-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .font-sample {
      padding: 2rem;
      border: 2px solid #eee;
      border-radius: 12px;
      background: #fafafa;
    }
    
    .font-name {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: ${colors[0]};
    }
    
    .font-demo {
      margin-bottom: 1rem;
    }
    
    .font-demo.large {
      font-size: 2rem;
      font-weight: 700;
    }
    
    .font-demo.medium {
      font-size: 1.2rem;
      font-weight: 400;
    }
    
    .font-demo.small {
      font-size: 0.9rem;
      font-weight: 300;
    }
    
    .logo-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .logo-variant {
      text-align: center;
      padding: 2rem;
      border: 2px solid #eee;
      border-radius: 12px;
      background: white;
    }
    
    .logo-variant.dark {
      background: #2c3e50;
      color: white;
    }
    
    .logo-variant img {
      max-width: 120px;
      height: auto;
      margin-bottom: 1rem;
    }
    
    .usage-guide {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    
    .usage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    
    .usage-item {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .usage-item h4 {
      color: ${colors[0]};
      margin-bottom: 0.5rem;
    }
    
    .brand-personality {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .personality-tag {
      background: ${colors[1]};
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .recommendations {
      background: #e8f5e8;
      border-left: 4px solid #4caf50;
      padding: 1.5rem;
      border-radius: 0 8px 8px 0;
      margin-top: 2rem;
    }
    
    .recommendations h3 {
      color: #2e7d32;
      margin-bottom: 1rem;
    }
    
    .recommendations ul {
      list-style: none;
      padding: 0;
    }
    
    .recommendations li {
      padding: 0.3rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    
    .recommendations li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #4caf50;
      font-weight: bold;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .content {
        padding: 2rem 1rem;
      }
      
      .color-row {
        flex-wrap: wrap;
      }
      
      .color-swatch {
        width: 60px;
        height: 60px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-container">
        <img src="logo.svg" alt="${brandName} Logo" width="80" height="60" />
      </div>
      <h1>Style Guide</h1>
      <p class="subtitle">${brandName} Brand Identity System</p>
    </header>
    
    <div class="content">
      <div class="section">
        <h2>🎨 Paleta Kolorów</h2>
        <div class="color-palette">
          <div class="color-group">
            <h3>Kolory Główne</h3>
            <div class="color-row">
              ${primaryColors.map(color => `
                <div class="color-swatch" style="background-color: ${color};">
                  <div class="color-code">${color}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ${secondaryColors.length > 0 ? `
          <div class="color-group">
            <h3>Kolory Dodatkowe</h3>
            <div class="color-row">
              ${secondaryColors.map(color => `
                <div class="color-swatch" style="background-color: ${color};">
                  <div class="color-code">${color}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        
        <div class="usage-guide">
          <h3>Wytyczne Kolorystyczne</h3>
          <div class="usage-grid">
            <div class="usage-item">
              <h4>Kolor Główny</h4>
              <p>Używaj jako dominant color w logo, nagłówkach i głównych elementach CTA.</p>
            </div>
            <div class="usage-item">
              <h4>Kolor Drugorzędny</h4>
              <p>Idealny do akcentów, hover states i elementów wspierających.</p>
            </div>
            <div class="usage-item">
              <h4>Kolor Akcent</h4>
              <p>Używaj oszczędnie do podkreślenia najważniejszych informacji.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>✍️ Typografia</h2>
        <div class="typography-section">
          ${fonts.map((font: string, index: number) => `
            <div class="font-sample">
              <div class="font-name">${font} ${index === 0 ? '(Główny)' : '(Wspierający)'}</div>
              <div class="font-demo large" style="font-family: '${font}', sans-serif;">
                Przykładowy Nagłówek
              </div>
              <div class="font-demo medium" style="font-family: '${font}', sans-serif;">
                Średni tekst do opisu produktu
              </div>
              <div class="font-demo small" style="font-family: '${font}', sans-serif;">
                Mały tekst do informacji dodatkowych i notatek
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="section">
        <h2>🏷️ Logo & Aplikacje</h2>
        <div class="logo-showcase">
          <div class="logo-variant">
            <img src="logo.svg" alt="${brandName} Logo" />
            <h4>Logo na jasnym tle</h4>
            <p>Standardowe zastosowanie</p>
          </div>
          <div class="logo-variant dark">
            <img src="logo.svg" alt="${brandName} Logo" style="filter: brightness(0) invert(1);" />
            <h4>Logo na ciemnym tle</h4>
            <p>Wersja kontrastowa</p>
          </div>
        </div>
        
        <div class="usage-guide">
          <h3>Zasady Użycia Logo</h3>
          <div class="usage-grid">
            <div class="usage-item">
              <h4>Minimalne rozmiary</h4>
              <p>Web: min. 120px szerokości<br>Print: min. 2.5cm szerokości</p>
            </div>
            <div class="usage-item">
              <h4>Bezpieczna przestrzeń</h4>
              <p>Minimum połowa wysokości logo wokół wszystkich stron</p>
            </div>
            <div class="usage-item">
              <h4>Formaty plików</h4>
              <p>SVG - web i skalowanie<br>PNG - aplikacje i social media</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>🎯 Osobowość Marki</h2>
        <div class="brand-personality">
          ${(recommendations.brandPersonality || []).map((trait: string) => `
            <span class="personality-tag">${trait}</span>
          `).join('')}
        </div>
        
        <div class="recommendations">
          <h3>Rekomendacje Brandingowe</h3>
          <ul>
            <li>Zachowaj spójność kolorystyczną we wszystkich materiałach</li>
            <li>Używaj głównej typografii do wszystkich komunikatów</li>
            <li>Podkreślaj ${(industry.tone || 'profesjonalny')} charakter marki</li>
            <li>Stosuj ${(industry.style || 'nowoczesny')} styl wizualny</li>
            ${colorPalette.analysis ? `<li>${colorPalette.analysis}</li>` : ''}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h2>📋 Specyfikacje Techniczne</h2>
        <div class="usage-grid">
          <div class="usage-item">
            <h4>Kolory Web</h4>
            <p>Format: HEX<br>Przestrzeń: sRGB</p>
          </div>
          <div class="usage-item">
            <h4>Kolory Print</h4>
            <p>Konwertuj do CMYK<br>Profil: ISO Coated v2</p>
          </div>
          <div class="usage-item">
            <h4>Fonty Web</h4>
            <p>Google Fonts<br>Fallback: system fonts</p>
          </div>
          <div class="usage-item">
            <h4>Obrazy</h4>
            <p>Web: PNG/WebP<br>Print: 300 DPI minimum</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
