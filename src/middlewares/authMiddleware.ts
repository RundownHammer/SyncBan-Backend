import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'  // Add this import
import type { Request, Response, NextFunction } from 'express'

export interface AuthPayload {
  id: string
  email: string
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    // Use config.JWT_SECRET instead of process.env.JWT_SECRET
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}