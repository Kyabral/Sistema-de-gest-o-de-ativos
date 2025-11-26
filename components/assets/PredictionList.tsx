import React from 'react';
import { FailurePrediction } from '../../types';
import { formatDate } from '../../utils/formatters';
import { LightBulbIcon } from '../common/icons';
import { useApp } from '../../hooks/useApp';

interface PredictionListProps {
  predictions: FailurePrediction[];
}

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
  const { isLoading } = useApp();

  const getProbabilityColor = (prob: number) => {
    if (prob > 0.75) return 'text-red-500 font-bold';
    if (prob > 0.5) return 'text-yellow-500 font-semibold';
    return 'text-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96 flex flex-col">
      <div className="flex items-center mb-4">
        <LightBulbIcon className="w-6 h-6 text-yellow-400 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Previsões de Falha (IA)</h3>
      </div>
      {isLoading ? (
         <div className="flex-grow flex items-center justify-center text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
         </div>
      ) : predictions.length > 0 ? (
        <div className="overflow-y-auto flex-grow">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {predictions.sort((a,b) => b.probability - a.probability).map(pred => (
              <li key={pred.assetId} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pred.assetName}</p>
                  <p className={`text-sm ${getProbabilityColor(pred.probability)}`}>
                    {(pred.probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Data Prevista: {formatDate(pred.predictedDate)}
                  </p>
                  <button className="text-xs font-medium text-primary-600 hover:underline">
                    Agendar Inspeção
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center">
            <div>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma predição de falha crítica no momento.</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">A IA está monitorando seus ativos.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default PredictionList;