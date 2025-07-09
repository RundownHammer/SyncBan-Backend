import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  title: string
  description?: string
  status: 'ToDo' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  assignedTo?: string
  team: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['ToDo', 'In Progress', 'Done'],
    default: 'ToDo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model<ITask>('Task', taskSchema)