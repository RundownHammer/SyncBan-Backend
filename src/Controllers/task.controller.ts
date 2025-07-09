import Task from '../models/task.js'
import User from '../models/user.js'
import mongoose from 'mongoose'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/authMiddleware.js'

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Get tasks request user:', req.user) // Debug log
    
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - No user ID' })
    }

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You must be in a team to view tasks' })
    }

    // Get all tasks for the team
    const tasks = await Task.find({ team: user.currentTeam })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })

    console.log(`📋 Found ${tasks.length} tasks for team ${user.currentTeam}`)

    res.json({ 
      message: 'Tasks retrieved successfully',
      tasks,
      teamId: user.currentTeam
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ message: 'Error fetching tasks', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Create task request user:', req.user) // Debug log
    
    const { title, description, priority, status, assignedTo } = req.body
    const userId = req.user?.id // Use optional chaining

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - No user ID' })
    }

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You must be in a team to create tasks' })
    }

    // Manual validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    // Create task
    const task = new Task({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'Medium',
      status: status || 'ToDo',
      assignedTo: assignedTo?.trim() || '',
      team: user.currentTeam,
      createdBy: new mongoose.Types.ObjectId(userId)
    })

    await task.save()

    // Populate createdBy for response
    await task.populate('createdBy', 'username email')

    console.log(`✅ Created task: ${task.title} for team ${user.currentTeam}`)

    res.status(201).json({
      message: 'Task created successfully',
      task
    })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ message: 'Error creating task', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - No user ID' })
    }

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You must be in a team to update tasks' })
    }

    // Find and update task
    const task = await Task.findOneAndUpdate(
      { _id: id, team: user.currentTeam },
      updates,
      { new: true }
    ).populate('createdBy', 'username email')

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    console.log(`✅ Updated task: ${task.title}`)

    res.json({
      message: 'Task updated successfully',
      task
    })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ message: 'Error updating task', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - No user ID' })
    }

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You must be in a team to delete tasks' })
    }

    // Find and delete task
    const task = await Task.findOneAndDelete({
      _id: id,
      team: user.currentTeam
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    console.log(`✅ Deleted task: ${task.title}`)

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ message: 'Error deleting task', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}