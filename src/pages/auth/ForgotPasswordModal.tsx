import React, { useState } from 'react';
import { sendPasswordReset } from '../../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');
    const response = await sendPasswordReset(email);
    setMessage(response.message || 'An error occurred.');
    setIsLoading(false);
    if (response.success) {
        setTimeout(() => {
            handleClose();
        }, 3000);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setEmail('');
    setMessage('');
    setIsLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={handleClose}>
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-lg text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Enter your email to receive a password reset link.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., alex.hudson@nexver.io"
              className="w-full bg-secondary-50 dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          {message && <p className="text-sm text-center text-secondary-600 dark:text-secondary-300">{message}</p>}
        </div>
        <div className="px-6 py-4 bg-secondary-100/50 dark:bg-secondary-900/50 flex justify-end gap-4 rounded-b-xl">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-semibold bg-secondary-200 text-secondary-800 hover:bg-secondary-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 rounded-lg transition">Cancel</button>
          <button onClick={handleSubmit} disabled={!email.trim() || isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
