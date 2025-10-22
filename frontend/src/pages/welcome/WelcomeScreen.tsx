import React, { useState } from 'react';
import { NexVerLogo, NewProjectIcon, FolderIcon, HelpIcon } from '../../components/Icons';
import CreateProjectModal from '../../components/CreateProjectModal';
import { Project } from '../../types';

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


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateProject, onOpenProject, existingProjects }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-950 font-sans relative overflow-hidden">
        {/* Professional Background */}
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


        <div className="w-full max-w-4xl bg-white dark:bg-secondary-900 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden flex flex-col z-10 border border-secondary-200/50 dark:border-secondary-700/50">
            <div className="flex-grow p-12 text-secondary-900 dark:text-white">
                <div className="text-center mb-10">
                    <NexVerLogo className="h-20 w-20 mx-auto text-primary-500 dark:text-primary-400" />
                    <h1 className="text-5xl font-bold mt-4">NexVer</h1>
                    <p className="text-xl text-secondary-500 dark:text-secondary-400 mt-2">
                        Accelerate Hardware Verification. Globally.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-12 items-center">
                    <div className="text-secondary-600 dark:text-secondary-300">
                        <h2 className="text-xl font-semibold mb-3 text-secondary-800 dark:text-secondary-100">Advanced Hardware Verification Platform.</h2>
                        <p className="text-base">
                        Automate VP generation, testbench creation, and coverage analysis for SystemVerilog, Verilog, & VHDL.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group flex items-center justify-between px-6 py-4 text-left font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300 transform hover:scale-105"
                        >
                            <span>Create New Project</span>
                            <NewProjectIcon className="w-6 h-6 transform transition-transform group-hover:rotate-90" />
                        </button>
                         <button
                            onClick={() => setIsProjectSelectorOpen(true)}
                            className="group flex items-center justify-between px-6 py-4 text-left font-bold text-secondary-800 dark:text-white bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300 transform hover:scale-105"
                        >
                            <span>Open Existing Project</span>
                            <FolderIcon className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
                        </button>
                         <button
                            className="group flex items-center justify-between px-6 py-4 text-left font-bold text-secondary-800 dark:text-white bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-300 transform hover:scale-105 opacity-60 cursor-not-allowed"
                        >
                            <span>Help & Tutorials</span>
                            <HelpIcon className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
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
