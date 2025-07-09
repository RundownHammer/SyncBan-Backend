// Don't use dotenv in production - Railway provides env vars directly
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv')
  dotenv.config()
}

// Log environment variables for debugging
console.log('🔍 Environment Variables Status:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('MONGO_URI available:', !!process.env.MONGO_URI)
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET)
console.log('CLIENT_URL:', process.env.CLIENT_URL)

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined')
  console.error('Available env vars:', Object.keys(process.env).sort())
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined')
  console.error('Available env vars:', Object.keys(process.env).sort())
  process.exit(1)
}

export const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'production',
  CLIENT_URL: process.env.CLIENT_URL || 'https://syncban.netlify.app',
  
  // CORS origins based on environment
  CORS_ORIGINS: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || 'https://syncban.netlify.app']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
}

// Log final configuration
console.log('🔧 Final Configuration:')
console.log('- PORT:', config.PORT)
console.log('- NODE_ENV:', config.NODE_ENV)
console.log('- CLIENT_URL:', config.CLIENT_URL)
console.log('- MONGO_URI configured:', !!config.MONGO_URI)
console.log('- JWT_SECRET configured:', !!config.JWT_SECRET)
console.log('- CORS_ORIGINS:', config.CORS_ORIGINS)