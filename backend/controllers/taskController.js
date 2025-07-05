
import Task from '../models/Task.js';


export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, category, deadline, reminder } = req.body;

    if (!title || !deadline || !reminder) {
      return res.status(400).json({ error: 'Title, deadline, and reminder are required' });
    }

    const task = new Task({
      title,
      description,
      category,
      deadline,
      reminder,
      userId: req.userId
    });

    await task.save();
    res.status(201).json({ 
      message: 'Task created successfully', 
      task 
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
 
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, deadline, reminder, completed } = req.body;

    const task = await Task.findOne({ _id: id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.category = category || task.category;
    task.deadline = deadline || task.deadline;
    task.reminder = reminder || task.reminder;
    task.completed = completed !== undefined ? completed : task.completed;

    await task.save();
    res.json({ 
      message: 'Task updated successfully', 
      task 
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
 
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
 
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
 
export const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    res.json({ 
      message: 'Task completion toggled successfully', 
      task 
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};