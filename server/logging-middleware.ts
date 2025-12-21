import { type Request, Response, NextFunction } from 'express';
import { logger } from './logger';

interface RequestWithId extends Request {
  requestId?: string;
  startTime?: number;
}

export function setupLoggingMiddleware() {
  return [
    // Request ID middleware
    (req: RequestWithId, res: Response, next: NextFunction) => {
      req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      req.startTime = Date.now();
      next();
    },

    // Error logging middleware - should be after all routes
    (err: any, req: RequestWithId, res: Response, next: NextFunction) => {
      const duration = req.startTime ? Date.now() - req.startTime : 0;
      
      logger.error(
        `Unhandled Error: ${err.message || 'Unknown error'}`,
        err,
        {
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          statusCode: err.status || err.statusCode || 500,
          duration,
          ip: req.ip
        }
      );

      const status = err.status || err.statusCode || 500;
      res.status(status).json({
        error: err.message || 'Internal Server Error',
        requestId: req.requestId
      });
    }
  ];
}

export function logRequest(req: RequestWithId, res: Response) {
  const original = res.json;

  res.json = function (data: any, ...args: any[]) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const statusCode = res.statusCode;

    // Log API requests
    if (req.path.startsWith('/api/')) {
      logger.logRequest(
        req.method,
        req.path,
        statusCode,
        duration,
        req.ip,
        {
          requestId: req.requestId,
          responseSize: JSON.stringify(data).length
        }
      );
    }

    return original.call(this, data, ...args);
  };
}

export function attachRequestLogging() {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    logRequest(req, res);
    next();
  };
}
