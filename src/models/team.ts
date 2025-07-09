import mongoose, { Schema, Document } from 'mongoose'

export interface ITeam extends Document {
  name: string
  code: string
  createdBy: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  codeExpiresAt: Date
  isActive: boolean
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true, trim: true },
  code: { type: String, unique: true, uppercase: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  codeExpiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Auto-generate team code before saving
TeamSchema.pre('save', function(next) {
  if (this.isNew && !this.code) {
    this.code = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.codeExpiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
  }
  next()
})

export default mongoose.model<ITeam>('Team', TeamSchema)