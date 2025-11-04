import React, { useState } from 'react';
import { NexVerLogo, NewProjectIcon, FolderIcon, HelpIcon } from './Icons';
import CreateProjectModal from './CreateProjectModal';
import { Project } from '../types';

interface WelcomeScreenProps {
  onCreateProject: (details: { name: string }) => void;
  onOpenProject: (project: Project) => void;
  existingProjects: Project[];
}

interface OpenProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProject: (project: Project) => void;
    projects: Project[];
}

const OpenProjectModal: React.FC<OpenProjectModalProps> = ({ isOpen, onClose, onSelectProject, projects }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-2xl text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <h2 className="text-xl font-bold">Open Existing Project</h2>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">Select a project to continue your work.</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                    <ul className="space-y-3">
                        {projects.map(p => (
                            <li key={p.name} onClick={() => onSelectProject(p)} className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-700/50 cursor-pointer transition-colors border border-transparent hover:border-primary-500">
                                <div className="flex items-center gap-4">
                                    <FolderIcon className="w-6 h-6 text-primary-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-base">{p.name}</h3>
                                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{p.location}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-secondary-500">{p.history.slice(-1)[0].timestamp.toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="px-6 py-4 bg-secondary-100/50 dark:bg-secondary-900/50 flex justify-end gap-4 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-secondary-200 text-secondary-800 hover:bg-secondary-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const DecorativeShapes = () => (
    <>
      <div className="absolute w-64 h-64 bg-metal-light/5 rounded-full -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-metal-light/5 rounded-full -bottom-32 -right-10"></div>
      <div className="absolute bottom-[20%] left-[10%] w-48 h-1.5 bg-gradient-to-r from-metal-medium/80 to-metal-light/80 transform -rotate-45 rounded-full opacity-60"></div>
      <div className="absolute bottom-[25%] left-[25%] w-32 h-1.5 bg-gradient-to-r from-metal-medium/80 to-metal-light/80 transform -rotate-45 rounded-full opacity-60"></div>
      <div className="absolute bottom-[15%] left-[40%] w-40 h-1.5 bg-gradient-to-r from-metal-medium/80 to-metal-light/80 transform -rotate-45 rounded-full opacity-60"></div>
    </>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateProject, onOpenProject, existingProjects }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-metal-dark to-metal-medium font-sans relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <DecorativeShapes />
        </div>

        <div className="w-full max-w-4xl bg-metal-white dark:bg-secondary-900 rounded-xl shadow-2xl overflow-hidden flex flex-col z-10 border border-white/20">
            <div className="flex-grow p-12 text-metal-dark dark:text-white">
                <div className="text-center mb-10">
                    <NexVerLogo className="h-20 w-20 mx-auto text-metal-dark dark:text-metal-medium" />
                    <h1 className="text-5xl font-bold mt-4">NexVer</h1>
                    <p className="text-xl text-metal-gray dark:text-metal-light mt-2">
                        Accelerate Hardware Verification. Globally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="text-metal-dark/80 dark:text-metal-light">
                        <h2 className="text-xl font-semibold mb-3 text-metal-dark dark:text-metal-white">Advanced Hardware Verification Platform.</h2>
                        <p className="text-base">
                        Automate VP generation, testbench creation, and coverage analysis for SystemVerilog, Verilog, & VHDL.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group flex items-center justify-between px-6 py-4 text-left font-bold text-white bg-gradient-to-r from-metal-medium to-metal-dark rounded-full hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-metal-medium transition-all duration-300 transform hover:scale-105"
                        >
                            <span>Create New Project</span>
                            <NewProjectIcon className="w-6 h-6 transform transition-transform group-hover:rotate-90" />
                        </button>
                         <button
                            onClick={() => setIsProjectSelectorOpen(true)}
                            className="group flex items-center justify-between px-6 py-4 text-left font-bold text-metal-dark dark:text-white bg-metal-light dark:bg-metal-gray rounded-full hover:bg-metal-light/80 dark:hover:bg-metal-gray/80 focus:outline-none focus:ring-2 focus:ring-metal-medium transition-all duration-300 transform hover:scale-105"
                        >
                            <span>Open Existing Project</span>
                            <FolderIcon className="w-6 h-6 text-metal-dark" />
                        </button>
                         <button
                            className="group flex items-center justify-between px-6 py-4 text-left font-bold text-metal-dark/70 dark:text-white/70 bg-metal-light/50 dark:bg-metal-gray/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300 opacity-60 cursor-not-allowed"
                        >
                            <span>Help & Tutorials</span>
                            <HelpIcon className="w-6 h-6 text-metal-gray/70 dark:text-metal-light/70" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={onCreateProject}
      />
      <OpenProjectModal
        isOpen={isProjectSelectorOpen}
        onClose={() => setIsProjectSelectorOpen(false)}
        onSelectProject={onOpenProject}
        projects={existingProjects}
      />
    </>
  );
};

export default WelcomeScreen;
