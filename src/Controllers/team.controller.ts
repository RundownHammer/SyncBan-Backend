import Team from '../models/team.js'
import User from '../models/user.js'
import mongoose from 'mongoose'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/authMiddleware.js'

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body
    const userId = req.user!.id // Now we can use ! because middleware guarantees user exists

    // Manual validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Team name is required' })
    }

    // Check if user is already in a team
    const user = await User.findById(userId)
    if (user?.currentTeam) {
      return res.status(400).json({ message: 'You are already in a team. Leave current team first.' })
    }

    // Generate team code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const codeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create new team
    const team = new Team({
      name: name.trim(),
      code,
      codeExpiresAt,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(userId),
      members: [new mongoose.Types.ObjectId(userId)]
    })

    await team.save()

    // Update user's current team
    await User.findByIdAndUpdate(userId, { currentTeam: team._id })

    // Populate the team members for the response
    const populatedTeam = await Team.findById(team._id).populate({
      path: 'members',
      select: 'username email'
    })

    res.status(201).json({
      message: 'Team created successfully',
      team: populatedTeam
    })
  } catch (error) {
    console.error('Create team error:', error)
    res.status(500).json({ message: 'Error creating team', error })
  }
}

export const joinTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body
    const userId = req.user!.id

    // Manual validation
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ message: 'Team code is required' })
    }

    // Check if user is already in a team
    const user = await User.findById(userId)
    if (user?.currentTeam) {
      return res.status(400).json({ message: 'You are already in a team. Leave current team first.' })
    }

    // Find team by code
    const team = await Team.findOne({ 
      code: code.trim().toUpperCase(), 
      isActive: true,
      codeExpiresAt: { $gt: new Date() }
    })

    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired team code' })
    }

    // Add user to team
    const userObjectId = new mongoose.Types.ObjectId(userId)
    if (!team.members.some(memberId => memberId.equals(userObjectId))) {
      team.members.push(userObjectId)
      await team.save()
    }

    // Update user's current team
    await User.findByIdAndUpdate(userId, { currentTeam: team._id })

    // Populate the team members for the response
    const populatedTeam = await Team.findById(team._id).populate({
      path: 'members',
      select: 'username email'
    })

    res.json({
      message: 'Successfully joined team',
      team: populatedTeam
    })
  } catch (error) {
    console.error('Join team error:', error)
    res.status(500).json({ message: 'Error joining team', error })
  }
}

export const leaveTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You are not in any team' })
    }

    const team = await Team.findById(user.currentTeam)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    // Remove user from team
    team.members = team.members.filter(memberId => !memberId.equals(new mongoose.Types.ObjectId(userId)))
    await team.save()

    // Remove team from user
    await User.findByIdAndUpdate(userId, { currentTeam: null })

    res.json({ message: 'Successfully left team' })
  } catch (error) {
    console.error('Leave team error:', error)
    res.status(500).json({ message: 'Error leaving team', error })
  }
}

export const getMyTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId).populate({
      path: 'currentTeam',
      populate: {
        path: 'members',
        select: 'username email'
      }
    })

    if (!user?.currentTeam) {
      return res.status(404).json({ message: 'You are not in any team' })
    }

    res.json({ team: user.currentTeam })
  } catch (error) {
    console.error('Get team error:', error)
    res.status(500).json({ message: 'Error fetching team', error })
  }
}

export const regenerateTeamCode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(400).json({ message: 'You are not in any team' })
    }

    const team = await Team.findById(user.currentTeam)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    if (!team.createdBy.equals(new mongoose.Types.ObjectId(userId))) {
      return res.status(403).json({ message: 'Only team creator can regenerate code' })
    }

    // Generate new code
    team.code = Math.random().toString(36).substring(2, 8).toUpperCase()
    team.codeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await team.save()

    res.json({
      message: 'Team code regenerated',
      code: team.code,
      expiresAt: team.codeExpiresAt
    })
  } catch (error) {
    console.error('Regenerate code error:', error)
    res.status(500).json({ message: 'Error regenerating code', error })
  }
}