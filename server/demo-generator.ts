import { CompleteProductData } from "./complete-product-export";

export interface DemoVideoSpecs {
  duration: string;
  resolution: string;
  format: string;
  frameRate: string;
  scenes: DemoScene[];
}

export interface DemoScene {
  timeRange: string;
  title: string;
  description: string;
  visualElements: string[];
  audioElements: string[];
  transitions: string;
}

export function generateDemoVideoStoryboard(data: CompleteProductData): string {
  const scenes = createDemoScenes(data);
  
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.brandName} - Demo Video Storyboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: '${data.fonts[0]}', Arial, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, ${data.colors[0]}15, ${data.colors[1] || data.colors[0]}15);
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, ${data.colors[0]}, ${data.colors[1] || data.colors[0]});
            color: white;
            padding: 3rem 2rem;
            border-radius: 16px;
            margin-bottom: 3rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .header h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .specs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        .spec-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid ${data.colors[0]};
        }
        .spec-card h3 {
            color: ${data.colors[0]};
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        .scene {
            background: white;
            margin: 2rem 0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            border: 2px solid ${data.colors[0]}20;
        }
        .scene-header {
            background: linear-gradient(135deg, ${data.colors[0]}, ${data.colors[1] || data.colors[0]});
            color: white;
            padding: 1.5rem 2rem;
            position: relative;
        }
        .scene-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(135deg, ${data.colors[0]}, ${data.colors[1] || data.colors[0]});
            clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
        }
        .scene-header h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        .scene-time {
            background: rgba(255,255,255,0.2);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            display: inline-block;
            margin-bottom: 0.5rem;
        }
        .scene-content {
            padding: 2rem;
        }
        .scene-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 1.5rem;
        }
        .element-group {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 3px solid ${data.colors[0]};
        }
        .element-group h4 {
            color: ${data.colors[0]};
            margin-bottom: 1rem;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .element-group ul {
            list-style: none;
        }
        .element-group li {
            margin: 0.5rem 0;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
            position: relative;
            padding-left: 1.5rem;
        }
        .element-group li::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: ${data.colors[0]};
            font-size: 0.8rem;
        }
        .transitions {
            background: linear-gradient(135deg, ${data.colors[0]}10, ${data.colors[1] || data.colors[0]}10);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            border: 1px solid ${data.colors[0]}30;
        }
        .cta {
            text-align: center;
            margin: 3rem 0;
            padding: 2rem;
            background: linear-gradient(135deg, ${data.colors[0]}05, ${data.colors[1] || data.colors[0]}05);
            border-radius: 12px;
            border: 2px dashed ${data.colors[0]}50;
        }
        .cta h3 {
            color: ${data.colors[0]};
            margin-bottom: 1rem;
        }
        .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .tool-card {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid ${data.colors[0]}20;
        }
        .tool-card h4 {
            color: ${data.colors[0]};
            margin-bottom: 0.5rem;
        }
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            background: ${data.colors[0]}10;
            border-radius: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.brandName}</h1>
            <p>Professional Demo Video Storyboard</p>
            <p>Industry: ${data.industry} | Target: ${data.targetAudience}</p>
        </div>

        <div class="specs">
            <div class="spec-card">
                <h3>📹 Video Specifications</h3>
                <p><strong>Duration:</strong> 2-3 minutes</p>
                <p><strong>Resolution:</strong> 1920x1080 (Full HD)</p>
                <p><strong>Format:</strong> MP4, H.264 codec</p>
                <p><strong>Frame Rate:</strong> 30fps</p>
            </div>
            <div class="spec-card">
                <h3>🎨 Brand Guidelines</h3>
                <p><strong>Primary Color:</strong> ${data.colors[0]}</p>
                <p><strong>Secondary:</strong> ${data.colors[1] || data.colors[0]}</p>
                <p><strong>Font:</strong> ${data.fonts[0]}</p>
                <p><strong>Style:</strong> ${data.logoStyle}</p>
            </div>
            <div class="spec-card">
                <h3>🎯 Target Audience</h3>
                <p><strong>Primary:</strong> ${data.targetAudience}</p>
                <p><strong>Industry:</strong> ${data.industry}</p>
                <p><strong>Tone:</strong> Professional, engaging</p>
                <p><strong>Language:</strong> Polish/English</p>
            </div>
        </div>

        ${scenes.map(scene => `
        <div class="scene">
            <div class="scene-header">
                <div class="scene-time">${scene.timeRange}</div>
                <h3>${scene.title}</h3>
                <p>${scene.description}</p>
            </div>
            <div class="scene-content">
                <div class="scene-grid">
                    <div class="element-group">
                        <h4>🎬 Visual Elements</h4>
                        <ul>
                            ${scene.visualElements.map(element => `<li>${element}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="element-group">
                        <h4>🎵 Audio Elements</h4>
                        <ul>
                            ${scene.audioElements.map(element => `<li>${element}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="transitions">
                    <strong>🔄 Transitions:</strong> ${scene.transitions}
                </div>
            </div>
        </div>
        `).join('')}

        <div class="cta">
            <h3>🛠️ Recommended Production Tools</h3>
            <div class="tool-grid">
                <div class="tool-card">
                    <h4>OBS Studio</h4>
                    <p>Free screen recording</p>
                </div>
                <div class="tool-card">
                    <h4>Camtasia</h4>
                    <p>Professional editing</p>
                </div>
                <div class="tool-card">
                    <h4>Loom</h4>
                    <p>Quick creation</p>
                </div>
                <div class="tool-card">
                    <h4>After Effects</h4>
                    <p>Advanced animation</p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by PINnode System v1.0.0 | ${new Date().toLocaleDateString('pl-PL')}</p>
            <p>Ready for professional video production</p>
        </div>
    </div>
</body>
</html>`;
}

function createDemoScenes(data: CompleteProductData): DemoScene[] {
  return [
    {
      timeRange: "0:00 - 0:30",
      title: "Brand Introduction & Welcome",
      description: `Opening sequence showcasing ${data.brandName} with dynamic logo animation`,
      visualElements: [
        `${data.brandName} logo animation with brand colors`,
        `Background gradient: ${data.colors[0]} → ${data.colors[1] || data.colors[0]}`,
        `Typography showcase using ${data.fonts[0]}`,
        "Professional studio lighting effect",
        "Smooth zoom-in to logo center"
      ],
      audioElements: [
        "Upbeat professional intro music",
        `Voiceover: "Welcome to ${data.brandName}"`,
        `Brand description: "${data.description}"`,
        "Subtle sound effects for animations",
        "Background music fade to focus on voice"
      ],
      transitions: "Fade in from black, logo scale animation, smooth color transitions"
    },
    {
      timeRange: "0:30 - 1:30", 
      title: "Core Features Demonstration",
      description: `Interactive showcase of ${data.brandName} main functionality for ${data.targetAudience}`,
      visualElements: [
        "Live interface demonstration",
        `${data.industry}-specific use cases`,
        "Mouse cursor highlighting key features",
        "Smooth screen transitions",
        "Feature callouts with brand colors",
        "Real-time functionality preview"
      ],
      audioElements: [
        "Clear explanatory narration",
        `"Perfect for ${data.targetAudience}"`,
        "Interface click sounds",
        "Success notification sounds",
        "Background music (low volume)"
      ],
      transitions: "Slide transitions, zoom-in on important UI elements, fade between features"
    },
    {
      timeRange: "1:30 - 2:15",
      title: "Benefits & Value Proposition", 
      description: "Compelling presentation of advantages and professional quality",
      visualElements: [
        "Animated statistics and metrics",
        "Before/after comparisons",
        "Customer testimonial graphics",
        "Industry-specific benefits showcase",
        "Professional quality demonstrations",
        "Success stories visualization"
      ],
      audioElements: [
        "Confident, persuasive narration",
        "Statistics reading with emphasis",
        "Customer testimonial quotes",
        "Professional success stories",
        "Uplifting background music"
      ],
      transitions: "Chart animations, metric count-up effects, smooth data visualizations"
    },
    {
      timeRange: "2:15 - 2:30",
      title: "Call to Action & Contact",
      description: "Strong closing with clear next steps and contact information",
      visualElements: [
        "Bold call-to-action text",
        `Final ${data.brandName} logo presentation`,
        "Contact information display",
        "Website URL and social media",
        "QR code for easy access",
        "Professional closing frame"
      ],
      audioElements: [
        `"Start today with ${data.brandName}"`,
        "Contact information narration",
        "Website URL pronunciation",
        "Memorable closing statement",
        "Outro music with brand theme"
      ],
      transitions: "Zoom out to full logo, fade to contact info, professional end screen"
    }
  ];
}

export function generateDemoVideoInfo(data: CompleteProductData): string {
  return `# ${data.brandName} - Demo Video Production Guide

## 🎬 VIDEO SPECIFICATIONS
- **Duration:** 2-3 minutes (optimal for engagement)
- **Resolution:** 1920x1080 (Full HD)
- **Format:** MP4, H.264 codec
- **Frame Rate:** 30fps
- **Audio:** Professional quality, 44.1kHz
- **File Size:** Target 50-100MB for web optimization

## 🎨 BRAND GUIDELINES FOR VIDEO
- **Primary Color:** ${data.colors[0]}
- **Secondary Color:** ${data.colors[1] || data.colors[0]}
- **Accent Color:** ${data.colors[2] || data.colors[0]}
- **Primary Font:** ${data.fonts[0]}
- **Secondary Font:** ${data.fonts[1] || data.fonts[0]}
- **Logo Style:** ${data.logoStyle}

## 📝 SCRIPT OUTLINE

### Scene 1: Introduction (0:00-0:30)
**Voiceover Script:**
"Welcome to ${data.brandName} - ${data.description}. 
Designed specifically for ${data.targetAudience} in the ${data.industry} industry."

**Visual Cues:**
- Logo animation entrance
- Brand color transition
- Typography reveal

### Scene 2: Features (0:30-1:30)
**Voiceover Script:**
"Discover powerful features that transform how you work. 
Built for professionals who demand excellence and efficiency."

**Demo Points:**
- Core functionality showcase
- User interface walkthrough  
- Key benefits demonstration
- Real-world use cases

### Scene 3: Benefits (1:30-2:15)
**Voiceover Script:**
"Join thousands of satisfied ${data.targetAudience} who've revolutionized their workflow.
Professional quality, reliable performance, exceptional results."

**Visual Elements:**
- Success metrics
- Testimonial highlights
- Industry recognition
- Performance statistics

### Scene 4: Call to Action (2:15-2:30)
**Voiceover Script:**
"Ready to experience ${data.brandName}? 
Start your journey today and transform your ${data.industry} operations."

**Contact Information:**
- Website: www.${data.brandName.toLowerCase().replace(/\s+/g, '')}.com
- Email: contact@${data.brandName.toLowerCase().replace(/\s+/g, '')}.com
- Phone: +48 XXX XXX XXX

## 🛠️ PRODUCTION TOOLS

### Free Options:
- **OBS Studio** - Screen recording and streaming
- **DaVinci Resolve** - Professional video editing
- **Audacity** - Audio editing and enhancement
- **GIMP** - Graphics and image editing

### Professional Options:
- **Camtasia** - Screen recording + editing suite
- **Adobe Premiere Pro** - Professional video editing
- **After Effects** - Motion graphics and animation
- **Adobe Audition** - Professional audio editing

### Quick Creation:
- **Loom** - Instant screen recording with narration
- **Canva Video** - Simple editing with brand templates
- **Animoto** - Automated video creation
- **Vyond** - Animated explainer videos

## 📊 PERFORMANCE METRICS

### Target Engagement:
- **View Duration:** >80% completion rate
- **Click-through Rate:** >5% for CTA
- **Conversion Rate:** >2% from video to action
- **Social Shares:** >1% share rate

### Optimization Tips:
- Upload to multiple platforms (YouTube, Vimeo, LinkedIn)
- Create shorter versions (30s, 60s) for social media
- Add captions for accessibility
- Optimize thumbnails with brand colors
- Include video transcripts for SEO

## 🎯 DISTRIBUTION STRATEGY

### Primary Channels:
- Company website (hero section)
- LinkedIn company page
- YouTube channel
- Email marketing campaigns

### Secondary Channels:
- Facebook business page
- Twitter/X promotional tweets
- Industry conference presentations
- Sales team demonstrations

## 💡 PRODUCTION NOTES

### Before Recording:
- [ ] Script approval and rehearsal
- [ ] Brand assets prepared (logo, colors, fonts)
- [ ] Screen resolution set to 1920x1080
- [ ] Audio equipment tested
- [ ] Lighting setup optimized

### During Recording:
- [ ] Multiple takes for each section
- [ ] Audio levels monitored
- [ ] Cursor movements deliberate and smooth
- [ ] Brand colors visible throughout
- [ ] Professional demeanor maintained

### Post-Production:
- [ ] Color correction for brand consistency
- [ ] Audio enhancement and noise reduction
- [ ] Smooth transitions between scenes
- [ ] Text overlays with brand fonts
- [ ] Final quality check on multiple devices

---

**Generated:** ${new Date().toLocaleDateString('pl-PL')}
**System:** PINnode v1.0.0
**Status:** Ready for professional production

This video will establish ${data.brandName} as the premium choice for ${data.targetAudience} in ${data.industry}.`;
}

export function generateAnimatedLogo(data: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
    <defs>
        <linearGradient id="animGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${data.colors[0]};stop-opacity:1">
                <animate attributeName="stop-color" 
                         values="${data.colors[0]};${data.colors[1] || data.colors[0]};${data.colors[0]}" 
                         dur="4s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" style="stop-color:${data.colors[1] || data.colors[0]};stop-opacity:1">
                <animate attributeName="stop-color" 
                         values="${data.colors[1] || data.colors[0]};${data.colors[2] || data.colors[0]};${data.colors[1] || data.colors[0]}" 
                         dur="4s" repeatCount="indefinite"/>
            </stop>
        </linearGradient>
        
        <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    
    <!-- Background -->
    <rect width="400" height="200" fill="url(#animGrad)" opacity="0.1">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
    </rect>
    
    <!-- Animated Logo Icon -->
    <g transform="translate(50, 50)" filter="url(#glow)">
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#animGrad)" stroke-width="4">
            <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        <text x="50" y="60" text-anchor="middle" fill="url(#animGrad)" 
              font-family="${data.fonts[0]}, sans-serif" font-size="32" font-weight="bold">
            ${data.brandName.charAt(0)}
            <animate attributeName="font-size" values="28;36;28" dur="3s" repeatCount="indefinite"/>
        </text>
    </g>
    
    <!-- Brand Name with Typewriter Effect -->
    <text x="160" y="80" font-family="${data.fonts[0]}, sans-serif" font-size="36" font-weight="bold" fill="url(#animGrad)">
        ${data.brandName}
        <animate attributeName="opacity" values="0;1;1;0.8" dur="5s" repeatCount="indefinite"/>
    </text>
    
    <!-- Tagline -->
    <text x="160" y="110" font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="14" fill="${data.colors[0]}" opacity="0.8">
        ${data.description.length > 50 ? data.description.substring(0, 50) + '...' : data.description}
        <animate attributeName="opacity" values="0;0;1;1" dur="6s" repeatCount="indefinite"/>
    </text>
    
    <!-- Industry Badge -->
    <rect x="160" y="130" width="100" height="24" rx="12" fill="${data.colors[0]}" opacity="0.2">
        <animate attributeName="opacity" values="0;0;0.2;0.2" dur="7s" repeatCount="indefinite"/>
    </rect>
    <text x="210" y="146" font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="12" 
          fill="${data.colors[0]}" text-anchor="middle" font-weight="500">
        ${data.industry.toUpperCase()}
        <animate attributeName="opacity" values="0;0;1;1" dur="7s" repeatCount="indefinite"/>
    </text>
    
    <!-- Animated Particles -->
    <g opacity="0.6">
        <circle cx="300" cy="60" r="3" fill="${data.colors[0]}">
            <animate attributeName="cy" values="60;40;60" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="320" cy="80" r="2" fill="${data.colors[1] || data.colors[0]}">
            <animate attributeName="cy" values="80;100;80" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="340" cy="70" r="4" fill="${data.colors[2] || data.colors[0]}">
            <animate attributeName="cy" values="70;50;70" dur="2.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
        </circle>
    </g>
</svg>`;
}