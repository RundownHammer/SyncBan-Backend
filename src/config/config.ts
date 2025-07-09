import dotenv from 'dotenv'

dotenv.config()

export const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // CORS origins based on environment
  CORS_ORIGINS: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL!]  // Remove the hardcoded domain
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
    
  // Database options
  DB_OPTIONS: {
    retryWrites: true,
    w: 'majority'
  }
}