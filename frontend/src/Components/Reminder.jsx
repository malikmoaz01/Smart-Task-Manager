import React, { useState, useEffect } from 'react';
import { Calendar, Tag, AlertTriangle, ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Reminder() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reminderDates, setReminderDates] = useState({});
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
        const sortedTasks = data.tasks.sort((a, b) => new Date(a.reminder) - new Date(b.reminder));
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

  const handleReminderChange = (taskId, date) => {
    setReminderDates(prev => ({ ...prev, [taskId]: date }));
  };

  const handleSetReminder = async (taskId) => {
    const token = getAuthToken();
    const reminderDate = reminderDates[taskId];
    if (!reminderDate) {
      alert('Please select a reminder date');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/reminder/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId, reminderDate })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Reminder set successfully!');
        fetchTasks();
      } else {
        alert(data.message || 'Failed to set reminder');
      }
    } catch (err) {
      console.error('Set reminder error:', err);
      alert('Server error');
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

  const getReminderStatus = (reminder) => {
    const today = new Date();
    const reminderDate = new Date(reminder);
    const diffTime = reminderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { status: 'missed', color: 'text-red-600', text: 'Missed' };
    } else if (diffDays === 0) {
      return { status: 'today', color: 'text-orange-600', text: 'Remind Today' };
    } else if (diffDays <= 2) {
      return { status: 'soon', color: 'text-yellow-600', text: `${diffDays} days to remind` };
    } else {
      return { status: 'upcoming', color: 'text-green-600', text: `${diffDays} days to remind` };
    }
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
            <div className="text-center py-12 text-gray-400">Loading tasks...</div>
          ) : (
            tasks.map((task) => {
              const reminderStatus = getReminderStatus(task.reminder);
              return (
                <div key={task._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
                      {task.description && <p className="text-gray-600 mb-3">{task.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm mb-2">
                        <span className={`px-2 py-1 rounded-full flex items-center space-x-1 ${getCategoryColor(task.category)}`}>
                          <Tag size={14} />
                          <span>{task.category}</span>
                        </span>
                        <span className="text-gray-500 flex items-center space-x-1">
                          <Bell size={14} />
                          <span>Reminder: {formatDate(task.reminder)}</span>
                        </span>
                        <span className="text-gray-500 flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Deadline: {formatDate(task.deadline)}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <input
                          type="datetime-local"
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          value={reminderDates[task._id] || ''}
                          onChange={(e) => handleReminderChange(task._id, e.target.value)}
                        />
                        <button
                          onClick={() => handleSetReminder(task._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Set Reminder
                        </button>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${reminderStatus.color} bg-opacity-10`}>
                        {reminderStatus.text}
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
              <Bell size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first task</p>
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
