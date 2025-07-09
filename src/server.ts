import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { config } from './config/config.js'

const startServer = async () => {
  const app = express()
  const server = http.createServer(app)

  // CORS configuration
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin) return callback(null, true)
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000'
      ]
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.log(`CORS blocked origin: ${origin}`)
        callback(null, true)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }

  app.use(cors(corsOptions))

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Add debugging middleware
  app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.path}`)
    next()
  })

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      message: 'Live-ToDo Server is running!', 
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV
    })
  })

  try {
    // Connect to Database first
    await connectDB()
    console.log('✅ Database connected successfully')

    // Test basic route first
    console.log('🔧 Adding basic test route...')
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Test route working' })
    })

    // Add auth routes with controller
    console.log('🔧 Adding auth routes with controller...')
    try {
      const authRoutes = await import('./routes/auth.routes.js')
      app.use('/api/auth', authRoutes.default)
      console.log('✅ Auth routes added successfully')
    } catch (error) {
      console.error('❌ Error adding auth routes:', error)
      throw error
    }

    // Add task routes
    console.log('🔧 Adding task routes...')
    try {
      const taskRoutes = await import('./routes/task.routes.js')
      app.use('/api/tasks', taskRoutes.default)
      console.log('✅ Task routes added successfully')
    } catch (error) {
      console.error('❌ Error adding task routes:', error)
      throw error
    }

    // Add team routes
    console.log('🔧 Adding team routes...')
    try {
      const teamRoutes = await import('./routes/team.routes.js')
      app.use('/api/teams', teamRoutes.default)
      console.log('✅ Team routes added successfully')
    } catch (error) {
      console.error('❌ Error adding team routes:', error)
      throw error
    }

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' })
    })

    // Start server
    const PORT = config.PORT || 5000
    server.listen(PORT, () => {
      console.log(`🚀 Live-ToDo Server running on port ${PORT}`)
      console.log(`🌐 Environment: ${config.NODE_ENV}`)
      console.log(`🔗 Test routes:`)
      console.log(`   - GET http://localhost:${PORT}/api/health`)
      console.log(`   - GET http://localhost:${PORT}/api/test`)
      console.log(`   - POST http://localhost:${PORT}/api/auth/register`)
      console.log(`   - POST http://localhost:${PORT}/api/auth/login`)
      console.log(`   - GET http://localhost:${PORT}/api/tasks`)
      console.log(`   - GET http://localhost:${PORT}/api/teams/test`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()