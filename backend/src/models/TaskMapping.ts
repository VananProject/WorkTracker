import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskMapping extends Document {
  taskName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskMappingSchema = new Schema<ITaskMapping>({
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['L1', 'L2', 'L3', 'L4']
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
TaskMappingSchema.index({ createdBy: 1, taskName: 1 });
TaskMappingSchema.index({ createdBy: 1, level: 1 });

export default mongoose.model<ITaskMapping>('TaskMapping', TaskMappingSchema);
