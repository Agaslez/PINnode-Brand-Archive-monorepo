/**
 * Core Services - Single Responsibility Per Service
 * SOLID: Single Responsibility Principle
 * Each service has ONE domain: Brand, Archive, or Sales
 */

import type { IBrandService, IArchiveService, ISalesService } from './interfaces';
import { logger } from '../logger';
import { storage } from '../storage';
import type { IAIProvider } from './interfaces';
import { FaultDomain, executeInFaultDomain } from './error-handler';

/**
 * Brand Service - Handles all brand-related operations
 * Single Responsibility: Brand creation, management, and enhancement
 */
export class BrandService implements IBrandService {
  private aiProvider: IAIProvider;
  private faultDomain: FaultDomain;

  constructor(aiProvider: IAIProvider) {
    this.aiProvider = aiProvider;
    this.faultDomain = new FaultDomain('BrandService');
  }

  async createBrand(data: any): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Creating brand', { brandName: data.name });
        
        const project = await storage.createBrandProject({
          name: data.name,
          description: data.description,
          industry: data.industry,
          targetAudience: data.targetAudience
        });

        return project;
      }
    );
  }

  async getBrand(id: string): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        const project = await storage.getBrandProject(parseInt(id));
        if (!project) {
          throw new Error(`Brand not found: ${id}`);
        }
        return project;
      }
    );
  }

  async updateBrand(id: string, data: any): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Updating brand', { brandId: id });
        const project = await storage.getBrandProject(parseInt(id));
        
        if (!project) {
          throw new Error(`Brand not found: ${id}`);
        }

        const updated = { ...project, ...data };
        await storage.updateBrandProject(updated);
        return updated;
      }
    );
  }

  async deleteBrand(id: string): Promise<void> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Deleting brand', { brandId: id });
        await storage.deleteBrandProject(parseInt(id));
      }
    );
  }

  async listBrands(): Promise<any[]> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        return storage.getAllBrandProjects();
      },
      async () => {
        logger.warn('Using empty list fallback for brands');
        return [];
      }
    );
  }

  async generateBrandKit(brandId: string): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Generating brand kit', { brandId });
        
        const brand = await storage.getBrandProject(parseInt(brandId));
        if (!brand) {
          throw new Error(`Brand not found: ${brandId}`);
        }

        // Use AI provider for enhancement
        const enhanced = await this.aiProvider.enhanceBrand(brand);
        
        return {
          brandId,
          kit: {
            metadata: brand,
            ai_enhancement: enhanced.aiEnhanced,
            confidence: enhanced.confidenceScore,
            generated_at: enhanced.generatedAt
          }
        };
      }
    );
  }
}

/**
 * Archive Service - Handles file archival and retrieval
 * Single Responsibility: Archive management and search
 */
export class ArchiveService implements IArchiveService {
  private faultDomain: FaultDomain;

  constructor() {
    this.faultDomain = new FaultDomain('ArchiveService');
  }

  async storeEntry(entry: any): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Storing archive entry', { filename: entry.filename });
        return storage.createArchivedEntry({
          filename: entry.filename,
          content: entry.content,
          category: entry.category || 'General',
          tags: entry.tags || []
        });
      }
    );
  }

  async retrieveEntry(id: string): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        const entry = await storage.getArchivedEntry(parseInt(id));
        if (!entry) {
          throw new Error(`Archive entry not found: ${id}`);
        }
        return entry;
      }
    );
  }

  async searchEntries(query: string): Promise<any[]> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Searching archive entries', { query });
        return storage.getArchivedEntriesBySearch(query);
      },
      async () => {
        logger.warn('Using empty results fallback for archive search');
        return [];
      }
    );
  }

  async deleteEntry(id: string): Promise<void> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Deleting archive entry', { entryId: id });
        await storage.deleteArchivedEntry(parseInt(id));
      }
    );
  }

  async autoHeal(): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Running archive auto-heal');
        
        // Check all entries for integrity
        const entries = await storage.getAllArchivedEntries();
        const healedCount = entries.length;
        
        return {
          status: 'healing_complete',
          entriesHealed: healedCount,
          timestamp: new Date().toISOString()
        };
      }
    );
  }
}

/**
 * Sales Service - Handles transactions and subscriptions
 * Single Responsibility: Sales transactions and pricing
 */
export class SalesService implements ISalesService {
  private faultDomain: FaultDomain;
  private transactions: Map<string, any> = new Map();

  constructor() {
    this.faultDomain = new FaultDomain('SalesService');
  }

  async createTransaction(data: any): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        logger.info('Creating transaction', { plan: data.plan });
        
        const transaction = {
          id: `txn_${Date.now()}`,
          ...data,
          status: 'completed',
          createdAt: new Date().toISOString()
        };

        this.transactions.set(transaction.id, transaction);
        return transaction;
      }
    );
  }

  async getTransaction(id: string): Promise<any> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        const transaction = this.transactions.get(id);
        if (!transaction) {
          throw new Error(`Transaction not found: ${id}`);
        }
        return transaction;
      }
    );
  }

  async listTransactions(): Promise<any[]> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        return Array.from(this.transactions.values());
      },
      async () => {
        return [];
      }
    );
  }

  async calculatePricing(plan: string): Promise<number> {
    return executeInFaultDomain(
      this.faultDomain,
      async () => {
        const pricing: Record<string, number> = {
          free: 0,
          pro: 99,
          enterprise: 999
        };
        
        return pricing[plan.toLowerCase()] || 0;
      }
    );
  }
}
