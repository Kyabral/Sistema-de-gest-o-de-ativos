import React from 'react';
import { LightBulbIcon } from './icons';

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: string;
  assetName: string;
}

const AISuggestionModal: React.FC<AISuggestionModalProps> = ({ isOpen, onClose, suggestion, assetName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-full mr-3">
                <LightBulbIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insight de IA para "{assetName}"</h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
            <p>{suggestion}</p>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionModal;