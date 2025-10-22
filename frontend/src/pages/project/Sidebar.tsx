import React, { useState } from 'react';
import { Project, AppStatus, UploadedFile, ActiveTab } from '../../types';
import { FolderIcon, FileIcon, PdfIcon, ChevronRightIcon, LogFileIcon } from '../../components/Icons';

interface SidebarProps {
  projectState: {
    project?: Project;
    status: AppStatus;
  };
  onFileSelect: (file: UploadedFile) => void;
  onNavigateToTab: (tab: ActiveTab) => void;
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ projectState, onFileSelect, onNavigateToTab, isSidebarOpen }) => {
  const { project, status } = projectState;
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'Inputs': true,
    'Specification Docs': true,
    'Verification Environment': true,
    'Testbench': true,
    'Tests': true,
    'Sequences': true,
    'Outputs': true,
    'Verification Plan': true,
    'Logs': true,
    'Reports': true,
  });

  const toggleFolder = (name: string) => {
    setOpenFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const Folder: React.FC<{ name: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ name, children }) => (
    <div>
      <div onClick={() => toggleFolder(name)} className="flex items-center cursor-pointer p-1 rounded hover:bg-primary-900/50 transition-colors">
        <ChevronRightIcon className={`w-4 h-4 mr-2 transition-transform ${openFolders[name] ? 'rotate-90' : ''}`} />
        <FolderIcon className="w-5 h-5 mr-2 text-primary-400" />
        <span className="font-semibold">{name}</span>
      </div>
      {openFolders[name] && <div className="pl-6 border-l border-secondary-700 ml-3">{children}</div>}
    </div>
  );

  const FileItem: React.FC<{ name: string, type: 'sv' | 'pdf' | 'log' }> = ({ name, type }) => {
    let Icon;
    switch(type) {
        case 'pdf': Icon = PdfIcon; break;
        case 'log': Icon = LogFileIcon; break;
        case 'sv':
        default: Icon = FileIcon;
    }
    return (
      <div className="flex items-center p-1">
        <Icon className="w-5 h-5 mr-2 text-secondary-400" />
        <span>{name}</span>
      </div>
    );
  };
  
  if (!project) return null;

  return (
    <div className="w-full h-full bg-secondary-800 text-secondary-200 p-4 flex flex-col">
      {/* Project Title */}
      <div className="flex-shrink-0 text-lg font-bold text-white border-b border-secondary-700 pb-2 mb-2">{project.name}</div>
      
      {/* Scrollable File List */}
      <div className="flex-1 overflow-y-auto space-y-4 -mr-2 pr-2">
        <Folder name="Inputs">
            <Folder name="Specification Docs">
                {project.specFiles.length > 0 ? (
                project.specFiles.map(f => 
                    <div key={f.name} onClick={() => onFileSelect(f)} className="cursor-pointer rounded hover:bg-primary-900/50">
                        <FileItem name={f.name} type="pdf" />
                    </div>
                )
                ) : (
                <p className="text-xs text-secondary-500 p-1">No files uploaded.</p>
                )}
            </Folder>
        </Folder>

        {status >= AppStatus.TBAndTestsGenerated && (
            <Folder name="Verification Environment">
                <Folder name="Testbench">
                    <FileItem name="tb_top.sv" type="sv" />
                </Folder>
                <Folder name="Tests">
                    <FileItem name="base_test.sv" type="sv" />
                    <FileItem name="alu_add_test.sv" type="sv" />
                </Folder>
                 <Folder name="Sequences">
                    <FileItem name="alu_add_sequence.sv" type="sv" />
                </Folder>
            </Folder>
        )}

        {status >= AppStatus.VPGenerated && (
            <Folder name="Outputs">
                <Folder name="Verification Plan">
                    <div onClick={() => onNavigateToTab(ActiveTab.VerificationPlan)} className="cursor-pointer rounded hover:bg-primary-900/50">
                        <FileItem name="verification_plan.pdf" type="pdf" />
                    </div>
                </Folder>
                 <Folder name="Logs">
                    <div onClick={() => onFileSelect({ name: 'logs.txt', type: 'Log' })} className="cursor-pointer rounded hover:bg-primary-900/50">
                      <FileItem name="logs.txt" type="log" />
                    </div>
                </Folder>
                {status >= AppStatus.ReportReady && (
                    <Folder name="Reports">
                        <FileItem name="simulation_report.pdf" type="pdf" />
                    </Folder>
                )}
            </Folder>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
