import React from 'react';
import { RequestForQuotation, RFQStatus } from '../../types';
import { formatDate } from '../../utils/formatters';

interface RFQListProps {
  rfqs: RequestForQuotation[];
  onView: (rfq: RequestForQuotation) => void;
}

const getStatusBadge = (status: RFQStatus) => {
    const statusMap: Record<RFQStatus, string> = {
        [RFQStatus.DRAFT]: "bg-gray-100 text-gray-800",
        [RFQStatus.SENT]: "bg-blue-100 text-blue-800",
        [RFQStatus.CLOSED]: "bg-green-100 text-green-800",
    };
    return `px-2 py-1 text-xs font-medium rounded-full inline-block ${statusMap[status]}`;
};

const RFQList: React.FC<RFQListProps> = ({ rfqs, onView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cotações (RFQs)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Data de Criação</th>
              <th scope="col" className="px-6 py-3">Itens</th>
              <th scope="col" className="px-6 py-3 text-center">Cotações Recebidas</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map(rfq => (
              <tr key={rfq.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{formatDate(rfq.creationDate)}</td>
                <td className="px-6 py-4 truncate max-w-sm" title={rfq.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}>
                    {rfq.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                </td>
                <td className="px-6 py-4 text-center">{rfq.quotes.length} / {rfq.sentToSupplierIds.length}</td>
                <td className="px-6 py-4 text-center"><span className={getStatusBadge(rfq.status)}>{rfq.status}</span></td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onView(rfq)} className="font-medium text-primary-600 hover:underline">Analisar Cotações</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rfqs.length === 0 && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma cotação encontrada.</p>}
      </div>
    </div>
  );
};

export default RFQList;
