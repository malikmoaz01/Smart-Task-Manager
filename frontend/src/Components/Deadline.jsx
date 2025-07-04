import React from 'react';
import { Heart } from 'lucide-react';
 
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-white to-blue-100 border-t border-gray-200 mt-auto shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-2">
          <p className="text-gray-700 text-sm font-medium">
            Made with
          </p>
          <Heart className="w-4 h-4 text-blue-500 animate-pulse" />
          <p className="text-gray-700 text-sm font-medium">
            for <span className="font-semibold text-blue-600">Jeeny</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
