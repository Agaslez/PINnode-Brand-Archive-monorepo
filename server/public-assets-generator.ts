import { CompleteProductData } from "./complete-product-export";
import JSZip from "jszip";
import { generateAdvancedSVGLogo, generateSmartColorPalette } from "./ai-logo-generator";
import { createAnimatedVideoSVG } from "./video-generator";

export async function generatePublicAssetsFolder(zip: JSZip, data: CompleteProductData): Promise<void> {
  const publicFolder = zip.folder('public')!;
  
  // Generate complete landing page
  const landingPage = generateLandingPage(data);
  publicFolder.file('index.html', landingPage);
  
  // Generate comprehensive CSS
  const mainStyles = generateMainStylesheet(data);
  publicFolder.file('style.css', mainStyles);
  
  // Add logo variants
  const logo = generateAdvancedSVGLogo(data);
  const logoIcon = generateLogoIcon(data);
  const logoWhite = generateWhiteLogo(data);
  
  publicFolder.file('logo.svg', logo);
  publicFolder.file('logo-icon.svg', logoIcon);
  publicFolder.file('logo-white.svg', logoWhite);
  
  // Add favicon and app icons
  const favicon = generateFavicon(data);
  const appleTouchIcon = generateAppleTouchIcon(data);
  
  publicFolder.file('favicon.svg', favicon);
  publicFolder.file('apple-touch-icon.svg', appleTouchIcon);
  
  // Add demo video placeholder
  const demoVideo = createAnimatedVideoSVG(data);
  publicFolder.file('demo-placeholder.svg', demoVideo);
  
  // Generate robots.txt and sitemap
  publicFolder.file('robots.txt', generateRobotsTxt(data));
  publicFolder.file('sitemap.xml', generateSitemap(data));
  
  // Add comprehensive assets.json
  const smartPalette = generateSmartColorPalette(data);
  const assetsJson = generateEnhancedAssetsJson(data, smartPalette);
  publicFolder.file('assets.json', JSON.stringify(assetsJson, null, 2));
  
  // Add manifest.json for PWA
  const manifest = generateWebAppManifest(data);
  publicFolder.file('manifest.json', JSON.stringify(manifest, null, 2));
}

function generateLandingPage(data: CompleteProductData): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.brandName} - ${data.description}</title>
    <meta name="description" content="${data.description}. Professional ${data.industry} solution for ${data.targetAudience}.">
    
    <!-- SEO Meta Tags -->
    <meta name="keywords" content="${data.brandName}, ${data.industry}, ${data.targetAudience}, professional, solution">
    <meta name="author" content="${data.brandName}">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${data.brandName} - ${data.description}">
    <meta property="og:description" content="Professional ${data.industry} solution for ${data.targetAudience}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com">
    <meta property="og:image" content="https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com/logo.svg">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${data.brandName}">
    <meta name="twitter:description" content="${data.description}">
    <meta name="twitter:image" content="https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com/logo.svg">
    
    <!-- Favicon -->
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="apple-touch-icon.svg">
    
    <!-- Styles -->
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${data.fonts[0].replace(/\s+/g, '+')}:wght@400;500;600;700&family=${data.fonts[1]?.replace(/\s+/g, '+') || 'Inter'}:wght@400;500&display=swap" rel="stylesheet">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="${data.colors[0]}">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">
                <img src="logo.svg" alt="${data.brandName}" class="logo">
                <span class="brand-name">${data.brandName}</span>
            </div>
            <div class="nav-links">
                <a href="#features" class="nav-link">Features</a>
                <a href="#demo" class="nav-link">Demo</a>
                <a href="#pricing" class="nav-link">Pricing</a>
                <a href="#contact" class="nav-link">Contact</a>
                <button class="cta-button">Get Started</button>
            </div>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="hero-title">${data.brandName}</h1>
                <p class="hero-subtitle">${data.description}</p>
                <p class="hero-description">
                    Professional ${data.industry} solution designed specifically for ${data.targetAudience}. 
                    Experience next-generation productivity with our ${data.logoStyle} approach.
                </p>
                <div class="hero-actions">
                    <button class="primary-button">Start Free Trial</button>
                    <button class="secondary-button">Watch Demo</button>
                </div>
                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number">95%</span>
                        <span class="stat-label">Success Rate</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">10x</span>
                        <span class="stat-label">Faster Results</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">24/7</span>
                        <span class="stat-label">Support</span>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-logo">
                    <img src="logo.svg" alt="${data.brandName}" class="hero-logo-image">
                </div>
            </div>
        </div>
    </section>

    <!-- Demo Section -->
    <section id="demo" class="demo-section">
        <div class="container">
            <h2 class="section-title">See ${data.brandName} in Action</h2>
            <p class="section-subtitle">Watch how ${data.brandName} transforms your ${data.industry} workflow</p>
            
            <div class="demo-container">
                <div class="video-wrapper">
                    <!-- SVG placeholder for demo video -->
                    <object data="demo-placeholder.svg" type="image/svg+xml" class="demo-video">
                        <div class="video-fallback">
                            <h3>Demo Video</h3>
                            <p>Professional ${data.brandName} demonstration</p>
                            <button class="play-button">▶ Play Demo</button>
                        </div>
                    </object>
                    
                    <!-- Alternative: Real video when available -->
                    <!--
                    <video controls poster="demo-thumbnail.jpg" class="demo-video">
                        <source src="demo.mp4" type="video/mp4">
                        <source src="demo.webm" type="video/webm">
                        Your browser does not support video playback.
                    </video>
                    -->
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
        <div class="container">
            <h2 class="section-title">Powerful Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon" style="background: ${data.colors[0]}20;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="${data.colors[0]}">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <h3 class="feature-title">Professional Quality</h3>
                    <p class="feature-description">Industry-leading ${data.industry} capabilities designed for ${data.targetAudience}.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon" style="background: ${data.colors[1] || data.colors[0]}20;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="${data.colors[1] || data.colors[0]}">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                    </div>
                    <h3 class="feature-title">Lightning Fast</h3>
                    <p class="feature-description">Get results 10x faster with our optimized ${data.logoStyle} workflow.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon" style="background: ${data.colors[2] || data.colors[0]}20;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="${data.colors[2] || data.colors[0]}">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 class="feature-title">Reliable & Secure</h3>
                    <p class="feature-description">Enterprise-grade security with 99.9% uptime guarantee.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <h2 class="cta-title">Ready to Transform Your ${data.industry} Workflow?</h2>
            <p class="cta-subtitle">Join thousands of satisfied ${data.targetAudience} using ${data.brandName}</p>
            <div class="cta-actions">
                <button class="primary-button large">Start Free Trial</button>
                <button class="secondary-button large">Schedule Demo</button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <img src="logo-white.svg" alt="${data.brandName}" class="footer-logo">
                    <p class="footer-description">${data.description}</p>
                </div>
                <div class="footer-links">
                    <div class="footer-section">
                        <h4>Product</h4>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#demo">Demo</a>
                    </div>
                    <div class="footer-section">
                        <h4>Company</h4>
                        <a href="#about">About</a>
                        <a href="#careers">Careers</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div class="footer-section">
                        <h4>Support</h4>
                        <a href="#help">Help Center</a>
                        <a href="#docs">Documentation</a>
                        <a href="#api">API</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 ${data.brandName}. All rights reserved.</p>
                <div class="footer-social">
                    <a href="#" class="social-link">LinkedIn</a>
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">YouTube</a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Basic interactions
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            // CTA button interactions
            document.querySelectorAll('.primary-button, .cta-button').forEach(button => {
                button.addEventListener('click', function() {
                    console.log('${data.brandName} CTA clicked');
                    // Add your conversion tracking here
                    alert('Thank you for your interest in ${data.brandName}! Contact us at contact@${data.brandName.toLowerCase().replace(/\s+/g, '')}.com');
                });
            });
            
            // Demo video placeholder interaction
            const playButtons = document.querySelectorAll('.play-button');
            playButtons.forEach(button => {
                button.addEventListener('click', function() {
                    alert('Demo video would play here. Upload your demo.mp4 to activate video playback.');
                });
            });
        });
    </script>
</body>
</html>`;
}

function generateMainStylesheet(data: CompleteProductData): string {
  return `/* ${data.brandName} - Main Stylesheet */
/* Generated by PINnode System v1.0.0 */

:root {
    --primary-color: ${data.colors[0]};
    --secondary-color: ${data.colors[1] || data.colors[0]};
    --accent-color: ${data.colors[2] || data.colors[0]};
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --text-light: #ffffff;
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-dark: #1a1a1a;
    --border-color: #e5e7eb;
    --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-heavy: 0 10px 25px rgba(0, 0, 0, 0.15);
    --radius-small: 6px;
    --radius-medium: 12px;
    --radius-large: 24px;
    --font-primary: '${data.fonts[0]}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-secondary: '${data.fonts[1] || data.fonts[0]}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-primary);
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-primary);
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-primary);
}

h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.5rem, 3vw, 2rem); }
h4 { font-size: clamp(1.25rem, 2.5vw, 1.5rem); }

p {
    font-family: var(--font-secondary);
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

/* Layout Components */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.section-title {
    text-align: center;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* Header & Navigation */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    z-index: 1000;
    transition: all 0.3s ease;
}

.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo {
    height: 40px;
    width: auto;
}

.brand-name {
    font-family: var(--font-primary);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-link {
    font-family: var(--font-secondary);
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-link:hover {
    color: var(--primary-color);
}

/* Buttons */
.primary-button, .secondary-button, .cta-button {
    font-family: var(--font-primary);
    font-weight: 600;
    border: none;
    border-radius: var(--radius-medium);
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.primary-button, .cta-button {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--text-light);
    padding: 0.75rem 1.5rem;
    box-shadow: var(--shadow-medium);
}

.primary-button:hover, .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-heavy);
}

.secondary-button {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    padding: 0.75rem 1.5rem;
}

.secondary-button:hover {
    background: var(--primary-color);
    color: var(--text-light);
}

.large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
}

/* Hero Section */
.hero {
    padding: 8rem 2rem 4rem;
    background: linear-gradient(135deg, var(--primary-color)10, var(--secondary-color)05);
    min-height: 100vh;
    display: flex;
    align-items: center;
}

.hero-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-title {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.hero-description {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
}

.hero-stats {
    display: flex;
    gap: 2rem;
}

.stat {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    font-family: var(--font-primary);
}

.stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-family: var(--font-secondary);
}

.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-logo {
    position: relative;
    padding: 3rem;
    background: linear-gradient(135deg, var(--primary-color)15, var(--secondary-color)10);
    border-radius: var(--radius-large);
    box-shadow: var(--shadow-heavy);
}

.hero-logo-image {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Demo Section */
.demo-section {
    padding: 6rem 0;
    background: var(--bg-secondary);
}

.demo-container {
    max-width: 800px;
    margin: 0 auto;
}

.video-wrapper {
    position: relative;
    background: var(--bg-dark);
    border-radius: var(--radius-large);
    overflow: hidden;
    box-shadow: var(--shadow-heavy);
}

.demo-video {
    width: 100%;
    height: 450px;
    object-fit: cover;
}

.video-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 450px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--text-light);
    text-align: center;
}

.play-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid var(--text-light);
    color: var(--text-light);
    padding: 1rem 2rem;
    border-radius: var(--radius-medium);
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.play-button:hover {
    background: var(--text-light);
    color: var(--primary-color);
}

/* Features Section */
.features-section {
    padding: 6rem 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.feature-card {
    background: var(--bg-primary);
    padding: 2rem;
    border-radius: var(--radius-large);
    box-shadow: var(--shadow-light);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    text-align: center;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-heavy);
}

.feature-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
}

.feature-title {
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.feature-description {
    color: var(--text-secondary);
    line-height: 1.6;
}

/* CTA Section */
.cta-section {
    padding: 6rem 0;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--text-light);
    text-align: center;
}

.cta-title {
    color: var(--text-light);
    margin-bottom: 1rem;
}

.cta-subtitle {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.cta-section .primary-button {
    background: var(--text-light);
    color: var(--primary-color);
}

.cta-section .secondary-button {
    border-color: var(--text-light);
    color: var(--text-light);
}

.cta-section .secondary-button:hover {
    background: var(--text-light);
    color: var(--primary-color);
}

/* Footer */
.footer {
    background: var(--bg-dark);
    color: var(--text-light);
    padding: 3rem 0 1rem;
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    margin-bottom: 2rem;
}

.footer-brand {
    max-width: 300px;
}

.footer-logo {
    height: 40px;
    width: auto;
    margin-bottom: 1rem;
}

.footer-description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
}

.footer-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
}

.footer-section h4 {
    color: var(--text-light);
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.footer-section a {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: var(--text-light);
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
}

.footer-social {
    display: flex;
    gap: 1rem;
}

.social-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.3s ease;
}

.social-link:hover {
    color: var(--text-light);
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
    
    .nav {
        padding: 1rem;
    }
    
    .nav-links {
        gap: 1rem;
    }
    
    .hero {
        padding: 6rem 1rem 3rem;
        text-align: center;
    }
    
    .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .hero-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .hero-stats {
        justify-content: center;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .cta-actions {
        flex-direction: column;
        align-items: center;
    }
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero-content > * {
    animation: fadeInUp 0.8s ease forwards;
}

.hero-text > *:nth-child(1) { animation-delay: 0.1s; }
.hero-text > *:nth-child(2) { animation-delay: 0.2s; }
.hero-text > *:nth-child(3) { animation-delay: 0.3s; }
.hero-text > *:nth-child(4) { animation-delay: 0.4s; }

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.hidden { display: none; }
.visible { display: block; }

/* Print Styles */
@media print {
    .header, .footer, .cta-section {
        display: none;
    }
    
    body {
        font-size: 12pt;
        line-height: 1.4;
    }
    
    .hero, .demo-section, .features-section {
        padding: 1rem 0;
        page-break-inside: avoid;
    }
}`;
}

function generateLogoIcon(data: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${data.colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${data.colors[1] || data.colors[0]};stop-opacity:1" />
        </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#iconGrad)"/>
    <text x="50" y="60" text-anchor="middle" fill="white" font-family="${data.fonts[0]}, sans-serif" font-size="32" font-weight="bold">
        ${data.brandName.charAt(0).toUpperCase()}
    </text>
</svg>`;
}

function generateWhiteLogo(data: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120" width="300" height="120">
    <g transform="translate(20, 20)">
        <circle cx="40" cy="40" r="35" fill="white" opacity="0.9"/>
        <text x="40" y="50" text-anchor="middle" fill="${data.colors[0]}" font-family="${data.fonts[0]}, sans-serif" font-size="24" font-weight="bold">
            ${data.brandName.charAt(0)}
        </text>
    </g>
    <text x="120" y="45" font-family="${data.fonts[0]}, sans-serif" font-size="28" font-weight="bold" fill="white">
        ${data.brandName}
    </text>
    <text x="120" y="70" font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">
        ${data.description.length > 40 ? data.description.substring(0, 40) + '...' : data.description}
    </text>
</svg>`;
}

function generateFavicon(data: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <rect width="32" height="32" rx="6" fill="${data.colors[0]}"/>
    <text x="16" y="22" text-anchor="middle" fill="white" font-family="${data.fonts[0]}, sans-serif" font-size="18" font-weight="bold">
        ${data.brandName.charAt(0).toUpperCase()}
    </text>
</svg>`;
}

function generateAppleTouchIcon(data: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
    <defs>
        <linearGradient id="appleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${data.colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${data.colors[1] || data.colors[0]};stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="180" height="180" rx="40" fill="url(#appleGrad)"/>
    <circle cx="90" cy="90" r="60" fill="rgba(255,255,255,0.1)"/>
    <text x="90" y="110" text-anchor="middle" fill="white" font-family="${data.fonts[0]}, sans-serif" font-size="64" font-weight="bold">
        ${data.brandName.charAt(0).toUpperCase()}
    </text>
</svg>`;
}

function generateRobotsTxt(data: CompleteProductData): string {
  return `User-agent: *
Allow: /

Sitemap: https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com/sitemap.xml

# ${data.brandName} - Professional ${data.industry} Solution
# Generated by PINnode System v1.0.0`;
}

function generateSitemap(data: CompleteProductData): string {
  const domain = `https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com`;
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${domain}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${domain}/features</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${domain}/demo</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${domain}/pricing</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${domain}/contact</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
</urlset>`;
}

function generateEnhancedAssetsJson(data: CompleteProductData, smartPalette: any): any {
  return {
    brand: {
      name: data.brandName,
      description: data.description,
      industry: data.industry,
      targetAudience: data.targetAudience,
      logoStyle: data.logoStyle,
      version: "1.0.0",
      generatedAt: new Date().toISOString()
    },
    design: {
      colors: smartPalette,
      typography: {
        primary: data.fonts[0],
        secondary: data.fonts[1] || data.fonts[0],
        families: data.fonts
      },
      logoVariants: {
        primary: "logo.svg",
        icon: "logo-icon.svg",
        white: "logo-white.svg",
        animated: "logo-animated.svg"
      }
    },
    assets: {
      favicon: "favicon.svg",
      appleTouchIcon: "apple-touch-icon.svg",
      ogImage: "og-image.jpg",
      demoVideo: "demo.mp4",
      demoPlaceholder: "demo-placeholder.svg"
    },
    technical: {
      manifest: "manifest.json",
      sitemap: "sitemap.xml",
      robots: "robots.txt"
    },
    urls: {
      website: `https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
      logo: `https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com/logo.svg`,
      demo: `https://${data.brandName.toLowerCase().replace(/\s+/g, '')}.com/demo.mp4`
    }
  };
}

function generateWebAppManifest(data: CompleteProductData): any {
  return {
    name: data.brandName,
    short_name: data.brandName.length > 12 ? data.brandName.substring(0, 12) : data.brandName,
    description: data.description,
    start_url: "/",
    display: "standalone",
    background_color: data.colors[0],
    theme_color: data.colors[0],
    icons: [
      {
        src: "favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: "apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml"
      }
    ],
    categories: [data.industry, "productivity", "business"],
    lang: "pl",
    orientation: "portrait-primary"
  };
}