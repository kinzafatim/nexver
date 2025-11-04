import React, { useRef, useEffect, useState } from 'react';
import { ProjectState, UploadedFile, AppStatus } from '../../../types';
import { PageHeader } from './components/PageHeader';
import { ClockIcon, GenerateIcon, CheckCircleIcon, PdfIcon } from '../../../components/Icons';
import { formatTimeAgo } from '../../../utils/formatters';

interface DashboardTabProps {
    projectState: ProjectState;
    isSimulating: boolean;
    onFilesUploaded: (files: UploadedFile[]) => void;
    onGenerateVP: () => Promise<void>;
    isLoadingVP: boolean;
    onCancelVP: () => void;
}

const NextStepItem: React.FC<{isComplete: boolean; children: React.ReactNode}> = ({ isComplete, children }) => (
    <li className={`flex items-center gap-3 ${isComplete ? 'text-green-500' : 'text-primary-800 dark:text-secondary-400'}`}>
        <CheckCircleIcon className={`w-5 h-5 ${isComplete ? 'text-green-500' : 'text-secondary-400 dark:text-secondary-600'}`}/>
        <span className={isComplete ? 'font-semibold text-secondary-800 dark:text-secondary-200' : ''}>{children}</span>
    </li>
);

const DashboardTab: React.FC<DashboardTabProps> = ({ projectState, isSimulating, onFilesUploaded, onGenerateVP, isLoadingVP, onCancelVP }) => {
    const { project, status } = projectState;
    const dropzoneRef = useRef<HTMLDivElement>(null);
    
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
                    .filter((file: File) => file.name.endsWith('.pdf'))
                    .map((file: File) => ({ name: file.name, type: 'Spec' }));
                if (newFiles.length > 0) onFilesUploaded(newFiles);
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles: UploadedFile[] = Array.from(event.target.files)
                .filter((file: File) => file.name.endsWith('.pdf'))
                .map((file: File) => ({ name: file.name, type: 'Spec' }));
            if (newFiles.length > 0) onFilesUploaded(newFiles);
        }
    };

    const isBusy = isLoadingVP || isSimulating;

    return (
        <main className="flex-1 p-4 overflow-auto relative">
             {isLoadingVP && (
                <div className="absolute inset-0 bg-secondary-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-lg">
                    <svg className="animate-spin h-12 w-12 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-white text-lg">Generating Verification Plan...</p>
                    <button 
                        onClick={onCancelVP}
                        className="mt-6 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Cancel
                    </button>
                </div>
            )}
            <PageHeader title="Upload Specification file" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow flex flex-col min-h-[300px]">
                        <div ref={dropzoneRef} className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-6 text-center transition-colors flex flex-col justify-center flex-grow">
                             {(project?.specFiles?.length || 0) > 0 ? (
                                <div className="text-left h-full flex flex-col">
                                    <h3 className="text-lg font-semibold mb-2 text-secondary-700 dark:text-secondary-200 flex-shrink-0">Uploaded Specification</h3>
                                    <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-4 border rounded-md border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50">
                                        <ul className="space-y-2 p-3">
                                            {project?.specFiles.map(file => (
                                                <li key={file.name} className="flex items-center gap-3 text-sm p-1 bg-white dark:bg-secondary-900 rounded-md shadow-sm">
                                                    <PdfIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                    <span className="truncate" title={file.name}>{file.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-semibold mb-2 text-secondary-700 dark:text-secondary-200">Upload File</h3>
                                    <p className="text-primary-800 dark:text-secondary-400 mb-4">
                                        To generate the Verification Plan (VP), upload the specification file of your design in .pdf format.
                                        <br/>
                                        Drag & drop a file here or click below to select one.
                                    </p>
                                    <input type="file" accept=".pdf" multiple onChange={handleFileChange} className="hidden" id="file-upload"/>
                                    <label htmlFor="file-upload" className="cursor-pointer inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">Select Files</label>
                                </>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-800 flex-shrink-0">
                            <button onClick={onGenerateVP} disabled={(project?.specFiles?.length || 0) === 0 || isBusy} className="w-full flex justify-center items-center gap-3 py-3 px-4 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <GenerateIcon className="w-5 h-5" />
                                Generate Verification Plan
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-3 text-secondary-700 dark:text-secondary-200">Next Steps</h3>
                        <ul className="space-y-2">
                            <NextStepItem isComplete={(project?.specFiles?.length || 0) > 0}>Upload Spec files</NextStepItem>
                            <NextStepItem isComplete={status >= AppStatus.VPGenerated}>Generate Verification Plan</NextStepItem>
                            <NextStepItem isComplete={status >= AppStatus.TBAndTestsGenerated}>Generate Testbench & Tests</NextStepItem>
                            <NextStepItem isComplete={status >= AppStatus.ReportReady}>Run Simulation & View Report</NextStepItem>
                        </ul>
                    </div>
                </div>

                <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-3 text-secondary-700 dark:text-secondary-200 flex-shrink-0">Project History</h3>
                    <div className="space-y-3 overflow-y-auto pr-2 max-h-96">
                    {project?.history.slice().reverse().map(item => (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className="bg-secondary-100 dark:bg-secondary-800 rounded-full p-2 mt-1">
                                <ClockIcon className="w-4 h-4 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-secondary-800 dark:text-secondary-200">{item.event}</p>
                                <p className="text-xs text-primary-700 dark:text-secondary-400">{formatTimeAgo(item.timestamp)}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DashboardTab;
