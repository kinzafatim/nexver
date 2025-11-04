import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsModal from '../../components/Settings';
import CommandBar from '../../components/CommandBar';
import Terminal from '../../components/Terminal';
// FIX: Added 'AppStatus' to the import list to resolve multiple 'Cannot find name' errors.
import { ProjectState, UploadedFile, SimulatorSettings, ActiveTab, VpDataSheets, AppStatus } from '../../types';
import * as projectService from '../../services/projectService';
import FilePreviewer from '../../components/FilePreviewer';
import { TerminalIcon, BoldIcon, HighlighterIcon } from '../../components/Icons';

import DashboardTab from './tabs/DashboardTab';
import VerificationPlanTab from './tabs/VerificationPlanTab';
import TestbenchTab from './tabs/TestbenchTab';
import ArchitectureTab from './tabs/ArchitectureTab';
import ReportTab from './tabs/ReportTab';

import { useVerificationPlanData, SheetName, sheetNames } from './tabs/useVerificationPlanData';

type Theme = 'light' | 'dark';

// Type declarations for CDN libraries
declare var jspdf: any;
declare var html2canvas: any;
declare var XLSX: any;


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

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);

    const [isLoadingVP, setIsLoadingVP] = useState(false);
    const cancelVpRef = useRef(false);
    const vpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(288);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(250);

    const isResizingSidebarRef = useRef(false);
    const isResizingTerminalRef = useRef(false);

    // --- VP Editing State ---
    const originalSheetsData = useVerificationPlanData(projectState.project);
    const [draftSheets, setDraftSheets] = useState<VpDataSheets | null>(null);
    const hasChanges = draftSheets !== null;

    useEffect(() => {
        setDraftSheets(null);
    }, [projectState.project?.name]);
    
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

        return () => { if (vpTimeoutRef.current) clearTimeout(vpTimeoutRef.current); };
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => { localStorage.setItem(LS_KEYS.SIDEBAR_WIDTH, String(sidebarWidth)); }, [sidebarWidth]);
    useEffect(() => { localStorage.setItem(LS_KEYS.SIDEBAR_OPEN, JSON.stringify(isSidebarOpen)); }, [isSidebarOpen]);
    useEffect(() => { localStorage.setItem(LS_KEYS.TERMINAL_HEIGHT, String(terminalHeight)); }, [terminalHeight]);
    useEffect(() => { localStorage.setItem(LS_KEYS.TERMINAL_OPEN, JSON.stringify(isTerminalOpen)); }, [isTerminalOpen]);

    const handleFileSelect = useCallback((file: UploadedFile) => { setPreviewFile(file); }, []);
    const handleClosePreview = useCallback(() => { setPreviewFile(null); }, []);
    
    const handleTabChange = useCallback((tab: ActiveTab) => {
        setActiveTab(tab);
        handleClosePreview();
    }, [handleClosePreview]);

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
        cancelVpRef.current = false;
        setIsLoadingVP(true);
        
        onStateUpdate(prev => addLogEntry('Generating Verification Plan from specification...', 'info', prev));
        
        // Simulating async call that can be cancelled
        const generationPromise = new Promise(resolve => {
            vpTimeoutRef.current = setTimeout(resolve, 2500);
        });
        
        await generationPromise;

        if (cancelVpRef.current) {
            return; // Stop execution if cancelled
        }
        
        try {
            const vpData = await projectService.generateVerificationPlan(projectState.project.name);

            onStateUpdate(prev => {
                if (!prev.project) return prev;
                const stateWithVP = {
                    ...prev,
                    status: AppStatus.VPGenerated,
                    project: {
                        ...prev.project,
                        ...vpData,
                    }
                };
                const stateWithVPHistory = addHistoryEvent('Verification Plan generated.', stateWithVP);
                return addLogEntry('Verification Plan generated successfully from RAG pipeline.', 'success', stateWithVPHistory);
            });
            handleTabChange(ActiveTab.VerificationPlan);
        } catch (error) {
            onStateUpdate(prev => addLogEntry(`Failed to generate Verification Plan: ${error}`, 'error', prev));
        } finally {
            setIsLoadingVP(false);
            vpTimeoutRef.current = null;
        }
    }, [projectState.project, onStateUpdate, addHistoryEvent, addLogEntry, handleTabChange]);

    const handleCancelVP = useCallback(() => {
        cancelVpRef.current = true;
        if (vpTimeoutRef.current) {
            clearTimeout(vpTimeoutRef.current);
            vpTimeoutRef.current = null;
        }
        setIsLoadingVP(false);
        onStateUpdate(prev => addLogEntry('Verification Plan generation cancelled by user.', 'warning', prev));
    }, [onStateUpdate, addLogEntry]);

    const handleGenerateTB = useCallback(async () => {
        if (!projectState.project) return;
        
        onStateUpdate(prev => addLogEntry('Generating UVM Testbench & Tests...', 'info', prev));
    
        try {
            await projectService.generateTestbench(projectState.project.name);
            onStateUpdate(prev => {
                let newState = addHistoryEvent('UVM Testbench & Tests generated.', { ...prev, status: AppStatus.TBAndTestsGenerated });
                return addLogEntry('UVM environment, testbench, and example tests generated.', 'success', newState);
            });
            handleTabChange(ActiveTab.TestbenchAndTests);
        } catch (error) {
            onStateUpdate(prev => addLogEntry(`Failed to generate testbench: ${error}`, 'error', prev));
        }
    }, [projectState.project, onStateUpdate, addHistoryEvent, addLogEntry, handleTabChange]);

    const handleRunSimulation = useCallback(async () => {
        setIsSimulating(true);
        setSimulationProgress(0);
        onStateUpdate(prev => {
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
                        onStateUpdate(current => {
                            let finalState = addHistoryEvent('Simulation finished. Report is ready.',{...current, status: AppStatus.ReportReady});
                            if(Math.random() > 0.8){
                                finalState = addLogEntry(`Test 'Register file access' FAILED. See report for details.`, 'error', finalState);
                            }
                            finalState = addLogEntry('Simulation complete. 1253 passed, 12 failed.', 'success', finalState);
                            return finalState;
                        });
                        setIsSimulating(false);
                        handleTabChange(ActiveTab.SimulationReport);
                        resolve();
                    }, 500);
                } else {
                    setSimulationProgress(progress);
                }
            }, 200);
        });
    }, [onStateUpdate, addHistoryEvent, addLogEntry, handleTabChange]);

    const handleSaveSettings = useCallback((newSettings: SimulatorSettings) => {
        onStateUpdate(prev => ({ ...prev, settings: newSettings }));
    }, [onStateUpdate]);

    const handleSaveChanges = () => {
        if (draftSheets) {
            onStateUpdate(prev => {
                if (!prev.project) return prev;
                const newState = { ...prev, project: { ...prev.project, editedVpSheets: draftSheets } };
                return addLogEntry('Verification plan changes saved.', 'success', addHistoryEvent('Saved verification plan edits.', newState));
            });
            setDraftSheets(null);
        }
    };
    
    const handleDiscardChanges = () => {
        setDraftSheets(null);
    };

    const handleCellChange = (sheetName: SheetName, rowIndex: number, cellIndex: number, value: string) => {
        setDraftSheets(prevDraft => {
            const newDraft = JSON.parse(JSON.stringify(prevDraft || originalSheetsData));
            newDraft[sheetName].rows[rowIndex][cellIndex] = value;
            return newDraft;
        });
    };

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    const handleDownloadPDF = useCallback((sheets: VpDataSheets) => {
        if (!projectState.project) return;
        const vpPdfRef = document.createElement('div');
        
        let htmlToPrint = `<div style="padding: 2rem; background-color: white; font-family: sans-serif; color: #1e293b; max-width: 100%;">
            <h1 style="font-size: 1.875rem; font-weight: bold; border-bottom: 2px solid #C4C7E2; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #363F9E;">Verification Plan: ${projectState.project.name}</h1>
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #2B327E;">Document Version History</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 2rem;">
                <thead>
                    <tr style="background-color: #F7F7FD; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #E4E2F8; font-weight: 600;">Version</th>
                        <th style="padding: 8px; border: 1px solid #E4E2F8; font-weight: 600;">Date</th>
                        <th style="padding: 8px; border: 1px solid #E4E2F8; font-weight: 600;">Changes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #E4E2F8;">1.0</td>
                        <td style="padding: 8px; border: 1px solid #E4E2F8;">${new Date().toLocaleDateString()}</td>
                        <td style="padding: 8px; border: 1px solid #E4E2F8;">Initial document generation.</td>
                    </tr>
                </tbody>
            </table>
            `;

        sheetNames.forEach(name => {
            const sheet = sheets[name];
            if (sheet.rows.length === 0) return;

            const headersHtml = sheet.headers.map(h => `<th style="padding: 10px; font-weight: 600; border-bottom: 1px solid #A1A5D1;">${h}</th>`).join('');
            const rowsHtml = sheet.rows.map(row => 
                `<tr style="border-bottom: 1px solid #E4E2F8;">${
                    row.map(cell => `<td style="padding: 10px; vertical-align: top; word-break: break-word;">${cell}</td>`).join('')
                }</tr>`
            ).join('');

            htmlToPrint += `
                <h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #2B327E; border-bottom: 1px solid #A1A5D1; padding-bottom: 0.25rem;">${name}</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; table-layout: fixed;">
                    <thead><tr style="background-color: #F7F7FD; text-align: left; text-transform: uppercase; font-size: 0.7rem;">${headersHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>`;
        });

        htmlToPrint += `</div>`;
        vpPdfRef.innerHTML = htmlToPrint;
        document.body.appendChild(vpPdfRef);

        html2canvas(vpPdfRef, { scale: 2, useCORS: true }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const imgProps= pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 40; // with margin
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight);
            pdf.save(`${projectState.project?.name}_verification-plan.pdf`);
            document.body.removeChild(vpPdfRef);
        });
    }, [projectState.project]);

    const handleDownloadXLSX = useCallback((sheets: VpDataSheets) => {
        if (!projectState.project) return;
        const wb = XLSX.utils.book_new();
        
        // Add Version History sheet first
        const versionHistoryHeaders = ["Version", "Date", "Changes"];
        const versionHistoryRows = [["1.0", new Date().toLocaleDateString(), "Initial document generation."]];
        const wsVersion = XLSX.utils.aoa_to_sheet([versionHistoryHeaders, ...versionHistoryRows]);
        XLSX.utils.book_append_sheet(wb, wsVersion, "Version History");

        sheetNames.forEach(name => {
            const sheet = sheets[name];
            if (sheet.rows.length === 0) return;

            const rowsData = sheet.rows.map(row => row.map(cell => stripHtml(String(cell))));
            const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...rowsData]);
            XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31)); // Sheet names can't be > 31 chars
        });
        XLSX.writeFile(wb, `${projectState.project.name}_verification-plan.xlsx`);
    }, [projectState.project?.name]);

    const handleDownloadMD = useCallback((sheets: VpDataSheets) => {
        if (!projectState.project) return;
        let mdContent = `# Verification Plan: ${projectState.project.name}\n\n`;

        mdContent += `## Document Version History\n\n`;
        mdContent += `| Version | Date | Changes |\n`;
        mdContent += `|---|---|---|\n`;
        mdContent += `| 1.0 | ${new Date().toLocaleDateString()} | Initial document generation. |\n\n`;

        sheetNames.forEach(name => {
            const sheet = sheets[name];
            if (sheet.rows.length === 0) return;

            mdContent += `## ${name}\n\n`;
            mdContent += `| ${sheet.headers.join(' | ')} |\n`;
            mdContent += `| ${sheet.headers.map(() => '---').join(' | ')} |\n`;
            sheet.rows.forEach(row => {
                const cleanRow = row.map(cell => stripHtml(String(cell)).replace(/\|/g, '\\|').replace(/\r?\n|\r/g, ' '));
                mdContent += `| ${cleanRow.join(' | ')} |\n`;
            });
        });
        
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectState.project.name}_verification-plan.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [projectState.project?.name]);
    
    const handleExport = useCallback((format: 'pdf' | 'xlsx' | 'md') => {
        const dataToExport = draftSheets || originalSheetsData;
        if (format === 'pdf') handleDownloadPDF(dataToExport);
        if (format === 'xlsx') handleDownloadXLSX(dataToExport);
        if (format === 'md') handleDownloadMD(dataToExport);
    }, [draftSheets, originalSheetsData, handleDownloadPDF, handleDownloadXLSX, handleDownloadMD]);


    const startSidebarResize = useCallback((mouseDownEvent: React.MouseEvent) => {
        isResizingSidebarRef.current = true;
        const startX = mouseDownEvent.clientX;
        const startWidth = sidebarWidth;

        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
            if (!isResizingSidebarRef.current) return;
            const newWidth = startWidth + mouseMoveEvent.clientX - startX;
            if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
                setSidebarWidth(newWidth);
            }
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
            if (newHeight >= MIN_TERMINAL_HEIGHT && newHeight <= window.innerHeight * 0.8) {
                setTerminalHeight(newHeight);
            }
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
            case ActiveTab.Dashboard: return <DashboardTab {...commonProps} onFilesUploaded={handleFilesUploaded} onGenerateVP={handleGenerateVP} isLoadingVP={isLoadingVP} onCancelVP={handleCancelVP} />;
            case ActiveTab.VerificationPlan: return <VerificationPlanTab {...commonProps} onGenerateTB={handleGenerateTB} originalSheets={originalSheetsData} draftSheets={draftSheets} hasChanges={hasChanges} onSaveChanges={handleSaveChanges} onDiscardChanges={handleDiscardChanges} onCellChange={handleCellChange} onExport={handleExport} />;
            case ActiveTab.TestbenchAndTests: return <TestbenchTab {...commonProps} onRunSimulation={handleRunSimulation} />;
            case ActiveTab.UVMArchitecture: return <ArchitectureTab />;
            case ActiveTab.SimulationReport: return <ReportTab />;
            default: return <DashboardTab {...commonProps} onFilesUploaded={handleFilesUploaded} onGenerateVP={handleGenerateVP} isLoadingVP={isLoadingVP} onCancelVP={handleCancelVP} />;
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <Header theme={theme} toggleTheme={toggleTheme} onOpenSettings={() => setIsSettingsOpen(true)} project={projectState.project} onLogout={onLogout} onToggleSidebar={toggleSidebar} />
            <CommandBar onNewProject={onGoToWelcome} onOpenProject={onGoToWelcome} onSaveProject={onSaveProject} onOpenSettings={() => setIsSettingsOpen(true)} onExport={handleExport} onGenerateVP={handleGenerateVP} onGenerateTB={handleGenerateTB} onRunSim={handleRunSimulation} />
            <div className="flex flex-1 overflow-hidden">
                 <div style={{ width: isSidebarOpen ? sidebarWidth : 0, transition: 'width 300ms ease-in-out' }} className="flex-shrink-0 bg-secondary-800 relative">
                    <div className="w-full h-full overflow-hidden"><Sidebar projectState={projectState} onFileSelect={handleFileSelect} onNavigateToTab={handleTabChange} isSidebarOpen={isSidebarOpen} /></div>
                </div>
                {isSidebarOpen && <div onMouseDown={startSidebarResize} className="flex-shrink-0 w-1.5 cursor-col-resize bg-secondary-200 dark:bg-secondary-800 hover:bg-primary-500 transition-colors" />}
                <div className="flex-1 flex flex-col bg-secondary-50 dark:bg-secondary-950 overflow-hidden">
                    <div className="flex-shrink-0 border-b border-secondary-200 dark:border-secondary-800 px-4">
                        <nav className="-mb-px flex space-x-2">
                            {Object.values(ActiveTab).map(tab => ( <TabButton key={tab} label={tab} isActive={activeTab === tab} onClick={() => handleTabChange(tab)} disabled={isTabDisabled(tab, projectState.status)} /> ))}
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
                    <footer className="flex-shrink-0 h-8 bg-secondary-200 dark:bg-secondary-900 border-t border-secondary-300 dark:border-secondary-800 flex items-center justify-between px-4 text-xs text-primary-900 dark:text-secondary-300">
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
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${isActive ? 'bg-secondary-50 dark:bg-secondary-950 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-primary-800 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
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