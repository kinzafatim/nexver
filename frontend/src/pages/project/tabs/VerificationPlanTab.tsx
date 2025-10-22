import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PageHeader } from './components/PageHeader';
import { ProjectState, AppStatus, VerificationPlanRow } from '../../../types';
import { SparklesIcon, DownloadIcon } from '../../../components/Icons';
import VerificationPlanTable from '../../../components/VerificationPlanTable';
import SimpleTable from '../../../components/SimpleTable';
import LlmExtractModal from '../../../components/LlmExtractModal';
import SourceViewerModal from '../../../components/SourceViewerModal';
import { mockSpecificationContent } from '../../../services/projectService';

// Type declarations for CDN libraries
declare const jspdf: any;
declare const html2canvas: any;
declare const XLSX: any;

interface VerificationPlanTabProps {
    projectState: ProjectState;
    isSimulating: boolean;
    onGenerateTB: () => Promise<void>;
    onUpdateVPData: (data: VerificationPlanRow[]) => void;
    exportAction: string | null;
    onExport: (action: string | null) => void;
    onExportComplete: () => void;
}

const VpSheetTabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${ isActive ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-secondary-500 hover:text-secondary-800 dark:hover:text-secondary-200'}`}>
        {label}
    </button>
);


const VerificationPlanTab: React.FC<VerificationPlanTabProps> = ({ projectState, isSimulating, onGenerateTB, onUpdateVPData, exportAction, onExport, onExportComplete }) => {
    const { project, status } = projectState;
    const [activeVpSheet, setActiveVpSheet] = useState('Features');
    const [isDownloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
    const [isLlmExtractModalOpen, setLlmExtractModalOpen] = useState(false);
    const [isSourceModalOpen, setSourceModalOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState<{ content: string; sourceLink: string } | null>(null);
    const vpPdfRef = useRef<HTMLDivElement>(null);

    const isBusy = isSimulating;

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    const handleDownloadPDF = useCallback(() => {
        if (!vpPdfRef.current || !project || !project.verificationPlanData) return;
        const { name, verificationPlanData, verificationPlanSheets } = project;

        let htmlToPrint = `<div style="padding: 2rem; background-color: white; font-family: sans-serif; color: #1e293b;">
            <h1 style="font-size: 1.875rem; font-weight: bold; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #2676d5;">Verification Plan: ${name}</h1>`;
        
        const featuresTableContent = verificationPlanData.map(row => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; vertical-align: top;">${row.feature}</td>
                <td style="padding: 12px; vertical-align: top;">${row.subFeature}</td>
                <td style="padding: 12px; vertical-align: top;">${row.description}</td>
                <td style="padding: 12px; vertical-align: top;">${row.verificationGoal}</td>
            </tr>`).join('');
        htmlToPrint += `
            <h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #1e4d94; border-bottom: 1px solid #94c8f4; padding-bottom: 0.25rem;">Features</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                <thead><tr style="background-color: #f8fafc; text-align: left; text-transform: uppercase;"><th style="padding: 12px; font-weight: 600;">Feature</th><th style="padding: 12px; font-weight: 600;">Sub Feature</th><th style="padding: 12px; font-weight: 600;">Description</th><th style="padding: 12px; font-weight: 600;">Verification Goal</th></tr></thead>
                <tbody>${featuresTableContent}</tbody></table>`;

        verificationPlanSheets?.forEach(sheet => {
            const sheetTableContent = sheet.rows.map(row => `<tr style="border-bottom: 1px solid #e2e8f0;">${row.map(cell => `<td style="padding: 12px; vertical-align: top;">${cell}</td>`).join('')}</tr>`).join('');
            htmlToPrint += `
                <h2 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #1e4d94; border-bottom: 1px solid #94c8f4; padding-bottom: 0.25rem;">${sheet.name}</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                    <thead><tr style="background-color: #f8fafc; text-align: left; text-transform: uppercase;">${sheet.headers.map(h => `<th style="padding: 12px; font-weight: 600;">${h}</th>`).join('')}</tr></thead>
                    <tbody>${sheetTableContent}</tbody></table>`;
        });

        htmlToPrint += `</div>`;
        vpPdfRef.current.innerHTML = htmlToPrint;

        html2canvas(vpPdfRef.current, { backgroundColor: '#ffffff', scale: 2 }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("verification-plan.pdf");
        });
    }, [project]);

    const handleDownloadXLSX = useCallback(() => {
        if (!project?.verificationPlanData || !project?.verificationPlanSheets) return;
        const wb = XLSX.utils.book_new();
        const featuresHeaders = ["Feature", "Sub Feature", "Description", "Verification Goal", "Source"];
        const featuresRows = project.verificationPlanData.map(row => [
            stripHtml(row.feature), stripHtml(row.subFeature), stripHtml(row.description), stripHtml(row.verificationGoal), stripHtml(row.source)
        ]);
        const ws1 = XLSX.utils.aoa_to_sheet([featuresHeaders, ...featuresRows]);
        XLSX.utils.book_append_sheet(wb, ws1, "Features");

        project.verificationPlanSheets.forEach(sheet => {
            const wsData = [sheet.headers, ...sheet.rows];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, sheet.name);
        });
        
        XLSX.writeFile(wb, 'verification-plan.xlsx');
    }, [project]);

    const handleDownloadMD = useCallback(() => {
        if (!project || !project.verificationPlanData) return;
        let mdContent = `# Verification Plan: ${project.name}\n\n## Features\n\n| Feature | Sub Feature | Description | Verification Goal |\n|---|---|---|---|\n`;
        project.verificationPlanData.forEach(row => {
            const description = row.description.replace(/\|/g, '\\|').replace(/\r?\n|\r/g, ' ');
            const goal = row.verificationGoal.replace(/\|/g, '\\|').replace(/\r?\n|\r/g, ' ');
            mdContent += `| ${row.feature} | ${row.subFeature} | ${description} | ${goal} |\n`;
        });
        project.verificationPlanSheets?.forEach(sheet => {
            mdContent += `\n## ${sheet.name}\n\n| ${sheet.headers.join(' | ')} |\n| ${sheet.headers.map(() => '---').join(' | ')} |\n`;
            sheet.rows.forEach(row => { mdContent += `| ${row.join(' | ')} |\n`; });
        });
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'verification-plan.md';
        a.click();
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

    return (
        <div className="p-6 h-full flex flex-col">
            <PageHeader title="Verification Plan">
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
                            <a onClick={() => { onExport('pdf'); setDownloadDropdownOpen(false); }} className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer">PDF</a>
                            <a onClick={() => { onExport('xlsx'); setDownloadDropdownOpen(false); }} className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer">XLSX</a>
                            <a onClick={() => { onExport('md'); setDownloadDropdownOpen(false); }} className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer">Markdown</a>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onGenerateTB}
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
                  />
               )}
               {project?.verificationPlanSheets?.map(sheet => (
                    activeVpSheet === sheet.name && <SimpleTable key={sheet.name} headers={sheet.headers} rows={sheet.rows} />
               ))}
            </div>
            <div className="hidden"><div ref={vpPdfRef} /></div>
            <LlmExtractModal isOpen={isLlmExtractModalOpen} onClose={() => setLlmExtractModalOpen(false)} />
            <SourceViewerModal isOpen={isSourceModalOpen} onClose={() => setSourceModalOpen(false)} sourceData={selectedSource} />
        </div>
    );
};

export default VerificationPlanTab;
