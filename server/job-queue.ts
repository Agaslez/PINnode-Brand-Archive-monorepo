/**
 * Job Queue System - BullMQ
 * SOLID: Single Responsibility - Queue management only
 * Purpose: Orchestrate async tasks, decouple request handlers from processing
 */

import type { Job } from 'bullmq';
import { Queue, QueueScheduler } from 'bullmq';
import { logger } from './logger';

// Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// ==========================================
// Queue Types
// ==========================================

export interface IJobData {
  type: string;
  data: any;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface IJobResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  timestamp: string;
}

// ==========================================
// Service Queues
// ==========================================

export const brandQueue = new Queue('brand', { connection: redisConfig });
export const archiveQueue = new Queue('archive', { connection: redisConfig });
export const salesQueue = new Queue('sales', { connection: redisConfig });
export const aiQueue = new Queue('ai-generation', { connection: redisConfig });
export const exportQueue = new Queue('export', { connection: redisConfig });

// ==========================================
// Queue Schedulers
// ==========================================

export const brandScheduler = new QueueScheduler('brand', { connection: redisConfig });
export const archiveScheduler = new QueueScheduler('archive', { connection: redisConfig });

// ==========================================
// Job Enqueue Helpers
// ==========================================

export async function enqueueBrandJob(jobType: string, data: any, userId: string) {
  try {
    const job = await brandQueue.add(jobType, { data, userId }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
    
    logger.info('Brand job enqueued', { jobId: job.id, jobType, userId });
    return job.id;
  } catch (error) {
    logger.error('Failed to enqueue brand job', error as Error, { jobType, userId });
    throw error;
  }
}

export async function enqueueArchiveJob(jobType: string, data: any, userId: string) {
  try {
    const job = await archiveQueue.add(jobType, { data, userId }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 3600 }, // Remove after 1 hour
    });
    
    logger.info('Archive job enqueued', { jobId: job.id, jobType });
    return job.id;
  } catch (error) {
    logger.error('Failed to enqueue archive job', error as Error, { jobType });
    throw error;
  }
}

export async function enqueueAIJob(jobType: string, prompt: string, context?: any) {
  try {
    const job = await aiQueue.add(jobType, { prompt, context }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
      timeout: 120000, // 2 minutes
    });
    
    logger.info('AI job enqueued', { jobId: job.id, jobType });
    return job.id;
  } catch (error) {
    logger.error('Failed to enqueue AI job', error as Error, { jobType });
    throw error;
  }
}

// ==========================================
// Queue Event Listeners
// ==========================================

export function setupQueueListeners() {
  // Brand queue events
  brandQueue.on('completed', (job: Job) => {
    logger.info('Brand job completed', { jobId: job.id, result: job.returnvalue });
  });

  brandQueue.on('failed', (job: Job | undefined, error: Error) => {
    logger.error('Brand job failed', error, { jobId: job?.id });
  });

  // Archive queue events
  archiveQueue.on('completed', (job: Job) => {
    logger.info('Archive job completed', { jobId: job.id });
  });

  archiveQueue.on('failed', (job: Job | undefined, error: Error) => {
    logger.error('Archive job failed', error, { jobId: job?.id });
  });

  // AI queue events
  aiQueue.on('completed', (job: Job) => {
    logger.info('AI job completed', { jobId: job.id });
  });

  aiQueue.on('failed', (job: Job | undefined, error: Error) => {
    logger.error('AI job failed', error, { jobId: job?.id });
  });
}

// ==========================================
// Queue Statistics
// ==========================================

export async function getQueueStats() {
  try {
    const stats = {
      brand: {
        waiting: await brandQueue.count('waiting'),
        active: await brandQueue.count('active'),
        completed: await brandQueue.count('completed'),
        failed: await brandQueue.count('failed'),
      },
      archive: {
        waiting: await archiveQueue.count('waiting'),
        active: await archiveQueue.count('active'),
        completed: await archiveQueue.count('completed'),
        failed: await archiveQueue.count('failed'),
      },
      ai: {
        waiting: await aiQueue.count('waiting'),
        active: await aiQueue.count('active'),
        completed: await aiQueue.count('completed'),
        failed: await aiQueue.count('failed'),
      },
    };
    
    return stats;
  } catch (error) {
    logger.error('Failed to get queue stats', error as Error);
    return null;
  }
}

// ==========================================
// Cleanup
// ==========================================

export async function closeQueues() {
  try {
    await Promise.all([
      brandQueue.close(),
      archiveQueue.close(),
      salesQueue.close(),
      aiQueue.close(),
      exportQueue.close(),
    ]);
    logger.info('All queues closed successfully');
  } catch (error) {
    logger.error('Error closing queues', error as Error);
  }
}
