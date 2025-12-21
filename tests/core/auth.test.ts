/**
 * Core Tests - Authentication
 * Tests JWT generation and password hashing
 */

import { generateJWT, hashPassword, verifyJWT, verifyPassword } from '../../server/auth';

describe('Authentication - Password Hashing', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', () => {
      const password = 'SecurePassword123!';
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.hash).not.toBe(password);
      expect(hash.hash.length).toBeGreaterThan(30);
    });

    it('should produce different hash for same password', () => {
      const password = 'SecurePassword123!';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1.hash).not.toBe(hash2.hash); // Different salts
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'SecurePassword123!';
      const hash = hashPassword(password);
      const isValid = verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = 'SecurePassword123!';
      const hash = hashPassword(password);
      const isValid = verifyPassword('WrongPassword123!', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('JWT', () => {
    it('should generate JWT', () => {
      const token = generateJWT('user123', 'user@example.com');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(30);
    });

    it('should verify valid JWT', () => {
      const token = generateJWT('user123', 'user@example.com');
      const payload = verifyJWT(token);

      expect(payload).toBeDefined();
      if (payload) {
        expect(payload.userId).toBe('user123');
        expect(payload.email).toBe('user@example.com');
      }
    });

    it('should reject invalid JWT', () => {
      const payload = verifyJWT('invalid-token-xyz');

      expect(payload).toBeNull();
    });
  });
});
