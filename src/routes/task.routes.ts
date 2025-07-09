import express from 'express'
import { createTask, getTasks, updateTask, deleteTask } from '../Controllers/task.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', verifyToken, getTasks)
router.post('/', verifyToken, createTask)
router.put('/:id', verifyToken, updateTask)
router.delete('/:id', verifyToken, deleteTask)

export default router