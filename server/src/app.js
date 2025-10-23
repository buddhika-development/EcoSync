import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import health_router from './routes/health.route.js'
import recycle_router from './routes/recycle.route.js'
import transaction_router from './routes/transaction.route.js'
import recycle_coin_router from './routes/recycle_coin.route.js'
import cost_router from './routes/costs.route.js'
import authRouter from './routes/auth.route.js'
import meRouter from './routes/me.route.js'
import userRouter from './routes/user.routes.js'
import binRouter from './routes/bin.route.js'
import collectorRouter from './routes/collector.route.js'
// import recyclableRouter from './routes/recyclable.route.js'
import adminRouter from './routes/admin.route.js'
import recyclablesRouter from './routes/recyclables.route.js'

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
    app.use('/api/costs', cost_router)
    app.use('/api/transaction', transaction_router)
    app.use('/api/recycle_coin', recycle_coin_router)
    
    app.use('/api/auth', authRouter, meRouter)
    app.use('/api/users', userRouter)
    app.use('/api/bins', binRouter)
    app.use('/api/collector', collectorRouter)
    // app.use('/api/recyclable', recyclableRouter)
    app.use('/api/admin', adminRouter)
    app.use("/api/recyclables", recyclablesRouter)

    return app
}

export default create_app