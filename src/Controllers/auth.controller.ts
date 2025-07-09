import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { config } from '../config/config.js'
import type { Request, Response } from 'express'
import type { AuthRequest } from '../middlewares/authMiddleware.js'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    // Manual validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    })
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
}

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' })
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Profile request user:', req.user) // Debug log
    
    const userId = req.user?.id
    if (!userId) {
      console.log('❌ No user ID found in request')
      return res.status(401).json({ message: 'Unauthorized - No user ID' })
    }

    const user = await User.findById(userId).select('-password').populate('currentTeam')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}