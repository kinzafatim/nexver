import React, { useState } from 'react';
import { NexVerLogo, UserIcon, LockIcon } from '../../components/Icons';
import { login } from '../../services/authService';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await login(username, password);
      if (response.success) {
        onLogin();
      } else {
        setError(response.message || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-900 font-sans relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 bg-transparent 
            bg-[linear-gradient(theme(colors.secondary.300)_1px,transparent_1px),linear-gradient(90deg,theme(colors.secondary.300)_1px,transparent_1px)] 
            dark:bg-[linear-gradient(theme(colors.secondary.800)_1px,transparent_1px),linear-gradient(90deg,theme(colors.secondary.800)_1px,transparent_1px)] 
            [background-size:2.5rem_2.5rem] opacity-75 dark:opacity-50">
        </div>

        <div className="w-full max-w-md bg-white dark:bg-secondary-950 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden z-10 border border-secondary-200/50 dark:border-secondary-700/50">
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
              
              <div className="text-right -mt-2">
                  <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus:outline-none">
                      Forgot Password?
                  </button>
              </div>

              {error && <p className="text-sm text-red-500 dark:text-red-400 text-center -mt-2">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 text-center font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? 'Logging In...' : 'Login'}
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
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </>
  );
};

export default AuthScreen;
