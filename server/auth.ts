import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const PBKDF2_ITERATIONS = 100000; // NIST recommendation
const SALT_LENGTH = 32; // 256 bits

interface JWTPayload {
  userId: string;
  email: string;
}

interface PasswordHash {
  hash: string;
  salt: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  userId?: string;
}

// Simple in-memory token store + user store
const tokens = new Map<string, { userId: string; email: string; expiresAt: number }>();
const users = new Map<string, { id: string; email: string; passwordHash: PasswordHash }>();

export function generateUserId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// PBKDF2 hashing with salt (production-grade security)
export function hashPassword(password: string): PasswordHash {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512')
    .toString('hex');
  
  return { hash, salt };
}

// Verify password against stored hash
export function verifyPassword(password: string, storedHash: PasswordHash): boolean {
  const hash = crypto
    .pbkdf2Sync(password, storedHash.salt, PBKDF2_ITERATIONS, 64, 'sha512')
    .toString('hex');
  
  return hash === storedHash.hash;
}

export function generateJWT(userId: string, email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + JWT_EXPIRES_IN;
  
  tokens.set(token, { userId, email, expiresAt });
  
  return token;
}

export function verifyJWT(token: string): JWTPayload | null {
  const payload = tokens.get(token);
  
  if (!payload) return null;
  if (payload.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  
  return { userId: payload.userId, email: payload.email };
}

// Middleware to check authentication
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  req.userId = payload.userId;
  next();
}

// Register user
export function registerUser(email: string, password: string): { id: string; token: string } | null {
  // Check if user already exists
  const userArray = Array.from(users.values());
  for (const user of userArray) {
    if (user.email === email) {
      return null;
    }
  }

  const userId = generateUserId();
  const passwordHash = hashPassword(password);

  users.set(userId, {
    id: userId,
    email,
    passwordHash
  });

  const token = generateJWT(userId, email);
  return { id: userId, token };
}

// Login user
export function loginUser(email: string, password: string): { id: string; token: string } | null {
  const userArray = Array.from(users.values());

  for (const user of userArray) {
    if (user.email === email && verifyPassword(password, user.passwordHash)) {
      const token = generateJWT(user.id, user.email);
      return { id: user.id, token };
    }
  }

  return null;
}

// Get user by ID
export function getUserById(userId: string) {
  return users.get(userId) || null;
}
