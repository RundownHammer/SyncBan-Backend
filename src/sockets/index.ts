import { Server, Socket } from 'socket.io'
import Task from '../models/task.js'
import User from '../models/user.js'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

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

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
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

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🟢 Socket connected: ${socket.id}, User: ${socket.userId}`)

    // Join team room for real-time updates
    if (socket.teamId) {
      socket.join(`team:${socket.teamId}`)
      console.log(`👥 User ${socket.userId} joined team room: ${socket.teamId}`)
    }

    // Handle task creation
    socket.on('task:create', async (taskData) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', { message: 'You are not in any team' })
          return
        }

        const task = new Task({
          ...taskData,
          team: new mongoose.Types.ObjectId(socket.teamId),
          createdBy: new mongoose.Types.ObjectId(socket.userId!)
        })

        await task.save()
        await task.populate('createdBy', 'username email')

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:created', task)
        
        console.log(`📝 Task created: ${task.title} by user ${socket.userId}`)
      } catch (error) {
        console.error('Socket create task error:', error)
        socket.emit('error', { message: 'Error creating task', error })
      }
    })

    // Handle task updates
    socket.on('task:update', async (taskData) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', { message: 'You are not in any team' })
          return
        }

        const task = await Task.findOne({ 
          _id: taskData._id, 
          team: socket.teamId 
        })

        if (!task) {
          socket.emit('error', { message: 'Task not found' })
          return
        }

        // Set who modified the task for history tracking
        (task as any).lastModifiedBy = new mongoose.Types.ObjectId(socket.userId!)

        Object.assign(task, taskData)
        await task.save()
        await task.populate('createdBy', 'username email')

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:updated', task)
        
        console.log(`✏️ Task updated: ${task.title} by user ${socket.userId}`)
      } catch (error) {
        console.error('Socket update task error:', error)
        socket.emit('error', { message: 'Error updating task', error })
      }
    })

    // Handle task deletion
    socket.on('task:delete', async (taskId) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', { message: 'You are not in any team' })
          return
        }

        const task = await Task.findOneAndDelete({ 
          _id: taskId, 
          team: socket.teamId 
        })

        if (!task) {
          socket.emit('error', { message: 'Task not found' })
          return
        }

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:deleted', taskId)
        
        console.log(`🗑️ Task deleted: ${task.title} by user ${socket.userId}`)
      } catch (error) {
        console.error('Socket delete task error:', error)
        socket.emit('error', { message: 'Error deleting task', error })
      }
    })

    // Handle task movement between columns
    socket.on('task:move', async ({ taskId, newStatus, newIndex }) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', { message: 'You are not in any team' })
          return
        }

        const task = await Task.findOne({ 
          _id: taskId, 
          team: socket.teamId 
        })

        if (!task) {
          socket.emit('error', { message: 'Task not found' })
          return
        }

        // Set who modified the task for history tracking
        (task as any).lastModifiedBy = new mongoose.Types.ObjectId(socket.userId!)

        task.status = newStatus
        await task.save()
        await task.populate('createdBy', 'username email')

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:moved', {
          task,
          newStatus,
          newIndex
        })
        
        console.log(`🔄 Task moved: ${task.title} to ${newStatus} by user ${socket.userId}`)
      } catch (error) {
        console.error('Socket move task error:', error)
        socket.emit('error', { message: 'Error moving task', error })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`)
    })
  })
}

export default setupSockets