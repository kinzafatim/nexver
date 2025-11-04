import React from 'react';
import { DocumentIcon, XIcon } from './Icons';

interface SourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceData: { content: string; sourceLink: string } | null;
}

const SourceViewerModal: React.FC<SourceViewerModalProps> = ({ isOpen, onClose, sourceData }) => {
  if (!isOpen || !sourceData) {
    return null;
  }

  // A simple markdown-to-html converter for basic formatting
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary-600 dark:text-primary-400">$1</strong>') // bold
      .replace(/`(.*?)`/g, '<code class="bg-secondary-200 text-amber-800 dark:bg-secondary-700 dark:text-amber-300 px-1 py-0.5 rounded text-xs">$1</code>') // inline code
      .replace(/\n/g, '<br />'); // newlines
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-3xl text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <DocumentIcon className="w-5 h-5 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                <div>
                    <h2 className="text-lg font-bold">Specification Source</h2>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 font-mono">{sourceData.sourceLink}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"><XIcon className="w-5 h-5"/></button>
        </div>
        <div 
          className="p-6 max-h-[60vh] overflow-y-auto prose prose-sm dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: formatContent(sourceData.content) }}
        />
      </div>
    </div>
  );
};

export default SourceViewerModal;