import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, AlertTriangle, ArrowLeft, Filter, Check, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Category() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocalNote, setShowLocalNote] = useState(true);
  const navigate = useNavigate();

  const categories = ['All', 'Work', 'Personal', 'Learning', 'Health', 'General'];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      loadLocalTasks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterTasksByCategory();
  }, [selectedCategory, tasks]);

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

  const filterTasksByCategory = () => {
    if (selectedCategory === 'All') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.category === selectedCategory));
    }
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

  const getCategoryCount = (category) => {
    if (category === 'All') return tasks.length;
    return tasks.filter(task => task.category === category).length;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
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

        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Filter by Category</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category}</span>
                <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {getCategoryCount(category)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {loading && filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading tasks...</div>
            </div>
          ) : (
            filteredTasks.map((task) => (
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
                          <span>Deadline: {formatDate(task.deadline)}</span>
                        </span>
                        
                        <span className={`flex items-center space-x-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock size={14} />
                          <span>Reminder: {formatDate(task.reminder)}</span>
                        </span>

                        {task.completed && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Tag size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategory === 'All' ? 'No tasks found' : `No tasks in ${selectedCategory} category`}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'All' 
                ? 'Get started by adding your first task' 
                : `Try selecting a different category or add a new task in ${selectedCategory}`}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Go to Home to Add Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}