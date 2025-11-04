import React from 'react';
import { NexVerLogo, UserIcon, SettingsIcon, SunIcon, MoonIcon } from '../../components/Icons';

type Theme = 'light' | 'dark';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'user' | 'admin') => void;
  theme: Theme;
  toggleTheme: () => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, theme, toggleTheme }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-900 font-sans relative overflow-hidden">
      <div className="absolute top-6 right-6 z-20">
        <button onClick={toggleTheme} className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
          {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 bg-transparent 
          bg-[linear-gradient(theme(colors.secondary.300)_1px,transparent_1px),linear-gradient(90deg,theme(colors.secondary.300)_1px,transparent_1px)] 
          dark:bg-[linear-gradient(theme(colors.secondary.800)_1px,transparent_1px),linear-gradient(90deg,theme(colors.secondary.800)_1px,transparent_1px)] 
          [background-size:2.5rem_2.5rem] opacity-75 dark:opacity-50">
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-secondary-950 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden z-10 border border-secondary-200/50 dark:border-secondary-700/50">
        <div className="p-12 text-secondary-800 dark:text-white">
          <div className="text-center mb-10">
            <NexVerLogo className="h-20 w-20 mx-auto text-primary-500" />
            <h1 className="text-5xl font-bold mt-4 text-secondary-900 dark:text-white">NexVer</h1>
            <p className="text-xl text-secondary-500 dark:text-secondary-400 mt-2">
              Select Your Role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RoleCard
              icon={<UserIcon className="w-10 h-10 mb-4 text-primary-500" />}
              title="User"
              description="Access your verification projects and dashboards."
              onClick={() => onSelectRole('user')}
            />
            <RoleCard
              icon={<SettingsIcon className="w-10 h-10 mb-4 text-primary-500" />}
              title="Admin"
              description="Manage users, permissions, and system settings."
              onClick={() => onSelectRole('admin')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <div
        onClick={onClick}
        className="group bg-white/50 dark:bg-secondary-800/50 p-6 rounded-lg text-center cursor-pointer border-2 border-secondary-200/50 dark:border-transparent hover:border-primary-500 hover:bg-white dark:hover:bg-secondary-700/50 transition-all duration-300 transform hover:-translate-y-2 shadow-sm hover:shadow-xl flex flex-col items-center justify-center h-72"
    >
        {icon}
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">{title}</h2>
        <p className="text-secondary-600 dark:text-secondary-400">{description}</p>
    </div>
);


export default RoleSelectionScreen;