/**
 * Fault Domain Error Handler
 * SOLID: Single Responsibility - error handling with fault isolation
 * Purpose: Isolated error handling per service, circuit breaker pattern
 */

import type { IServiceError, IFaultDomain } from './interfaces';
import { logger } from '../logger';

export class ServiceError implements IServiceError {
  code: string;
  message: string;
  statusCode: number;
  service: string;
  timestamp: string;
  isRecoverable: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    service: string,
    isRecoverable: boolean = false
  ) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.service = service;
    this.timestamp = new Date().toISOString();
    this.isRecoverable = isRecoverable;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      service: this.service,
      timestamp: this.timestamp,
      isRecoverable: this.isRecoverable
    };
  }
}

/**
 * Fault Domain - Isolated error boundary
 * Ensures one service failure doesn't crash the system
 */
export class FaultDomain implements IFaultDomain {
  name: string;
  private failureCount: number = 0;
  private lastError: Error | null = null;
  private isCircuitOpen: boolean = false;
  private readonly maxFailures: number = 5;
  private readonly recoveryTimeout: number = 30000; // 30 seconds

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Check if fault domain is healthy
   */
  async isHealthy(): Promise<boolean> {
    if (this.isCircuitOpen) {
      return false;
    }
    return this.failureCount < this.maxFailures;
  }

  /**
   * Record a failure
   */
  recordFailure(error: Error): void {
    this.failureCount++;
    this.lastError = error;
    logger.warn(`Fault domain failure: ${this.name} (${this.failureCount}/${this.maxFailures})`, {
      service: this.name,
      error: error.message
    });

    if (this.failureCount >= this.maxFailures) {
      this.isCircuitOpen = true;
      logger.critical(`Circuit breaker opened for: ${this.name}`, error, {
        service: this.name
      });

      // Auto-recover after timeout
      setTimeout(() => this.recover(), this.recoveryTimeout);
    }
  }

  /**
   * Record success
   */
  recordSuccess(): void {
    if (this.failureCount > 0) {
      this.failureCount--;
    }
  }

  /**
   * Recover the fault domain
   */
  async recover(): Promise<void> {
    logger.info(`Recovering fault domain: ${this.name}`, {
      service: this.name
    });
    
    this.failureCount = 0;
    this.isCircuitOpen = false;
    this.lastError = null;
  }

  /**
   * Get fault domain status
   */
  getStatus(): any {
    return {
      name: this.name,
      failureCount: this.failureCount,
      isCircuitOpen: this.isCircuitOpen,
      maxFailures: this.maxFailures,
      lastError: this.lastError?.message || null,
      healthy: !this.isCircuitOpen && this.failureCount < this.maxFailures
    };
  }
}

/**
 * Execute function with fault domain protection
 * SOLID: Open/Closed Principle - extend behavior without modification
 */
export async function executeInFaultDomain<T>(
  domain: FaultDomain,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  try {
    if (!await domain.isHealthy()) {
      throw new Error(`Fault domain ${domain.name} is not healthy`);
    }

    const result = await fn();
    domain.recordSuccess();
    return result;
  } catch (error) {
    domain.recordFailure(error instanceof Error ? error : new Error(String(error)));
    
    if (fallback) {
      logger.warn(`Using fallback for ${domain.name}`, {
        service: domain.name
      });
      return fallback();
    }

    throw error;
  }
}
