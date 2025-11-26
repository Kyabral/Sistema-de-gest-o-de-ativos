import React from 'react';
import { useApp } from '../hooks/useApp';
import { formatDate } from '../utils/formatters';
import { LightBulbIcon } from '../components/common/icons';

const PredictionsPage: React.FC = () => {
  const { failurePredictions, isLoading, error } = useApp();

  const getProbabilityColor = (prob: number) => {
    if (prob > 0.75) return 'text-red-500';
    if (prob > 0.5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center space-x-3">
        <LightBulbIcon className="w-8 h-8 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manutenção Preditiva</h1>
          <p className="text-gray-500 dark:text-gray-400">Insights gerados por IA para prever possíveis falhas em seus ativos.</p>
        </div>
      </div>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ativos com Alto Risco de Falha</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome do Ativo</th>
                  <th scope="col" className="px-6 py-3 text-center">Probabilidade de Falha</th>
                  <th scope="col" className="px-6 py-3">Data Prevista da Falha</th>
                  <th scope="col" className="px-6 py-3 text-center">Ações Sugeridas</th>
                </tr>
              </thead>
              <tbody>
                {failurePredictions.map(pred => (
                  <tr key={pred.assetId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{pred.assetName}</th>
                    <td className={`px-6 py-4 text-center font-bold ${getProbabilityColor(pred.probability)}`}>
                      {(pred.probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">{formatDate(pred.predictedDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="font-medium text-primary-600 hover:underline">Agendar Inspeção</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {failurePredictions.length === 0 && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>Nenhuma predição de falha crítica no momento.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionsPage;