import mongoose, { Schema, Document } from 'mongoose'

export interface ITaskHistory {
  field: string
  oldValue: any
  newValue: any
  changedBy: mongoose.Types.ObjectId
  changedAt: Date
}

export interface ITask extends Document {
  title: string
  description?: string
  assignedTo?: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'ToDo' | 'In Progress' | 'Done'
  team: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  history: ITaskHistory[]
}

const TaskHistorySchema = new Schema({
  field: { type: String, required: true },
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now }
})

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: String,
  assignedTo: String,
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  status: { type: String, enum: ['ToDo', 'In Progress', 'Done'], default: 'ToDo' },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  history: [TaskHistorySchema]
}, { timestamps: true })

// Middleware to track changes and limit history to 20 entries
TaskSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    const modifiedFields = this.modifiedPaths()
    modifiedFields.forEach(field => {
      if (field !== 'history' && field !== 'updatedAt') {
        const historyEntry = {
          field,
          oldValue: this.get(field),
          newValue: this.get(field),
          changedBy: this.get('lastModifiedBy') || this.get('createdBy'),
          changedAt: new Date()
        }
        
        this.history.push(historyEntry)
        
        // Keep only last 20 history entries
        if (this.history.length > 20) {
          this.history = this.history.slice(-20)
        }
      }
    })
  }
  next()
})

export default mongoose.model<ITask>('Task', TaskSchema)