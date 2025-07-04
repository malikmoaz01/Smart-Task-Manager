import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/task-manager');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
