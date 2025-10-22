import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

interface LlmExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LlmExtractModal: React.FC<LlmExtractModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    alert(`Generating feature with LLM...\n\nPrompt: "${prompt}"\n\nContext: "${context}"`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-2xl text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-4">
          <SparklesIcon className="w-6 h-6 text-primary-500 dark:text-primary-400 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">Extract Feature with LLM</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Extract all features related to the AXI4-Lite interface configuration registers from the provided spec...'"
              className="w-full h-28 bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-y"
            />
          </div>
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">You can also paste relevant sections of your specification below to provide context to the AI.</label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste specification text here..."
              className="w-full h-32 bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-y"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-secondary-100/50 dark:bg-secondary-900/50 flex justify-end gap-4 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-secondary-200 hover:bg-secondary-300 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-800 dark:text-secondary-100 rounded-lg transition">Cancel</button>
          <button onClick={handleSubmit} disabled={!prompt.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default LlmExtractModal;