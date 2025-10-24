import request from 'supertest'
import createApp from '../../src/app.js'

let app
beforeAll(() => {
  app = createApp()
})

describe('Costs and Transactions endpoint - status code checks', () => {
  test('GET /api/costs/health should return 200', async () => {
    const res = await request(app).get('/api/costs/health')
    expect(res.status).toBe(200)
  })

  test('POST /api/costs/health should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/api/costs/health')
    expect([404, 405]).toContain(res.status)
  })
})


describe('Costs and Transactions endpoint - status code checks', () => {
  test('GET /api/costs/calculate_cost/:id should return 200', async () => {
    const res = await request(app).get('/api/costs/calculate_cost/2510c54b-9573-4ef9-a3a9-94935408f01c')
    expect(res.status).toBe(200)
  })

    test('POST /api/costs/calculate_cost/:id should return 404 or 405 (method not allowed)', async () => {
        const res = await request(app).post('/api/costs/calculate_cost/2510c54b-9573-4ef9-a3a9-94935408f01c')
        expect([404, 405]).toContain(res.status)
  })

})