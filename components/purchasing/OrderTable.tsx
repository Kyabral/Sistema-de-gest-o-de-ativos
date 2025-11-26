import React from 'react';
import { PurchaseOrder, PurchaseStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useApp } from '../../hooks/useApp';
import { formatCurrency } from '../../utils/formatters';

interface OrderTableProps {
  orders: PurchaseOrder[];
  onView: (order: PurchaseOrder) => void;
}

const getStatusBadge = (status: PurchaseStatus) => {
    const statusMap: Record<PurchaseStatus, string> = {
        [PurchaseStatus.PENDING]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        [PurchaseStatus.SENT]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [PurchaseStatus.PARTIALLY_RECEIVED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [PurchaseStatus.RECEIVED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [PurchaseStatus.CANCELED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return `px-2 py-1 text-xs font-medium rounded-full inline-block ${statusMap[status]}`;
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, onView }) => {
  const { suppliers } = useApp();

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ordens de Compra</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Data do Pedido</th>
              <th scope="col" className="px-6 py-3">Fornecedor</th>
              <th scope="col" className="px-6 py-3">Itens</th>
              <th scope="col" className="px-6 py-3 text-right">Valor Total</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4">{formatDate(order.orderDate)}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{getSupplierName(order.supplierId)}</td>
                <td className="px-6 py-4 truncate max-w-sm" title={order.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}>
                    {order.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                </td>
                <td className="px-6 py-4 text-right">{formatCurrency(order.totalValue)}</td>
                <td className="px-6 py-4 text-center"><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onView(order)} className="font-medium text-primary-600 hover:underline">Ver Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma ordem de compra encontrada.</p>}
      </div>
    </div>
  );
};

export default OrderTable;
