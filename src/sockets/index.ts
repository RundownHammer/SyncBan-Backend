import { Server, Socket } from 'socket.io'
import Task from '../models/task.js'
import User from '../models/user.js'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { logActivity } from '../Controllers/activity.controller.js'

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

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('🔌 User connected:', socket.userId)

    // Join team room
    if (socket.teamId) {
      socket.join(`team:${socket.teamId}`)
      console.log('👥 User joined team room:', socket.teamId)
    }

    // Handle task creation
    socket.on('task:create', async (taskData) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', 'No team selected')
          return
        }

        const newTask = new Task({
          ...taskData,
          team: socket.teamId,
          createdBy: socket.userId
        })

        await newTask.save()
        const populatedTask = await Task.findById(newTask._id)
          .populate('createdBy', 'username')
          .populate('assignedTo', 'username')

        if (!populatedTask) {
          socket.emit('error', 'Failed to retrieve created task')
          return
        }

        // Log activity
        await logActivity('task:created', socket.userId!, socket.teamId!, {
          taskTitle: newTask.title
        })

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:created', populatedTask)
        console.log('✅ Task created and broadcast:', populatedTask.title)
      } catch (error) {
        console.error('❌ Error creating task:', error)
        socket.emit('error', 'Failed to create task')
      }
    })

    // Handle task updates
    socket.on('task:move', async ({ taskId, newStatus, newIndex }) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', 'No team selected')
          return
        }

        const task = await Task.findById(taskId)
        if (!task || task.team.toString() !== socket.teamId) {
          socket.emit('error', 'Task not found or unauthorized')
          return
        }

        const oldStatus = task.status
        task.status = newStatus
        task.updatedAt = new Date()
        await task.save()

        const populatedTask = await Task.findById(task._id)
          .populate('createdBy', 'username')
          .populate('assignedTo', 'username')

        // Log activity
        await logActivity('task:moved', socket.userId!, socket.teamId!, {
          taskTitle: task.title,
          fromStatus: oldStatus,
          toStatus: newStatus
        })

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:moved', { task: populatedTask })
        console.log('🔄 Task moved and broadcast:', task.title, '→', newStatus)
      } catch (error) {
        console.error('❌ Error moving task:', error)
        socket.emit('error', 'Failed to move task')
      }
    })

    // Handle task assignment
    socket.on('task:assign', async ({ taskId, assignedTo }) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', 'No team selected')
          return
        }

        const task = await Task.findById(taskId)
        if (!task || task.team.toString() !== socket.teamId) {
          socket.emit('error', 'Task not found or unauthorized')
          return
        }

        task.assignedTo = assignedTo
        task.updatedAt = new Date()
        await task.save()

        const populatedTask = await Task.findById(task._id)
          .populate('createdBy', 'username')
          .populate('assignedTo', 'username')

        // Get assigned user info for logging
        const assignedUser = await User.findById(assignedTo)
        
        // Log activity
        await logActivity('task:assigned', socket.userId!, socket.teamId!, {
          taskTitle: task.title,
          assignedToUser: assignedUser?.username || 'Unknown'
        })

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:updated', populatedTask)
        console.log('👤 Task assigned and broadcast:', task.title, '→', assignedTo)
      } catch (error) {
        console.error('❌ Error assigning task:', error)
        socket.emit('error', 'Failed to assign task')
      }
    })

    // Handle task deletion
    socket.on('task:delete', async (taskId) => {
      try {
        if (!socket.teamId) {
          socket.emit('error', 'No team selected')
          return
        }

        const task = await Task.findById(taskId)
        if (!task || task.team.toString() !== socket.teamId) {
          socket.emit('error', 'Task not found or unauthorized')
          return
        }

        const taskTitle = task.title
        await Task.findByIdAndDelete(taskId)

        // Log activity
        await logActivity('task:deleted', socket.userId!, socket.teamId!, {
          taskTitle
        })

        // Broadcast to all team members
        io.to(`team:${socket.teamId}`).emit('task:deleted', taskId)
        console.log('🗑️ Task deleted and broadcast:', taskId)
      } catch (error) {
        console.error('❌ Error deleting task:', error)
        socket.emit('error', 'Failed to delete task')
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.userId)
    })
  })
}

export default setupSockets