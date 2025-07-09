import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  assignedTo:  { type: String }, // Or ref to User._id
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  status:      { type: String, enum: ['ToDo', 'In Progress', 'Done'], default: 'ToDo' },
}, { timestamps: true })

export default mongoose.model('Task', TaskSchema)
