import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthPayload {
  id: string
  email: string
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}
