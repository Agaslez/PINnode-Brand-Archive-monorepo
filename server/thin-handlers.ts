/**
 * Thin Route Handlers - Using Services via Dependency Injection
 * SOLID: Single Responsibility, Dependency Inversion
 * Purpose: Controllers are thin, business logic is in services
 */

import type { Request, Response } from 'express';
import { getService } from './core/init';
import { logger } from './logger';
import type { IBrandService, IArchiveService, ISalesService } from './core/interfaces';

// ============================================
// BRAND HANDLERS
// ============================================

export async function handleCreateBrand(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IBrandService>('BrandService');
    const brand = await service.createBrand(req.body);
    res.json(brand);
  } catch (error) {
    logger.error('Create brand failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to create brand' });
  }
}

export async function handleGetBrand(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IBrandService>('BrandService');
    const brand = await service.getBrand(req.params.id);
    res.json(brand);
  } catch (error) {
    logger.error('Get brand failed', error as Error, { path: req.path });
    res.status(404).json({ error: 'Brand not found' });
  }
}

export async function handleUpdateBrand(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IBrandService>('BrandService');
    const brand = await service.updateBrand(req.params.id, req.body);
    res.json(brand);
  } catch (error) {
    logger.error('Update brand failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to update brand' });
  }
}

export async function handleListBrands(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IBrandService>('BrandService');
    const brands = await service.listBrands();
    res.json(brands);
  } catch (error) {
    logger.error('List brands failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to list brands' });
  }
}

export async function handleGenerateBrandKit(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IBrandService>('BrandService');
    const kit = await service.generateBrandKit(req.params.id);
    res.json(kit);
  } catch (error) {
    logger.error('Generate brand kit failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to generate brand kit' });
  }
}

// ============================================
// ARCHIVE HANDLERS
// ============================================

export async function handleStoreArchiveEntry(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IArchiveService>('ArchiveService');
    const entry = await service.storeEntry(req.body);
    res.json(entry);
  } catch (error) {
    logger.error('Store archive entry failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to store entry' });
  }
}

export async function handleRetrieveArchiveEntry(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IArchiveService>('ArchiveService');
    const entry = await service.retrieveEntry(req.params.id);
    res.json(entry);
  } catch (error) {
    logger.error('Retrieve archive entry failed', error as Error, { path: req.path });
    res.status(404).json({ error: 'Entry not found' });
  }
}

export async function handleSearchArchive(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IArchiveService>('ArchiveService');
    const query = req.query.q as string || '';
    const entries = await service.searchEntries(query);
    res.json(entries);
  } catch (error) {
    logger.error('Search archive failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Search failed' });
  }
}

export async function handleAutoHeal(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<IArchiveService>('ArchiveService');
    const result = await service.autoHeal();
    res.json(result);
  } catch (error) {
    logger.error('Auto heal failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Auto heal failed' });
  }
}

// ============================================
// SALES HANDLERS
// ============================================

export async function handleCreateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<ISalesService>('SalesService');
    const transaction = await service.createTransaction(req.body);
    res.json(transaction);
  } catch (error) {
    logger.error('Create transaction failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

export async function handleCalculatePricing(req: Request, res: Response): Promise<void> {
  try {
    const service = getService<ISalesService>('SalesService');
    const plan = req.query.plan as string || 'free';
    const price = await service.calculatePricing(plan);
    res.json({ plan, price });
  } catch (error) {
    logger.error('Calculate pricing failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
}

export async function handleGetServiceStatus(req: Request, res: Response): Promise<void> {
  try {
    const aiProvider = getService('AIProvider');
    const isAvailable = await aiProvider.isAvailable();
    
    res.json({
      status: 'operational',
      aiProvider: {
        name: aiProvider.name,
        available: isAvailable
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get service status failed', error as Error, { path: req.path });
    res.status(500).json({ error: 'Failed to get status' });
  }
}
