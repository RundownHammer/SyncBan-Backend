import { Server, Socket } from 'socket.io'
import Task from '../models/task.js'
import User from '../models/user.js'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'  // Add this import

interface AuthenticatedSocket extends Socket {
  userId?: string
  teamId?: string
}

const setupSockets = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      // Use config.JWT_SECRET instead of process.env.JWT_SECRET
      const decoded = jwt.verify(token, config.JWT_SECRET) as any
      const user = await User.findById(decoded.id)
      
      if (!user) {
        return next(new Error('User not found'))
      }

      socket.userId = user._id.toString()
      socket.teamId = user.currentTeam?.toString()
      next()
    } catch (err) {
      next(new Error('Authentication error'))
    }
  })

  // ... rest of your socket code remains the same
}

export default setupSockets