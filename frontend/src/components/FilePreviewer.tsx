import React from 'react';
import { UploadedFile, LogEntry } from '../types';
import { XIcon, FileIcon, LogFileIcon, InfoIcon, SuccessIcon, WarningIcon, ErrorIcon } from './Icons';

interface FilePreviewerProps {
  file: UploadedFile;
  onClose: () => void;
  logs?: LogEntry[];
}

const LogIcon: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
    const className="w-4 h-4 flex-shrink-0";
    switch(type){
        case 'success': return <SuccessIcon className={`${className} text-green-500`} />;
        case 'warning': return <WarningIcon className={`${className} text-yellow-500`} />;
        case 'error': return <ErrorIcon className={`${className} text-red-500`} />;
        case 'info':
        default:
            return <InfoIcon className={`${className} text-primary-500`} />;
    }
}

const FilePreviewer: React.FC<FilePreviewerProps> = ({ file, onClose, logs }) => {
  const formatTimestamp = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const renderContent = () => {
    if (file.type === 'Log' && logs) {
      return (
        <div className="font-mono text-xs text-secondary-700 dark:text-secondary-300 space-y-2 p-4">
            {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                    <LogIcon type={log.type} />
                    <span className="text-secondary-500 dark:text-secondary-600 select-none">{formatTimestamp(log.timestamp)}</span>
                    <p className="flex-1 whitespace-pre-wrap leading-relaxed">{log.message}</p>
                </div>
            ))}
        </div>
      );
    }
    
    // Default Spec file preview
    return (
      <div className="p-6 text-secondary-700 dark:text-secondary-300">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h3>File Preview</h3>
          <p>
            This is a placeholder for the file preview of <strong>{file.name}</strong>.
          </p>
          <p>
            In a real application, a PDF viewer component or an iframe would be used to render the contents of the specification document here.
            This would allow verification engineers to reference the source material directly within the application.
          </p>
          <div className="p-8 mt-4 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-md text-center">
            <p className="text-secondary-500">[ PDF Content for {file.name} would be displayed here ]</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = file.type === 'Log' ? LogFileIcon : FileIcon;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-secondary-900 rounded-lg shadow-lg">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-800">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-secondary-800 dark:text-secondary-100">{file.name}</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-300">
          <XIcon className="w-5 h-5" />
        </button>
      </header>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default FilePreviewer;