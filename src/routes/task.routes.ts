import express from 'express'
import { getTasks, createTask, updateTask, deleteTask } from '../Controllers/task.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Apply authentication middleware to all task routes
router.use(verifyToken)

// Task routes (all protected)
router.get('/', getTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router