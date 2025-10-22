import React, { useState, useEffect, useCallback, useRef } from 'react';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import SettingsModal from './components/Settings';
import CommandBar from './components/CommandBar';
import { MoonIcon, SunIcon, NexVerLogo, SettingsIcon, UserIcon, LogOutIcon } from './components/Icons';
import { AppStatus, Project, ProjectState, UploadedFile, SimulatorSettings, HistoryEntry, LogEntry, VerificationPlanRow, ActiveTab } from './types';
import { mockVerificationPlanMarkdown, mockProjects, mockVerificationPlanTableData, mockVerificationPlanExtraSheets } from './services/mockData';
import AdminAuthScreen from './components/AdminAuthScreen';

type Theme = 'light' | 'dark';

const Header: React.FC<{ 
    theme: Theme; 
    toggleTheme: () => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    project?: Project 
}> = ({ theme, toggleTheme, onOpenSettings, onLogout, project }) => {
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
        <header className="flex-shrink-0 bg-white dark:bg-secondary-900 h-16 flex items-center justify-between px-6 border-b border-secondary-200 dark:border-secondary-800 shadow-sm">
            <div className="flex items-center gap-4">
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

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [activeTab, setActiveTab] = useState(ActiveTab.Dashboard);
  const [exportAction, setExportAction] = useState<string | null>(null);
  const [projectState, setProjectState] = useState<ProjectState>({ 
      status: AppStatus.RoleSelection,
      settings: {
        simulator: 'VCS',
        apiKey: '',
      },
      existingProjects: mockProjects
  });
  // Fix: Lift simulation state to App component
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addHistoryEvent = (event: string, state: ProjectState): ProjectState => {
      if (!state.project) return state;
      const newHistoryEntry: HistoryEntry = {
          id: Date.now(),
          event,
          timestamp: new Date()
      };
      return {
          ...state,
          project: {
              ...state.project,
              history: [...state.project.history, newHistoryEntry]
          }
      }
  };
  
  const addLogEntry = (message: string, type: LogEntry['type'], state: ProjectState): ProjectState => {
      if (!state.project) return state;
      const newLogEntry: LogEntry = {
          id: Date.now(),
          message,
          type,
          timestamp: new Date()
      };
      return {
          ...state,
          project: {
              ...state.project,
              logs: [...state.project.logs, newLogEntry]
          }
      };
  };

  const handleSelectRole = useCallback((role: 'user' | 'admin') => {
    if (role === 'user') {
      setProjectState(prevState => ({ ...prevState, status: AppStatus.Auth }));
    } else {
      setProjectState(prevState => ({ ...prevState, status: AppStatus.AdminAuth }));
    }
  }, []);

  const handleAdminLogin = useCallback(() => {
    setProjectState(prevState => ({
      ...prevState,
      status: AppStatus.AdminPanel,
    }));
  }, []);

  const handleBackToRoleSelection = useCallback(() => {
    setProjectState(prevState => ({ ...prevState, status: AppStatus.RoleSelection }));
  }, []);

  const handleLogin = useCallback(() => {
    setProjectState(prevState => ({
      ...prevState,
      status: AppStatus.Welcome,
    }));
  }, []);

  const handleLogout = useCallback(() => {
    setProjectState(prevState => ({
      ...prevState,
      status: AppStatus.RoleSelection,
      project: undefined,
    }));
    setActiveTab(ActiveTab.Dashboard);
  }, []);

  const handleCreateProject = useCallback((details: { name: string }) => {
    const location = `C:\\Users\\user\\Documents\\NexVer_Projects\\${details.name}`;
    const initialHistory: HistoryEntry = { id: Date.now(), event: `Project "${details.name}" created at ${location}.`, timestamp: new Date() };
    const initialLog: LogEntry = { id: Date.now(), message: `Project created. Waiting for file uploads.`, type: 'info', timestamp: new Date() };
    setProjectState(prevState => ({
      ...prevState,
      status: AppStatus.ProjectCreation,
      project: { name: details.name, location: location, specFiles: [], history: [initialHistory], logs: [initialLog] }
    }));
    setActiveTab(ActiveTab.Dashboard);
  }, []);
  
  const handleOpenProject = useCallback((projectToOpen: Project) => {
      setProjectState(prevState => {
        const newState = {
            ...prevState,
            project: projectToOpen,
            status: projectToOpen.verificationPlanData ? AppStatus.VPGenerated : AppStatus.Dashboard,
        };
        const newStateWithHistory = addHistoryEvent(`Opened project "${projectToOpen.name}".`, newState);
        return addLogEntry(`Project "${projectToOpen.name}" loaded successfully.`, 'success', newStateWithHistory);
      });
      setActiveTab(ActiveTab.Dashboard);
  }, []);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setPreviewFile(file);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);
  
  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setProjectState(prevState => {
      if (!prevState.project) return prevState;
      const newSpecFiles = files.filter(f => f.type === 'Spec' && !prevState.project!.specFiles.some(pf => pf.name === f.name));
      
      const newState = {
        ...prevState,
        status: AppStatus.Dashboard,
        project: {
          ...prevState.project,
          specFiles: [...prevState.project.specFiles, ...newSpecFiles],
        }
      };
      
      const fileNames = files.map(f => f.name).join(', ');
      const newStateWithHistory = addHistoryEvent(`Uploaded files: ${fileNames}`, newState);
      return addLogEntry(`Successfully uploaded ${files.length} file(s): ${fileNames}`, 'success', newStateWithHistory);
    });
  }, []);

  const handleGenerateVP = useCallback(async () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            setProjectState(prev => {
                if (!prev.project) return prev;
                
                const stateWithVP = {
                    ...prev,
                    status: AppStatus.VPGenerated,
                    project: {
                        ...prev.project,
                        verificationPlan: mockVerificationPlanMarkdown,
                        verificationPlanData: mockVerificationPlanTableData,
                        verificationPlanSheets: mockVerificationPlanExtraSheets,
                    }
                };
                const stateWithVPHistory = addHistoryEvent('Verification Plan generated.', stateWithVP);
                return addLogEntry('Verification Plan generated successfully from RAG pipeline.', 'success', stateWithVPHistory);
            });
            resolve();
        }, 2500);
    });
  }, []);

  const handleUpdateVPData = useCallback((data: VerificationPlanRow[]) => {
      setProjectState(prev => {
        if (!prev.project) return prev;
        return {
            ...prev,
            project: {
                ...prev.project,
                verificationPlanData: data,
            }
        }
      })
  }, []);

  const handleGenerateTBAndTests = useCallback(async () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            setProjectState(prev => {
                let newState = addHistoryEvent('UVM Testbench & Tests generated.', { ...prev, status: AppStatus.TBAndTestsGenerated });
                return addLogEntry('UVM environment, testbench, and example tests generated.', 'success', newState);
            });
            resolve();
        }, 2500);
    });
  }, []);
  
  // Fix: Rewritten to be parameter-less and manage its own state.
  const handleRunSimulation = useCallback(async () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setProjectState(prev => {
      let newState = addHistoryEvent('Simulation started.', {...prev, status: AppStatus.Simulating});
      return addLogEntry('Simulation started with VCS. Monitor progress here.', 'info', newState);
    });
    
    return new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                setSimulationProgress(progress);
                clearInterval(interval);
                setTimeout(() => {
                    setProjectState(current => {
                        let finalState = addHistoryEvent('Simulation finished. Report is ready.',{...current, status: AppStatus.ReportReady});
                        if(Math.random() > 0.8){
                            finalState = addLogEntry(`Test 'Register file access' FAILED. See report for details.`, 'error', finalState);
                        }
                        finalState = addLogEntry('Simulation complete. 1253 passed, 12 failed.', 'success', finalState);
                        return finalState;
                    });
                    setIsSimulating(false);
                    setActiveTab(ActiveTab.SimulationReport);
                    resolve();
                }, 500);
            } else {
                setSimulationProgress(progress);
            }
        }, 200);
    });
  }, []);
  
  const handleSaveSettings = useCallback((newSettings: SimulatorSettings) => {
      setProjectState(prev => ({
          ...prev,
          settings: newSettings,
      }));
  }, []);

  const handleGoToWelcome = useCallback(() => {
    setProjectState(prevState => ({
      ...prevState,
      status: AppStatus.Welcome,
      project: undefined,
    }));
  }, []);

  const handleSaveProject = useCallback(() => {
      setProjectState(prevState => {
        if (!prevState.project) return prevState;
        const newState = addHistoryEvent(`Project "${prevState.project.name}" saved.`, prevState);
        return addLogEntry(`Project saved successfully.`, 'success', newState);
      });
  }, []);

  if (projectState.status === AppStatus.RoleSelection) {
    return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
  }

  if (projectState.status === AppStatus.AdminPanel) {
    return <AdminPanel onBack={handleBackToRoleSelection} />;
  }
  
  if (projectState.status === AppStatus.AdminAuth) {
    return <AdminAuthScreen onAdminLogin={handleAdminLogin} onBack={handleBackToRoleSelection} />;
  }

  if (projectState.status === AppStatus.Auth) {
    return <AuthScreen onLogin={handleLogin} onBack={handleBackToRoleSelection} />;
  }

  if (projectState.status === AppStatus.Welcome || !projectState.project) {
    return <WelcomeScreen 
              onCreateProject={handleCreateProject} 
              onOpenProject={handleOpenProject}
              existingProjects={projectState.existingProjects}
           />;
  }
  
  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-white dark:bg-secondary-950">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        project={projectState.project} 
        onLogout={handleLogout}
      />
      <CommandBar 
          onNewProject={handleGoToWelcome}
          onOpenProject={handleGoToWelcome}
          onSaveProject={handleSaveProject}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExport={setExportAction}
          onGenerateVP={handleGenerateVP}
          onGenerateTB={handleGenerateTBAndTests}
          onRunSim={handleRunSimulation}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          projectState={projectState} 
          onFileSelect={handleFileSelect}
          onNavigateToTab={setActiveTab}
        />
        <MainContent 
          status={projectState.status} 
          project={projectState.project}
          logs={projectState.project?.logs || []}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFilesUploaded={handleFilesUploaded}
          onGenerateVP={handleGenerateVP}
          onGenerateTBAndTests={handleGenerateTBAndTests}
          onRunSimulation={handleRunSimulation}
          onUpdateVPData={handleUpdateVPData}
          previewFile={previewFile}
          onClosePreview={handleClosePreview}
          exportAction={exportAction}
          onExportComplete={() => setExportAction(null)}
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
        />
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={projectState.settings}
      />
    </div>
  );
};

export default App;