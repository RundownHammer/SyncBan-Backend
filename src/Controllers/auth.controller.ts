import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body
    
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ username, email, password: hashed })
    await user.save()

    // Generate token and return user data
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        currentTeam: user.currentTeam
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    const user = await User.findOne({ email }).populate('currentTeam')
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    
    res.json({ 
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        currentTeam: user.currentTeam
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error })
  }
}