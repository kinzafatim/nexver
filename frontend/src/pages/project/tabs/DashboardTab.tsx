import React, { useRef, useEffect, useState } from 'react';
import { ProjectState, UploadedFile, AppStatus } from '../../../types';
import { PageHeader } from './components/PageHeader';
import { ClockIcon, GenerateIcon, CheckCircleIcon } from '../../../components/Icons';
import { formatTimeAgo } from '../../../utils/formatters';

interface DashboardTabProps {
    projectState: ProjectState;
    isSimulating: boolean;
    onFilesUploaded: (files: UploadedFile[]) => void;
    onGenerateVP: () => Promise<void>;
}

const NextStepItem: React.FC<{isComplete: boolean; children: React.ReactNode}> = ({ isComplete, children }) => (
    <li className={`flex items-center gap-3 ${isComplete ? 'text-green-500' : 'text-secondary-500 dark:text-secondary-400'}`}>
        <CheckCircleIcon className={`w-5 h-5 ${isComplete ? 'text-green-500' : 'text-secondary-400 dark:text-secondary-600'}`}/>
        <span className={isComplete ? 'font-semibold text-secondary-800 dark:text-secondary-200' : ''}>{children}</span>
    </li>
);

const DashboardTab: React.FC<DashboardTabProps> = ({ projectState, isSimulating, onFilesUploaded, onGenerateVP }) => {
    const { project, status } = projectState;
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

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
                .filter(file => file.name.endsWith('.pdf') || file.name.endsWith('.docx'))
                .map((file: File) => ({ name: file.name, type: 'Spec' }));
            if (newFiles.length > 0) onFilesUploaded(newFiles);
        }
    };

    const handleGenerateVPClick = async () => {
        setIsLoading(true);
        await onGenerateVP();
        setIsLoading(false);
    };

    const isBusy = isLoading || isSimulating;

    return (
        <main className="flex-1 p-6 overflow-auto relative">
             {isBusy && (
                <div className="absolute inset-0 bg-secondary-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-lg">
                    <svg className="animate-spin h-12 w-12 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-white text-lg">Generating Verification Plan...</p>
                </div>
            )}
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
        </main>
    );
};

export default DashboardTab;