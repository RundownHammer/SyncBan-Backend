import express from 'express'
import { getActivities } from '../Controllers/activity.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All activity routes require authentication
router.use(verifyToken)

// Activity routes
router.get('/', getActivities)

export default router
