/**
 * Jest Setup File - Global Test Configuration
 */

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-with-32-minimum-chars-required!!!';
process.env.SESSION_SECRET = 'test-session-secret-with-32-minimum-chars!!!';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-minimum!!!';
process.env.DATABASE_URL = 'sqlite::memory:';
process.env.DEEPSEEK_API_KEY = 'test-key';

// Global test utilities
beforeAll(() => {
  // Setup before all tests
});

afterAll(() => {
  // Cleanup after all tests
});

// Extend Jest matchers if needed
expect.extend({
  toBeValidJWT(received: string) {
    const isValid = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(received);
    return {
      pass: isValid,
      message: () => `Expected ${received} to be a valid JWT format`,
    };
  },
});
