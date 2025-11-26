
import React from 'react';
import { StockItem } from '../../types';
import { formatDate } from '../../utils/formatters';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen) return null;

  const history = item.movementHistory ? [...item.movementHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
             <h2 className="text-xl font-bold dark:text-white">Histórico de Movimentação</h2>
             <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <p className="mb-4 text-gray-600 dark:text-gray-300">Item: <strong>{item.name}</strong></p>

        <div className="overflow-y-auto flex-1">
            {history.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum histórico registrado.</p>
            ) : (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Data</th>
                            <th className="px-4 py-2">Ação</th>
                            <th className="px-4 py-2 text-center">Qtd</th>
                            <th className="px-4 py-2">Usuário</th>
                            <th className="px-4 py-2">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((log, idx) => (
                            <tr key={log.id || idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-2 whitespace-nowrap">{new Date(log.date).toLocaleString('pt-BR')}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        log.type === 'ENTRADA' ? 'bg-green-100 text-green-800' : 
                                        log.type === 'SAIDA' ? 'bg-red-100 text-red-800' : 
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-center font-mono">{log.quantity}</td>
                                <td className="px-4 py-2">{log.user}</td>
                                <td className="px-4 py-2 text-xs">
                                    {log.type === 'TRANSFERENCIA' ? (
                                        <span>{log.origin} &rarr; {log.destination}</span>
                                    ) : (
                                        log.reason || '-'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;
