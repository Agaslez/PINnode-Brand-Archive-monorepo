/**
 * Service Orchestrator - Workflow Execution Engine
 * SOLID: Single Responsibility - Orchestrate multi-step workflows
 * Purpose: Execute complex multi-service workflows with error recovery
 */

import type { ILogger } from './core/interfaces';
import { logger } from './logger';

// ==========================================
// Workflow Types
// ==========================================

export interface IWorkflowStep {
  id: string;
  name: string;
  service: string;
  method: string;
  input?: Record<string, any>;
  retries?: number;
  timeout?: number;
  fallback?: string;
}

export interface IWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: IWorkflowStep[];
  onSuccess?: (result: any) => Promise<void>;
  onFailure?: (error: Error) => Promise<void>;
}

export interface IWorkflowContext {
  [key: string]: any;
}

export interface IWorkflowResult {
  workflowId: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  stepsExecuted: string[];
  failedStep?: string;
}

// ==========================================
// Service Orchestrator
// ==========================================

export class ServiceOrchestrator {
  private logger: ILogger;
  private services: Map<string, any>;

  constructor(logger: ILogger, services: Map<string, any>) {
    this.logger = logger;
    this.services = services;
  }

  /**
   * Execute a workflow step by step
   */
  async executeWorkflow(workflow: IWorkflow): Promise<IWorkflowResult> {
    const startTime = Date.now();
    const context: IWorkflowContext = {};
    const stepsExecuted: string[] = [];

    this.logger.info(`Starting workflow: ${workflow.name}`, { workflowId: workflow.id });

    try {
      for (const step of workflow.steps) {
        try {
          this.logger.debug(`Executing step: ${step.name}`, { stepId: step.id });

          // Resolve input variables from context
          const resolvedInput = this.resolveInput(step.input || {}, context);

          // Execute step with retry logic
          const result = await this.executeWithRetry(
            step,
            resolvedInput,
            step.retries || 3,
            step.timeout || 30000
          );

          // Store result in context for next steps
          context[step.id] = result;
          stepsExecuted.push(step.id);

          this.logger.debug(`Step completed: ${step.name}`, { stepId: step.id, result });
        } catch (error) {
          // Try fallback if available
          if (step.fallback) {
            this.logger.warn(`Step failed, trying fallback: ${step.fallback}`, {
              stepId: step.id,
              originalError: (error as Error).message,
            });

            try {
              const fallbackStep = workflow.steps.find((s) => s.id === step.fallback);
              if (fallbackStep) {
                const fallbackResult = await this.executeWithRetry(fallbackStep, {}, 1);
                context[step.id] = fallbackResult;
                stepsExecuted.push(step.id);
                continue;
              }
            } catch (fallbackError) {
              this.logger.error(`Fallback also failed`, fallbackError as Error, {
                stepId: step.id,
              });
            }
          }

          // Workflow failed
          this.logger.error(`Workflow failed at step: ${step.name}`, error as Error, {
            workflowId: workflow.id,
            stepId: step.id,
          });

          if (workflow.onFailure) {
            await workflow.onFailure(error as Error);
          }

          const executionTime = Date.now() - startTime;
          return {
            workflowId: workflow.id,
            success: false,
            error: (error as Error).message,
            executionTime,
            stepsExecuted,
            failedStep: step.id,
          };
        }
      }

      // Workflow completed successfully
      if (workflow.onSuccess) {
        await workflow.onSuccess(context);
      }

      const executionTime = Date.now() - startTime;
      this.logger.info(`Workflow completed successfully`, {
        workflowId: workflow.id,
        executionTime,
      });

      return {
        workflowId: workflow.id,
        success: true,
        result: context,
        executionTime,
        stepsExecuted,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`Workflow execution error`, error as Error, {
        workflowId: workflow.id,
      });

      return {
        workflowId: workflow.id,
        success: false,
        error: (error as Error).message,
        executionTime,
        stepsExecuted,
      };
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeWithRetry(
    step: IWorkflowStep,
    input: any,
    retries: number,
    timeout: number
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.executeStepWithTimeout(step, input, timeout);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Step execution failed (attempt ${attempt}/${retries})`, lastError, {
          stepId: step.id,
        });

        if (attempt < retries) {
          // Exponential backoff: 2^attempt * 100ms
          const delay = Math.pow(2, attempt) * 100;
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error(`Step failed after ${retries} retries`);
  }

  /**
   * Execute step with timeout
   */
  private async executeStepWithTimeout(
    step: IWorkflowStep,
    input: any,
    timeout: number
  ): Promise<any> {
    const service = this.services.get(step.service);
    if (!service) {
      throw new Error(`Service not found: ${step.service}`);
    }

    const method = service[step.method];
    if (typeof method !== 'function') {
      throw new Error(`Method not found: ${step.service}.${step.method}`);
    }

    return Promise.race([
      method.call(service, input),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Step timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Resolve input variables from context
   * Supports ${variable} syntax
   */
  private resolveInput(input: any, context: IWorkflowContext): any {
    if (typeof input !== 'object' || input === null) {
      return input;
    }

    const resolved: any = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const varName = value.slice(2, -1);
        resolved[key] = context[varName];
      } else if (typeof value === 'object') {
        resolved[key] = this.resolveInput(value, context);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==========================================
// Predefined Workflows
// ==========================================

export const WORKFLOWS = {
  COMPLETE_BRAND_GENERATION: (userId: string, brandData: any): IWorkflow => ({
    id: 'complete-brand-gen-' + userId,
    name: 'Complete Brand Generation',
    description: 'Generate complete brand package with AI assistance',
    steps: [
      {
        id: 'create-brand',
        name: 'Create Brand Project',
        service: 'brandService',
        method: 'createBrand',
        input: brandData,
        retries: 3,
      },
      {
        id: 'generate-colors',
        name: 'Generate Color Palette',
        service: 'aiProvider',
        method: 'generateBrandContent',
        input: {
          prompt: `Generate 5 color palette for brand: ${brandData.name}`,
          context: '${create-brand}',
        },
        timeout: 60000,
        retries: 2,
        fallback: 'use-default-colors',
      },
      {
        id: 'generate-logo',
        name: 'Generate Logo Design',
        service: 'aiProvider',
        method: 'generateBrandContent',
        input: {
          prompt: `Design modern logo for ${brandData.name}`,
          colors: '${generate-colors}',
        },
        timeout: 120000,
        retries: 1,
        fallback: 'use-template-logo',
      },
      {
        id: 'create-kit',
        name: 'Create Brand Kit',
        service: 'brandService',
        method: 'generateBrandKit',
        input: {
          brandId: '${create-brand.id}',
          colors: '${generate-colors}',
          logo: '${generate-logo}',
        },
        retries: 3,
      },
      {
        id: 'archive-files',
        name: 'Archive Brand Files',
        service: 'archiveService',
        method: 'storeEntry',
        input: {
          type: 'brand-kit',
          data: '${create-kit}',
          userId: userId,
        },
        retries: 5,
      },
    ],
    onSuccess: async (result) => {
      logger.info('Brand generation workflow completed', { result });
    },
    onFailure: async (error) => {
      logger.error('Brand generation workflow failed', error);
    },
  }),

  AUTO_ARCHIVE_CLEANUP: (): IWorkflow => ({
    id: 'auto-archive-cleanup',
    name: 'Auto Archive Cleanup',
    description: 'Automatically clean and optimize archive',
    steps: [
      {
        id: 'scan-archive',
        name: 'Scan Archive for Issues',
        service: 'archiveService',
        method: 'scanForIssues',
        retries: 3,
      },
      {
        id: 'heal-corrupted',
        name: 'Heal Corrupted Entries',
        service: 'archiveService',
        method: 'autoHeal',
        input: { issues: '${scan-archive}' },
        retries: 3,
      },
      {
        id: 'optimize',
        name: 'Optimize Archive',
        service: 'archiveService',
        method: 'optimizeStorage',
        retries: 2,
      },
    ],
  }),
};
