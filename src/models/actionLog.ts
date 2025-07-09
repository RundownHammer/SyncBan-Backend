import mongoose from 'mongoose'

const ActionLogSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:  { type: String, required: true },
  taskId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, { timestamps: true })

export default mongoose.model('ActionLog', ActionLogSchema)
