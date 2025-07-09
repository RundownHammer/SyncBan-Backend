import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Request, Response } from 'express'

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body
  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ message: 'Email already exists' })

  const hashed = await bcrypt.hash(password, 10)
  const user = new User({ username, email, password: hashed })
  await user.save()

  res.status(201).json({ message: 'User registered' })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.json({ token })
}
