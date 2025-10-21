import express from 'express'
import { sendResponse, SUCCESS } from '../libs/response.js'
import health_router from './routes/health.route.js'
import recycle_router from './routes/recycle.route.js'

const create_app = () => {
    const app = express()
    app.use(express.json())
    
    // Health check endpoint
    app.use('/health', health_router)

    // endpoints
    app.use('/api/recycle', recycle_router)
    
    return app
}

export default create_app