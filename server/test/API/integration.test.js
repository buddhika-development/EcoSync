import request from 'supertest';
import create_app from '../../src/app.js';

const app = create_app();

describe('GET /health', () => {
  it("should return API health status", async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
  })
})