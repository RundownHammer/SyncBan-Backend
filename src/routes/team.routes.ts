import express from 'express'
import { 
  createTeam, 
  joinTeam, 
  leaveTeam, 
  getMyTeam, 
  regenerateTeamCode 
} from '../Controllers/team.controller.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Team routes working' })
})

// Protected routes (require authentication)
router.use(verifyToken)

// Controller routes
router.post('/create', createTeam)
router.post('/join', joinTeam)
router.post('/leave', leaveTeam)
router.get('/my-team', getMyTeam)
router.post('/regenerate-code', regenerateTeamCode)

export default router