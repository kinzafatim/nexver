import React, { useState, useEffect, useCallback, useRef } from 'react';
import RoleSelectionScreen from './pages/auth/RoleSelectionScreen';
import AuthScreen from './pages/auth/AuthScreen';
import AdminPanel from './pages/admin/AdminPanel';
import WelcomeScreen from './pages/welcome/WelcomeScreen';
import ProjectLayout from './pages/project/ProjectLayout';
import { AppStatus, Project, ProjectState, UploadedFile, SimulatorSettings, HistoryEntry, LogEntry, VerificationPlanRow, ActiveTab } from './types';
import * as projectService from './services/projectService';
import AdminAuthScreen from './pages/auth/AdminAuthScreen';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [projectState, setProjectState] = useState<ProjectState>({ 
      status: AppStatus.RoleSelection,
      settings: {
        simulator: 'VCS',
        apiKey: '',
      },
      existingProjects: []
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Load initial projects
    projectService.getProjects().then(projects => {
      setProjectState(prevState => ({ ...prevState, existingProjects: projects }));
    });
  }, []);

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
    setProjectState(prevState => ({ ...prevState, project: undefined, status: AppStatus.RoleSelection }));
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
  }, []);

  const handleCreateProject = useCallback(async (details: { name: string }) => {
    const newProject = await projectService.createProject(details.name);
    setProjectState(prevState => ({
      ...prevState,
      status: AppStatus.ProjectCreation,
      project: newProject
    }));
  }, []);
  
  const handleOpenProject = useCallback(async (projectToOpen: Project) => {
      const projectDetails = await projectService.getProjectDetails(projectToOpen.name);
      setProjectState(prevState => {
        const newState = {
            ...prevState,
            project: projectDetails,
            status: projectDetails.verificationPlanData ? AppStatus.VPGenerated : AppStatus.Dashboard,
        };
        const newStateWithHistory = addHistoryEvent(`Opened project "${projectDetails.name}".`, newState);
        return addLogEntry(`Project "${projectDetails.name}" loaded successfully.`, 'success', newStateWithHistory);
      });
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

  const handleStateUpdate = (updater: (prevState: ProjectState) => ProjectState) => {
    setProjectState(updater);
  };

  const renderContent = () => {
    switch(projectState.status) {
      case AppStatus.RoleSelection:
        return <RoleSelectionScreen onSelectRole={handleSelectRole} theme={theme} toggleTheme={toggleTheme} />;
      case AppStatus.Auth:
        return <AuthScreen onLogin={handleLogin} onBack={handleBackToRoleSelection} />;
      case AppStatus.AdminAuth:
        return <AdminAuthScreen onAdminLogin={handleAdminLogin} onBack={handleBackToRoleSelection} />;
      case AppStatus.AdminPanel:
        return <AdminPanel onBack={handleBackToRoleSelection} />;
      case AppStatus.Welcome:
      case AppStatus.ProjectCreation:
        if (projectState.project && projectState.status === AppStatus.ProjectCreation) {
           return <ProjectLayout 
              projectState={projectState}
              theme={theme}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
              onGoToWelcome={handleGoToWelcome}
              onSaveProject={handleSaveProject}
              addHistoryEvent={(event, state) => addHistoryEvent(event, state)}
              addLogEntry={(message, type, state) => addLogEntry(message, type, state)}
              onStateUpdate={handleStateUpdate}
            />;
        }
        return <WelcomeScreen 
                  onCreateProject={handleCreateProject} 
                  onOpenProject={handleOpenProject}
                  existingProjects={projectState.existingProjects}
               />;
      default:
         if (projectState.project) {
           return <ProjectLayout 
              projectState={projectState}
              theme={theme}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
              onGoToWelcome={handleGoToWelcome}
              onSaveProject={handleSaveProject}
              addHistoryEvent={(event, state) => addHistoryEvent(event, state)}
              addLogEntry={(message, type, state) => addLogEntry(message, type, state)}
              onStateUpdate={handleStateUpdate}
            />;
         }
         // Fallback to welcome if no project is loaded
         return <WelcomeScreen 
                  onCreateProject={handleCreateProject} 
                  onOpenProject={handleOpenProject}
                  existingProjects={projectState.existingProjects}
                />;
    }
  }
  
  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-white dark:bg-secondary-950">
      {renderContent()}
    </div>
  );
};

export default App;
