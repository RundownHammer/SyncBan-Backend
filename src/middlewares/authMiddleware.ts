import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import type { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    iat: number
    exp: number
  }
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization')
    console.log('🔍 Auth Header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No valid token provided.' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('🔍 Extracted Token:', token ? 'Present' : 'Missing')

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any
    console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email })
    
    req.user = decoded
    next()
  } catch (error) {
    console.error('🔒 Token verification failed:', error)
    res.status(401).json({ message: 'Invalid token.' })
  }
}

export const authenticateToken = verifyToken