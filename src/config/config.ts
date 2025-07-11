import dotenv from 'dotenv'

dotenv.config()

export const config = {
  PORT: parseInt(process.env.PORT || '5000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  CLIENT_URL: process.env.CLIENT_URL || (
    process.env.NODE_ENV === 'production' 
      ? 'https://planhive.netlify.app' 
      : 'http://localhost:5173'
  )
}

// Debug configuration
console.log('🔧 Final Configuration:')
console.log(`- PORT: ${config.PORT}`)
console.log(`- NODE_ENV: ${config.NODE_ENV}`)
console.log(`- CLIENT_URL: ${config.CLIENT_URL}`)
console.log(`- MONGO_URI configured: ${!!config.MONGO_URI}`)
console.log(`- JWT_SECRET configured: ${!!config.JWT_SECRET}`)