/**
 * Container Initialization
 * Bootstrap all services with dependency injection
 */

import { container } from './container';
import { DeepSeekProvider, FallbackAIProvider } from './ai-provider';
import { BrandService, ArchiveService, SalesService } from './services';
import { logger } from '../logger';
import type { IDeepSeekConfig } from './interfaces';

/**
 * Initialize all services in the container
 */
export async function initializeServices(): Promise<void> {
  try {
    logger.info('Initializing SOLID core services', { phase: 'startup' });

    // ========================================
    // 1. AI Provider Setup (Liskov Substitution)
    // ========================================
    
    const deepSeekConfig: IDeepSeekConfig = {
      apiKey: process.env.DEEPSEEK_API_KEY,
      apiUrl: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat',
      maxTokens: 1500,
      temperature: 0.7,
      timeout: 30000,
      retryCount: 3,
      enableFallback: true
    };

    // Register AI provider (real or fallback)
    if (process.env.DEEPSEEK_API_KEY) {
      logger.info('Registering DeepSeek AI Provider', { provider: 'deepseek' });
      container.registerSingleton(
        'AIProvider',
        new DeepSeekProvider(deepSeekConfig)
      );
    } else {
      logger.warn('DeepSeek API key not found, using FallbackAIProvider', { provider: 'fallback' });
      container.registerSingleton(
        'AIProvider',
        new FallbackAIProvider()
      );
    }

    // ========================================
    // 2. Service Layer Registration (Single Responsibility)
    // ========================================
    
    const aiProvider = container.resolve('AIProvider');
    
    container.registerSingleton(
      'BrandService',
      new BrandService(aiProvider)
    );

    container.registerSingleton(
      'ArchiveService',
      new ArchiveService()
    );

    container.registerSingleton(
      'SalesService',
      new SalesService()
    );

    logger.info('Services initialized successfully', {
      services: [
        'BrandService',
        'ArchiveService',
        'SalesService',
        'AIProvider'
      ]
    });

  } catch (error) {
    logger.critical('Failed to initialize services', error as Error, {
      phase: 'startup'
    });
    throw error;
  }
}

/**
 * Get a service from container
 */
export function getService<T>(key: string): T {
  return container.resolve<T>(key);
}
