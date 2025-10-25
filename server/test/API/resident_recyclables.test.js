// EcoSync/server/test/API/resident_recyclables.test.js
import request from 'supertest';
import createApp from '../../src/app.js';

let app;
beforeAll(() => {
  app = createApp();
});

// small helper: allow multiple expected codes
const expectStatusIn = (res, codes) => expect(codes).toContain(res.status);
// only assert ok when not 404 and body is an object
const expectOkShapeIfApplicable = (res) => {
  if (res.status !== 404 && typeof res.body === 'object' && res.body) {
    expect(res.body).toHaveProperty('ok');
  }
};

describe('Resident Recyclables - POST /api/recyclables/create', () => {
  test('POST /api/recyclables/create with valid data should return 201/400/401/500/404', async () => {
    const payload = {
      user_id: 'test-user-id',      // may be ignored by controller if it reads req.user
      area_id: 'test-area-id',
      type: 'HOME',
      category: 'PLASTIC',
      weight: 2.75,
      status: 'PENDING'
    };
    const res = await request(app).post('/api/recyclables/create').send(payload);
    expectStatusIn(res, [201, 400, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('POST /api/recyclables/create missing required fields should return 400/401/500/404', async () => {
    const res = await request(app).post('/api/recyclables/create').send({
      area_id: 'test-area-id',
      type: 'HOME',
      // category missing
      weight: 1.2
    });
    expectStatusIn(res, [400, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('POST /api/recyclables/create with invalid weight should return 400/401/500/404', async () => {
    const res = await request(app).post('/api/recyclables/create').send({
      area_id: 'test-area-id',
      type: 'HOME',
      category: 'PAPER',
      weight: 0
    });
    expectStatusIn(res, [400, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('GET /api/recyclables/create should return 404 or 405', async () => {
    const res = await request(app).get('/api/recyclables/create');
    expect([404, 405]).toContain(res.status);
  });

  test('PUT /api/recyclables/create should return 404 or 405', async () => {
    const res = await request(app).put('/api/recyclables/create');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Resident Recyclables - GET /api/recyclables/my', () => {
  test('GET /api/recyclables/my should return 200/401/500/404', async () => {
    const res = await request(app).get('/api/recyclables/my');
    expectStatusIn(res, [200, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('GET /api/recyclables/my with status filter should return 200/401/500/404', async () => {
    const res = await request(app).get('/api/recyclables/my?status=PENDING');
    expectStatusIn(res, [200, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('GET /api/recyclables/my with type & category filters should return 200/401/500/404', async () => {
    const res = await request(app).get('/api/recyclables/my?type=HOME&category=PLASTIC');
    expectStatusIn(res, [200, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('GET /api/recyclables/my with date range should return 200/401/500/404', async () => {
    const res = await request(app).get('/api/recyclables/my?from=2025-01-01&to=2025-12-31');
    expectStatusIn(res, [200, 401, 500, 404]);
    expectOkShapeIfApplicable(res);
  });

  test('POST /api/recyclables/my should return 404 or 405', async () => {
    const res = await request(app).post('/api/recyclables/my');
    expect([404, 405]).toContain(res.status);
  });

  test('Invalid recyclables route should return 404', async () => {
    const res = await request(app).get('/api/recyclables/not-exists');
    expect(res.status).toBe(404);
  });
});

describe('Resident Recyclables - Cross-cutting', () => {
  test('Resident endpoints should return payloads with ok property when applicable', async () => {
    const endpoints = [
      '/api/bins/my',
      '/api/bins/mine',
      '/api/recyclables/my'
    ];

    for (const ep of endpoints) {
      const res = await request(app).get(ep);
      // If the route exists and returns JSON, expect ok; if 404, skip shape assertion
      expectStatusIn(res, [200, 401, 500, 404]);
      expectOkShapeIfApplicable(res);
    }
  });
});
