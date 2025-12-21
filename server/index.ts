import compression from "compression";
import dotenv from "dotenv";
import express, { NextFunction, type Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer as createHttpServer } from "http";
import { initializeServices } from "./core/init";
import { globalErrorHandler, notFoundHandler } from "./error-handler";
import { logger } from "./logger";
import { attachRequestLogging } from "./logging-middleware";
import { registerRoutes } from "./routes";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createHttpServer(app);

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Setup logging middleware
app.use(attachRequestLogging());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      logger.info(logLine);
      logger.info(`${req.method} ${path}`, { status: res.statusCode, duration });
    }
  });

  next();
});

(async () => {
  // Initialize SOLID core services
  await initializeServices();

  const routes = registerRoutes(app);

  // Setup Vite in development mode if available
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    logger.info('Development mode - serving static files from dist/public');
    app.use(express.static('dist/public'));
  } else {
    // Production: use static files
    app.use(express.static('dist/public'));
  }

  // Error handling middleware with logging
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error(message, err, { status, path: _req.path });
    res.status(status).json({ message });
    throw err;
  });

  // Error handling middleware (must be after all other middleware including Vite)
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen(port, '0.0.0.0', () => {
    logger.info(`serving on port ${port}`);
    logger.info(`PINnode System started on port ${port}`, { environment: process.env.NODE_ENV });
  });
})();