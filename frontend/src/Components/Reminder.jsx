import React, { useState, useEffect } from 'react';
import { Calendar, Tag, AlertTriangle, ArrowLeft, Bell, Mail, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Reminder() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reminderDates, setReminderDates] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [autoReminders, setAutoReminders] = useState({}); 
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
    } else {
      loadLocalTasks();
    }
     
    const interval = setInterval(checkAutoReminders, 60000); 
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadLocalTasks = () => {
    try {
      const localTasks = localStorage.getItem('localTasks');
      const localAutoReminders = localStorage.getItem('autoReminders');
      
      if (localTasks) {
        const parsedTasks = JSON.parse(localTasks);
        const sortedTasks = parsedTasks.sort((a, b) => new Date(a.reminder) - new Date(b.reminder));
        setTasks(sortedTasks);
      }
      
      if (localAutoReminders) {
        setAutoReminders(JSON.parse(localAutoReminders));
      }
    } catch (err) {
      console.error('Error loading local tasks:', err);
    }
  };

  const saveLocalTasks = (updatedTasks) => {
    try {
      localStorage.setItem('localTasks', JSON.stringify(updatedTasks));
    } catch (err) {
      console.error('Error saving local tasks:', err);
    }
  };

  const saveAutoReminders = (updatedAutoReminders) => {
    try {
      localStorage.setItem('autoReminders', JSON.stringify(updatedAutoReminders));
    } catch (err) {
      console.error('Error saving auto reminders:', err);
    }
  };

  const checkAutoReminders = () => {
    const now = new Date();
    
    tasks.forEach(task => {
      const deadline = new Date(task.deadline);
      const timeDiff = deadline - now;
      const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60));
       
      const taskAutoReminder = autoReminders[task._id];
      if (!taskAutoReminder || !taskAutoReminder.enabled) return;
       
      if (hoursRemaining <= 48 && hoursRemaining > 24 && !taskAutoReminder.sent48h) {
        sendAutoReminder(task, '48 hours');
        updateAutoReminderStatus(task._id, { sent48h: true });
      }
       
      if (hoursRemaining <= 24 && hoursRemaining > 0 && !taskAutoReminder.sent24h) {
        sendAutoReminder(task, '24 hours');
        updateAutoReminderStatus(task._id, { sent24h: true });
      }
    });
  };

  const sendAutoReminder = async (task, timeRemaining) => {
    try {
      const email = isAuthenticated ? 
        await getUserEmail() : 
        autoReminders[task._id]?.email;
      
      if (!email) return;
      
      const response = await fetch('http://localhost:5000/api/reminder/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && { 'Authorization': `Bearer ${getAuthToken()}` })
        },
        body: JSON.stringify({
          email: email,
          taskTitle: task.title,
          taskDescription: task.description,
          deadline: task.deadline,
          timeRemaining: timeRemaining,
          message: `⏰ Auto Reminder: Your task "${task.title}" deadline is in ${timeRemaining}! Don't forget to complete it by ${formatDate(task.deadline)}.`
        })
      });

      if (response.ok) {
        console.log(`Auto reminder sent for task: ${task.title} (${timeRemaining} remaining)`); 
        showNotification(`Reminder sent: ${task.title} deadline in ${timeRemaining}`);
      }
    } catch (err) {
      console.error('Error sending auto reminder:', err);
    }
  };

  const getUserEmail = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data.email;
    } catch (err) {
      console.error('Error fetching user email:', err);
      return null;
    }
  };

  const updateAutoReminderStatus = (taskId, updates) => {
    const updatedAutoReminders = {
      ...autoReminders,
      [taskId]: {
        ...autoReminders[taskId],
        ...updates
      }
    };
    setAutoReminders(updatedAutoReminders);
    saveAutoReminders(updatedAutoReminders);
  };

  const toggleAutoReminder = (taskId, enabled, email = null) => {
    const updatedAutoReminders = {
      ...autoReminders,
      [taskId]: {
        enabled: enabled,
        email: email || autoReminders[taskId]?.email,
        sent24h: false,
        sent48h: false
      }
    };
    setAutoReminders(updatedAutoReminders);
    saveAutoReminders(updatedAutoReminders);
  };

  const showNotification = (message) => { 
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

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
    const reminderDate = reminderDates[taskId];
    if (!reminderDate) {
      alert('Please select a reminder date');
      return;
    }

    if (isAuthenticated) {
      try {
        const token = getAuthToken();
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
    } else {
      setCurrentTaskId(taskId);
      setShowEmailModal(true);
    }
  };

  const handleEmailSubmit = async () => {
    if (!userEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const task = tasks.find(t => t._id === currentTaskId);
      const reminderDate = reminderDates[currentTaskId];
      
      const response = await fetch('http://localhost:5000/api/reminder/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          taskTitle: task.title,
          taskDescription: task.description,
          reminderDate: reminderDate,
          message: `Hello! This is a friendly reminder about your task: "${task.title}". Please make sure to complete it by ${formatDate(task.deadline)}. Stay organized and productive!`
        })
      });

      const data = await response.json();
      if (response.ok) {
        const updatedTasks = tasks.map(t => 
          t._id === currentTaskId 
            ? { ...t, reminder: reminderDate, reminderEmail: userEmail }
            : t
        );
        setTasks(updatedTasks);
        saveLocalTasks(updatedTasks);
        
        alert('Reminder set successfully! You will receive an email notification.');
        setShowEmailModal(false);
        setUserEmail('');
        setCurrentTaskId(null);
      } else {
        alert(data.message || 'Failed to set reminder');
      }
    } catch (err) {
      console.error('Set reminder error:', err);
      alert('Server error');
    }
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      if (isAuthenticated) { 
        deleteTaskFromServer(taskId);
      } else { 
        const updatedTasks = tasks.filter(task => task._id !== taskId);
        setTasks(updatedTasks);
        saveLocalTasks(updatedTasks);
         
        const updatedAutoReminders = { ...autoReminders };
        delete updatedAutoReminders[taskId];
        setAutoReminders(updatedAutoReminders);
        saveAutoReminders(updatedAutoReminders);
      }
    }
  };

  const deleteTaskFromServer = async (taskId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
         
        const updatedAutoReminders = { ...autoReminders };
        delete updatedAutoReminders[taskId];
        setAutoReminders(updatedAutoReminders);
        saveAutoReminders(updatedAutoReminders);
        
        alert('Task deleted successfully');
      } else {
        alert('Failed to delete task');
      }
    } catch (err) {
      console.error('Delete error:', err);
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

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60));
    
    if (hoursRemaining <= 0) {
      return { status: 'overdue', color: 'text-red-600', text: 'Overdue' };
    } else if (hoursRemaining <= 24) {
      return { status: 'urgent', color: 'text-red-600', text: `${hoursRemaining}h left` };
    } else if (hoursRemaining <= 48) {
      return { status: 'soon', color: 'text-orange-600', text: `${Math.ceil(hoursRemaining/24)}d left` };
    } else {
      return { status: 'normal', color: 'text-green-600', text: `${Math.ceil(hoursRemaining/24)}d left` };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800"> 
                  <strong>Note:</strong> You're using local storage. Tasks will be saved locally and won't sync across devices. 
                  <button 
                    onClick={() => navigate('/login')} 
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    Login
                  </button> for cloud sync.
                </p>
              </div>
            )}
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
              const deadlineStatus = getDeadlineStatus(task.deadline);
              const taskAutoReminder = autoReminders[task._id];
              
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
                        <span className={`flex items-center space-x-1 ${deadlineStatus.color}`}>
                          <Clock size={14} />
                          <span>{deadlineStatus.text}</span>
                        </span>
                        {!isAuthenticated && task.reminderEmail && (
                          <span className="text-gray-500 flex items-center space-x-1">
                            <Mail size={14} />
                            <span>Email: {task.reminderEmail}</span>
                          </span>
                        )}
                      </div>

                      {/* Auto-reminder toggle */}
                      <div className="flex items-center space-x-4 mb-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`auto-${task._id}`}
                            checked={taskAutoReminder?.enabled || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (!isAuthenticated) {
                                  const email = prompt('Enter your email for auto-reminders:');
                                  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                    toggleAutoReminder(task._id, true, email);
                                  }
                                } else {
                                  toggleAutoReminder(task._id, true);
                                }
                              } else {
                                toggleAutoReminder(task._id, false);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`auto-${task._id}`} className="text-sm font-medium text-gray-700">
                            Auto-reminder (24h & 48h before deadline)
                          </label>
                        </div>
                        {taskAutoReminder?.enabled && (
                          <div className="text-xs text-green-600">
                            ✓ Active {taskAutoReminder.email && `(${taskAutoReminder.email})`}
                          </div>
                        )}
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
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${reminderStatus.color} bg-opacity-10`}>
                        {reminderStatus.text}
                      </span>
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

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Reminder Email</h3>
            <p className="text-gray-600 mb-4">
              Enter your email address to receive reminder notifications for this task.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEmailSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                  Set Reminder
                </button>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setUserEmail('');
                    setCurrentTaskId(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}