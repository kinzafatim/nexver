import React, { useState, useEffect, useRef } from 'react';
import { MoonIcon, SunIcon, NexVerLogo, SettingsIcon, UserIcon, LogOutIcon, SidebarIcon } from '../../components/Icons';
import { Project } from '../../types';

type Theme = 'light' | 'dark';

interface HeaderProps { 
    theme: Theme; 
    toggleTheme: () => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    onToggleSidebar: () => void;
    project?: Project 
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onOpenSettings, onLogout, onToggleSidebar, project }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return (
        <header className="flex-shrink-0 bg-white dark:bg-secondary-900 h-16 flex items-center justify-between px-6 border-b border-secondary-200 dark:border-secondary-800 shadow-sm z-20">
            <div className="flex items-center gap-4">
            <button onClick={onToggleSidebar} className="p-2 -ml-2 rounded-full text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <SidebarIcon className="w-6 h-6" />
            </button>
            <NexVerLogo className="h-8 w-8 text-primary-500" />
            <div className="text-xl font-bold text-secondary-800 dark:text-secondary-100">
                Nex<span className="text-primary-500">Ver</span>
            </div>
            {project && <span className="text-sm text-secondary-500 dark:text-secondary-400">/ {project.name}</span>}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={onOpenSettings} className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <SettingsIcon className="w-6 h-6" />
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>
                 {/* Profile Dropdown */}
                <div ref={profileMenuRef} className="relative">
                    <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-secondary-900 focus:ring-primary-500">
                        <UserIcon className="w-6 h-6 text-white" />
                    </button>
                    {isProfileMenuOpen && (
                        <div className="absolute top-14 right-0 w-64 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-20 border border-secondary-200 dark:border-secondary-700 py-1 transition-all duration-150 ease-out origin-top-right">
                           <div className="flex items-center gap-3 p-3 border-b border-secondary-200 dark:border-secondary-700">
                              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                  <p className="font-semibold text-sm text-secondary-800 dark:text-white">Alex Hudson</p>
                                  <p className="text-xs text-secondary-500 dark:text-secondary-400">alex.hudson@nexver.io</p>
                              </div>
                           </div>
                           <button
                              onClick={onLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 transition-colors"
                           >
                              <LogOutIcon className="w-4 h-4" />
                              <span>Logout</span>
                           </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;