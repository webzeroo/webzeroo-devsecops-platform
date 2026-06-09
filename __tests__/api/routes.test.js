/**
 * @jest-environment node
 */

// Mock Firebase Admin
jest.mock('@/lib/firebaseAdmin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(() => ({
      get: jest.fn(() => ({
        docs: [],
        size: 0,
      })),
      doc: jest.fn(() => ({
        get: jest.fn(() => ({ exists: true, data: () => ({ role: 'admin', email: 'admin@webzeroo.com' }) })),
        set: jest.fn(),
      })),
      add: jest.fn(() => ({ id: 'test-id' })),
      where: jest.fn(() => ({
        get: jest.fn(() => ({ docs: [], size: 0 })),
      })),
    })),
  },
}));

describe('API Routes', () => {
  describe('POST /api/login', () => {
    it('should return 400 if no token provided', async () => {
      const { POST } = require('@/app/api/login/route');
      const request = {
        json: async () => ({}),
      };
      const response = await POST(request);
      const body = await response.json();
      
      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid or missing ID token');
    });
  });

  describe('GET /api/courses', () => {
    it('should return 401 without auth header', async () => {
      const { GET } = require('@/app/api/courses/route');
      const request = {
        headers: {
          get: () => null,
        },
      };
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/submit', () => {
    it('should return 401 without auth', async () => {
      const { POST } = require('@/app/api/submit/route');
      const request = {
        headers: {
          get: () => null,
        },
      };
      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/reports', () => {
    it('should return 401 without auth', async () => {
      const { GET } = require('@/app/api/reports/route');
      const request = {
        headers: {
          get: () => null,
        },
      };
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });
});
