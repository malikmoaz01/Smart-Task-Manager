import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete project proposal', category: 'Work', deadline: '2025-07-10', reminder: '2025-07-09' },
    { id: 2, title: 'Buy groceries', category: 'Personal', deadline: '2025-07-05', reminder: '2025-07-05' },
    { id: 3, title: 'Call dentist', category: 'Health', deadline: '2025-07-08', reminder: '2025-07-07' }
  ]);

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleEditTask = (taskId) => {
    const newTitle = prompt('Edit task title:');
    if (newTitle) {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, title: newTitle } : task
      ));
    }
  };

  const handleAddTask = () => {
    const newTitle = prompt('Enter task title:');
    if (newTitle) {
      const newTask = {
        id: Date.now(),
        title: newTitle,
        category: 'General',
        deadline: '2025-07-10',
        reminder: '2025-07-09'
      };
      setTasks([...tasks, newTask]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h2>
            <p className="text-gray-600">Manage your daily tasks efficiently</p>
          </div>
          <button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>
 
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span>Deadline: {task.deadline}</span>
                    <span>Reminder: {task.reminder}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditTask(task.id)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first task</p>
            <button
              onClick={handleAddTask}
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