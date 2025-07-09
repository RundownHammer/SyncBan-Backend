import Task from '../models/task.js'
import User from '../models/user.js'
import mongoose from 'mongoose'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/authMiddleware.js'

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    
    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You are not in any team' })
    }

    const tasks = await Task.find({ team: user.currentTeam })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })

    res.json({ tasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ message: 'Error fetching tasks', error })
  }
}

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo, priority, status } = req.body
    const userId = req.user!.id

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You are not in any team' })
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      priority: priority || 'Low',
      status: status || 'ToDo',
      team: user.currentTeam,
      createdBy: new mongoose.Types.ObjectId(userId)
    })

    await task.save()
    await task.populate('createdBy', 'username email')

    res.status(201).json({ message: 'Task created successfully', task })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ message: 'Error creating task', error })
  }
}

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const userId = req.user!.id

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You are not in any team' })
    }

    const task = await Task.findOne({ _id: id, team: user.currentTeam })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Set who modified the task for history tracking
    (task as any).lastModifiedBy = new mongoose.Types.ObjectId(userId)

    Object.assign(task, updates)
    await task.save()
    await task.populate('createdBy', 'username email')

    res.json({ message: 'Task updated successfully', task })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ message: 'Error updating task', error })
  }
}

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Get user's current team
    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You are not in any team' })
    }

    const task = await Task.findOneAndDelete({ _id: id, team: user.currentTeam })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ message: 'Error deleting task', error })
  }
}