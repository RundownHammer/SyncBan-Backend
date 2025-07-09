import mongoose, { Schema, Document } from 'mongoose'

export interface ITeam extends Document {
  name: string
  code: string
  codeExpiresAt: Date
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  codeExpiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

export default mongoose.model<ITeam>('Team', teamSchema)