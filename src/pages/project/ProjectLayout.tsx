import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsModal from '../../components/Settings';
import CommandBar from '../../components/CommandBar';
import Terminal from '../../components/Terminal';
import { ProjectState, UploadedFile, SimulatorSettings, ActiveTab, VerificationPlanRow, AppStatus } from '../../types';
import * as projectService from '../../services/projectService';
import FilePreviewer from '../../components/FilePreviewer';
import { TerminalIcon } from '../../components/Icons';

// Import Tab Components
import DashboardTab from './tabs/DashboardTab';
import VerificationPlanTab from './tabs/VerificationPlanTab';
import TestbenchTab from './tabs/TestbenchTab';
import ArchitectureTab from './tabs/ArchitectureTab';
import ReportTab from './tabs/ReportTab';

type Theme = 'light' | 'dark';

interface ProjectLayoutProps {
    projectState: ProjectState;
    theme: Theme;
    toggleTheme: () => void;
    onLogout: () => void;
    onGoToWelcome: () => void;
    onSaveProject: () => void;
    addHistoryEvent: (event: string, state: ProjectState) => ProjectState;
    addLogEntry: (message: string, type: 'info' | 'success' | 'warning' | 'error', state: ProjectState) => ProjectState;
    onStateUpdate: (updater: (prevState: ProjectState) => ProjectState) => void;
}

const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 500;
const MIN_TERMINAL_HEIGHT = 100;

const LS_KEYS = {
    SIDEBAR_WIDTH: 'nexver_sidebar_width',
    SIDEBAR_OPEN: 'nexver_sidebar_open',
    TERMINAL_HEIGHT: 'nexver_terminal_height',
    TERMINAL_OPEN: 'nexver_terminal_open',
};

const ProjectLayout: React.FC<ProjectLayoutProps> = (props) => {
    const { projectState, theme, toggleTheme, onLogout, onGoToWelcome, onSaveProject, addHistoryEvent, addLogEntry, onStateUpdate } = props;

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
    const [activeTab, setActiveTab] = useState(ActiveTab.Dashboard);
    const [exportAction, setExportAction] = useState<string | null>(null);

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(288);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(250);

    const isResizingSidebarRef = useRef(false);
    const isResizingTerminalRef = useRef(false);

    // Load state from localStorage on initial render
    useEffect(() => {
        const savedWidth = localStorage.getItem(LS_KEYS.SIDEBAR_WIDTH);
        if (savedWidth) setSidebarWidth(Number(savedWidth));
        const savedSidebarOpen = localStorage.getItem(LS_KEYS.SIDEBAR_OPEN);
        if (savedSidebarOpen) setIsSidebarOpen(JSON.parse(savedSidebarOpen));
        const savedTerminalHeight = localStorage.getItem(LS_KEYS.TERMINAL_HEIGHT);
        if (savedTerminalHeight) setTerminalHeight(Number(savedTerminalHeight));
        const savedTerminalOpen = localStorage.getItem(LS_KEYS.TERMINAL_OPEN);
        if (savedTerminalOpen) setIsTerminalOpen(JSON.parse(savedTerminalOpen));
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => { localStorage.setItem(LS_KEYS.SIDEBAR_WIDTH, String(sidebarWidth)); }, [sidebarWidth]);
    useEffect(() => { localStorage.setItem(LS_KEYS.SIDEBAR_OPEN, JSON.stringify(isSidebarOpen)); }, [isSidebarOpen]);
    useEffect(() => { localStorage.setItem(LS_KEYS.TERMINAL_HEIGHT, String(terminalHeight)); }, [terminalHeight]);
    useEffect(() => { localStorage.setItem(LS_KEYS.TERMINAL_OPEN, JSON.stringify(isTerminalOpen)); }, [isTerminalOpen]);

    const handleFileSelect = useCallback((file: UploadedFile) => { setPreviewFile(file); }, []);
    const handleClosePreview = useCallback(() => { setPreviewFile(null); }, []);

    const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
        onStateUpdate(prevState => {
            if (!prevState.project) return prevState;
            const newSpecFiles = files.filter(f => f.type === 'Spec' && !prevState.project!.specFiles.some(pf => pf.name === f.name));
            const newState = { ...prevState, status: AppStatus.Dashboard, project: { ...prevState.project, specFiles: [...prevState.project.specFiles, ...newSpecFiles] } };
            const fileNames = files.map(f => f.name).join(', ');
            const newStateWithHistory = addHistoryEvent(`Uploaded files: ${fileNames}`, newState);
            return addLogEntry(`Successfully uploaded ${files.length} file(s): ${fileNames}`, 'success', newStateWithHistory);
        });
        setIsTerminalOpen(true);
    }, [onStateUpdate, addHistoryEvent, addLogEntry]);

    const handleGenerateVP = useCallback(async () => {
        if (!projectState.project) return;
        const vpData = await projectService.generateVerificationPlan(projectState.project.name);
        onStateUpdate(prev => {
            if (!prev.project) return prev;
            const stateWithVP = { ...prev, status: AppStatus.VPGenerated, project: { ...prev.project, ...vpData } };
            const stateWithVPHistory = addHistoryEvent('Verification Plan generated.', stateWithVP);
            return addLogEntry('Verification Plan generated successfully from RAG pipeline.', 'success', stateWithVPHistory);
        });
        setActiveTab(ActiveTab.VerificationPlan);
    }, [projectState.project, onStateUpdate, addHistoryEvent, addLogEntry]);

    const handleGenerateTB = useCallback(async () => {
        if (!projectState.project) return;
        await projectService.generateTestbench(projectState.project.name);
        onStateUpdate(prev => {
            let newState = addHistoryEvent('UVM Testbench & Tests generated.', { ...prev, status: AppStatus.TBAndTestsGenerated });
            return addLogEntry('UVM environment, testbench, and example tests generated.', 'success', newState);
        });
        setActiveTab(ActiveTab.TestbenchAndTests);
    }, [projectState.project, onStateUpdate, addHistoryEvent, addLogEntry]);

    const handleRunSimulation = useCallback(async () => {
        setIsSimulating(true);
        setSimulationProgress(0);
        setIsTerminalOpen(true);
        onStateUpdate(prev => {
          let newState = addHistoryEvent('Simulation started.', {...prev, status: AppStatus.Simulating});
          return addLogEntry('Simulation started. Monitor progress here.', 'info', newState);
        });
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                setSimulationProgress(progress);
                clearInterval(interval);
                setTimeout(() => {
                    onStateUpdate(current => {
                        let finalState = addHistoryEvent('Simulation finished. Report is ready.',{...current, status: AppStatus.ReportReady});
                        finalState = addLogEntry('Simulation complete. 1253 passed, 12 failed.', 'success', finalState);
                        return finalState;
                    });
                    setIsSimulating(false);
                    setActiveTab(ActiveTab.SimulationReport);
                }, 500);
            } else {
                setSimulationProgress(progress);
            }
        }, 200);
    }, [onStateUpdate, addHistoryEvent, addLogEntry]);

    const handleSaveSettings = useCallback((newSettings: SimulatorSettings) => {
        onStateUpdate(prev => ({ ...prev, settings: newSettings }));
    }, [onStateUpdate]);

    const handleUpdateVPData = useCallback((data: VerificationPlanRow[]) => {
      onStateUpdate(prev => {
        if (!prev.project) return prev;
        return { ...prev, project: { ...prev.project, verificationPlanData: data } }
      })
    }, [onStateUpdate]);

    const startSidebarResize = useCallback((mouseDownEvent: React.MouseEvent) => {
        isResizingSidebarRef.current = true;
        const startX = mouseDownEvent.clientX;
        const startWidth = sidebarWidth;
        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
            if (!isResizingSidebarRef.current) return;
            const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
            if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) setSidebarWidth(newWidth);
        };
        const handleMouseUp = () => {
            isResizingSidebarRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [sidebarWidth]);

    const startTerminalResize = useCallback((mouseDownEvent: React.MouseEvent) => {
        isResizingTerminalRef.current = true;
        const startY = mouseDownEvent.clientY;
        const startHeight = terminalHeight;
        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
            if (!isResizingTerminalRef.current) return;
            const newHeight = startHeight - (mouseMoveEvent.clientY - startY);
            if (newHeight >= MIN_TERMINAL_HEIGHT && newHeight < window.innerHeight * 0.8) setTerminalHeight(newHeight);
        };
        const handleMouseUp = () => {
            isResizingTerminalRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [terminalHeight]);

    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
    
    const renderActiveTab = () => {
        const commonProps = { projectState, isSimulating, simulationProgress };
        if (previewFile) {
            return ( <main className="flex-1 flex flex-col relative p-6 overflow-hidden"><FilePreviewer file={previewFile} onClose={handleClosePreview} logs={projectState.project?.logs} /></main> );
        }
        switch(activeTab) {
            case ActiveTab.Dashboard: return <DashboardTab {...commonProps} onFilesUploaded={handleFilesUploaded} onGenerateVP={handleGenerateVP} />;
            case ActiveTab.VerificationPlan: return <VerificationPlanTab {...commonProps} onGenerateTB={handleGenerateTB} onUpdateVPData={handleUpdateVPData} onExport={setExportAction} exportAction={exportAction} onExportComplete={() => setExportAction(null)} />;
            case ActiveTab.TestbenchAndTests: return <TestbenchTab {...commonProps} onRunSimulation={handleRunSimulation} />;
            case ActiveTab.UVMArchitecture: return <ArchitectureTab />;
            case ActiveTab.SimulationReport: return <ReportTab />;
            default: return <DashboardTab {...commonProps} onFilesUploaded={handleFilesUploaded} onGenerateVP={handleGenerateVP} />;
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <Header theme={theme} toggleTheme={toggleTheme} onOpenSettings={() => setIsSettingsOpen(true)} project={projectState.project} onLogout={onLogout} onToggleSidebar={toggleSidebar} />
            <CommandBar onNewProject={onGoToWelcome} onOpenProject={onGoToWelcome} onSaveProject={onSaveProject} onOpenSettings={() => setIsSettingsOpen(true)} onExport={setExportAction} onGenerateVP={handleGenerateVP} onGenerateTB={handleGenerateTB} onRunSim={handleRunSimulation} />
            <div className="flex flex-1 overflow-hidden">
                 <div style={{ width: isSidebarOpen ? sidebarWidth : 0 }} className="flex-shrink-0 bg-secondary-800 relative transition-all duration-300 ease-in-out">
                    <div className="w-full h-full overflow-hidden"><Sidebar projectState={projectState} onFileSelect={handleFileSelect} onNavigateToTab={setActiveTab} isSidebarOpen={isSidebarOpen} /></div>
                </div>
                <div onMouseDown={startSidebarResize} className="flex-shrink-0 w-1.5 cursor-col-resize bg-secondary-200 dark:bg-secondary-800 hover:bg-primary-500 transition-colors" />
                <div className="flex-1 flex flex-col bg-secondary-100 dark:bg-secondary-950 overflow-hidden">
                    <div className="flex-shrink-0 border-b border-secondary-200 dark:border-secondary-800 px-4">
                        <nav className="-mb-px flex space-x-2">
                            {Object.values(ActiveTab).map(tab => ( <TabButton key={tab} label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} disabled={isTabDisabled(tab, projectState.status)} /> ))}
                        </nav>
                    </div>
                    <div className="flex-1 flex flex-col relative overflow-y-hidden">
                        {renderActiveTab()}
                        {isTerminalOpen && projectState.project?.logs && (
                            <div className="flex-shrink-0 flex flex-col">
                                <div onMouseDown={startTerminalResize} className="w-full h-1.5 cursor-row-resize bg-secondary-300 dark:bg-secondary-800 hover:bg-primary-500 transition-colors"></div>
                                <Terminal style={{ height: `${terminalHeight}px` }} onClose={() => setIsTerminalOpen(false)} logs={projectState.project.logs} />
                            </div>
                        )}
                    </div>
                    <footer className="flex-shrink-0 h-8 bg-secondary-200 dark:bg-secondary-900 border-t border-secondary-300 dark:border-secondary-800 flex items-center justify-between px-4 text-xs text-secondary-600 dark:text-secondary-400">
                        <div>Ready</div>
                        <button onClick={() => setIsTerminalOpen(prev => !prev)} className="flex items-center gap-2 hover:text-primary-400"><TerminalIcon className="w-4 h-4" /><span>TERMINAL</span></button>
                    </footer>
                </div>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings} currentSettings={projectState.settings} />
        </div>
    );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; disabled?: boolean; }> = ({ label, isActive, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${isActive ? 'bg-secondary-100 dark:bg-secondary-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    {label}
  </button>
);

const isTabDisabled = (tab: ActiveTab, status: AppStatus) => {
    switch (tab) {
        case ActiveTab.VerificationPlan: return status < AppStatus.VPGenerated;
        case ActiveTab.TestbenchAndTests: return status < AppStatus.TBAndTestsGenerated;
        case ActiveTab.UVMArchitecture: return status < AppStatus.TBAndTestsGenerated;
        case ActiveTab.SimulationReport: return status < AppStatus.ReportReady;
        default: return false;
    }
};

export default ProjectLayout;