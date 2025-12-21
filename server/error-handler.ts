import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Global error handler middleware
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const path = req.path;
  const method = req.method;

  // Handle AppError (custom application errors)
  if (err instanceof AppError) {
    logger.error('Application error', {
      statusCode: err.statusCode,
      message: err.message,
      path,
      method,
      details: err.details
    });

    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      ...(err.details && { details: err.details }),
      timestamp
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    logger.warn('Validation error', {
      message: err.message,
      path,
      method
    });

    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
      timestamp
    });
  }

  // Handle syntax errors (e.g., JSON parsing)
  if (err instanceof SyntaxError) {
    logger.warn('Syntax error', {
      message: err.message,
      path,
      method
    });

    return res.status(400).json({
      error: 'Invalid request format',
      message: err.message,
      timestamp
    });
  }

  // Handle generic errors
  logger.error('Unhandled error', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path,
    method
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { message: err.message }),
    ...(isDevelopment && { stack: err.stack }),
    timestamp
  });
}

// 404 handler middleware
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('Not found', {
    path: req.path,
    method: req.method
  });

  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
