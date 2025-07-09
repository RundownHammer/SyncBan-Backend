import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('MONGO') || key.startsWith('JWT')))
    process.exit(1)
  }
}

export const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || 'production',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // CORS origins based on environment
  CORS_ORIGINS: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || 'https://your-netlify-app.netlify.app']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
    
  // Database options
  DB_OPTIONS: {
    retryWrites: true,
    w: 'majority'
  }
}

// Log configuration (without sensitive data)
console.log('🔧 Configuration loaded:')
console.log('- PORT:', config.PORT)
console.log('- NODE_ENV:', config.NODE_ENV)
console.log('- CLIENT_URL:', config.CLIENT_URL)
console.log('- MONGO_URI:', config.MONGO_URI ? 'Set ✅' : 'Missing ❌')
console.log('- JWT_SECRET:', config.JWT_SECRET ? 'Set ✅' : 'Missing ❌')