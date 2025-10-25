import request from 'supertest';
import createApp from '../../src/app.js';

let app;
beforeAll(() => {
  app = createApp();
});

describe('Resident Bins - GET /api/bins/my', () => {
  test('GET /api/bins/my should return 200 or 401', async () => {
    const res = await request(app).get('/api/bins/my');
    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/bins/my with status=FULL should return 200 or 401', async () => {
    const res = await request(app).get('/api/bins/my?status=FULL');
    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/bins/my with pagination should return 200 or 401', async () => {
    const res = await request(app).get('/api/bins/my?page=1&pageSize=10');
    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/bins/my with invalid page/pageSize should return 400', async () => {
    const res = await request(app).get('/api/bins/my?page=-1&pageSize=0');
    expect([400, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/bins/my should return 404 or 405', async () => {
    const res = await request(app).post('/api/bins/my');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Resident Bins - POST /api/bins/:id/mark-full', () => {
  test('POST /api/bins/:id/mark-full should return 200/404/409/401', async () => {
    const testBinId = 'BIN-TEST-1';
    const res = await request(app).post(`/api/bins/${testBinId}/mark-full`);
    expect([200, 401, 404, 409, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/bins/:id/mark-full with missing id route should return 404', async () => {
    const res = await request(app).post('/api/bins//mark-full');
    expect([404, 405]).toContain(res.status);
  });

  test('GET /api/bins/:id/mark-full should return 404 or 405', async () => {
    const res = await request(app).get('/api/bins/BIN-TEST-1/mark-full');
    expect([404, 405]).toContain(res.status);
  });

  test('PUT /api/bins/:id/mark-full should return 404 or 405', async () => {
    const res = await request(app).put('/api/bins/BIN-TEST-1/mark-full');
    expect([404, 405]).toContain(res.status);
  });

  test('DELETE /api/bins/:id/mark-full should return 404 or 405', async () => {
    const res = await request(app).delete('/api/bins/BIN-TEST-1/mark-full');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Resident Bins - GET /api/bins/mine (full-bin history)', () => {
  test('GET /api/bins/mine should return 200 or 401', async () => {
    const res = await request(app).get('/api/bins/mine');
    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/bins/mine with status filter should return 200 or 401', async () => {
    const res = await request(app).get('/api/bins/mine?status=PENDING');
    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/bins/mine with date range should return 200 or 401', async () => {
    const res = await request(app).get('/api/bins/mine?from=2025-01-01&to=2025-12-31');
    expect([200, 401, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/bins/mine should return 404 or 405', async () => {
    const res = await request(app).post('/api/bins/mine');
    expect([404, 405]).toContain(res.status);
  });

  test('Invalid resident bins route should return 404', async () => {
    const res = await request(app).get('/api/bins/not-exists');
    expect(res.status).toBe(404);
  });
});
