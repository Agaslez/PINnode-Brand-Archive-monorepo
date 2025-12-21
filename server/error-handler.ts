import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { ApiResponseBuilder } from './types/api-response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'APP_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Global error handler middleware - STANDARD FORMAT
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const path = req.path;
  const method = req.method;

  // Handle AppError (custom application errors)
  if (err instanceof AppError) {
    logger.error('Application error', {
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      path,
      method,
      details: err.details
    });

    return res.status(err.statusCode).json(
      ApiResponseBuilder.error(err.code, err.message, err.statusCode)
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    logger.warn('Validation error', {
      message: err.message,
      path,
      method
    });

    return res.status(400).json(
      ApiResponseBuilder.error('VALIDATION_ERROR', 'Validation failed', 400)
    );
  }

  // Handle syntax errors (e.g., JSON parsing)
  if (err instanceof SyntaxError) {
    logger.warn('Syntax error', {
      message: err.message,
      path,
      method
    });

    return res.status(400).json(
      ApiResponseBuilder.error('INVALID_REQUEST', 'Invalid request format', 400)
    );
  }

  // Handle generic errors
  logger.error('Unhandled error', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path,
    method
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json(
    ApiResponseBuilder.error(
      'INTERNAL_SERVER_ERROR',
      isDevelopment ? err.message : 'Internal server error',
      500
    )
  );
}

// 404 handler middleware
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('Not found', {
    path: req.path,
    method: req.method
  });

  res.status(404).json(
    ApiResponseBuilder.error('NOT_FOUND', 'Endpoint not found', 404)
  );
}
