
import React from 'react';
import { StockItem } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ExclamationTriangleIcon, ArrowLeftOnRectangleIcon, ClockIcon } from '../common/icons';

interface StockTableProps {
  items: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (itemId: string) => void;
  onRequestPurchase: (item: StockItem) => void;
  onMove: (item: StockItem) => void;
  onHistory: (item: StockItem) => void;
}

const StockTable: React.FC<StockTableProps> = ({ items, onEdit, onDelete, onRequestPurchase, onMove, onHistory }) => {
  const getExpiryRowClass = (expiryDate?: string): string => {
    if (!expiryDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(expiryDate);
    
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-50 dark:bg-red-900/50';
    if (diffDays <= 30) return 'bg-yellow-50 dark:bg-yellow-900/50';
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Nome do Item</th>
            <th scope="col" className="px-6 py-3">SKU</th>
            <th scope="col" className="px-6 py-3">Lote</th>
            <th scope="col" className="px-6 py-3">Validade</th>
            <th scope="col" className="px-6 py-3 text-center">Qtd.</th>
            <th scope="col" className="px-6 py-3">Localização</th>
            <th scope="col" className="px-6 py-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isLowStock = item.quantity <= item.threshold;
            const expiryClass = getExpiryRowClass(item.expiryDate);

            return (
              <tr key={item.id} className={`border-b dark:border-gray-700 ${expiryClass || (isLowStock ? 'bg-orange-50 dark:bg-orange-900/50' : 'bg-white dark:bg-gray-800')} hover:bg-gray-50 dark:hover:bg-gray-600`}>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <div className="flex items-center">
                    {item.name}
                    {isLowStock && <ExclamationTriangleIcon className="w-4 h-4 ml-2 text-orange-600" title={`Estoque baixo! Limite: ${item.threshold}.`} />}
                    {expiryClass.includes('yellow') && <ExclamationTriangleIcon className="w-4 h-4 ml-2 text-yellow-600" title="Validade próxima!" />}
                    {expiryClass.includes('red') && <ExclamationTriangleIcon className="w-4 h-4 ml-2 text-red-600" title="Produto vencido!" />}
                  </div>
                </th>
                <td className="px-6 py-4 font-mono">{item.sku}</td>
                <td className="px-6 py-4">{item.lotNumber || 'N/A'}</td>
                <td className="px-6 py-4">{item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}</td>
                <td className={`px-6 py-4 text-center font-bold ${isLowStock ? 'text-orange-700 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>
                  {item.quantity}
                </td>
                <td className="px-6 py-4">{item.location}</td>
                <td className="px-6 py-4 text-center flex items-center justify-center space-x-2">
                  <button onClick={() => onMove(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Movimentar">
                      <ArrowLeftOnRectangleIcon className="w-4 h-4 transform rotate-90" />
                  </button>
                  <button onClick={() => onHistory(item)} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="Histórico">
                      <ClockIcon className="w-4 h-4" />
                  </button>
                  <div className="h-4 border-l border-gray-300 mx-1"></div>
                  {isLowStock && <button onClick={() => onRequestPurchase(item)} className="text-xs font-medium text-blue-600 hover:underline">Comprar</button>}
                  <button onClick={() => onEdit(item)} className="text-xs font-medium text-yellow-600 hover:underline">Editar</button>
                  <button onClick={() => onDelete(item.id)} className="text-xs font-medium text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Nenhum item encontrado no estoque.
        </div>
      )}
    </div>
  );
};

export default StockTable;
