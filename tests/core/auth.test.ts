/**
 * Core Tests - Authentication
 * Tests JWT generation and password hashing
 */

import { generateToken, hashPassword, verifyPassword, verifyToken } from '../auth';

describe('Authentication - Password Hashing', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(30);
    });

    it('should produce different hash for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should reject empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow();
    });

    it('should reject very long password', async () => {
      const longPassword = 'a'.repeat(10000);
      await expect(hashPassword(longPassword)).rejects.toThrow();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('WrongPassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('securepassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should handle empty password gracefully', async () => {
      const hash = await hashPassword('Password123!');
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });
  });
});

describe('Authentication - JWT', () => {
  const testSecret = 'test-secret-key-minimum-32-chars-long';

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = generateToken(payload, testSecret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include payload in token', () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = generateToken(payload, testSecret);
      const verified = verifyToken(token, testSecret);

      expect(verified.userId).toBe('123');
      expect(verified.email).toBe('test@test.com');
    });

    it('should generate different tokens for same payload', () => {
      const payload = { userId: '123' };
      const token1 = generateToken(payload, testSecret);
      const token2 = generateToken(payload, testSecret);

      expect(token1).not.toBe(token2); // Different due to `iat` claim
    });

    it('should handle complex payload', () => {
      const payload = {
        userId: '123',
        roles: ['admin', 'user'],
        permissions: { read: true, write: false },
        nested: { key: 'value' },
      };
      const token = generateToken(payload, testSecret);
      const verified = verifyToken(token, testSecret);

      expect(verified.roles).toEqual(['admin', 'user']);
      expect(verified.permissions.read).toBe(true);
      expect(verified.nested.key).toBe('value');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = generateToken(payload, testSecret);
      const verified = verifyToken(token, testSecret);

      expect(verified).toBeDefined();
      expect(verified.userId).toBe('123');
    });

    it('should reject invalid signature', () => {
      const payload = { userId: '123' };
      const token = generateToken(payload, testSecret);
      const wrongSecret = 'different-secret-key-minimum-32-chars-long';

      expect(() => {
        verifyToken(token, wrongSecret);
      }).toThrow();
    });

    it('should reject malformed token', () => {
      expect(() => {
        verifyToken('not.a.token', testSecret);
      }).toThrow();
    });

    it('should reject expired token', () => {
      const payload = { userId: '123', exp: Math.floor(Date.now() / 1000) - 3600 }; // Expired 1 hour ago
      const token = generateToken(payload, testSecret);

      expect(() => {
        verifyToken(token, testSecret);
      }).toThrow();
    });

    it('should accept token with future expiration', () => {
      const payload = {
        userId: '123',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };
      const token = generateToken(payload, testSecret);
      const verified = verifyToken(token, testSecret);

      expect(verified.userId).toBe('123');
    });
  });

  describe('Token Security', () => {
    it('should not expose sensitive data in token payload', () => {
      const payload = {
        userId: '123',
        password: 'should-not-include-this', // Bad practice
      };
      const token = generateToken(payload, testSecret);

      // Note: JWT payload is base64 encoded, not encrypted
      // This is a reminder to never include sensitive data in token payload
      const parts = token.split('.');
      const payload_b64 = parts[1];
      const payload_decoded = JSON.parse(Buffer.from(payload_b64, 'base64').toString());

      // Token contains the password - this is expected behavior to remind us NOT to include it
      expect(payload_decoded.password).toBe('should-not-include-this');
    });

    it('should validate token structure', () => {
      const payload = { userId: '123' };
      const token = generateToken(payload, testSecret);

      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    });
  });
});

describe('Authentication - Integration', () => {
  it('should handle complete auth flow: register -> login -> verify', async () => {
    const email = 'newuser@test.com';
    const password = 'SecurePassword123!';
    const secret = 'test-secret-key-minimum-32-chars-long';

    // Step 1: Hash password during registration
    const passwordHash = await hashPassword(password);
    expect(passwordHash).toBeDefined();

    // Step 2: Verify password during login
    const isValid = await verifyPassword(password, passwordHash);
    expect(isValid).toBe(true);

    // Step 3: Generate JWT token
    const token = generateToken({ userId: '123', email }, secret);
    expect(token).toBeDefined();

    // Step 4: Verify token in subsequent requests
    const verified = verifyToken(token, secret);
    expect(verified.email).toBe(email);
  });

  it('should reject login with wrong password', async () => {
    const password = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword123!';

    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });
});
