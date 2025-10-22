import React, { useState } from 'react';
import { NexVerLogo, UserIcon, LockIcon } from './Icons';

interface AuthScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { username, password });
    onLogin();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-950 font-sans relative overflow-hidden">
      {/* Background from WelcomeScreen */}
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

      <div className="w-full max-w-md bg-white dark:bg-secondary-900 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden z-10 border border-secondary-200/50 dark:border-secondary-700/50">
        <div className="p-8 text-secondary-900 dark:text-white">
          <div className="text-center mb-8">
            <NexVerLogo className="h-16 w-16 mx-auto text-primary-500 dark:text-primary-400" />
            <h1 className="text-4xl font-bold mt-4">NexVer</h1>
            <p className="text-lg text-secondary-500 dark:text-secondary-400 mt-1">
              User Login
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-3 text-secondary-400 dark:text-secondary-500" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/50 dark:bg-secondary-900/50 border border-secondary-300 dark:border-secondary-600 rounded-md pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="relative">
                <LockIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-3 text-secondary-400 dark:text-secondary-500" />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-secondary-900/50 border border-secondary-300 dark:border-secondary-600 rounded-md pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
            </div>
            
            <div className="text-right -mt-4">
                <button type="button" onClick={() => alert('Password recovery/change flow initiated.')} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none">
                    Forgot / Change Password?
                </button>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 text-center font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </form>
          
          <div className="text-center mt-8">
            <button
                onClick={onBack}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm focus:outline-none"
            >
                &larr; Back to Role Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;