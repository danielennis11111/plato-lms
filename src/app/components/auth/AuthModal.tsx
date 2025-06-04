'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSuccess = () => {
    // Close modal on successful login/registration
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Form Content */}
          <div className="transform transition-all duration-300 ease-in-out">
            {mode === 'login' ? (
              <LoginForm 
                onSuccess={handleSuccess}
                onSwitchToRegister={handleSwitchMode}
              />
            ) : (
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={handleSwitchMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 