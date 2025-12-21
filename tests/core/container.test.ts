/**
 * Core Tests - DI Container
 * Tests the fundamental dependency injection mechanism
 */

import { ServiceContainer } from '../core/container';

describe('ServiceContainer - Dependency Injection', () => {
  let container: ServiceContainer;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  describe('register', () => {
    it('should register a service factory', () => {
      const mockService = { name: 'test' };
      const factory = () => mockService;

      expect(() => {
        container.register('test-service', factory);
      }).not.toThrow();
    });

    it('should reject duplicate registration', () => {
      container.register('test', () => ({ name: 'test1' }));

      expect(() => {
        container.register('test', () => ({ name: 'test2' }));
      }).toThrow();
    });
  });

  describe('registerSingleton', () => {
    it('should register a singleton instance', () => {
      const instance = { name: 'singleton' };

      expect(() => {
        container.registerSingleton('singleton', instance);
      }).not.toThrow();
    });

    it('should return same instance on multiple resolves', () => {
      const instance = { name: 'singleton' };
      container.registerSingleton('singleton', instance);

      const resolved1 = container.resolve('singleton');
      const resolved2 = container.resolve('singleton');

      expect(resolved1).toBe(resolved2);
      expect(resolved1).toBe(instance);
    });
  });

  describe('resolve', () => {
    it('should resolve a registered service', () => {
      const mockService = { name: 'test' };
      container.register('test', () => mockService);

      const resolved = container.resolve('test');

      expect(resolved).toBe(mockService);
    });

    it('should create new instance for factory services', () => {
      container.register('factory', () => ({ id: Math.random() }));

      const resolved1 = container.resolve('factory');
      const resolved2 = container.resolve('factory');

      expect(resolved1).not.toBe(resolved2);
      expect(resolved1.id).not.toBe(resolved2.id);
    });

    it('should throw for unregistered service', () => {
      expect(() => {
        container.resolve('nonexistent');
      }).toThrow('Service not registered: nonexistent');
    });
  });

  describe('has', () => {
    it('should check if service is registered', () => {
      container.register('exists', () => ({}));

      expect(container.has('exists')).toBe(true);
      expect(container.has('nonexistent')).toBe(false);
    });
  });

  describe('getServices', () => {
    it('should return list of registered services', () => {
      container.register('service1', () => ({}));
      container.register('service2', () => ({}));
      container.registerSingleton('singleton', {});

      const services = container.getServices();

      expect(services).toContain('service1');
      expect(services).toContain('service2');
      expect(services).toContain('singleton');
    });
  });

  describe('clear', () => {
    it('should remove all registrations', () => {
      container.register('service', () => ({}));
      container.registerSingleton('singleton', {});

      container.clear();

      expect(container.has('service')).toBe(false);
      expect(container.has('singleton')).toBe(false);
    });
  });

  describe('Multiple service resolution', () => {
    it('should resolve complex service dependencies', () => {
      // Simulate service dependencies
      const loggerFactory = () => ({
        log: (msg: string) => console.log(msg),
      });

      const databaseFactory = () => ({
        query: async (sql: string) => ({ rows: [] }),
      });

      const serviceFactory = () => ({
        logger: container.resolve('logger'),
        database: container.resolve('database'),
        execute: async (action: string) => 'result',
      });

      container.register('logger', loggerFactory);
      container.register('database', databaseFactory);
      container.register('service', serviceFactory);

      const service = container.resolve('service');

      expect(service.logger).toBeDefined();
      expect(service.database).toBeDefined();
      expect(typeof service.execute).toBe('function');
    });
  });
});
