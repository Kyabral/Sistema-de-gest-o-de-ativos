
import React from 'react';
import { PurchaseRequisition, RequisitionStatus } from '../../types';
import { formatDate } from '../../utils/formatters';

interface RequisitionTableProps {
  requisitions: PurchaseRequisition[];
  onView: (requisition: PurchaseRequisition) => void;
}

const getStatusBadge = (status: RequisitionStatus) => {
    const statusMap: Record<RequisitionStatus, string> = {
        [RequisitionStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [RequisitionStatus.APPROVED]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [RequisitionStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        [RequisitionStatus.ORDERED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [RequisitionStatus.RFQ_CREATED]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
        [RequisitionStatus.CANCELED]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return `px-2 py-1 text-xs font-medium rounded-full inline-block ${statusMap[status]}`;
};

const RequisitionTable: React.FC<RequisitionTableProps> = ({ requisitions, onView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requisições de Compra</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3">Solicitante</th>
              <th scope="col" className="px-6 py-3">Itens</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map(req => (
              <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4">{formatDate(req.requestDate)}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{req.requesterName}</td>
                <td className="px-6 py-4 truncate max-w-sm" title={req.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}>
                    {req.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                </td>
                <td className="px-6 py-4 text-center"><span className={getStatusBadge(req.status)}>{req.status}</span></td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onView(req)} className="font-medium text-primary-600 hover:underline">Visualizar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requisitions.length === 0 && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma requisição de compra encontrada.</p>}
      </div>
    </div>
  );
};

export default RequisitionTable;
