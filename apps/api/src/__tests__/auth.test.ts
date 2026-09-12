import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';

describe('Authentication API (/api/auth)', () => {
  const testUser = {
    name: 'Jane Doe',
    email: 'jane.auth@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    // Clean up test user before each run
    await prisma.user.deleteMany({
      where: { email: testUser.email.toLowerCase() },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email.toLowerCase() },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('successfully registers a new user with hashed password and sets httpOnly token cookie without exposing token in JSON', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.token).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('token=');
      expect(res.headers['set-cookie'][0]).toMatch(/httponly/i);
    });

    it('rejects duplicate email registration with 409 Conflict', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(testUser);

      // Duplicate registration
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already exists');
    });

    it('rejects short passwords with 400 Bad Request', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('successfully logs in with valid credentials and sets httpOnly token cookie without exposing token in JSON', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('token=');
      expect(res.headers['set-cookie'][0]).toMatch(/httponly/i);
    });

    it('rejects invalid password with 401 Unauthorized', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid email or password/i);
    });

    it('rejects non-existent email with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'doesnotexist@example.com',
        password: 'somepassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current authenticated user when valid cookie is provided', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      const cookie = reg.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('returns current authenticated user when valid Bearer token is provided', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      const cookie = reg.headers['set-cookie'];
      const tokenMatch = cookie[0].match(/token=([^;]+)/);
      const rawToken = tokenMatch ? tokenMatch[1] : '';

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${rawToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('rejects request with 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Authentication required/i);
    });

    it('rejects request with 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-string');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Invalid or expired/i);
    });
  });
});
