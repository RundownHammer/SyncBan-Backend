import mongoose, { Schema, Document } from 'mongoose'

export interface IActionLog extends Document {
  user: mongoose.Types.ObjectId
  action: string
  taskId?: mongoose.Types.ObjectId
}

const ActionLogSchema = new Schema<IActionLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' }
}, { timestamps: true })

export default mongoose.model<IActionLog>('ActionLog', ActionLogSchema)
