/**
 * @jest-environment node
 */

// Robust Mock for Firebase Admin
jest.mock('@/lib/firebaseAdmin', () => {
  return {
    adminAuth: {
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'valid-admin-token') {
          return { uid: 'admin-uid', email: 'admin@webzeroo.com' };
        }
        if (token === 'valid-learner-token') {
          return { uid: 'learner-uid', email: 'learner@webzeroo.com' };
        }
        throw new Error('Invalid token');
      }),
    },
    adminDb: {
      collection: jest.fn(() => ({
        get: jest.fn(async () => ({
          docs: [
            { id: '1', data: () => ({ title: 'Secure React Course', role: 'admin' }) },
            { id: '2', data: () => ({ title: 'DevSecOps Masterclass', role: 'learner' }) }
          ],
          size: 2,
        })),
        doc: jest.fn(() => ({
          get: jest.fn(async () => ({ 
            exists: true, 
            data: () => ({ role: 'admin', email: 'admin@webzeroo.com' }) 
          })),
          set: jest.fn(async () => true),
        })),
        add: jest.fn(async () => ({ id: 'new-document-id' })),
        where: jest.fn(() => ({
          get: jest.fn(async () => ({ docs: [], size: 0 })),
        })),
      })),
    },
  };
});

describe('API Security & Functional Tests', () => {

  // ==========================================
  // LOGIN ENDPOINT
  // ==========================================
  describe('POST /api/login', () => {
    it('[Hacker Path] should return 400 if no token provided', async () => {
      const { POST } = require('@/app/api/login/route');
      const request = { json: async () => ({}) };
      const response = await POST(request);
      const body = await response.json();
      
      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid or missing ID token');
    });

    it('[Happy Path] should return 200 and set cookie with valid token', async () => {
      const { POST } = require('@/app/api/login/route');
      const request = { json: async () => ({ idToken: 'valid-admin-token' }) };
      const response = await POST(request);
      const body = await response.json();
      
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  // ==========================================
  // COURSES ENDPOINT
  // ==========================================
  describe('GET /api/courses', () => {
    it('[Hacker Path] should return 401 without auth header', async () => {
      const { GET } = require('@/app/api/courses/route');
      const request = { headers: { get: () => null } };
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('[Happy Path] should return 200 and courses array with valid auth', async () => {
      const { GET } = require('@/app/api/courses/route');
      const request = { headers: { get: () => 'Bearer valid-learner-token' } };
      const response = await GET(request);
      const body = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(2);
      expect(body[0].title).toBe('Secure React Course');
    });
  });

  // ==========================================
  // SUBMIT ENDPOINT
  // ==========================================
  describe('POST /api/submit', () => {
    it('[Hacker Path] should return 401 without auth', async () => {
      const { POST } = require('@/app/api/submit/route');
      const request = { headers: { get: () => null } };
      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('[Happy Path] should return 200 and success message on valid submission', async () => {
      const { POST } = require('@/app/api/submit/route');
      const request = { 
        headers: { get: () => 'Bearer valid-learner-token' },
        json: async () => ({ answers: { q1: 'A' }, courseId: '123' })
      };
      const response = await POST(request);
      const body = await response.json();
      
      expect(response.status).toBe(200);
      expect(body.message).toBe('Assessment submitted successfully');
    });
  });

  // ==========================================
  // REPORTS ENDPOINT
  // ==========================================
  describe('GET /api/reports', () => {
    it('[Hacker Path] should return 401 without auth', async () => {
      const { GET } = require('@/app/api/reports/route');
      const request = { headers: { get: () => null } };
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('[Happy Path] should return 200 and stats object for valid Admin', async () => {
      const { GET } = require('@/app/api/reports/route');
      const request = { headers: { get: () => 'Bearer valid-admin-token' } };
      const response = await GET(request);
      const body = await response.json();
      
      expect(response.status).toBe(200);
      expect(body).toHaveProperty('totalUsers');
      expect(body).toHaveProperty('totalCourses');
    });
  });
});
