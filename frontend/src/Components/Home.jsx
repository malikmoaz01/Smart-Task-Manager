import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Tag, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Work',
    deadline: '',
    reminder: ''
  });
 
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    
    if (!token) {
      setError('⚠️ WARNING: You must be logged in to save tasks. Tasks will not persist without authentication!');
      return;
    }

    if (!formData.title.trim()) {
      setError('Task title is required');
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
        body: JSON.stringify(formData)
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
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
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
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      deadline: task.deadline.split('T')[0],
      reminder: task.reminder.split('T')[0]
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Work',
      deadline: '',
      reminder: ''
    });
    setEditingTask(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access your tasks. Please log in to continue.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder *
                  </label>
                  <input
                    type="date"
                    name="reminder"
                    value={formData.reminder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full flex items-center space-x-1 ${getCategoryColor(task.category)}`}>
                        <Tag size={14} />
                        <span>{task.category}</span>
                      </span>
                      
                      <span className="text-gray-500 flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Deadline: {formatDate(task.deadline)}</span>
                      </span>
                      
                      <span className="text-gray-500 flex items-center space-x-1">
                        <Clock size={14} />
                        <span>Reminder: {formatDate(task.reminder)}</span>
                      </span>
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

        {tasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first task</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Add Your First Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}