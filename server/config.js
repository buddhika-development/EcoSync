
export const APPLICATION_CONFIG = {
    PORT : process.env.PORT || 8000,
    APPLICATION_ENVIRONMENT : process.env.NODE_ENV || 'development',
}

export const DATABASE_CONFIG = {
    DB_URL : process.env.DB_URL || "https://vueseoefnkrmahcrbivf.supabase.co",
    DB_ANON_KEY : process.env.DB_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZXNlb2VmbmtybWFoY3JiaXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTQ5OTMsImV4cCI6MjA3MTkzMDk5M30.Un-hP8rBHrtFTsXuSGoZIC5CTaE8wN8NjDEDFFZaw6k"
}

export const CORS_CONFIG = [
    process.env.CORS || "http:localhost:3000",    
]
