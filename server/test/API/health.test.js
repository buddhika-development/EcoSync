import request from 'supertest'
import createApp from '../../src/app.js'

let app
beforeAll(() => {
  app = createApp()
})

describe('Health endpoint - status code checks', () => {
  test('GET /health should return 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  test('POST /health should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/health')
    expect([404, 405]).toContain(res.status)
  })
})
