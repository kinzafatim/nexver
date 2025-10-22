import React from 'react';
import { NexVerLogo, UserIcon, SettingsIcon } from '../../components/Icons';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'user' | 'admin') => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-950 font-sans relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-50">
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

      <div className="w-full max-w-2xl bg-white dark:bg-secondary-900 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden z-10 border border-secondary-200/50 dark:border-secondary-700/50">
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
              icon={<UserIcon className="w-12 h-12 mb-4 text-primary-500" />}
              title="User"
              description="Access your verification projects and dashboards."
              onClick={() => onSelectRole('user')}
            />
            <RoleCard
              icon={<SettingsIcon className="w-12 h-12 mb-4 text-primary-500" />}
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
        className="group bg-white/50 dark:bg-secondary-800/50 p-8 rounded-lg text-center cursor-pointer border-2 border-secondary-200/50 dark:border-transparent hover:border-primary-500 hover:bg-white dark:hover:bg-secondary-700/50 transition-all duration-300 transform hover:-translate-y-2 shadow-sm hover:shadow-xl flex flex-col items-center justify-center h-80"
    >
        {icon}
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">{title}</h2>
        <p className="text-secondary-600 dark:text-secondary-400">{description}</p>
    </div>
);


export default RoleSelectionScreen;
