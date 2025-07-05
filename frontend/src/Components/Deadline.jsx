import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, AlertTriangle, ArrowLeft, Check, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Deadline() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocalNote, setShowLocalNote] = useState(true);
  const navigate = useNavigate();

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
        const allTasks = JSON.parse(localTasks);
        const incompleteTasks = allTasks.filter(task => !task.completed);
        const sortedTasks = incompleteTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTasks(sortedTasks);
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
        const incompleteTasks = data.tasks.filter(task => !task.completed);
        const sortedTasks = incompleteTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTasks(sortedTasks);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Error fetching tasks');
    } finally {
      setLoading(false);
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
          if (data.task.completed) {
            setTasks(tasks.filter(task => task._id !== taskId));
          } else {
            setTasks(tasks.map(task => 
              task._id === taskId ? data.task : task
            ));
          }
        } else {
          setError('Failed to update task status');
        }
      } catch (err) {
        setError('Error updating task status');
      } finally {
        setLoading(false);
      }
    } else {
      const allLocalTasks = JSON.parse(localStorage.getItem('localTasks') || '[]');
      const updatedTasks = allLocalTasks.map(task => 
        task._id === taskId ? { ...task, completed: !task.completed } : task
      );
      saveLocalTasks(updatedTasks);
      
      const incompleteTasks = updatedTasks.filter(task => !task.completed);
      const sortedTasks = incompleteTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setTasks(sortedTasks);
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

  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', color: 'text-red-600', text: 'Overdue' };
    } else if (diffDays === 0) {
      return { status: 'today', color: 'text-orange-600', text: 'Due Today' };
    } else if (diffDays <= 3) {
      return { status: 'urgent', color: 'text-yellow-600', text: `${diffDays} days left` };
    } else {
      return { status: 'normal', color: 'text-green-600', text: `${diffDays} days left` };
    }
  };

  const dismissLocalNote = () => {
    setShowLocalNote(false);
    localStorage.setItem('localNoteDismissedDeadline', 'true');
  };

  useEffect(() => {
    const noteDismissed = localStorage.getItem('localNoteDismissedDeadline');
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

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading tasks...</div>
            </div>
          ) : (
            tasks.map((task) => {
              const deadlineStatus = getDeadlineStatus(task.deadline);
              
              return (
                <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleTaskCompletion(task._id)}
                        className="mt-1 p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      
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
                    </div>
                    
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${deadlineStatus.color} bg-opacity-10`}>
                        {deadlineStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {tasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending deadlines</h3>
            <p className="text-gray-600 mb-4">
              Great work! All your tasks are completed or you haven't added any tasks yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Go to Home to Manage Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}