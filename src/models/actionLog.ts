import mongoose, { Schema, Document } from 'mongoose'

export interface IActionLog extends Document {
  type: 'task:created' | 'task:moved' | 'task:deleted' | 'task:assigned' | 'member:joined' | 'member:left'
  user: mongoose.Types.ObjectId
  team: mongoose.Types.ObjectId
  taskTitle?: string
  fromStatus?: string
  toStatus?: string
  assignedToUser?: string
  memberName?: string
  createdAt: Date
  updatedAt: Date
}

const ActionLogSchema = new Schema<IActionLog>({
  type: {
    type: String,
    enum: ['task:created', 'task:moved', 'task:deleted', 'task:assigned', 'member:joined', 'member:left'],
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  taskTitle: {
    type: String
  },
  fromStatus: {
    type: String
  },
  toStatus: {
    type: String
  },
  assignedToUser: {
    type: String
  },
  memberName: {
    type: String
  }
}, { timestamps: true })

// Index for efficient queries
ActionLogSchema.index({ team: 1, createdAt: -1 })

export default mongoose.model<IActionLog>('ActionLog', ActionLogSchema)
