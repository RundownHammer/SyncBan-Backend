import express, { type Request, type Response, type NextFunction } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { config } from './config/config.js'
import setupSockets from './sockets/index.js'

const startServer = async () => {
  const app = express()
  const server = http.createServer(app)

  const getAllowedOrigins = () => {
    const origins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'http://localhost:5000'
    ]
    
    // Add production origins
    if (config.NODE_ENV === 'production') {
      origins.push(
        'https://planhive.netlify.app',  // Update with your actual frontend URL
        'https://planhive-backend.onrender.com'  // Your backend URL
      )
    }
    
    return origins
  }

  // CORS configuration
  const corsOptions = {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }

  console.log('🔧 CORS_ORIGINS:', getAllowedOrigins())

  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions))

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Debugging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`🔍 ${req.method} ${req.path}`)
    next()
  })

  // Health check endpoints
  app.get('/', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      message: 'PlanHive Server is running',  // Changed
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  })

  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy', 
      message: 'Health check passed',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  })

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok',
      message: 'PlanHive API is running!',  // Changed
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV
    })
  })

  try {
    // Connect to Database
    await connectDB()
    console.log('✅ Database connected successfully')

    // Test route
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ message: 'Test route working' })
    })

    // Add routes
    const authRoutes = await import('./routes/auth.routes.js')
    app.use('/api/auth', authRoutes.default)
    console.log('✅ Auth routes added')

    const taskRoutes = await import('./routes/task.routes.js')
    app.use('/api/tasks', taskRoutes.default)
    console.log('✅ Task routes added')

    const teamRoutes = await import('./routes/team.routes.js')
    app.use('/api/teams', teamRoutes.default)
    console.log('✅ Team routes added')

    const activityRoutes = await import('./routes/activity.routes.js')
    app.use('/api/activities', activityRoutes.default)
    console.log('✅ Activity routes added')

    // Setup Socket.IO event handlers
    setupSockets(io)
    console.log('✅ Socket.IO setup complete')

    // 404 handler
    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
      })
    })

    // Start server
    const PORT = parseInt(process.env.PORT || String(config.PORT) || '5000', 10)
    const HOST = '0.0.0.0'

    server.listen(PORT, HOST, () => {
      console.log(`🚀 PlanHive Server running on ${HOST}:${PORT}`)  // Changed
      console.log(`🌐 Environment: ${config.NODE_ENV}`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

startServer()