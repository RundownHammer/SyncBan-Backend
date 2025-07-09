import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { config } from './config/config.js'
import authRoutes from './routes/auth.routes.js'
import taskRoutes from './routes/task.routes.js'
import teamRoutes from './routes/team.routes.js'
import setupSockets from './sockets/index.js'

const app = express()
const server = http.createServer(app)

// More permissive CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Allow your frontend domains
    const allowedOrigins = [
      'https://syncban.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000'
    ]
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log(`CORS blocked origin: ${origin}`)
      callback(null, true) // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

// Socket.IO with fixed CORS
const io = new Server(server, {
  cors: {
    origin: ['https://syncban.netlify.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Add preflight handling
app.options('*', cors(corsOptions))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint (move before database connection)
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Live-ToDo Server is running!', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    cors: {
      allowedOrigins: ['https://syncban.netlify.app', 'http://localhost:5173']
    }
  })
})

// Connect to Database
try {
  await connectDB()
  console.log('✅ Database connected successfully')
} catch (error) {
  console.error('❌ Database connection failed:', error)
  process.exit(1)
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/teams', teamRoutes)

// Setup Socket.IO
setupSockets(io)

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err)
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Start server
const PORT = config.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Live-ToDo Server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`🌐 Environment: ${config.NODE_ENV}`)
  console.log(`🔗 CORS enabled for: https://syncban.netlify.app`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})