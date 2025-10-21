
export const APPLICATION_CONFIG = {
    PORT : process.env.PORT || 3000,
    APPLICATION_ENVIRONMENT : process.env.NODE_ENV || 'development',
}

export const DATABASE_CONFIG = {
    DB_URL : process.env.DB_URL,
    DB_ANON_KEY : process.env.DB_ANON_KEY
}

export const CORS_CONFIG = [
    process.env.CORS || "http:localhost:3000",    
]
