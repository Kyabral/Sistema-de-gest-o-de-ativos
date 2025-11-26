import React from 'react';
import { StockCount } from '../../types';
import { formatDate } from '../../utils/formatters';

interface StockCountListProps {
  stockCounts: StockCount[];
}

const StockCountList: React.FC<StockCountListProps> = ({ stockCounts }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Contagens</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Data da Contagem</th>
              <th scope="col" className="px-6 py-3">Contado Por</th>
              <th scope="col" className="px-6 py-3 text-center">Itens com Divergência</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {stockCounts.map(count => {
              const divergentItems = count.items.filter(i => i.variance !== 0).length;
              return (
                <tr key={count.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{formatDate(count.date)}</td>
                  <td className="px-6 py-4">{count.countedBy}</td>
                  <td className={`px-6 py-4 text-center font-semibold ${divergentItems > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {divergentItems}
                  </td>
                  <td className="px-6 py-4 text-center">{count.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {stockCounts.length === 0 && <p className="text-center py-10 text-gray-500">Nenhum histórico de contagem encontrado.</p>}
      </div>
    </div>
  );
};

export default StockCountList;