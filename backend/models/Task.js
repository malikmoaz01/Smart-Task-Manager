import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Work', 'Personal', 'Learning', 'Health', 'General'],
    default: 'General'
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  reminder: { 
    type: Date, 
    required: true 
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;