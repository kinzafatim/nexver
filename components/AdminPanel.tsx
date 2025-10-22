import React from 'react';
import { UserIcon, LockIcon } from './Icons';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-950 font-sans relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-50">
        <svg className="absolute w-full h-full text-secondary-300/70 dark:text-primary-950/50" xmlns="http://www.w3.org/2000/svg" fill="none">
          <defs>
            <pattern id="texture-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#texture-pattern)" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white dark:to-secondary-950 z-0"></div>
      <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,rgba(38,118,213,0.05)_0%,rgba(255,255,255,0)_60%) dark:bg-radial-gradient(ellipse_at_center,rgba(38,118,213,0.1)_0%,rgba(27,32,44,0)_60%)"></div>

      <div className="w-full max-w-4xl bg-white dark:bg-secondary-900 backdrop-blur-lg rounded-xl shadow-2xl z-10 border border-secondary-200/50 dark:border-secondary-700/50 p-8 text-secondary-900 dark:text-white">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>
        
        <div className="text-center mb-8">
            <p className="text-lg text-secondary-600 dark:text-secondary-400">User Management Functions</p>
            <p className="text-secondary-500 dark:text-secondary-500 mt-2">This area is for creating, editing, and managing user accounts and permissions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/50 dark:bg-secondary-800 p-6 rounded-lg">
                <UserIcon className="w-10 h-10 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
                <h2 className="text-xl font-semibold">Create User</h2>
            </div>
            <div className="bg-white/50 dark:bg-secondary-800 p-6 rounded-lg">
                <LockIcon className="w-10 h-10 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
                <h2 className="text-xl font-semibold">Alter Permissions</h2>
            </div>
            <div className="bg-white/50 dark:bg-secondary-800 p-6 rounded-lg">
                <UserIcon className="w-10 h-10 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
                <h2 className="text-xl font-semibold">View All Users</h2>
            </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 text-center font-bold text-secondary-800 dark:text-white bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300"
          >
            &larr; Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;