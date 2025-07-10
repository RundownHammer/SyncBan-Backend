import ActionLog from '../models/actionLog.js'
import User from '../models/user.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/authMiddleware.js'

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)
    if (!user?.currentTeam) {
      return res.status(404).json({ message: 'You are not in any team' })
    }

    const activities = await ActionLog.find({ team: user.currentTeam })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({ activities })
  } catch (error) {
    console.error('Get activities error:', error)
    res.status(500).json({ message: 'Error fetching activities', error })
  }
}

export const logActivity = async (
  type: string,
  userId: string,
  teamId: string,
  data: {
    taskTitle?: string
    fromStatus?: string
    toStatus?: string
    assignedToUser?: string
    memberName?: string
  } = {}
) => {
  try {
    const activity = new ActionLog({
      type,
      user: userId,
      team: teamId,
      ...data
    })

    await activity.save()
    console.log(`📝 Activity logged: ${type}`)
  } catch (error) {
    console.error('❌ Error logging activity:', error)
  }
}
