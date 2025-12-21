import rateLimit from 'express-rate-limit';
import { logger } from './logger';

// Auth rate limiter - strict: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter - medium: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Logo generation rate limiter - strict: 20 requests per hour
export const logoGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour (expensive operation)
  message: 'Too many logo generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
