import React from 'react';
import { UserIcon, SettingsIcon, ChevronRightIcon } from './Icons';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'user' | 'admin') => void;
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

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
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

        {/* Right Panel */}
        <div className="w-full lg:w-[45%] xl:w-1/2 flex items-center justify-center min-h-screen p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="text-left mb-10">
                <h2 className="text-sm font-bold uppercase tracking-widest text-metal-gray mb-2">Select Your Role</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-metal-medium to-metal-dark"></div>
            </div>

            <div className="space-y-6">
                <RoleCard
                    icon={<UserIcon className="w-8 h-8 text-metal-dark" />}
                    title="User"
                    description="Access verification projects and dashboards."
                    onClick={() => onSelectRole('user')}
                />
                <RoleCard
                    icon={<SettingsIcon className="w-8 h-8 text-metal-dark" />}
                    title="Admin"
                    description="Manage users, permissions, and settings."
                    onClick={() => onSelectRole('admin')}
                />
            </div>
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
        className="group bg-white p-6 rounded-lg cursor-pointer border-2 border-metal-light hover:border-metal-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-center gap-6">
        <div className="bg-metal-medium/10 p-4 rounded-lg">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-metal-dark mb-1">{title}</h2>
          <p className="text-metal-gray">{description}</p>
        </div>
        <ChevronRightIcon className="w-6 h-6 ml-auto text-metal-light group-hover:text-metal-medium transition" />
      </div>
    </div>
);


export default RoleSelectionScreen;
