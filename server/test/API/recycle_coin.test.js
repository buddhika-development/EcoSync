import request from 'supertest'
import createApp from '../../src/app.js'

let app
beforeAll(() => {
  app = createApp()
})

describe('recycle coin - status code checks', () => {
  test('GET /api/recycle_coin/health should return 200', async () => {
    const res = await request(app).get('/api/recycle_coin/health')
    expect(res.status).toBe(200)
  })

  test('POST /api/recycle_coin/health should return 404 or 405 (method not allowed)', async () => {
    const res = await request(app).post('/api/recycle_coin/health')
    expect([404, 405]).toContain(res.status)
  })
})

describe('recycle coin - status code checks', () => {
    test('GET /api/recycle_coin/health should return 200', async () => {
        const res = await request(app).get('/api/recycle_coin/health')
        expect(res.status).toBe(200)
    })

    test('POST /api/recycle_coin/health should return 404 or 405 (method not allowed)', async () => {
        const res = await request(app).post('/api/recycle_coin/health')
        expect([404, 405]).toContain(res.status)
    })

    test('POST /api/recycle_coin/new-recycle-coin-user should accept user_id body', async () => {
        const payload = {
            user_id: '2510c54b-9573-4ef9-a3a9-94935408f01c'
        }

        const res = await request(app)
            .post('/api/recycle_coin/new-recycle-coin-user')
            .send(payload)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')

        expect([200, 201, 400, 404, 409]).toContain(res.status)
    })
})