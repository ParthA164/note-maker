import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  tags: string[];
  isPinned: boolean;
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ userId: 1, tags: 1 });

// Text index for search functionality
noteSchema.index({ 
  title: 'text', 
  content: 'text',
  tags: 'text'
});

export default mongoose.model<INote>('Note', noteSchema);