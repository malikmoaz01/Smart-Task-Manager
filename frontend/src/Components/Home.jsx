import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Tag, AlertTriangle, Check, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocalNote, setShowLocalNote] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Work',
    deadline: '',
    deadlineTime: '',
    reminder: '',
    reminderTime: ''
  });

  const getTodayDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };
 
  const getAuthToken = () => {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return null;
    
    try {
      const sessionData = JSON.parse(userSession);
      const currentTime = new Date().getTime();
      
      if (currentTime > sessionData.expiryTime) {
        localStorage.removeItem('userSession');
        return null;
      }
      
      return sessionData.token;
    } catch (error) {
      localStorage.removeItem('userSession');
      return null;
    }
  };

  const isAuthenticated = getAuthToken();

  const loadLocalTasks = () => {
    const localTasks = localStorage.getItem('localTasks');
    if (localTasks) {
      try {
        setTasks(JSON.parse(localTasks));
      } catch (error) {
        console.error('Error loading local tasks:', error);
      }
    }
  };

  const saveLocalTasks = (tasksToSave) => {
    localStorage.setItem('localTasks', JSON.stringify(tasksToSave));
  };

  const generateLocalId = () => {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      loadLocalTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'deadline' || name === 'deadlineTime') {
      const deadlineDateTime = new Date(`${name === 'deadline' ? value : formData.deadline}T${name === 'deadlineTime' ? value : formData.deadlineTime}`);
      const reminderDateTime = new Date(`${formData.reminder}T${formData.reminderTime}`);
      
      if (formData.reminder && formData.reminderTime && deadlineDateTime < reminderDateTime) {
        setFormData(prev => ({
          ...prev,
          reminder: name === 'deadline' ? value : formData.deadline,
          reminderTime: name === 'deadlineTime' ? value : formData.deadlineTime
        }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }
    
    if (!formData.deadline) {
      setError('Deadline date is required');
      return false;
    }
    
    if (!formData.deadlineTime) {
      setError('Deadline time is required');
      return false;
    }
    
    if (!formData.reminder) {
      setError('Reminder date is required');
      return false;
    }
    
    if (!formData.reminderTime) {
      setError('Reminder time is required');
      return false;
    }
    
    const now = new Date();
    const deadlineDateTime = new Date(`${formData.deadline}T${formData.deadlineTime}`);
    const reminderDateTime = new Date(`${formData.reminder}T${formData.reminderTime}`);
    
    if (deadlineDateTime < now) {
      setError('Deadline cannot be in the past');
      return false;
    }
    
    if (reminderDateTime < now) {
      setError('Reminder cannot be in the past');
      return false;
    }
    
    if (reminderDateTime > deadlineDateTime) {
      setError('Reminder cannot be set after the deadline');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const deadlineDateTime = new Date(`${formData.deadline}T${formData.deadlineTime}`).toISOString();
    const reminderDateTime = new Date(`${formData.reminder}T${formData.reminderTime}`).toISOString();

    const taskData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      deadline: deadlineDateTime,
      reminder: reminderDateTime
    };

    if (isAuthenticated) {
      const token = getAuthToken();
      
      if (!token) {
        setError('You must be logged in to save tasks');
        return;
      }

      try {
        setLoading(true);
        const url = editingTask ? `http://localhost:5000/api/tasks/${editingTask._id}` : 'http://localhost:5000/api/tasks';
        const method = editingTask ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });

        if (response.ok) {
          const data = await response.json();
          if (editingTask) {
            setTasks(tasks.map(task => 
              task._id === editingTask._id ? data.task : task
            ));
          } else {
            setTasks([...tasks, data.task]);
          }
          
          resetForm();
          setError('');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to save task');
        }
      } catch (err) {
        setError('Error saving task');
      } finally {
        setLoading(false);
      }
    } else {
      const newTask = {
        _id: editingTask ? editingTask._id : generateLocalId(),
        ...taskData,
        completed: editingTask ? editingTask.completed : false,
        createdAt: editingTask ? editingTask.createdAt : new Date().toISOString()
      };

      let updatedTasks;
      if (editingTask) {
        updatedTasks = tasks.map(task => 
          task._id === editingTask._id ? newTask : task
        );
      } else {
        updatedTasks = [...tasks, newTask];
      }

      setTasks(updatedTasks);
      saveLocalTasks(updatedTasks);
      resetForm();
      setError('');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    if (isAuthenticated) {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setTasks(tasks.filter(task => task._id !== taskId));
        } else {
          setError('Failed to delete task');
        }
      } catch (err) {
        setError('Error deleting task');
      } finally {
        setLoading(false);
      }
    } else {
      const updatedTasks = tasks.filter(task => task._id !== taskId);
      setTasks(updatedTasks);
      saveLocalTasks(updatedTasks);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    const deadlineDate = new Date(task.deadline);
    const reminderDate = new Date(task.reminder);
    
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      deadline: deadlineDate.toISOString().split('T')[0],
      deadlineTime: deadlineDate.toTimeString().slice(0, 5),
      reminder: reminderDate.toISOString().split('T')[0],
      reminderTime: reminderDate.toTimeString().slice(0, 5)
    });
    setShowAddForm(true);
  };

  const toggleTaskCompletion = async (taskId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/toggle`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(tasks.map(task => 
            task._id === taskId ? data.task : task
          ));
        } else {
          setError('Failed to update task status');
        }
      } catch (err) {
        setError('Error updating task status');
      } finally {
        setLoading(false);
      }
    } else {
      const updatedTasks = tasks.map(task => 
        task._id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);
      saveLocalTasks(updatedTasks);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Work',
      deadline: '',
      deadlineTime: '',
      reminder: '',
      reminderTime: ''
    });
    setEditingTask(null);
    setShowAddForm(false);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Work: 'bg-blue-100 text-blue-800',
      Personal: 'bg-green-100 text-green-800',
      Learning: 'bg-purple-100 text-purple-800',
      Health: 'bg-red-100 text-red-800',
      General: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.General;
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/');
  };

  const dismissLocalNote = () => {
    setShowLocalNote(false);
    localStorage.setItem('localNoteDismissed', 'true');
  };

  useEffect(() => {
    const noteDismissed = localStorage.getItem('localNoteDismissed');
    if (noteDismissed === 'true') {
      setShowLocalNote(false);
    }
  }, []);

  const { date: todayDate, time: currentTime } = getTodayDateTime();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Task Manager</h2>
            <p className="text-gray-600">Manage your tasks efficiently with deadlines and reminders</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {!isAuthenticated && showLocalNote && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <Info className="text-blue-400 mr-3 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-blue-800">
                  <strong>Note:</strong> Your tasks are stored locally.
                  If you want to sync your tasks across devices and save them permanently, please login to enable the sync feature.
                </p>
              </div>
              <button
                onClick={dismissLocalNote}
                className="text-blue-600 hover:text-blue-800 ml-4"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="text-red-400 mr-3" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Learning">Learning</option>
                  <option value="Health">Health</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      min={todayDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="time"
                      name="deadlineTime"
                      value={formData.deadlineTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      name="reminder"
                      value={formData.reminder}
                      onChange={handleInputChange}
                      min={todayDate}
                      max={formData.deadline}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="time"
                      name="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks added yet</h3>
              <p className="text-gray-600">Start by adding your first task to get organized</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${task.completed ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTaskCompletion(task._id)}
                      className={`mt-1 p-1 rounded-full transition-colors ${
                        task.completed 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {task.completed ? <Check size={16} /> : <X size={16} />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium mb-2 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className={`mb-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full flex items-center space-x-1 ${getCategoryColor(task.category)}`}>
                          <Tag size={14} />
                          <span>{task.category}</span>
                        </span>
                        
                        <span className={`flex items-center space-x-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar size={14} />
                          <span>Deadline: {formatDateTime(task.deadline)}</span>
                        </span>
                        
                        <span className={`flex items-center space-x-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock size={14} />
                          <span>Reminder: {formatDateTime(task.reminder)}</span>
                        </span>

                        {task.completed && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}