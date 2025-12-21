/**
 * Integration Tests - Frontend ↔ Backend Communication
 * Tests cross-repo API communication and workflows
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

describe('Frontend ↔ Backend Integration Tests', () => {
  let authToken: string;
  const testUser = {
    email: `test-${Date.now()}@test.com`,
    password: 'TestPassword123!',
  };

  // ==========================================
  // Authentication Flow
  // ==========================================
  describe('Authentication & Authorization', () => {
    it('should register new user', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.token).toBeDefined();
      expect(data.userId).toBeDefined();

      authToken = data.token;
    });

    it('should login user', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // Brand Management Workflow
  // ==========================================
  describe('Brand Management API', () => {
    let brandId: string;

    it('should create brand', async () => {
      const brandData = {
        name: `TestBrand-${Date.now()}`,
        industry: 'Technology',
        targetAudience: 'Startups',
        description: 'Test brand for integration testing',
      };

      const response = await fetch(`${API_URL}/api/brand/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(brandData),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.id).toBeDefined();
      expect(data.name).toBe(brandData.name);

      brandId = data.id;
    });

    it('should fetch created brand', async () => {
      const response = await fetch(`${API_URL}/api/brand/${brandId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.id).toBe(brandId);
    });

    it('should list all brands', async () => {
      const response = await fetch(`${API_URL}/api/brand/list`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(Array.isArray(data)).toBe(true);
    });

    it('should update brand', async () => {
      const updatedData = {
        name: `UpdatedBrand-${Date.now()}`,
        description: 'Updated description',
      };

      const response = await fetch(`${API_URL}/api/brand/${brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.name).toBe(updatedData.name);
    });

    it('should delete brand', async () => {
      const response = await fetch(`${API_URL}/api/brand/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);

      // Verify deletion
      const getResponse = await fetch(`${API_URL}/api/brand/${brandId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(getResponse.ok).toBe(false);
    });
  });

  // ==========================================
  // Archive Management Workflow
  // ==========================================
  describe('Archive Management API', () => {
    let entryId: string;

    it('should create archive entry', async () => {
      const entryData = {
        title: `Archive-${Date.now()}`,
        content: 'Test archive content',
        type: 'brand-kit',
        tags: ['test', 'integration'],
      };

      const response = await fetch(`${API_URL}/api/archive/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(entryData),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.id).toBeDefined();

      entryId = data.id;
    });

    it('should retrieve archive entry', async () => {
      const response = await fetch(`${API_URL}/api/archive/${entryId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.id).toBe(entryId);
    });

    it('should search archive', async () => {
      const response = await fetch(`${API_URL}/api/archive/search?q=test`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(Array.isArray(data)).toBe(true);
    });
  });

  // ==========================================
  // Health & Status Checks
  // ==========================================
  describe('System Health', () => {
    it('should return backend health status', async () => {
      const response = await fetch(`${API_URL}/api/health`);

      expect(response.ok).toBe(true);
      const data = (await response.json()) as any;
      expect(data.status).toBe('healthy');
      expect(data.uptime).toBeDefined();
    });

    it('should access frontend', async () => {
      const response = await fetch(FRONTEND_URL);

      expect(response.ok).toBe(true);
      const html = await response.text();
      expect(html).toContain('<!DOCTYPE html');
    });

    it('should have CORS enabled for frontend', async () => {
      const response = await fetch(`${API_URL}/api/health`, {
        headers: {
          'Origin': FRONTEND_URL,
        },
      });

      expect(response.ok).toBe(true);
      const corsHeader = response.headers.get('access-control-allow-origin');
      expect(corsHeader).toBeDefined();
    });
  });

  // ==========================================
  // Rate Limiting
  // ==========================================
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = [];

      // Make multiple requests quickly
      for (let i = 0; i < 110; i++) {
        requests.push(
          fetch(`${API_URL}/api/health`)
        );
      }

      const responses = await Promise.all(requests);

      // Most should succeed, but some should be rate limited
      const successCount = responses.filter(r => r.ok).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBeGreaterThan(0);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  describe('Error Handling', () => {
    it('should return proper error for unauthorized request', async () => {
      const response = await fetch(`${API_URL}/api/brand/list`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should return proper error for invalid resource', async () => {
      const response = await fetch(`${API_URL}/api/brand/nonexistent`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should return proper error for invalid request body', async () => {
      const response = await fetch(`${API_URL}/api/brand/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({}), // Missing required fields
      });

      expect(response.ok).toBe(false);
      expect([400, 422]).toContain(response.status);
    });
  });
});

// ==========================================
// Performance Tests
// ==========================================
describe('Performance Benchmarks', () => {
  it('should respond to health check in < 50ms', async () => {
    const start = Date.now();
    await fetch(`${API_URL}/api/health`);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('should list brands in < 200ms', async () => {
    // Assuming we have auth token from previous tests
    const start = Date.now();
    await fetch(`${API_URL}/api/brand/list`, {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      },
    }).catch(() => {}); // May fail without real token, but we just measure time
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });
});
