/**
 * Unit Tests for Service Container (DI Pattern)
 * Tests: SOLID - Dependency Inversion + Inversion of Control
 */

import { ServiceContainer } from '../../server/core/container';

describe('ServiceContainer - Dependency Injection', () => {
  let container: ServiceContainer;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  describe('Service Registration', () => {
    it('should register a service factory', () => {
      const mockService = { name: 'TestService' };
      container.register('TestService', () => mockService);

      expect(container.isRegistered('TestService')).toBe(true);
    });

    it('should register a singleton instance', () => {
      const mockService = { name: 'TestSingleton' };
      container.registerSingleton('TestSingleton', mockService);

      expect(container.isRegistered('TestSingleton')).toBe(true);
    });

    it('should not register duplicate services', () => {
      const service1 = { id: 1 };
      const service2 = { id: 2 };

      container.registerSingleton('Service', service1);
      container.registerSingleton('Service', service2); // Override

      // Should return the last registered (service2)
      const resolved = container.resolve('Service');
      expect(resolved.id).toBe(2);
    });
  });

  describe('Service Resolution', () => {
    it('should resolve registered singleton', () => {
      const mockService = { name: 'TestService', getValue: () => 42 };
      container.registerSingleton('TestService', mockService);

      const resolved = container.resolve('TestService');

      expect(resolved).toBe(mockService);
      expect(resolved.getValue()).toBe(42);
    });

    it('should resolve from factory each time', () => {
      let callCount = 0;
      container.register('FactoryService', () => {
        callCount++;
        return { call: callCount };
      });

      const first = container.resolve('FactoryService');
      const second = container.resolve('FactoryService');

      expect(first.call).toBe(1);
      expect(second.call).toBe(2);
    });

    it('should throw error for unregistered service', () => {
      expect(() => {
        container.resolve('NonExistent');
      }).toThrow('Service not registered: NonExistent');
    });

    it('should return singleton reference consistently', () => {
      const mockService = { id: 'unique-id' };
      container.registerSingleton('Singleton', mockService);

      const first = container.resolve('Singleton');
      const second = container.resolve('Singleton');

      expect(first).toBe(second);
      expect(first.id).toBe('unique-id');
    });
  });

  describe('Service Management', () => {
    it('should get all registered services', () => {
      container.register('Service1', () => ({}));
      container.registerSingleton('Service2', {});

      const services = container.getRegisteredServices();

      expect(services).toContain('Service1');
      expect(services).toContain('Service2');
      expect(services.length).toBe(2);
    });

    it('should clear all services', () => {
      container.register('Service1', () => ({}));
      container.registerSingleton('Service2', {});

      container.clear();

      expect(() => {
        container.resolve('Service1');
      }).toThrow();
      expect(() => {
        container.resolve('Service2');
      }).toThrow();
    });

    it('should check if service is registered', () => {
      container.registerSingleton('Registered', {});

      expect(container.isRegistered('Registered')).toBe(true);
      expect(container.isRegistered('NotRegistered')).toBe(false);
    });
  });

  describe('Complex Dependencies', () => {
    it('should support nested dependencies', () => {
      const loggerService = { log: (msg: string) => msg };
      const dataService = { getData: () => 'data' };

      container.registerSingleton('Logger', loggerService);
      container.registerSingleton('DataService', dataService);

      const logger = container.resolve('Logger');
      const data = container.resolve('DataService');

      expect(logger.log('test')).toBe('test');
      expect(data.getData()).toBe('data');
    });

    it('should resolve generic types', () => {
      interface ServiceInterface {
        execute(): string;
      }

      const implementation: ServiceInterface = {
        execute: () => 'executed',
      };

      container.registerSingleton('GenericService', implementation);

      const service = container.resolve<ServiceInterface>('GenericService');

      expect(service.execute()).toBe('executed');
    });
  });
});
