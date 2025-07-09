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

// Socket.IO with environment-aware CORS
const io = new Server(server, {
  cors: { 
    origin: config.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
})

// CORS middleware
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to Database
await connectDB()

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/teams', teamRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Live-ToDo Server is running!', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0'
  })
})

// Serve static files in production
if (config.NODE_ENV === 'production') {
  app.use(express.static('dist/public'))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
  })
}

// Setup Socket.IO
setupSockets(io)

// Start server
server.listen(config.PORT, () => {
  console.log(`🚀 Live-ToDo Server running on port ${config.PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`🌐 Environment: ${config.NODE_ENV}`)
  console.log(`🔗 CORS enabled for: ${config.CORS_ORIGINS.join(', ')}`)
  
  if (config.NODE_ENV === 'development') {
    console.log(`📋 API Documentation: http://localhost:${config.PORT}/api/health`)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})