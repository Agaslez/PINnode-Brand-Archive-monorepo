/**
 * SOLID Principles Core Interfaces
 * Each interface has single responsibility
 * Enables Dependency Injection and loose coupling
 */

// ============================================
// 1. DEPENDENCY INJECTION - Interface contracts
// ============================================

export interface ILogger {
  debug(msg: string, data?: any): void;
  info(msg: string, data?: any): void;
  warn(msg: string, data?: any): void;
  error(msg: string, error?: Error, data?: any): void;
  critical(msg: string, error?: Error, data?: any): void;
}

// ============================================
// 2. AI PROVIDER - Abstraction for AI services
// ============================================

export interface IAIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateBrandContent(prompt: string, context?: any): Promise<AIResponse>;
  enhanceBrand(data: any): Promise<any>;
}

export interface AIResponse {
  content: string;
  source: 'api' | 'fallback';
  confidence: number;
  processingTime: number;
}

// ============================================
// 3. ERROR HANDLING - Fault isolation contracts
// ============================================

export interface IServiceError {
  code: string;
  message: string;
  statusCode: number;
  service: string;
  timestamp: string;
  isRecoverable: boolean;
}

export interface IFaultDomain {
  name: string;
  isHealthy(): Promise<boolean>;
  recover(): Promise<void>;
  getStatus(): any;
}

// ============================================
// 4. SERVICE CONTRACTS - Single responsibility
// ============================================

export interface IBrandService {
  createBrand(data: any): Promise<any>;
  getBrand(id: string): Promise<any>;
  updateBrand(id: string, data: any): Promise<any>;
  deleteBrand(id: string): Promise<void>;
  listBrands(): Promise<any[]>;
  generateBrandKit(brandId: string): Promise<any>;
}

export interface IArchiveService {
  storeEntry(entry: any): Promise<any>;
  retrieveEntry(id: string): Promise<any>;
  searchEntries(query: string): Promise<any[]>;
  deleteEntry(id: string): Promise<void>;
  autoHeal(): Promise<any>;
}

export interface ISalesService {
  createTransaction(data: any): Promise<any>;
  getTransaction(id: string): Promise<any>;
  listTransactions(): Promise<any[]>;
  calculatePricing(plan: string): Promise<number>;
}

// ============================================
// 5. REPOSITORY PATTERN - Data access abstraction
// ============================================

export interface IRepository<T> {
  create(data: T): Promise<T>;
  read(id: string | number): Promise<T | null>;
  update(id: string | number, data: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<boolean>;
  list(filter?: any): Promise<T[]>;
  search(query: string): Promise<T[]>;
}

// ============================================
// 6. CONFIGURATION - Environment contracts
// ============================================

export interface IServiceConfig {
  apiKey?: string;
  apiUrl?: string;
  timeout?: number;
  retryCount?: number;
  enableFallback?: boolean;
}

export interface IDeepSeekConfig extends IServiceConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

// ============================================
// 7. CONTAINER - DI Container contract
// ============================================

export interface IServiceContainer {
  register<T>(key: string, factory: () => T): void;
  resolve<T>(key: string): T;
  isRegistered(key: string): boolean;
  clear(): void;
}

// ============================================
// 8. HEALTH CHECK - Container-ready architecture
// ============================================

export interface IHealthCheck {
  name: string;
  check(): Promise<HealthStatus>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details?: any;
}
