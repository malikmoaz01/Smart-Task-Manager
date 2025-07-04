import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-700">STM</h1>
            <p className="text-xs text-gray-500">Simple Task Manager</p>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">All Tasks</Link>
            <Link to="/category" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">Categories</Link>
            <Link to="/deadlines" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">Deadlines</Link>
            <Link to="/reminders" className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium">Reminders</Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login" className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition">Login</Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition">Signup</Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <div className="px-4 pt-4 pb-2 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-blue-600 text-base font-medium">All Tasks</Link>
            <Link to="/category" className="block text-gray-700 hover:text-blue-600 text-base font-medium">Categories</Link>
            <Link to="/deadlines" className="block text-gray-700 hover:text-blue-600 text-base font-medium">Deadlines</Link>
            <Link to="/reminders" className="block text-gray-700 hover:text-blue-600 text-base font-medium">Reminders</Link>
            <div className="pt-4 border-t border-gray-100 flex space-x-2">
              <Link to="/login" className="flex-1 text-center text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition">Login</Link>
              <Link to="/signup" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition">Signup</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
