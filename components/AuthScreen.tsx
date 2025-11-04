import React, { useState } from 'react';
import { UserIcon, LockIcon } from './Icons';

interface AuthScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

const DecorativeShapes = () => (
  <>
    {/* Subtle circles for background texture */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-metal-medium/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-metal-medium/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
    
    {/* Diagonal capsule shapes inspired by example */}
    <div className="absolute bottom-[20%] left-[5%] w-32 h-6 bg-gradient-to-br from-metal-light/40 to-metal-medium/40 rounded-full transform -rotate-45 opacity-80"></div>
    <div className="absolute bottom-[25%] left-[15%] w-48 h-6 bg-gradient-to-br from-metal-light/40 to-metal-medium/40 rounded-full transform -rotate-45 opacity-80"></div>
    <div className="absolute bottom-[15%] left-[30%] w-40 h-6 bg-gradient-to-br from-metal-light/40 to-metal-medium/40 rounded-full transform -rotate-45 opacity-80"></div>
    <div className="absolute bottom-[30%] left-[35%] w-24 h-6 bg-gradient-to-br from-metal-light/40 to-metal-medium/40 rounded-full transform -rotate-45 opacity-80"></div>
  </>
);


const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="flex flex-wrap">
        {/* Left Panel */}
        <div className="hidden lg:flex w-full lg:w-[55%] xl:w-1/2 min-h-screen bg-gradient-to-br from-metal-dark to-metal-medium text-white p-12 lg:p-20 flex-col justify-center relative overflow-hidden">
          <DecorativeShapes />
          <div className="z-10">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">Welcome to NexVer</h1>
            <p className="mt-4 text-lg xl:text-xl text-metal-light max-w-lg">
              Accelerate Hardware Verification. Globally. An advanced hardware verification platform to automate VP generation, testbench creation, and coverage analysis.
            </p>
          </div>
        </div>

        {/* Right Panel (Login Form) */}
        <div className="w-full lg:w-[45%] xl:w-1/2 flex items-center justify-center min-h-screen p-8 bg-white">
          <div className="w-full max-w-sm">
            <div className="text-left mb-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-metal-gray mb-2">User Login</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-metal-medium to-metal-dark"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-4 text-metal-gray" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-metal-white border-transparent rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-metal-medium focus:outline-none transition"
                />
              </div>
              <div className="relative">
                <LockIcon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-4 text-metal-gray" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-metal-white border-transparent rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-metal-medium focus:outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-metal-gray cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-metal-light text-metal-medium focus:ring-metal-medium"/>
                  Remember me
                </label>
                <a href="#" className="font-semibold text-metal-dark hover:text-metal-medium transition">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 text-center font-bold tracking-wider text-white bg-gradient-to-r from-metal-medium to-metal-dark rounded-full hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-metal-medium transition-all duration-300 transform hover:scale-105"
              >
                LOGIN
              </button>
            </form>
            
            <div className="text-center mt-8">
              <button
                  onClick={onBack}
                  className="font-semibold text-metal-dark hover:text-metal-medium text-sm focus:outline-none transition"
              >
                  &larr; Back to Role Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
