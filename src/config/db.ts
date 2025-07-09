import mongoose from 'mongoose'
import { config } from './config.js'

export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...')
    console.log('🔧 Using MONGO_URI:', config.MONGO_URI ? 'Set ✅' : 'Missing ❌')
    
    if (!config.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined')
    }

    const conn = await mongoose.connect(config.MONGO_URI, {
      retryWrites: true,
      w: 'majority'
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error)
    console.error('🔧 Available environment variables:')
    console.error(Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('JWT') || key.includes('NODE')
    ))
    process.exit(1)
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB')
})