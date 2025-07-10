import express from 'express'
import type { Request, Response } from 'express'
import { 
  createTeam, 
  joinTeam, 
  leaveTeam, 
  getMyTeam, 
  regenerateTeamCode 
} from '../Controllers/team.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All team routes require authentication
router.use(verifyToken)

// Team routes
router.post('/create', createTeam)
router.post('/join', joinTeam)
router.post('/leave', leaveTeam)
router.get('/my-team', getMyTeam)
router.post('/regenerate-code', regenerateTeamCode)

// Test route with proper typing
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Team routes working' })
})

export default router