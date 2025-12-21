import { CompleteProductData } from "./complete-product-export";
import JSZip from "jszip";

export interface VideoConfig {
  duration: number;
  width: number;
  height: number;
  fps: number;
  format: string;
}

export interface VideoScene {
  start: number;
  duration: number;
  title: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  animation: string;
}

export function generateVideoPlaceholder(data: CompleteProductData): Buffer {
  // Generate a simple animated SVG that can be converted to MP4
  const videoSvg = createAnimatedVideoSVG(data);
  return Buffer.from(videoSvg);
}

export function createAnimatedVideoSVG(data: CompleteProductData): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${data.colors[0]};stop-opacity:1">
                <animate attributeName="stop-color" 
                         values="${data.colors[0]};${data.colors[1] || data.colors[0]};${data.colors[2] || data.colors[0]};${data.colors[0]}" 
                         dur="8s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" style="stop-color:${data.colors[1] || data.colors[0]};stop-opacity:1">
                <animate attributeName="stop-color" 
                         values="${data.colors[1] || data.colors[0]};${data.colors[2] || data.colors[0]};${data.colors[0]};${data.colors[1] || data.colors[0]}" 
                         dur="8s" repeatCount="indefinite"/>
            </stop>
        </linearGradient>
        
        <filter id="textShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
        
        <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1920" height="1080" fill="url(#bgGrad)"/>
    
    <!-- Scene 1: Brand Introduction (0-2s) -->
    <g opacity="1">
        <animateTransform attributeName="transform" type="scale" 
                          values="0;1;1;0" dur="8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1;0;0;0;0;0" dur="8s" repeatCount="indefinite"/>
        
        <!-- Logo -->
        <circle cx="960" cy="400" r="120" fill="white" opacity="0.9" filter="url(#glow)">
            <animate attributeName="r" values="100;140;120" dur="2s" repeatCount="indefinite"/>
        </circle>
        <text x="960" y="420" text-anchor="middle" fill="${data.colors[0]}" 
              font-family="${data.fonts[0]}, sans-serif" font-size="80" font-weight="bold" filter="url(#textShadow)">
            ${data.brandName.charAt(0)}
        </text>
        
        <!-- Brand Name -->
        <text x="960" y="600" text-anchor="middle" fill="white" 
              font-family="${data.fonts[0]}, sans-serif" font-size="72" font-weight="bold" filter="url(#textShadow)">
            ${data.brandName}
        </text>
        
        <!-- Tagline -->
        <text x="960" y="680" text-anchor="middle" fill="white" 
              font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="32" opacity="0.9" filter="url(#textShadow)">
            ${data.description.length > 60 ? data.description.substring(0, 60) + '...' : data.description}
        </text>
    </g>
    
    <!-- Scene 2: Features Demo (2-4s) -->
    <g opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0;0;0;0" dur="8s" repeatCount="indefinite"/>
        
        <!-- Interface mockup -->
        <rect x="200" y="200" width="1520" height="680" rx="20" fill="white" opacity="0.95" filter="url(#textShadow)"/>
        <rect x="220" y="220" width="1480" height="60" rx="10" fill="${data.colors[0]}" opacity="0.8"/>
        
        <!-- Feature highlights -->
        <circle cx="400" cy="400" r="40" fill="${data.colors[0]}" opacity="0.7">
            <animate attributeName="r" values="30;50;40" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="800" cy="500" r="40" fill="${data.colors[1] || data.colors[0]}" opacity="0.7">
            <animate attributeName="r" values="35;45;40" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="1200" cy="600" r="40" fill="${data.colors[2] || data.colors[0]}" opacity="0.7">
            <animate attributeName="r" values="40;50;45" dur="0.8s" repeatCount="indefinite"/>
        </circle>
        
        <text x="960" y="800" text-anchor="middle" fill="${data.colors[0]}" 
              font-family="${data.fonts[0]}, sans-serif" font-size="48" font-weight="bold">
            Powerful Features for ${data.targetAudience}
        </text>
    </g>
    
    <!-- Scene 3: Benefits (4-6s) -->
    <g opacity="0">
        <animate attributeName="opacity" values="0;0;0;0;1;1;0;0" dur="8s" repeatCount="indefinite"/>
        
        <!-- Statistics -->
        <rect x="300" y="300" width="400" height="200" rx="15" fill="white" opacity="0.9" filter="url(#textShadow)"/>
        <text x="500" y="350" text-anchor="middle" fill="${data.colors[0]}" 
              font-family="${data.fonts[0]}, sans-serif" font-size="48" font-weight="bold">
            95%
        </text>
        <text x="500" y="390" text-anchor="middle" fill="#666" 
              font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="24">
            Success Rate
        </text>
        
        <rect x="800" y="300" width="400" height="200" rx="15" fill="white" opacity="0.9" filter="url(#textShadow)"/>
        <text x="1000" y="350" text-anchor="middle" fill="${data.colors[1] || data.colors[0]}" 
              font-family="${data.fonts[0]}, sans-serif" font-size="48" font-weight="bold">
            10x
        </text>
        <text x="1000" y="390" text-anchor="middle" fill="#666" 
              font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="24">
            Faster Results
        </text>
        
        <text x="960" y="600" text-anchor="middle" fill="white" 
              font-family="${data.fonts[0]}, sans-serif" font-size="56" font-weight="bold" filter="url(#textShadow)">
            Professional Quality Guaranteed
        </text>
    </g>
    
    <!-- Scene 4: Call to Action (6-8s) -->
    <g opacity="0">
        <animate attributeName="opacity" values="0;0;0;0;0;0;1;1" dur="8s" repeatCount="indefinite"/>
        
        <!-- CTA Button -->
        <rect x="660" y="450" width="600" height="100" rx="50" fill="white" opacity="0.95" filter="url(#glow)">
            <animate attributeName="opacity" values="0.95;1;0.95" dur="1s" repeatCount="indefinite"/>
        </rect>
        <text x="960" y="510" text-anchor="middle" fill="${data.colors[0]}" 
              font-family="${data.fonts[0]}, sans-serif" font-size="36" font-weight="bold">
            Start with ${data.brandName} Today
        </text>
        
        <!-- Contact info -->
        <text x="960" y="650" text-anchor="middle" fill="white" 
              font-family="${data.fonts[1] || data.fonts[0]}, sans-serif" font-size="28" filter="url(#textShadow)">
            www.${data.brandName.toLowerCase().replace(/\s+/g, '')}.com
        </text>
        
        <!-- Final logo -->
        <circle cx="960" cy="800" r="60" fill="white" opacity="0.9"/>
        <text x="960" y="815" text-anchor="middle" fill="${data.colors[0]}" 
              font-family="${data.fonts[0]}, sans-serif" font-size="40" font-weight="bold">
            ${data.brandName.charAt(0)}
        </text>
    </g>
    
    <!-- Progress indicator -->
    <rect x="100" y="1000" width="1720" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>
    <rect x="100" y="1000" width="0" height="8" rx="4" fill="white">
        <animate attributeName="width" values="0;1720;1720;0" dur="8s" repeatCount="indefinite"/>
    </rect>
</svg>`;
}

export function generateOBSStudioScript(data: CompleteProductData): string {
  return `# OBS Studio Recording Script for ${data.brandName}

## 🎥 RECORDING SETUP

### Scene Configuration
1. **Browser Source Setup:**
   - Add Browser Source
   - URL: http://localhost:3000 (your app)
   - Width: 1920, Height: 1080
   - Custom CSS: body { zoom: 1.0; }

2. **Audio Configuration:**
   - Desktop Audio: Enabled
   - Microphone: Professional USB mic recommended
   - Audio levels: -12dB to -6dB optimal

### Recording Settings
- **Video:**
  - Base Resolution: 1920x1080
  - Output Resolution: 1920x1080
  - FPS: 30
  - Format: MP4

- **Audio:**
  - Sample Rate: 44.1 kHz
  - Channels: Stereo
  - Bitrate: 320 kbps

## 📝 RECORDING SCRIPT

### Scene 1: Introduction (0-30s)
**Action:** Open ${data.brandName} application
**Voiceover:** "Welcome to ${data.brandName} - ${data.description}"

**Steps:**
1. Show loading screen with logo animation
2. Zoom into main interface
3. Highlight brand colors: ${data.colors.join(', ')}
4. Display tagline prominently

**Mouse Actions:**
- Smooth cursor movements
- Pause on key elements
- Use click animations

### Scene 2: Core Features (30s-1:30min)
**Action:** Demonstrate main functionality
**Voiceover:** "Designed specifically for ${data.targetAudience} in ${data.industry}"

**Demo Points:**
1. **Feature 1:** Primary workflow demonstration
   - Show user interface navigation
   - Highlight key buttons and controls
   - Display real-time results

2. **Feature 2:** Advanced capabilities
   - Switch between different modes
   - Show customization options
   - Demonstrate efficiency gains

3. **Feature 3:** Professional outputs
   - Generate sample results
   - Show export options
   - Quality comparison

**Screen Recording Tips:**
- Record at 1920x1080 native resolution
- Use smooth, deliberate mouse movements
- Pause 2-3 seconds on important UI elements
- Keep cursor visible but not distracting

### Scene 3: Results & Benefits (1:30-2:15min)
**Action:** Show success metrics and outcomes
**Voiceover:** "Join thousands of satisfied ${data.targetAudience}"

**Visual Elements:**
1. Before/after comparisons
2. Performance statistics
3. User testimonials (text overlay)
4. Industry recognition badges

**Animation Ideas:**
- Counter animations for statistics
- Smooth transitions between examples
- Professional chart animations
- Success story timeline

### Scene 4: Call to Action (2:15-2:30min)
**Action:** Clear next steps and contact information
**Voiceover:** "Ready to transform your ${data.industry} workflow?"

**Final Elements:**
1. **Call to Action Button:** Prominently displayed
2. **Contact Information:**
   - Website: www.${data.brandName.toLowerCase().replace(/\s+/g, '')}.com
   - Email: contact@${data.brandName.toLowerCase().replace(/\s+/g, '')}.com
   - Phone: +48 XXX XXX XXX

3. **Social Proof:**
   - Customer logos
   - Industry certifications
   - Security badges

## 🎬 POST-PRODUCTION CHECKLIST

### Video Editing (Optional)
- **Intro/Outro:** 2-3 second branded intro
- **Transitions:** Smooth cuts between scenes
- **Text Overlays:** Feature callouts and benefits
- **Background Music:** Subtle, professional track
- **Color Correction:** Match brand colors exactly

### Audio Enhancement
- **Noise Reduction:** Remove background hiss
- **Normalization:** Consistent audio levels
- **Compression:** Professional vocal processing
- **Music Balance:** Background music at -20dB

### Export Settings
- **Format:** MP4 (H.264)
- **Resolution:** 1920x1080
- **Frame Rate:** 30fps
- **Bitrate:** 8-12 Mbps (high quality)
- **Audio:** AAC, 320kbps

### Quality Check
- [ ] Video plays smoothly without stutters
- [ ] Audio is clear and professional
- [ ] Brand colors are accurate
- [ ] Text is readable at all sizes
- [ ] Call to action is prominent
- [ ] Contact information is correct
- [ ] File size optimized for web (target: 50-100MB)

## 🚀 DISTRIBUTION STRATEGY

### Primary Hosting
- **Website:** Hero section autoplay
- **YouTube:** Unlisted for embedding
- **Vimeo:** Business account for custom player

### Social Media Versions
- **LinkedIn:** 60-second version
- **Twitter:** 30-second teaser
- **Facebook:** Square format version
- **Instagram:** Stories-optimized vertical

### Analytics Tracking
- **View Duration:** Target >80% completion
- **Click-through Rate:** Track CTA clicks
- **Conversion Rate:** Demo to trial signups
- **Engagement:** Comments, shares, likes

---

**Equipment Recommendations:**
- **Microphone:** Audio-Technica AT2020USB+ or similar
- **Lighting:** Key light for presenter (if on camera)
- **Monitor:** 4K display for crisp recording
- **Internet:** Stable connection for cloud app demos

**Recording Environment:**
- Quiet room with minimal echo
- Stable internet connection
- Closed unnecessary applications
- Do not disturb mode enabled

This script will produce a professional ${data.brandName} demo video that converts viewers into customers.`;
}

export function generateLoomAlternativeScript(data: CompleteProductData): string {
  return `# Quick Demo Creation with Loom - ${data.brandName}

## 🎯 LOOM SETUP (5 minutes)

### Installation & Configuration
1. **Install Loom:** loom.com/download
2. **Account Setup:** Business account recommended
3. **Quality Settings:**
   - Resolution: 1080p
   - Frame Rate: 30fps
   - Audio: High quality

### Recording Preferences
- **Screen + Camera:** Professional presenter view
- **Screen Only:** Focus on product interface
- **Camera Only:** Personal introduction/conclusion

## ⚡ QUICK RECORDING SCRIPT

### Pre-Recording Checklist (2 minutes)
- [ ] Close unnecessary browser tabs
- [ ] Set browser zoom to 100%
- [ ] Test microphone levels
- [ ] Prepare ${data.brandName} demo environment
- [ ] Have script points ready

### Recording Flow (3-5 minutes)

**Introduction (15 seconds):**
"Hi, I'm showing you ${data.brandName} - ${data.description}. Perfect for ${data.targetAudience} in ${data.industry}."

**Core Demo (2-3 minutes):**
1. **Quick Overview:** Navigate main interface
2. **Key Feature:** Show primary workflow
3. **Results:** Demonstrate output quality
4. **Benefits:** Highlight time savings

**Call to Action (15 seconds):**
"Ready to try ${data.brandName}? Visit ${data.brandName.toLowerCase().replace(/\s+/g, '')}.com or contact us for a personalized demo."

### Loom-Specific Tips
- **Smooth Mouse Movement:** Slow, deliberate cursor actions
- **Clear Speech:** Speak 10% slower than normal
- **Pause for Impact:** 2-second pauses after key points
- **Professional Tone:** Confident but conversational

## 🎨 BRANDING INTEGRATION

### Visual Consistency
- **Background:** Use ${data.brandName} app interface
- **Colors:** Highlight features with brand colors
- **Logo:** Ensure logo is visible in demo
- **Typography:** Consistent with brand fonts

### Custom Thumbnail
- **Loom Thumbnail:** Professional headshot + logo
- **Title:** "${data.brandName} Demo - See It In Action"
- **Description:** Key benefits and CTA

## 📤 EXPORT & SHARING

### Loom Export Options
1. **Direct Link:** loom.com/share/[id]
2. **Embed Code:** For website integration
3. **Download MP4:** For custom hosting
4. **GIF Creation:** For social media teasers

### Integration Points
- **Website Landing Page:** Hero section
- **Email Campaigns:** Personalized demos
- **Sales Presentations:** Live demo backup
- **Social Media:** LinkedIn, Twitter shares

### Custom Branding (Business Plan)
- **Custom Player:** Match ${data.brandName} colors
- **Logo Overlay:** Branded video player
- **Call-to-Action:** Custom end screen
- **Analytics:** Detailed viewing metrics

## 📊 PERFORMANCE OPTIMIZATION

### Loom Analytics
- **View Duration:** Target 80%+ completion
- **Engagement Rate:** Comments and reactions
- **Click-through:** CTA link clicks
- **Geographic Data:** Audience location insights

### A/B Testing Ideas
- **Script Variations:** Different opening hooks
- **Length Testing:** 2min vs 4min versions
- **CTA Placement:** Beginning vs end
- **Presenter Style:** Screen-only vs camera

---

**Loom Advantages for ${data.brandName}:**
- ✅ Quick 5-minute setup
- ✅ Instant sharing links
- ✅ Built-in analytics
- ✅ Mobile-friendly playback
- ✅ Automatic transcription
- ✅ Team collaboration features

**Perfect for:**
- Sales team training
- Customer onboarding
- Feature announcements
- Support documentation
- Prospect personalization

This approach gets you a professional ${data.brandName} demo in under 10 minutes total time investment.`;
}

export async function addVideoAssetsToZip(zip: JSZip, data: CompleteProductData): Promise<void> {
  const videoFolder = zip.folder('video-assets')!;
  
  // Video storyboard (already have this)
  // Add OBS Studio script
  const obsScript = generateOBSStudioScript(data);
  videoFolder.file('obs-studio-script.md', obsScript);
  
  // Add Loom alternative script
  const loomScript = generateLoomAlternativeScript(data);
  videoFolder.file('loom-quick-demo.md', loomScript);
  
  // Add animated SVG as video placeholder
  const animatedSvg = createAnimatedVideoSVG(data);
  videoFolder.file('animated-demo.svg', animatedSvg);
  
  // Video specifications
  const videoSpecs = {
    format: "MP4",
    resolution: "1920x1080",
    frameRate: 30,
    duration: "2-3 minutes",
    codec: "H.264",
    audio: "AAC 320kbps",
    targetSize: "50-100MB",
    platforms: ["Web", "YouTube", "LinkedIn", "Email"],
    brandColors: data.colors,
    fonts: data.fonts,
    scenes: [
      { time: "0-30s", focus: "Brand Introduction" },
      { time: "30s-1:30m", focus: "Core Features Demo" },
      { time: "1:30m-2:15m", focus: "Benefits & Results" },
      { time: "2:15m-2:30m", focus: "Call to Action" }
    ]
  };
  
  videoFolder.file('video-specifications.json', JSON.stringify(videoSpecs, null, 2));
  
  // HTML5 video embed code
  const embedCode = generateVideoEmbedCode(data);
  videoFolder.file('embed-code.html', embedCode);
}

export function generateVideoEmbedCode(data: CompleteProductData): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.brandName} - Video Demo Embed</title>
    <style>
        .video-container {
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: linear-gradient(135deg, ${data.colors[0]}, ${data.colors[1] || data.colors[0]});
            border-radius: 12px;
            padding: 2px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        
        .video-wrapper {
            position: relative;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .video-player {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        
        .video-container:hover .video-overlay {
            opacity: 1;
        }
        
        .play-button {
            width: 80px;
            height: 80px;
            background: ${data.colors[0]};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease;
            pointer-events: all;
        }
        
        .play-button:hover {
            transform: scale(1.1);
        }
        
        .play-icon {
            width: 0;
            height: 0;
            border-left: 20px solid white;
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            margin-left: 4px;
        }
        
        .video-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            color: white;
            background: rgba(0,0,0,0.8);
            padding: 15px;
            border-radius: 8px;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        
        .video-container:hover .video-info {
            transform: translateY(0);
        }
        
        .video-title {
            font-family: '${data.fonts[0]}', sans-serif;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .video-description {
            font-family: '${data.fonts[1] || data.fonts[0]}', sans-serif;
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .brand-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: ${data.colors[0]};
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-family: '${data.fonts[0]}', sans-serif;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- Basic Video Embed -->
    <div class="video-container">
        <div class="video-wrapper">
            <video class="video-player" controls poster="demo-thumbnail.jpg">
                <source src="demo.mp4" type="video/mp4">
                <source src="demo.webm" type="video/webm">
                Twoja przeglądarka nie obsługuje odtwarzania wideo.
            </video>
            
            <div class="video-overlay">
                <div class="play-button">
                    <div class="play-icon"></div>
                </div>
            </div>
            
            <div class="video-info">
                <div class="video-title">${data.brandName} - Professional Demo</div>
                <div class="video-description">${data.description}</div>
            </div>
            
            <div class="brand-badge">${data.industry.toUpperCase()}</div>
        </div>
    </div>

    <!-- Alternative: Autoplay Version -->
    <div class="video-container" style="margin-top: 40px;">
        <div class="video-wrapper">
            <video class="video-player" autoplay muted loop>
                <source src="demo.mp4" type="video/mp4">
                <source src="demo.webm" type="video/webm">
            </video>
        </div>
    </div>

    <!-- YouTube Embed Alternative -->
    <!--
    <div class="video-container" style="margin-top: 40px;">
        <iframe width="100%" height="450" 
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&mute=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
    </div>
    -->

    <!-- Vimeo Embed Alternative -->
    <!--
    <div class="video-container" style="margin-top: 40px;">
        <iframe src="https://player.vimeo.com/video/YOUR_VIDEO_ID?autoplay=1&muted=1" 
                width="100%" height="450" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
        </iframe>
    </div>
    -->

    <script>
        // Custom video controls
        document.addEventListener('DOMContentLoaded', function() {
            const videos = document.querySelectorAll('.video-player');
            
            videos.forEach(video => {
                // Track video engagement
                video.addEventListener('play', function() {
                    console.log('${data.brandName} demo started');
                    // Add analytics tracking here
                });
                
                video.addEventListener('ended', function() {
                    console.log('${data.brandName} demo completed');
                    // Add conversion tracking here
                });
                
                // Auto-pause when out of view
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting && !video.paused) {
                            video.pause();
                        }
                    });
                });
                
                observer.observe(video);
            });
            
            // Play button functionality for overlay
            const playButtons = document.querySelectorAll('.play-button');
            playButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const video = this.closest('.video-wrapper').querySelector('video');
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            });
        });
    </script>
</body>
</html>`;
}