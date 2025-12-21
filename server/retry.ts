import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2
};

/**
 * Retry helper with exponential backoff for API calls
 * @param fn Async function to retry
 * @param options Retry configuration
 * @returns Result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === opts.maxRetries) {
        logger.error('All retry attempts failed', {
          attempt: attempt + 1,
          maxRetries: opts.maxRetries,
          error: error?.message
        });
        throw error;
      }

      // Calculate backoff delay
      const delayMs = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );

      logger.warn('API call failed, retrying...', {
        attempt: attempt + 1,
        maxRetries: opts.maxRetries,
        delayMs,
        error: error?.message
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Retry with jitter to prevent thundering herd
 */
export async function withRetryAndJitter<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === opts.maxRetries) {
        logger.error('All retry attempts failed (with jitter)', {
          attempt: attempt + 1,
          maxRetries: opts.maxRetries,
          error: error?.message
        });
        throw error;
      }

      // Calculate backoff delay with jitter
      const delayMs = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt) +
        Math.random() * 1000, // Add up to 1s jitter
        opts.maxDelayMs
      );

      logger.warn('API call failed, retrying with jitter...', {
        attempt: attempt + 1,
        maxRetries: opts.maxRetries,
        delayMs,
        error: error?.message
      });

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Retry with jitter failed');
}
