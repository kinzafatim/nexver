

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ActiveTab, AppStatus, UploadedFile, Project, LogEntry, VerificationPlanRow, VPSheet } from '../types';
import CodeViewer from './CodeViewer';
import Terminal from './Terminal';
import VerificationPlanTable from './VerificationPlanTable';
import SimpleTable from './SimpleTable';
import LlmExtractModal from './LlmExtractModal';
import SourceViewerModal from './SourceViewerModal';
import FilePreviewer from './FilePreviewer';
import { mockTestbenchCode, mockTestcaseCode, mockSpecificationContent } from '../services/mockData';
import { ClockIcon, GenerateIcon, DownloadIcon, CheckCircleIcon, TerminalIcon, SparklesIcon } from './Icons';

// Type declarations for CDN libraries
declare var jspdf: any;
declare var html2canvas: any;
declare var XLSX: any;
declare var mermaid: any;

interface MainContentProps {
  status: AppStatus;
  project?: Project;
  logs: LogEntry[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onFilesUploaded: (files: UploadedFile[]) => void;
  onGenerateVP: () => Promise<void>;
  onGenerateTBAndTests: () => Promise<void>;
  onRunSimulation: () => Promise<void>;
  onUpdateVPData: (data: VerificationPlanRow[]) => void;
  previewFile: UploadedFile | null;
  onClosePreview: () => void;
  exportAction: string | null;
  onExportComplete: () => void;
  isSimulating: boolean;
  simulationProgress: number;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
      isActive
        ? 'bg-secondary-100 dark:bg-secondary-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
        : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {label}
  </button>
);

const PageHeader: React.FC<{
    title: string;
    children?: React.ReactNode;
}> = ({ title, children }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-secondary-200 dark:border-secondary-800">
        <h2 className="text-2xl font-bold text-secondary-800 dark:text-secondary-100">{title}</h2>
        <div className="flex items-center gap-2">
            {children}
        </div>
    </div>
);

const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds < 10) return "just now";
    return Math.floor(seconds) + " seconds ago";
};

const uvmMermaidDiagram = `
graph TD
    subgraph tb_top ["tb_top (Testbench Top)"]
        direction LR
        UVM_TEST("UVM Test (base_test)") --> UVM_ENV("UVM Environment (picocpu_env)")
        DUT(PicoCPU DUT)
    end

    subgraph UVM_ENV
        direction LR
        V_SEQUENCER("Virtual Sequencer") --> UVM_AGENT("Memory Agent")
        SCOREBOARD(Scoreboard)
    end
    
    subgraph UVM_AGENT
        direction TB
        SEQUENCER(Sequencer) --> DRIVER(Driver)
        MONITOR(Monitor)
    end
    
    DRIVER -- "Drives mem_transaction" --> DUT
    DUT -- "Monitors Bus" --> MONITOR
    MONITOR -- "Sends collected data" --> SCOREBOARD

    style DUT fill:#1e427a,stroke:#3b92e8,stroke-width:2px,color:#fff
    style UVM_TEST fill:#1e4d94,stroke:#3b92e8,stroke-width:2px,color:#fff
`;

const MainContent: React.FC<MainContentProps> = ({ status, project, logs, activeTab, onTabChange, onFilesUploaded, onGenerateVP, onGenerateTBAndTests, onRunSimulation, onUpdateVPData, previewFile, onClosePreview, exportAction, onExportComplete, isSimulating, simulationProgress }) => {
  const [activeVpSheet, setActiveVpSheet] = useState('Features');
  const [isDownloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isLlmExtractModalOpen, setLlmExtractModalOpen] = useState(false);
  const [isSourceModalOpen, setSourceModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{ content: string; sourceLink: string } | null>(null);
  const [highlightedRows, setHighlightedRows] = useState<Set<number>>(new Set());

  const isResizingRef = useRef(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const vpPdfRef = useRef<HTMLDivElement>(null);
  const prevProjectName = useRef(project?.name);
  const prevSpecFileCount = useRef(project?.specFiles?.length || 0);
  
  useEffect(() => {
    if (activeTab === ActiveTab.UVMArchitecture) {
      mermaid.contentLoaded();
    }
    if(status >= AppStatus.VPGenerated && activeTab === ActiveTab.VerificationPlan){
      setActiveVpSheet('Features');
    }
  }, [activeTab, status]);
  
  useEffect(() => {
    const currentSpecCount = project?.specFiles?.length || 0;

    if (project?.name !== prevProjectName.current) {
        prevSpecFileCount.current = currentSpecCount;
        prevProjectName.current = project?.name;
        return; 
    }

    const filesWereAdded = currentSpecCount > prevSpecFileCount.current;
    if (filesWereAdded) {
        setIsTerminalOpen(true);
    }

    prevSpecFileCount.current = currentSpecCount;

  }, [project?.name, project?.specFiles]);

  const handleGenerateVPClick = async () => {
    setIsLoading(true);
    setLoadingText('Generating Verification Plan...');
    await onGenerateVP();
    setIsLoading(false);
    onTabChange(ActiveTab.VerificationPlan);
  };

  const handleGenerateTBAndTestsClick = async () => {
      setIsLoading(true);
      setLoadingText('Generating UVM Testbench & Tests...');
      await onGenerateTBAndTests();
      setIsLoading(false);
      onTabChange(ActiveTab.TestbenchAndTests);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles: UploadedFile[] = Array.from(event.target.files)
        .filter(file => file.name.endsWith('.pdf') || file.name.endsWith('.docx'))
        .map((file: File) => ({
          name: file.name,
          type: 'Spec'
        }));
      if (newFiles.length > 0) {
        onFilesUploaded(newFiles);
      }
    }
  };
  
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  const handleDownloadPDF = useCallback(() => {
    if (!vpPdfRef.current || !project) return;

    const { verificationPlanData, verificationPlanSheets } = project;

    let htmlToPrint = `<div style="padding: 2rem; background-color: white; font-family: sans-serif; color: #1e293b;">
        <h1 style="font-size: 1.875rem; font-weight: bold; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #5778D4;">Verification Plan: ${project.name}</h1>`;
    
    // Features Table
    if (verificationPlanData) {
        const featuresTableContent = verificationPlanData.map(row => `
            <tr style="border-bottom: 1px solid #e2e8f0; ${highlightedRows.has(row.id) ? 'background-color: #fef9c3;' : ''}">
                <td style="padding: 12px; vertical-align: top;">${row.feature}</td>
                <td style="padding: 12px; vertical-align: top;">${row.subFeature}</td>
                <td style="padding: 12px; vertical-align: top;">${row.description}</td>
                <td style="padding: 12px; vertical-align: top;">${row.verificationGoal}</td>
            </tr>
        `).join('');
        htmlToPrint += `
            <h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #4661B5; border-bottom: 1px solid #A9BFF4; padding-bottom: 0.25rem;">Features</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                <thead>
                    <tr style="background-color: #f8fafc; text-align: left; text-transform: uppercase;">
                        <th style="padding: 12px; font-weight: 600;">Feature</th><th style="padding: 12px; font-weight: 600;">Sub Feature</th>
                        <th style="padding: 12px; font-weight: 600;">Description</th><th style="padding: 12px; font-weight: 600;">Verification Goal</th>
                    </tr>
                </thead><tbody>${featuresTableContent}</tbody></table>`;
    }

    // Other Sheets
    // FIX: Added explicit type annotation for the 'sheet' parameter to fix type inference issue.
    verificationPlanSheets?.forEach((sheet: VPSheet) => {
        const sheetTableContent = sheet.rows.map((row: (string|number)[]) => `<tr style="border-bottom: 1px solid #e2e8f0;">${row.map((cell: string|number) => `<td style="padding: 12px; vertical-align: top;">${cell}</td>`).join('')}</tr>`).join('');
        htmlToPrint += `
            <h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #4661B5; border-bottom: 1px solid #A9BFF4; padding-bottom: 0.25rem;">${sheet.name}</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                <thead><tr style="background-color: #f8fafc; text-align: left; text-transform: uppercase;">${sheet.headers.map((h: string) => `<th style="padding: 12px; font-weight: 600;">${h}</th>`).join('')}</tr></thead>
                <tbody>${sheetTableContent}</tbody></table>`;
    });

    htmlToPrint += `</div>`;
    vpPdfRef.current.innerHTML = htmlToPrint;

    const element = vpPdfRef.current;
    if (element) {
        html2canvas(element, { backgroundColor: '#ffffff', scale: 2 }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const imgProps= pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("verification-plan.pdf");
      });
    }
  }, [project, highlightedRows]);

  const handleDownloadXLSX = useCallback(() => {
    if (!project || !project.verificationPlanData) return;
    
    const { verificationPlanData, verificationPlanSheets } = project;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Features (rich data)
    const featuresHeaders = ["Feature", "Sub Feature", "Description", "Verification Goal", "Source"];
    const featuresRows = verificationPlanData.map(row => [
        stripHtml(row.feature), stripHtml(row.subFeature), stripHtml(row.description), stripHtml(row.verificationGoal), stripHtml(row.source)
    ]);
    const ws1 = XLSX.utils.aoa_to_sheet([featuresHeaders, ...featuresRows]);
    XLSX.utils.book_append_sheet(wb, ws1, "Features");

    // Other sheets
    // FIX: Added explicit type annotation for the 'sheet' parameter to fix type inference issue.
    verificationPlanSheets?.forEach((sheet: VPSheet) => {
        const wsData = [sheet.headers, ...sheet.rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    
    XLSX.writeFile(wb, 'verification-plan.xlsx');
  }, [project]);

  const handleDownloadMD = useCallback(() => {
    if (!project || !project.verificationPlanData) return;
    
    const { verificationPlanData, verificationPlanSheets } = project;
    let mdContent = `# Verification Plan: ${project.name}\n\n`;

    // Features sheet
    mdContent += `## Features\n\n`;
    mdContent += `| Feature | Sub Feature | Description | Verification Goal |\n`;
    mdContent += `|---|---|---|---|\n`;
    verificationPlanData.forEach(row => {
        const description = stripHtml(row.description).replace(/\|/g, '\\|').replace(/\r?\n|\r/g, ' ');
        const goal = stripHtml(row.verificationGoal).replace(/\|/g, '\\|').replace(/\r?\n|\r/g, ' ');
        mdContent += `| ${row.feature} | ${row.subFeature} | ${description} | ${goal} |\n`;
    });

    // Other sheets
    // FIX: Added explicit type annotation for the 'sheet' parameter to fix type inference issue.
    verificationPlanSheets?.forEach((sheet: VPSheet) => {
        mdContent += `\n## ${sheet.name}\n\n`;
        mdContent += `| ${sheet.headers.join(' | ')} |\n`;
        mdContent += `| ${sheet.headers.map(() => '---').join(' | ')} |\n`;
        sheet.rows.forEach((row : (string|number)[]) => {
            mdContent += `| ${row.join(' | ')} |\n`;
        });
    });
      
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verification-plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project]);

  useEffect(() => {
    if (exportAction === 'pdf') handleDownloadPDF();
    if (exportAction === 'xlsx') handleDownloadXLSX();
    if (exportAction === 'md') handleDownloadMD();
    if (exportAction) onExportComplete();
  }, [exportAction, onExportComplete, handleDownloadPDF, handleDownloadXLSX, handleDownloadMD]);

  const handleViewSource = (sourceLink: string) => {
    const content = mockSpecificationContent[sourceLink] || "Source content not found.";
    setSelectedSource({ content, sourceLink });
    setSourceModalOpen(true);
  };
  
  const isTabDisabled = (tab: ActiveTab) => {
    switch (tab) {
      case ActiveTab.VerificationPlan: return status < AppStatus.VPGenerated;
      case ActiveTab.TestbenchAndTests: return status < AppStatus.TBAndTestsGenerated;
      case ActiveTab.UVMArchitecture: return status < AppStatus.TBAndTestsGenerated;
      case ActiveTab.SimulationReport: return status < AppStatus.ReportReady;
      default: return false;
    }
  };

  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (!dropzone) return;

    const onDragOver = (e: DragEvent) => { e.preventDefault(); dropzone.classList.add('border-primary-500', 'bg-primary-500/10'); };
    const onDragLeave = (e: DragEvent) => { e.preventDefault(); dropzone.classList.remove('border-primary-500', 'bg-primary-500/10'); };
    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        dropzone.classList.remove('border-primary-500', 'bg-primary-500/10');
        if (e.dataTransfer?.files) {
            const newFiles: UploadedFile[] = Array.from(e.dataTransfer.files)
                .filter(file => file.name.endsWith('.pdf') || file.name.endsWith('.docx'))
                .map((file: File) => ({
                    name: file.name,
                    type: 'Spec'
                }));
            if (newFiles.length > 0) {
              onFilesUploaded(newFiles);
            }
        }
    };

    dropzone.addEventListener('dragover', onDragOver);
    dropzone.addEventListener('dragleave', onDragLeave);
    dropzone.addEventListener('drop', onDrop);

    return () => {
        dropzone.removeEventListener('dragover', onDragOver);
        dropzone.removeEventListener('dragleave', onDragLeave);
        dropzone.removeEventListener('drop', onDrop);
    };
  }, [onFilesUploaded]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newHeight = window.innerHeight - e.clientY - 32; // 32 is status bar height
    if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
        setTerminalHeight(newHeight);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResizing);
  }, [handleResize]);
  
  const startResizing = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResizing);
  }, [handleResize, stopResizing]);

  const coverageData = [ { name: 'Statement', coverage: 96 }, { name: 'Branch', coverage: 88 }, { name: 'Functional', coverage: 92 }, { name: 'Assert', coverage: 100 }, ];
  const testStatusData = [{name: 'Pass', value: 1253}, {name: 'Fail', value: 12}, {name: 'Skipped', value: 5}];
  const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

  const NextStepItem: React.FC<{isComplete: boolean; children: React.ReactNode}> = ({ isComplete, children }) => (
    <li className={`flex items-center gap-3 ${isComplete ? 'text-green-500' : 'text-secondary-500 dark:text-secondary-400'}`}>
        <CheckCircleIcon className={`w-5 h-5 ${isComplete ? 'text-green-500' : 'text-secondary-400 dark:text-secondary-600'}`}/>
        <span className={isComplete ? 'font-semibold text-secondary-800 dark:text-secondary-200' : ''}>{children}</span>
    </li>
);

  const VpSheetTabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${ isActive ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-secondary-500 hover:text-secondary-800 dark:hover:text-secondary-200'}`}>
        {label}
    </button>
  );

  if (previewFile) {
    return (
        <main className="flex-1 flex flex-col relative p-6 overflow-hidden">
            <FilePreviewer file={previewFile} onClose={onClosePreview} logs={project?.logs} />
        </main>
    );
  }

  const isBusy = isLoading || isSimulating;

  return (
    <div className="flex-1 flex flex-col bg-secondary-100 dark:bg-secondary-950 overflow-hidden">
      <div className="flex-shrink-0 border-b border-secondary-200 dark:border-secondary-800 px-4">
        <nav className="-mb-px flex space-x-2">
          {Object.values(ActiveTab).map(tab => (
            <TabButton key={tab} label={tab} isActive={activeTab === tab} onClick={() => onTabChange(tab)} disabled={isTabDisabled(tab)} />
          ))}
        </nav>
      </div>
      <main className="flex-1 flex flex-col relative overflow-y-hidden">
        <div className="flex-1 p-6 overflow-auto relative">
            {isBusy && (
                <div className="absolute inset-0 bg-secondary-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-lg">
                    <svg className="animate-spin h-12 w-12 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-white text-lg">{isSimulating ? 'Running simulation...' : loadingText}</p>
                    {isSimulating && (
                        <div className="w-1/3 mt-4 bg-secondary-700 rounded-full h-2.5">
                            <div className="bg-primary-500 h-2.5 rounded-full" style={{width: `${simulationProgress}%`}}></div>
                        </div>
                    )}
                </div>
            )}
            <div style={{ display: activeTab === ActiveTab.Dashboard ? 'block' : 'none' }} className="h-full">
                <PageHeader title="Upload Files" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-secondary-900 p-6 rounded-lg shadow flex flex-col">
                            <div ref={dropzoneRef} className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-8 text-center transition-colors flex-grow flex flex-col justify-center">
                                <h3 className="text-xl font-semibold mb-2 text-secondary-700 dark:text-secondary-200">Upload Files</h3>
                                <p className="text-secondary-500 dark:text-secondary-400 mb-4">Drag & drop Specification (.pdf, .docx) files here, or click to select.</p>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload"/>
                                <label htmlFor="file-upload" className="cursor-pointer inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">Select Files</label>
                            </div>
                            {(project?.specFiles?.length || 0) > 0 && (
                            <div className="mt-6">
                                <button onClick={handleGenerateVPClick} disabled={status < AppStatus.Dashboard || isBusy} className="w-full flex justify-center items-center gap-3 py-3 px-4 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    <GenerateIcon className="w-5 h-5" />
                                    Generate Verification Plan
                                </button>
                            </div>
                            )}
                        </div>
                        <div className="bg-white dark:bg-secondary-900 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4 text-secondary-700 dark:text-secondary-200">Next Steps</h3>
                            <ul className="space-y-3">
                                <NextStepItem isComplete={(project?.specFiles?.length || 0) > 0}>Upload Spec files</NextStepItem>
                                <NextStepItem isComplete={status >= AppStatus.VPGenerated}>Generate Verification Plan</NextStepItem>
                                <NextStepItem isComplete={status >= AppStatus.TBAndTestsGenerated}>Generate Testbench & Tests</NextStepItem>
                                <NextStepItem isComplete={status >= AppStatus.ReportReady}>Run Simulation & View Report</NextStepItem>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary-900 p-6 rounded-lg shadow flex flex-col">
                        <h3 className="text-xl font-semibold mb-4 text-secondary-700 dark:text-secondary-200 flex-shrink-0">Project History</h3>
                        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                        {project?.history.slice().reverse().map(item => (
                            <div key={item.id} className="flex items-start gap-3">
                                <div className="bg-secondary-100 dark:bg-secondary-800 rounded-full p-2 mt-1">
                                    <ClockIcon className="w-4 h-4 text-primary-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary-800 dark:text-secondary-200">{item.event}</p>
                                    <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatTimeAgo(item.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: activeTab === ActiveTab.VerificationPlan ? 'block' : 'none' }} className="h-full flex flex-col">
                 <PageHeader title="Verification Plan">
                    <div className="flex-grow"></div>
                    <button onClick={() => setLlmExtractModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-secondary-200 text-secondary-800 rounded-lg hover:bg-secondary-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 transition">
                        <SparklesIcon className="w-4 h-4 text-primary-400"/>
                        <span>Extract with LLM</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => setDownloadDropdownOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-secondary-200 text-secondary-800 rounded-lg hover:bg-secondary-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 transition">
                            <DownloadIcon className="w-4 h-4" />
                            <span>Export As</span>
                        </button>
                        {isDownloadDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-10 border border-secondary-200 dark:border-secondary-700 py-1">
                                <a onClick={() => { handleDownloadPDF(); setDownloadDropdownOpen(false); }} className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer">PDF</a>
                                <a onClick={() => { handleDownloadXLSX(); setDownloadDropdownOpen(false); }} className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer">XLSX</a>
                                <a onClick={() => { handleDownloadMD(); setDownloadDropdownOpen(false); }} className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer">Markdown</a>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleGenerateTBAndTestsClick}
                        disabled={status < AppStatus.VPGenerated || isBusy}
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Generate TB & Test
                    </button>
                </PageHeader>
                <div className="flex-shrink-0 border-b border-secondary-200 dark:border-secondary-800 mb-4">
                    <nav className="-mb-px flex space-x-2">
                        <VpSheetTabButton label="Features" isActive={activeVpSheet === 'Features'} onClick={() => setActiveVpSheet('Features')} />
                        {project?.verificationPlanSheets?.map(sheet => (
                            <VpSheetTabButton key={sheet.name} label={sheet.name} isActive={activeVpSheet === sheet.name} onClick={() => setActiveVpSheet(sheet.name)} />
                        ))}
                    </nav>
                </div>
                <div className="flex-grow overflow-auto">
                   {activeVpSheet === 'Features' && (
                     <VerificationPlanTable 
                       data={project?.verificationPlanData || []} 
                       onViewSource={handleViewSource}
                       onUpdateData={onUpdateVPData}
                       highlightedRows={highlightedRows}
                       onHighlightChange={setHighlightedRows}
                      />
                   )}
                   {project?.verificationPlanSheets?.map(sheet => (
                        activeVpSheet === sheet.name && <SimpleTable key={sheet.name} headers={sheet.headers} rows={sheet.rows} />
                   ))}
                </div>
                <div className="hidden">
                    <div ref={vpPdfRef} />
                </div>
            </div>
            <div style={{ display: activeTab === ActiveTab.TestbenchAndTests ? 'block' : 'none' }} className="h-full flex flex-col">
                <PageHeader title="UVM Testbench & Tests">
                    <button onClick={() => alert('Downloading files...')} className="px-4 py-2 text-sm font-semibold bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition">Download All Files</button>
                    <button
                        onClick={onRunSimulation}
                        disabled={status < AppStatus.TBAndTestsGenerated || isBusy}
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Run Simulation &rarr;
                    </button>
                </PageHeader>
                <div className="flex-grow overflow-auto space-y-8 pr-2">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Testbench Skeleton</h3>
                        <div className="h-96">
                            <CodeViewer code={mockTestbenchCode} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Example Test Case & Sequence</h3>
                        <div className="h-96">
                            <CodeViewer code={mockTestcaseCode} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: activeTab === ActiveTab.UVMArchitecture ? 'block' : 'none' }} className="h-full flex flex-col">
                <PageHeader title="UVM Testbench Architecture" />
                <div className="flex-grow overflow-auto bg-white dark:bg-secondary-900 rounded-lg p-4 flex items-center justify-center">
                    <pre className="mermaid w-full h-full">
                        {uvmMermaidDiagram}
                    </pre>
                </div>
            </div>
            <div style={{ display: activeTab === ActiveTab.SimulationReport ? 'block' : 'none' }}>
                <PageHeader title="Simulation Report">
                    <button onClick={() => alert('Downloading report...')} className="px-4 py-2 text-sm font-semibold bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition">Download Report</button>
                    <button onClick={() => alert('Exporting project...')} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Export Project as .zip</button>
                </PageHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-4 text-secondary-700 dark:text-secondary-200">Coverage Metrics</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={coverageData}>
                                <XAxis dataKey="name" stroke="rgb(100 116 139)" />
                                <YAxis stroke="rgb(100 116 139)" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgb(27,32,44)', border: '1px solid rgb(59,71,104)' }} />
                                <Legend />
                                <Bar dataKey="coverage" fill="#5778D4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow">
                        <h3 className="font-semibold mb-4 text-secondary-700 dark:text-secondary-200">Test Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={testStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {testStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgb(27,32,44)', border: '1px solid rgb(59,71,104)' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

        {isTerminalOpen && project?.logs && (
            <div className="flex-shrink-0 flex flex-col">
                <div onMouseDown={startResizing} className="w-full h-1.5 cursor-row-resize bg-secondary-300 dark:bg-secondary-800 hover:bg-primary-500 transition-colors"></div>
                 <Terminal
                    style={{ height: `${terminalHeight}px` }}
                    onClose={() => setIsTerminalOpen(false)}
                    logs={logs}
                />
            </div>
        )}
      </main>
      <footer className="flex-shrink-0 h-8 bg-secondary-200 dark:bg-secondary-900 border-t border-secondary-300 dark:border-secondary-800 flex items-center justify-between px-4 text-xs text-secondary-600 dark:text-secondary-400">
        <div>
            Ready
        </div>
        <button onClick={() => setIsTerminalOpen(prev => !prev)} className="flex items-center gap-2 hover:text-primary-400">
            <TerminalIcon className="w-4 h-4" />
            <span>TERMINAL</span>
        </button>
      </footer>
      <LlmExtractModal isOpen={isLlmExtractModalOpen} onClose={() => setLlmExtractModalOpen(false)} />
      <SourceViewerModal isOpen={isSourceModalOpen} onClose={() => setSourceModalOpen(false)} sourceData={selectedSource} />
    </div>
  );
};

export default MainContent;