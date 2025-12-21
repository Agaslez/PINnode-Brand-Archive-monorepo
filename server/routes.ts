import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBrandProjectSchema, insertArchivedEntrySchema } from "@shared/schema";
import { AdvancedAssistantHandler } from "./assistant-handler";
import { createBrandingZip, createArchiveZip } from "./export-zip";
import { AIStyleDetector } from "./ai-style-detector";
import salesRouter from "./sales-system";
import { generateCompleteProductZip } from "./complete-product-export";
import { db, testDatabaseConnection } from "./database";
import { logger } from "./logger";
import { errorMonitor } from "./monitor";
import { authMiddleware, registerUser, loginUser, AuthRequest } from "./auth";
import { validateRequest, validateData } from "./validation";
import { authRegisterSchema, authLoginSchema } from "@shared/schema";
import { authLimiter, apiLimiter, logoGenerationLimiter } from "./rate-limiter";
import { globalErrorHandler, notFoundHandler, AppError } from "./error-handler";
import { withRetry } from "./retry";

// Helper functions for complete workflow
function extractBrandNameFromPrompt(prompt: string): string {
  // Extract brand name from various prompt formats
  const patterns = [
    /([A-Z][a-zA-Z0-9\.]+\.[a-z]{2,})/,  // domain.com format
    /([A-Z][a-zA-Z]+(?:\.[A-Z][a-zA-Z]*)*)/,  // Brand.Name format
    /"([^"]+)"/,  // quoted names
    /([A-Z][a-z]+(?:[A-Z][a-z]+)*)/  // CamelCase
  ];
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) return match[1];
  }
  
  return 'NewBrand';
}

function generateStyleGuideFromPackage(brandPackage: any): string {
  const { brandData, colors, fonts } = brandPackage;
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Style Guide - ${brandData?.brandName || 'Brand'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem; }
        .color-palette { display: flex; gap: 1rem; margin: 1rem 0; }
        .color-box { width: 80px; height: 80px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .font-example { margin: 1rem 0; padding: 1rem; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <h1>📋 Style Guide: ${brandData?.brandName || 'Brand'}</h1>
    
    <section>
        <h2>🎨 Paleta Kolorów</h2>
        <div class="color-palette">
            ${(colors || ['#007bff', '#6c757d', '#28a745']).map((color: string, index: number) => 
              `<div class="color-box" style="background-color: ${color}">${color}</div>`
            ).join('')}
        </div>
    </section>
    
    <section>
        <h2>✍️ Typografia</h2>
        ${(fonts || ['Arial', 'Georgia']).map((font: string) => 
          `<div class="font-example" style="font-family: '${font}', sans-serif;">
             <strong>${font}</strong>: Przykładowy tekst w tym foncie
           </div>`
        ).join('')}
    </section>
    
    <section>
        <h2>📝 Wytyczne</h2>
        <ul>
            <li>Używaj głównych kolorów marki dla elementów CTA</li>
            <li>Zachowaj spójność typograficzną we wszystkich materiałach</li>
            <li>Logo powinno być czytelne w minimalnym rozmiarze 32px</li>
        </ul>
    </section>
</body>
</html>`;
}

function generateAppDescription(brandPackage: any): string {
  const { brandData } = brandPackage;
  return `${brandData?.brandName || 'App'} - Profesjonalne rozwiązanie

📱 OPIS APLIKACJI:
${brandData?.description || 'Nowoczesna aplikacja zaprojektowana z myślą o użytkownikach.'}

🎯 KLUCZOWE FUNKCJE:
• Intuicyjny interfejs użytkownika
• Szybka i niezawodna wydajność  
• Bezpieczne przechowywanie danych
• Cross-platform compatibility

🏆 KORZYŚCI:
• Oszczędność czasu
• Zwiększona produktywność
• Łatwa obsługa
• Regularne aktualizacje

📦 WYMAGANIA SYSTEMOWE:
• iOS 14.0+ / Android 8.0+
• 50MB wolnej przestrzeni
• Połączenie z internetem

📞 WSPARCIE:
support@${(brandData?.brandName || 'app').toLowerCase()}.com

Wersja: 1.0.0
Kategoria: Produktywność
Deweloper: ${brandData?.brandName || 'App'} Team`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Brand Projects CRUD API
  
  // Get all brand projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllBrandProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single brand project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getBrandProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create new brand project
  app.post("/api/projects", async (req, res) => {
    try {
      const result = insertBrandProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid project data", details: result.error });
      }
      
      const project = await storage.createBrandProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update brand project
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingProject = await storage.getBrandProject(id);
      if (!existingProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updatedProject = { ...existingProject, ...req.body, id };
      await storage.updateBrandProject(updatedProject);
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete brand project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBrandProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Update project rating
  app.patch("/api/projects/:id/rating", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { rating } = req.body;
      
      if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return res.status(400).json({ error: "Rating must be a number between 0 and 5" });
      }
      
      const project = await storage.getBrandProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updatedProject = { ...project, rating };
      await storage.updateBrandProject(updatedProject);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project rating:", error);
      res.status(500).json({ error: "Failed to update project rating" });
    }
  });

  // Update project export status
  app.patch("/api/projects/:id/export-status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { exported } = req.body;
      
      if (typeof exported !== 'boolean') {
        return res.status(400).json({ error: "Exported must be a boolean value" });
      }
      
      const project = await storage.getBrandProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updatedProject = { ...project, exported };
      await storage.updateBrandProject(updatedProject);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project export status:", error);
      res.status(500).json({ error: "Failed to update project export status" });
    }
  });

  // Generate logo using AI
  app.post("/api/generate-logo", async (req, res) => {
    try {
      const { projectName, industry, style } = req.body;
      
      // Generate SVG logo
      const logo = `<svg width="300" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#logoGrad)" rx="8"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
         font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">${projectName}</text>
      </svg>`;
      
      res.json({ logo });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate logo" });
    }
  });

  // Generate description using DeepSeek API
  app.post("/api/generate-description", async (req, res) => {
    try {
      const { projectName, industry } = req.body;
      
      const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
      if (!DEEPSEEK_API_KEY) {
        return res.status(400).json({ error: "DeepSeek API key not configured" });
      }

      const prompt = `Write a professional project description for a ${industry ? industry + ' ' : ''}project called "${projectName}". Include purpose, key features, and target audience. Keep it concise and engaging.`;
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const description = data.choices?.[0]?.message?.content || '';
      
      res.json({ description });
    } catch (error) {
      console.error('DeepSeek API error:', error);
      res.status(500).json({ error: "Failed to generate description" });
    }
  });

  // Archived Entries CRUD API
  
  // Get all archived entries
  app.get("/api/archive", async (req, res) => {
    try {
      const entries = await storage.getAllArchivedEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch archived entries" });
    }
  });

  // Search archived entries
  app.get("/api/archive/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const entries = await storage.getArchivedEntriesBySearch(query);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to search archived entries" });
    }
  });

  // Get entries by category
  app.get("/api/archive/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const entries = await storage.getArchivedEntriesByCategory(category);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries by category" });
    }
  });

  // Create new archived entry
  app.post("/api/archive", async (req, res) => {
    try {
      const result = insertArchivedEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid entry data", details: result.error });
      }
      
      const entry = await storage.createArchivedEntry(result.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create archived entry" });
    }
  });

  // Update archived entry
  app.put("/api/archive/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingEntry = await storage.getArchivedEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      const updatedEntry = { ...existingEntry, ...req.body, id };
      await storage.updateArchivedEntry(updatedEntry);
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update archived entry" });
    }
  });

  // Delete archived entry
  app.delete("/api/archive/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArchivedEntry(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete archived entry" });
    }
  });

  // Assistant API Routes
  
  // Main assistant query endpoint  
  app.post("/api/assistant", async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const result = await AdvancedAssistantHandler.handleQuery(query, context || {});
      res.json(result);
    } catch (error) {
      console.error('Assistant query error:', error);
      res.status(500).json({ 
        response: `❌ Błąd asystenta: ${error}`,
        suggestions: ["Spróbuj ponownie", "Sprawdź połączenie"]
      });
    }
  });

  // Assistant action execution endpoint
  app.post("/api/assistant/action", async (req, res) => {
    try {
      const { action } = req.body;
      
      if (!action) {
        return res.status(400).json({ error: "Action is required" });
      }

      const result = await AdvancedAssistantHandler.executeAction(action);
      res.json(result);
    } catch (error) {
      console.error('Assistant action error:', error);
      res.status(500).json({ 
        response: `❌ Błąd wykonania akcji: ${error}`
      });
    }
  });

  // Enhanced ZIP Export endpoints
  app.post('/api/branding-export', async (req, res) => {
    try {
      const { html, brandName = 'Brand', logoSvg, industry = 'technology' } = req.body;
      
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const zipBuffer = await createBrandingZip(brandName, html, logoSvg, industry);
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_branding.zip"`
      });
      
      res.send(zipBuffer);
    } catch (error) {
      console.error('Branding export error:', error);
      res.status(500).json({ error: 'Failed to create branding export' });
    }
  });

  app.post('/api/archive-export', async (req, res) => {
    try {
      const { entryIds = [], format = 'complete' } = req.body;
      
      let entries;
      if (entryIds.length > 0) {
        entries = await storage.getArchiveEntriesByIds(entryIds);
      } else {
        entries = await storage.getAllArchivedEntries();
      }

      if (entries.length === 0) {
        return res.status(400).json({ error: 'No entries found for export' });
      }

      const zipBuffer = await createArchiveZip(entries, format);
      
      const formatName = format === 'code_only' ? 'code' : format === 'chats_only' ? 'chats' : 'complete';
      const timestamp = new Date().toISOString().split('T')[0];
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="pinnode_archive_${formatName}_${timestamp}.zip"`
      });
      
      res.send(zipBuffer);
    } catch (error) {
      console.error('Archive export error:', error);
      res.status(500).json({ error: 'Failed to create archive export' });
    }
  });

  // AI Style Detection and Brand Generation endpoints
  app.post('/api/ai-brand-analysis', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const analysis = await AIStyleDetector.analyzePrompt(prompt);
      res.json(analysis);
    } catch (error) {
      console.error('AI brand analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze brand prompt' });
    }
  });

  app.post('/api/ai-brand-strategy', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const strategy = await AIStyleDetector.generateAIBrandStrategy(prompt);
      res.json(strategy);
    } catch (error) {
      console.error('AI brand strategy error:', error);
      res.status(500).json({ error: 'Failed to generate brand strategy' });
    }
  });

  app.post('/api/ai-generate-brand', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const brandPackage = await AIStyleDetector.generateFromPrompt(prompt);
      res.json(brandPackage);
    } catch (error) {
      console.error('AI brand generation error:', error);
      res.status(500).json({ error: 'Failed to generate complete brand package' });
    }
  });

  // Enhanced branding export with AI-generated content
  app.post('/api/ai-branding-export', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Generate complete brand package from prompt
      const brandPackage = await AIStyleDetector.generateFromPrompt(prompt);
      const { brandData, htmlTemplate, logoSvg } = brandPackage;
      
      // Create enhanced ZIP with AI-generated content
      const zipBuffer = await createBrandingZip(
        brandData.brandName, 
        htmlTemplate, 
        logoSvg, 
        brandData.industry
      );
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${brandData.brandName.replace(/[^a-zA-Z0-9]/g, '_')}_AI_branding.zip"`
      });
      
      res.send(zipBuffer);
    } catch (error) {
      console.error('AI branding export error:', error);
      res.status(500).json({ error: 'Failed to create AI branding export' });
    }
  });

  // Complete Product Generation Workflow (as per user's document)
  app.post('/api/complete-project-workflow', async (req, res) => {
    try {
      const { prompt, preferences = {} } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Projekt prompt jest wymagany' });
      }

      // 1. Generate project structure from prompt
      const projectAnalysis = await AIStyleDetector.analyzePrompt(prompt);
      const brandName = projectAnalysis.brandName || extractBrandNameFromPrompt(prompt);
      
      // 2. Create assets.json with brand data
      const assetsData = {
        brandName,
        description: (projectAnalysis as any).description || `Professional ${brandName} solution`,
        colors: projectAnalysis.colors,
        fonts: projectAnalysis.fonts,
        industry: projectAnalysis.industry,
        logoStyle: projectAnalysis.logoStyle,
        mood: projectAnalysis.mood,
        targetAudience: (projectAnalysis as any).targetAudience || 'Professional users',
        generatedAt: new Date().toISOString(),
        preferences
      };

      // 3. Generate complete brand package
      const brandPackage = await AIStyleDetector.generateFromPrompt(prompt);
      
      // 4. Create project structure with all files
      const projectStructure = {
        assetsData,
        brandPackage,
        files: {
          'assets.json': JSON.stringify(assetsData, null, 2),
          'logo.svg': brandPackage.logoSvg,
          'style-guide.html': generateStyleGuideFromPackage(brandPackage),
          'app_description.txt': generateAppDescription(brandPackage),
          'index.html': brandPackage.htmlTemplate,
          'style.css': (brandPackage as any).cssContent || `/* Generated styles for ${brandName} */\nbody { font-family: Arial, sans-serif; }`
        }
      };

      res.json({
        success: true,
        message: `✅ Projekt ${brandName} został wygenerowany`,
        projectStructure,
        nextSteps: [
          'Dostosuj style i kolory',
          'Wybierz opcje hostingu',
          'Generuj pliki do pobrania',
          'Eksportuj ZIP lub deploy na Vercel'
        ]
      });
    } catch (error) {
      console.error('Complete workflow error:', error);
      res.status(500).json({ 
        error: 'Błąd generowania kompletnego projektu',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Auto-deploy to Vercel endpoint
  app.post('/api/auto-deploy', async (req, res) => {
    try {
      const { projectData, deploymentOptions = {} } = req.body;
      
      if (!projectData || !projectData.brandName) {
        return res.status(400).json({ error: 'Dane projektu są wymagane' });
      }

      // Create deployment configuration
      const deployConfig = {
        name: projectData.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        files: projectData.files || {},
        environment: deploymentOptions.environment || 'production',
        domain: deploymentOptions.customDomain || null
      };

      // In a real implementation, this would integrate with Vercel API
      const mockDeploymentUrl = `https://${deployConfig.name}.vercel.app`;
      
      res.json({
        success: true,
        message: `🚀 Projekt ${projectData.brandName} gotowy do deploy`,
        deploymentUrl: mockDeploymentUrl,
        deployConfig,
        instructions: [
          'Skopiuj pliki do repozytorium Git',
          'Połącz z Vercel Dashboard',
          'Automatyczny deploy zostanie uruchomiony'
        ]
      });
    } catch (error) {
      console.error('Auto-deploy error:', error);
      res.status(500).json({ error: 'Błąd auto-deploy' });
    }
  });

  // Database test endpoint
  app.get("/api/db-test", async (req, res) => {
    try {
      console.log('Testing database connection...');
      const isConnected = await testDatabaseConnection();
      if (isConnected) {
        res.json({ success: true, message: "Database connection successful", data: [] });
      } else {
        res.status(500).json({ success: false, error: "Database connection failed" });
      }
    } catch (error: any) {
      console.error('Database test error:', error);
      res.status(500).json({ success: false, error: error?.message || 'Database test failed' });
    }
  });

  // Enhanced ZIP export with complete product package
  app.post('/api/generate-complete-zip', async (req, res) => {
    try {
      const { productData } = req.body;
      
      if (!productData || !productData.brandName) {
        return res.status(400).json({ error: 'Brand data is required' });
      }

      const completeProductData = {
        brandName: productData.brandName,
        industry: productData.industry || 'tech',
        colors: productData.colors || ['#667eea', '#764ba2', '#f093fb'],
        fonts: productData.fonts || ['Inter', 'Roboto', 'Poppins'],
        description: productData.description || `Professional ${productData.brandName} solution`,
        logoStyle: productData.logoStyle || 'modern',
        targetAudience: productData.targetAudience || 'Professional users'
      };

      console.log('Generating complete product ZIP for:', completeProductData.brandName);
      await generateCompleteProductZip(req, res);
    } catch (error: any) {
      console.error('Complete ZIP generation error:', error);
      res.status(500).json({ error: 'Failed to create complete product package', details: error.message });
    }
  });

  // Register sales system routes
  app.use(salesRouter);

  // Logging and monitoring endpoints
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
      const offset = parseInt(req.query.offset as string) || 0;
      const level = req.query.level as string | undefined;
      const endpoint = req.query.endpoint as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const logs = logger.retrieveLogs({
        level: level as any,
        endpoint,
        limit,
        offset,
        startDate,
        endDate
      });

      logger.info('Logs retrieved', { count: logs.length, offset, limit });
      res.json({ logs, total: logs.length, limit, offset });
    } catch (error: any) {
      logger.error('Failed to retrieve logs', error);
      res.status(500).json({ error: 'Failed to retrieve logs' });
    }
  });

  app.get("/api/logs/stats", async (req, res) => {
    try {
      const stats = logger.getStats();
      res.json(stats);
    } catch (error: any) {
      logger.error('Failed to retrieve log statistics', error);
      res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
  });

  app.get("/api/logs/search", async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

      if (!keyword) {
        return res.status(400).json({ error: 'Search keyword required' });
      }

      const results = logger.searchLogs(keyword, limit);
      res.json({ results, count: results.length });
    } catch (error: any) {
      logger.error('Failed to search logs', error);
      res.status(500).json({ error: 'Failed to search logs' });
    }
  });

  app.get("/api/health", async (req, res) => {
    try {
      const stats = logger.getStats();
      const healthStatus = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        logs: {
          total: stats.totalEntries,
          errorRate: stats.errorRate + '%',
          avgResponseTime: stats.avgResponseTime + 'ms'
        }
      };

      logger.debug('Health check', healthStatus);
      res.json(healthStatus);
    } catch (error: any) {
      logger.error('Health check failed', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  // ==================== MONITORING ENDPOINTS ====================
  // Get error monitor statistics
  app.get("/api/monitor", async (req, res) => {
    try {
      const stats = errorMonitor.getStats();
      res.json(stats);
    } catch (error: any) {
      logger.error('Failed to get monitor stats', error);
      res.status(500).json({ error: 'Failed to get monitor stats' });
    }
  });

  // Get system health summary
  app.get("/api/monitor/health", async (req, res) => {
    try {
      const health = errorMonitor.getHealthSummary();
      res.json(health);
    } catch (error: any) {
      logger.error('Failed to get system health', error);
      res.status(500).json({ error: 'Failed to get system health' });
    }
  });

  // ==================== AUTHENTICATION ENDPOINTS ====================
  // Register new user - with Zod validation + rate limiting
  app.post('/api/auth/register', authLimiter, (req, res) => {
    try {
      const validation = validateData(req.body, authRegisterSchema);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { email, password } = validation.data as { email: string; password: string };
      const result = registerUser(email, password);
      
      if (!result) {
        return res.status(400).json({ error: 'User already exists' });
      }

      res.status(201).json({ 
        message: 'User registered successfully',
        userId: result.id,
        token: result.token 
      });
    } catch (error: any) {
      logger.error('Registration error', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login user - with Zod validation + rate limiting
  app.post('/api/auth/login', authLimiter, (req, res) => {
    try {
      const validation = validateData(req.body, authLoginSchema);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { email, password } = validation.data as { email: string; password: string };
      const result = loginUser(email, password);
      
      if (!result) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      res.json({ 
        message: 'Login successful',
        userId: result.id,
        token: result.token 
      });
    } catch (error: any) {
      logger.error('Login error', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
