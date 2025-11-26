import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  isOpen: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, isOpen }) => {
  if (!isOpen) {
    return null;
  }

  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-lg flex items-center z-[100] transition-opacity duration-300";
  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold text-xl leading-none" aria-label="Close">&times;</button>
    </div>
  );
};

export default Toast;
