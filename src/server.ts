import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import taskRoutes from './routes/task.routes.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
})

app.use(cors())
app.use(express.json())

// Connect DB
await connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

// Socket setup
import setupSockets from './sockets/index.js'
setupSockets(io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
