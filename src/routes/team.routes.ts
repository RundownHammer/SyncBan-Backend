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

router.post('/create', verifyToken, createTeam)
router.post('/join', verifyToken, joinTeam)
router.post('/leave', verifyToken, leaveTeam)
router.get('/my-team', verifyToken, getMyTeam)
router.post('/regenerate-code', verifyToken, regenerateTeamCode)

export default router