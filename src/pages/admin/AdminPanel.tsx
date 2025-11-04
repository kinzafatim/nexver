import React from 'react';
import { UserIcon, LockIcon } from '../../components/Icons';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-900 font-sans relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 bg-transparent 
          bg-[linear-gradient(theme(colors.secondary.300)_1px,transparent_1px),linear-gradient(90deg,theme(colors.secondary.300)_1px,transparent_1px)] 
          dark:bg-[linear-gradient(theme(colors.secondary.800)_1px,transparent_1px),linear-gradient(90deg,theme(colors.secondary.800)_1px,transparent_1px)] 
          [background-size:2.5rem_2.5rem] opacity-75 dark:opacity-50">
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-secondary-950 backdrop-blur-lg rounded-xl shadow-2xl z-10 border border-secondary-200/50 dark:border-secondary-700/50 p-8 text-secondary-900 dark:text-white">
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