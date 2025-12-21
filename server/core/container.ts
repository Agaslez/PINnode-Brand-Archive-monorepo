/**
 * Service Container - IoC Container for Dependency Injection
 * SOLID: Inversion of Control, Dependency Injection
 * Purpose: Manage service lifecycle and dependencies
 */

import type { IServiceContainer } from './interfaces';
import { logger } from '../logger';

export class ServiceContainer implements IServiceContainer {
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();

  /**
   * Register a service factory
   * @param key Service identifier
   * @param factory Function that creates the service instance
   */
  register<T>(key: string, factory: () => T): void {
    try {
      this.services.set(key, factory);
      logger.debug(`Registered service: ${key}`);
    } catch (error) {
      logger.error(`Failed to register service: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Register a singleton service
   * @param key Service identifier
   * @param instance Singleton instance
   */
  registerSingleton<T>(key: string, instance: T): void {
    try {
      this.singletons.set(key, instance);
      logger.debug(`Registered singleton: ${key}`);
    } catch (error) {
      logger.error(`Failed to register singleton: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Resolve a service
   * @param key Service identifier
   * @returns Service instance
   */
  resolve<T>(key: string): T {
    try {
      // Check singletons first
      if (this.singletons.has(key)) {
        return this.singletons.get(key);
      }

      // Create from factory
      if (!this.services.has(key)) {
        throw new Error(`Service not registered: ${key}`);
      }

      const factory = this.services.get(key);
      const instance = factory();
      
      logger.debug(`Resolved service: ${key}`);
      return instance;
    } catch (error) {
      logger.error(`Failed to resolve service: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Check if service is registered
   */
  isRegistered(key: string): boolean {
    return this.services.has(key) || this.singletons.has(key);
  }

  /**
   * Clear all registered services
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    logger.debug('Service container cleared');
  }

  /**
   * Get all registered services
   */
  getRegisteredServices(): string[] {
    return Array.from(
      new Set([...this.services.keys(), ...this.singletons.keys()])
    );
  }
}

// Global container instance (singleton)
export const container = new ServiceContainer();
