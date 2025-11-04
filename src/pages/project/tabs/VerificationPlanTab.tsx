import React, { useState, useCallback } from 'react';
import { PageHeader } from './components/PageHeader';
import { ProjectState, AppStatus, VpDataSheets } from '../../../types';
import LlmExtractModal from './components/LlmExtractModal';
import SpreadsheetView from './components/SpreadsheetView';
import { SparklesIcon, SaveIcon, DownloadIcon, PdfIcon, ExcelIcon, MarkdownIcon } from '../../../components/Icons';
import { useVerificationPlanData, SheetName, sheetNames } from './useVerificationPlanData';

interface VerificationPlanTabProps {
    projectState: ProjectState;
    isSimulating: boolean;
    onGenerateTB: () => Promise<void>;
    originalSheets: VpDataSheets;
    draftSheets: VpDataSheets | null;
    hasChanges: boolean;
    onSaveChanges: () => void;
    onDiscardChanges: () => void;
    onCellChange: (sheetName: SheetName, rowIndex: number, cellIndex: number, value: string) => void;
    onExport: (format: 'pdf' | 'xlsx' | 'md') => void;
}

const VpSheetTabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${ isActive ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-secondary-500 hover:text-secondary-800 dark:hover:text-secondary-200'}`}>
        {label}
    </button>
);

const VerificationPlanTab: React.FC<VerificationPlanTabProps> = (props) => {
    const { 
        projectState, isSimulating, onGenerateTB, 
        originalSheets, draftSheets, hasChanges,
        onSaveChanges, onDiscardChanges, onCellChange,
        onExport 
    } = props;
    
    const { status } = projectState;
    const [activeSheet, setActiveSheet] = useState<SheetName>('Verification Plan');
    const [fontSize, setFontSize] = useState('text-sm');
    const [isLlmExtractModalOpen, setLlmExtractModalOpen] = useState(false);
    const [isDownloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

    const sheetsToRender = draftSheets || originalSheets;
    const isBusy = isSimulating;

    const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
        onCellChange(activeSheet, rowIndex, cellIndex, value);
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <PageHeader title="Verification Plan">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mr-2">FONT SIZE</span>
                    <button onClick={() => setFontSize('text-xs')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${fontSize === 'text-xs' ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'}`}>Small</button>
                    <button onClick={() => setFontSize('text-sm')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${fontSize === 'text-sm' ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'}`}>Normal</button>
                    <button onClick={() => setFontSize('text-base')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${fontSize === 'text-base' ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'}`}>Large</button>
                </div>
                <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-700 mx-2"></div>
                {hasChanges && (
                    <>
                        <button onClick={onDiscardChanges} className="px-4 py-2 text-sm font-semibold text-secondary-800 dark:text-secondary-100 bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition">
                            Discard Changes
                        </button>
                        <button onClick={onSaveChanges} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">
                            <SaveIcon className="w-4 h-4" />
                            Save Changes
                        </button>
                    </>
                )}
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
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-secondary-800 rounded-md shadow-lg z-10 border border-secondary-200 dark:border-secondary-700 py-1">
                            <a onClick={() => { onExport('pdf'); setDownloadDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer"><PdfIcon className="w-4 h-4" />Verification Plan (PDF)</a>
                            <a onClick={() => { onExport('xlsx'); setDownloadDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer"><ExcelIcon className="w-4 h-4" />Verification Plan (XLSX)</a>
                            <a onClick={() => { onExport('md'); setDownloadDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer"><MarkdownIcon className="w-4 h-4" />Verification Plan (MD)</a>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onGenerateTB}
                    disabled={status < AppStatus.VPGenerated || isBusy || hasChanges}
                    title={hasChanges ? "Save or discard changes before generating" : ""}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Generate TB & Test
                </button>
            </PageHeader>
             <div className="flex-shrink-0 border-b border-secondary-200 dark:border-secondary-800 mb-4">
                <nav className="-mb-px flex space-x-2">
                    {sheetNames.map(name => (
                        <VpSheetTabButton key={name} label={name} isActive={activeSheet === name} onClick={() => setActiveSheet(name)} />
                    ))}
                </nav>
            </div>
            <div className="flex-grow overflow-auto bg-white dark:bg-secondary-900 rounded-lg shadow-sm">
                <SpreadsheetView
                    sheet={sheetsToRender[activeSheet]}
                    fontSize={fontSize}
                    onCellChange={handleCellChange}
                />
            </div>
            <LlmExtractModal isOpen={isLlmExtractModalOpen} onClose={() => setLlmExtractModalOpen(false)} />
        </div>
    );
};

export default VerificationPlanTab;