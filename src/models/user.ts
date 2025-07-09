import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  currentTeam?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  currentTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  }
}, {
  timestamps: true
})

export default mongoose.model<IUser>('User', userSchema)