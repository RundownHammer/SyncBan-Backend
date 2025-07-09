import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import type { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' })
  }
}

export const authenticateToken = verifyToken