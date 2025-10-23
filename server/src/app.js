import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import health_router from './routes/health.route.js'
import recycle_router from './routes/recycle.route.js'
import authRouter from './routes/auth.route.js'
import meRouter from './routes/me.route.js'
import userRouter from './routes/user.routes.js'
import binRouter from './routes/bin.route.js'
import adminRouter from './routes/admin.route.js'

const create_app = () => {
    dotenv.config()
    const app = express()
    app.use(helmet())
    app.use(express.json());
    app.use(cookieParser());

    app.use(cors({
        origin: process.env.CLIENT_WEB_ORIGIN,
        credentials: true
    }));

    // Health check endpoint
    app.use('/health', health_router)

    // endpoints
    app.use('/api/recycle', recycle_router)
    app.use('/api/auth', authRouter, meRouter)
    app.use('/api/users', userRouter)
    app.use('/api/bins', binRouter)
    app.use('/api/admin', adminRouter)

    return app
}

export default create_app