import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import type { HealthCheckResponse } from '@cinescope/shared';

describe('GET /api/health', () => {
  it('should return 200 OK with health status information', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);

    const body = response.body as HealthCheckResponse;
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.environment).toBe('string');
    expect(new Date(body.timestamp).getTime()).not.toBeNaN();
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Resource not found: GET /api/unknown-endpoint',
        statusCode: 404,
      },
    });
  });
});
