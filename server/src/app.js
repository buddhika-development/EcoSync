import express from 'express'
import { sendResponse, SUCCESS } from '../libs/response.js'
import health_router from './routes/health.js'

const create_app = () => {
    const app = express()
    
    // Health check endpoint
    app.use('/health', health_router)
    
    return app
}

export default create_app