import React, { useState } from 'react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { name: string }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('New_Verification_Project');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-lg text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Set up a new verification environment.</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Project Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., PicoCPU_Verification"
              className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-secondary-100/50 dark:bg-secondary-900/50 flex justify-end gap-4 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-secondary-200 text-secondary-800 hover:bg-secondary-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 rounded-lg transition">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Create Project</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;