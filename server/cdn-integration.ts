import { CompleteProductData } from "./complete-product-export";

export interface CDNConfiguration {
  baseUrl: string;
  endpoints: CDNEndpoints;
  caching: CachingSettings;
  security: SecuritySettings;
}

export interface CDNEndpoints {
  assets: string;
  demos: string;
  logos: string;
  styles: string;
  fonts: string;
}

export interface CachingSettings {
  staticAssets: string;
  dynamicContent: string;
  apiResponses: string;
}

export interface SecuritySettings {
  accessControl: boolean;
  signedUrls: boolean;
  hotlinkProtection: boolean;
}

export function generateCDNConfiguration(data: CompleteProductData): CDNConfiguration {
  const baseUrl = `https://cdn.${data.brandName.toLowerCase().replace(/\s+/g, '')}.com`;
  
  return {
    baseUrl,
    endpoints: {
      assets: `${baseUrl}/assets`,
      demos: `${baseUrl}/demos`,
      logos: `${baseUrl}/logos`,
      styles: `${baseUrl}/styles`,
      fonts: `${baseUrl}/fonts`
    },
    caching: {
      staticAssets: "max-age=31536000, immutable", // 1 year
      dynamicContent: "max-age=3600", // 1 hour
      apiResponses: "max-age=300" // 5 minutes
    },
    security: {
      accessControl: true,
      signedUrls: false,
      hotlinkProtection: true
    }
  };
}

export function generateCDNAssetUrls(data: CompleteProductData): Record<string, string> {
  const baseUrl = `https://cdn.${data.brandName.toLowerCase().replace(/\s+/g, '')}.com`;
  
  return {
    // Logo variants
    "logo.svg": `${baseUrl}/logos/logo.svg`,
    "logo-animated.svg": `${baseUrl}/logos/logo-animated.svg`,
    "logo-dark.svg": `${baseUrl}/logos/logo-dark.svg`,
    "logo-light.svg": `${baseUrl}/logos/logo-light.svg`,
    "logo-icon.svg": `${baseUrl}/logos/icon.svg`,
    
    // Multi-format logos
    "logo.png": `${baseUrl}/logos/logo.png`,
    "logo@2x.png": `${baseUrl}/logos/logo@2x.png`,
    "logo.webp": `${baseUrl}/logos/logo.webp`,
    "favicon.ico": `${baseUrl}/logos/favicon.ico`,
    "apple-touch-icon.png": `${baseUrl}/logos/apple-touch-icon.png`,
    
    // Style assets
    "style-guide.css": `${baseUrl}/styles/style-guide.css`,
    "theme.css": `${baseUrl}/styles/theme.css`,
    "components.css": `${baseUrl}/styles/components.css`,
    
    // Demo materials
    "demo.mp4": `${baseUrl}/demos/demo.mp4`,
    "demo-thumbnail.jpg": `${baseUrl}/demos/thumbnail.jpg`,
    "storyboard.html": `${baseUrl}/demos/storyboard.html`,
    
    // Font assets
    "primary-font.woff2": `${baseUrl}/fonts/${data.fonts[0].toLowerCase().replace(/\s+/g, '-')}.woff2`,
    "secondary-font.woff2": `${baseUrl}/fonts/${data.fonts[1]?.toLowerCase().replace(/\s+/g, '-') || 'fallback'}.woff2`,
    
    // Marketing materials
    "business-card.pdf": `${baseUrl}/assets/business-card.pdf`,
    "letterhead.pdf": `${baseUrl}/assets/letterhead.pdf`,
    "presentation-template.pptx": `${baseUrl}/assets/presentation-template.pptx`,
    
    // Social media assets
    "og-image.jpg": `${baseUrl}/assets/og-image.jpg`,
    "twitter-card.jpg": `${baseUrl}/assets/twitter-card.jpg`,
    "linkedin-cover.jpg": `${baseUrl}/assets/linkedin-cover.jpg`,
    
    // App assets
    "android-app.apk": `${baseUrl}/apps/android-app.apk`,
    "ios-app.ipa": `${baseUrl}/apps/ios-app.ipa`,
    "web-app.zip": `${baseUrl}/apps/web-app.zip`
  };
}

export function generateCloudflareConfig(data: CompleteProductData): string {
  return `# Cloudflare Workers configuration for ${data.brandName} CDN

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    
    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Set caching based on file type
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    
    // Add brand-specific headers
    newHeaders.set('X-Brand-Name', '${data.brandName}');
    newHeaders.set('X-Brand-Version', '1.0.0');
    
    // Set cache control
    if (url.pathname.includes('/logos/') || url.pathname.includes('/fonts/')) {
      newHeaders.set('Cache-Control', 'max-age=31536000, immutable');
    } else if (url.pathname.includes('/demos/')) {
      newHeaders.set('Cache-Control', 'max-age=86400');
    } else {
      newHeaders.set('Cache-Control', 'max-age=3600');
    }
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};`;
}

export function generateVercelCDNConfig(data: CompleteProductData): string {
  return JSON.stringify({
    "version": 2,
    "name": `${data.brandName.toLowerCase().replace(/\s+/g, '-')}-cdn`,
    "builds": [
      {
        "src": "assets/**",
        "use": "@vercel/static"
      }
    ],
    "routes": [
      {
        "src": "/logos/(.*)",
        "headers": {
          "Cache-Control": "max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff"
        },
        "dest": "/assets/logos/$1"
      },
      {
        "src": "/demos/(.*)",
        "headers": {
          "Cache-Control": "max-age=86400",
          "X-Content-Type-Options": "nosniff"
        },
        "dest": "/assets/demos/$1"
      },
      {
        "src": "/styles/(.*)",
        "headers": {
          "Cache-Control": "max-age=3600",
          "Content-Type": "text/css"
        },
        "dest": "/assets/styles/$1"
      },
      {
        "src": "/fonts/(.*)",
        "headers": {
          "Cache-Control": "max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*"
        },
        "dest": "/assets/fonts/$1"
      }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Brand-Name",
            "value": data.brandName
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }, null, 2);
}

export function generateAWSCloudFrontConfig(data: CompleteProductData): string {
  return JSON.stringify({
    "DistributionConfig": {
      "CallerReference": `${data.brandName.replace(/\s+/g, '')}-${Date.now()}`,
      "Comment": `CDN for ${data.brandName} brand assets`,
      "DefaultCacheBehavior": {
        "TargetOriginId": "primary-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // Managed-CachingOptimized
        "Compress": true
      },
      "Origins": [
        {
          "Id": "primary-origin",
          "DomainName": `${data.brandName.toLowerCase().replace(/\s+/g, '')}-assets.s3.amazonaws.com`,
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ],
      "CacheBehaviors": [
        {
          "PathPattern": "/logos/*",
          "TargetOriginId": "primary-origin",
          "ViewerProtocolPolicy": "redirect-to-https",
          "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
          "TTL": 31536000
        },
        {
          "PathPattern": "/fonts/*",
          "TargetOriginId": "primary-origin",
          "ViewerProtocolPolicy": "redirect-to-https",
          "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
          "TTL": 31536000
        },
        {
          "PathPattern": "/demos/*",
          "TargetOriginId": "primary-origin",
          "ViewerProtocolPolicy": "redirect-to-https",
          "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
          "TTL": 86400
        }
      ],
      "Enabled": true,
      "PriceClass": "PriceClass_100",
      "HttpVersion": "http2",
      "IPV6Enabled": true
    }
  }, null, 2);
}

export function generateCDNUsageInstructions(data: CompleteProductData): string {
  const urls = generateCDNAssetUrls(data);
  
  return `# ${data.brandName} CDN Usage Instructions

## 🌐 CDN Overview
Your brand assets are optimized and distributed globally through our Content Delivery Network (CDN) for maximum performance and reliability.

## 📁 Asset Categories

### 🎨 Logos & Branding
\`\`\`html
<!-- Primary logo -->
<img src="${urls['logo.svg']}" alt="${data.brandName} Logo" width="200">

<!-- Animated logo for web -->
<object data="${urls['logo-animated.svg']}" type="image/svg+xml" width="200"></object>

<!-- High-DPI displays -->
<img src="${urls['logo@2x.png']}" alt="${data.brandName}" width="200" style="width: 200px;">

<!-- Favicon -->
<link rel="icon" href="${urls['favicon.ico']}" type="image/x-icon">
<link rel="apple-touch-icon" href="${urls['apple-touch-icon.png']}">
\`\`\`

### 🎬 Demo Materials
\`\`\`html
<!-- Video demo -->
<video controls poster="${urls['demo-thumbnail.jpg']}">
  <source src="${urls['demo.mp4']}" type="video/mp4">
</video>

<!-- Interactive storyboard -->
<iframe src="${urls['storyboard.html']}" width="100%" height="600"></iframe>
\`\`\`

### 🎨 Stylesheets
\`\`\`html
<!-- Brand theme CSS -->
<link rel="stylesheet" href="${urls['style-guide.css']}">
<link rel="stylesheet" href="${urls['theme.css']}">
<link rel="stylesheet" href="${urls['components.css']}">
\`\`\`

### ✍️ Web Fonts
\`\`\`css
/* Primary font: ${data.fonts[0]} */
@font-face {
  font-family: '${data.fonts[0]}';
  src: url('${urls['primary-font.woff2']}') format('woff2');
  font-display: swap;
}

/* Secondary font: ${data.fonts[1] || 'fallback'} */
@font-face {
  font-family: '${data.fonts[1] || 'fallback'}';
  src: url('${urls['secondary-font.woff2']}') format('woff2');
  font-display: swap;
}
\`\`\`

## 🚀 Performance Optimization

### Image Optimization
- SVG logos for scalability
- WebP format for modern browsers
- Retina displays supported (@2x assets)
- Progressive JPEG loading

### Caching Strategy
- **Static assets:** 1 year cache (logos, fonts)
- **Demo content:** 24 hours cache
- **Stylesheets:** 1 hour cache for updates

### Global Distribution
- Edge servers in 200+ locations
- Sub-100ms response times globally
- 99.9% uptime guarantee
- Automatic failover protection

## 📱 Social Media Integration

### Open Graph Tags
\`\`\`html
<meta property="og:image" content="${urls['og-image.jpg']}">
<meta property="og:title" content="${data.brandName}">
<meta property="og:description" content="${data.description}">
\`\`\`

### Twitter Cards
\`\`\`html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${urls['twitter-card.jpg']}">
<meta name="twitter:title" content="${data.brandName}">
\`\`\`

## 🔧 Development Tools

### React/Next.js
\`\`\`jsx
import Image from 'next/image'

const Logo = () => (
  <Image
    src="${urls['logo.svg']}"
    alt="${data.brandName}"
    width={200}
    height={80}
    priority
  />
)
\`\`\`

### Vue.js
\`\`\`vue
<template>
  <img 
    :src="logoUrl" 
    alt="${data.brandName}"
    width="200"
  >
</template>

<script>
export default {
  data() {
    return {
      logoUrl: '${urls['logo.svg']}'
    }
  }
}
</script>
\`\`\`

## 📊 Analytics & Monitoring

### Asset Performance
- Real-time loading metrics
- Geographic usage data
- Device and browser analytics
- Bandwidth usage reports

### Security Features
- DDoS protection
- Bot detection
- Rate limiting
- SSL/TLS encryption

## 🛠️ Maintenance

### Asset Updates
1. Upload new assets to origin server
2. CDN automatically syncs within 5 minutes
3. Old versions cached for 24 hours
4. Purge cache manually if needed

### Version Control
- Assets tagged with version numbers
- Rollback capability to previous versions
- A/B testing support
- Staged deployment options

---

**CDN Provider:** Global Multi-CDN  
**Generated:** ${new Date().toLocaleDateString('pl-PL')}  
**Support:** cdn-support@${data.brandName.toLowerCase().replace(/\s+/g, '')}.com

Your ${data.brandName} assets are now globally optimized for maximum performance and reliability.`;
}