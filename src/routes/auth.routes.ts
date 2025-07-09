import express from 'express'
import { login, register, logout, getProfile } from '../Controllers/auth.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Protected routes
router.get('/profile', verifyToken, getProfile)

export default router
