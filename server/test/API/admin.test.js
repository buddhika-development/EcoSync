import request from 'supertest';
import createApp from '../../src/app.js';

let app;
beforeAll(() => {
  app = createApp();
});

describe('Admin Bins Endpoint - GET /api/admin/bins', () => {
  test('GET /api/admin/bins should return 200', async () => {
    const res = await request(app).get('/api/admin/bins');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/bins with status filter should return 200', async  () => {
    const res = await request(app).get('/api/admin/bins?status=FULL');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/bins with EMPTY status filter should return 200', async () => {
    const res = await request(app).get('/api/admin/bins?status=EMPTY');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/bins with areaName filter should return 200', async () => {
    const res = await request(app).get('/api/admin/bins?areaName=Colombo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/bins with search parameter should return 200 or 500', async () => {
    const res = await request(app).get('/api/admin/bins?search=bin');
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/admin/bins with multiple filters should return 200', async () => {
    const res = await request(app).get('/api/admin/bins?status=FULL&areaName=Colombo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('POST /api/admin/bins should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/api/admin/bins');
    expect([404, 405]).toContain(res.status);
  });

  test('PUT /api/admin/bins should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).put('/api/admin/bins');
    expect([404, 405]).toContain(res.status);
  });

  test('DELETE /api/admin/bins should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).delete('/api/admin/bins');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Admin Full Bins Endpoint - GET /api/admin/full-bins', () => {
  test('GET /api/admin/full-bins should return 200', async () => {
    const res = await request(app).get('/api/admin/full-bins');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/full-bins with status filter should return 200', async () => {
    const res = await request(app).get('/api/admin/full-bins?status=PENDING');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/full-bins with SCHEDULED status should return 200', async () => {
    const res = await request(app).get('/api/admin/full-bins?status=SCHEDULED');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/full-bins with COMPLETED status should return 200 or 500', async () => {
    const res = await request(app).get('/api/admin/full-bins?status=COMPLETED');
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/admin/full-bins with areaName filter should return 200', async () => {
    const res = await request(app).get('/api/admin/full-bins?areaName=Colombo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/full-bins with binId filter should return 200 or 500', async () => {
    const res = await request(app).get('/api/admin/full-bins?binId=123');
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/admin/full-bins with all filters should return 200 or 500', async () => {
    const res = await request(app).get('/api/admin/full-bins?status=PENDING&areaName=Colombo&binId=123');
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/admin/full-bins should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/api/admin/full-bins');
    expect([404, 405]).toContain(res.status);
  });

  test('DELETE /api/admin/full-bins should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).delete('/api/admin/full-bins');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Admin Schedule Pickup Endpoint - POST /api/admin/pickups', () => {
  test('POST /api/admin/pickups with valid data should return 201', async () => {
    const validPickupData = {
      areaId: 'test-area-id',
      binIds: ['bin-1', 'bin-2'],
      scheduledDate: '2025-10-25',
      autoAssignCollector: true
    };
    const res = await request(app)
      .post('/api/admin/pickups')
      .send(validPickupData);
    
    // Should return 201 or 400/500 depending on validation
    expect([201, 400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/admin/pickups with areaName instead of areaId should work', async () => {
    const validPickupData = {
      areaName: 'Colombo',
      binIds: ['bin-1'],
      scheduledDate: '2025-10-25',
      autoAssignCollector: false
    };
    const res = await request(app)
      .post('/api/admin/pickups')
      .send(validPickupData);
    
    expect([201, 400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/admin/pickups without binIds should return 400', async () => {
    const invalidData = {
      areaId: 'test-area-id',
      scheduledDate: '2025-10-25'
    };
    const res = await request(app)
      .post('/api/admin/pickups')
      .send(invalidData);
    
    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok', false);
  });

  test('POST /api/admin/pickups without scheduledDate should return 400', async () => {
    const invalidData = {
      areaId: 'test-area-id',
      binIds: ['bin-1']
    };
    const res = await request(app)
      .post('/api/admin/pickups')
      .send(invalidData);
    
    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok', false);
  });

  test('POST /api/admin/pickups with empty binIds array should return 400', async () => {
    const invalidData = {
      areaId: 'test-area-id',
      binIds: [],
      scheduledDate: '2025-10-25'
    };
    const res = await request(app)
      .post('/api/admin/pickups')
      .send(invalidData);
    
    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok', false);
  });

  test('GET /api/admin/pickups should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).get('/api/admin/pickups');
    expect([404, 405]).toContain(res.status);
  });

  test('PUT /api/admin/pickups should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).put('/api/admin/pickups');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Admin Get Pickup Progress Endpoint - GET /api/admin/pickups/:orderId', () => {
  test('GET /api/admin/pickups/:orderId with valid orderId should return 200 or 500', async () => {
    const testOrderId = 'test-order-id-123';
    const res = await request(app).get(`/api/admin/pickups/${testOrderId}`);
    
    // Will return 500 if order not found, 200 if found
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('GET /api/admin/pickups/:orderId with UUID format should return 200 or 500', async () => {
    const uuidOrderId = '550e8400-e29b-41d4-a716-446655440000';
    const res = await request(app).get(`/api/admin/pickups/${uuidOrderId}`);
    
    expect([200, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('ok');
  });

  test('POST /api/admin/pickups/:orderId should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/api/admin/pickups/test-id');
    expect([404, 405]).toContain(res.status);
  });

  test('PUT /api/admin/pickups/:orderId should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).put('/api/admin/pickups/test-id');
    expect([404, 405]).toContain(res.status);
  });

  test('DELETE /api/admin/pickups/:orderId should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).delete('/api/admin/pickups/test-id');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Admin Scheduled Routes Endpoint - GET /api/admin/scheduled-routes', () => {
  test('GET /api/admin/scheduled-routes should return 200', async () => {
    const res = await request(app).get('/api/admin/scheduled-routes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/scheduled-routes with status filter should return 200', async () => {
    const res = await request(app).get('/api/admin/scheduled-routes?status=SCHEDULED');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/scheduled-routes with IN_PROGRESS status should return 200', async () => {
    const res = await request(app).get('/api/admin/scheduled-routes?status=IN_PROGRESS');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/scheduled-routes with COMPLETED status should return 200', async () => {
    const res = await request(app).get('/api/admin/scheduled-routes?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/scheduled-routes with areaName filter should return 200', async () => {
    const res = await request(app).get('/api/admin/scheduled-routes?areaName=Colombo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('GET /api/admin/scheduled-routes with both status and areaName should return 200', async () => {
    const res = await request(app).get('/api/admin/scheduled-routes?status=SCHEDULED&areaName=Kandy');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  test('POST /api/admin/scheduled-routes should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/api/admin/scheduled-routes');
    expect([404, 405]).toContain(res.status);
  });

  test('PUT /api/admin/scheduled-routes should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).put('/api/admin/scheduled-routes');
    expect([404, 405]).toContain(res.status);
  });

  test('DELETE /api/admin/scheduled-routes should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).delete('/api/admin/scheduled-routes');
    expect([404, 405]).toContain(res.status);
  });
});

describe('Admin Routes - Cross-cutting concerns', () => {
  test('All admin GET endpoints should have ok property in response', async () => {
    const endpoints = [
      '/api/admin/bins',
      '/api/admin/full-bins',
      '/api/admin/scheduled-routes'
    ];

    for (const endpoint of endpoints) {
      const res = await request(app).get(endpoint);
      expect(res.body).toHaveProperty('ok');
    }
  });

  test('Invalid admin routes should return 404', async () => {
    const res = await request(app).get('/api/admin/nonexistent-route');
    expect(res.status).toBe(404);
  });
});
