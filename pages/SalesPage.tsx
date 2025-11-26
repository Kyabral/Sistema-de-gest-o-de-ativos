
import React, { useEffect, useState } from 'react';
import { SalesOrder } from '../types';
import { PlusIcon } from '../components/common/icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useApp } from '../hooks/useApp';

const SalesPage: React.FC = () => {
    const { salesOrders, updateSalesOrderStatus } = useApp();
    const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);

    useEffect(() => {
        // In a real scenario, salesOrders from context come from DB.
        // We use them directly.
        setAllOrders(salesOrders);
    }, [salesOrders]);

    const getStatusBadge = (status: SalesOrder['status']) => {
        switch(status) {
            case 'Faturado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Entregue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Aberto': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100';
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: SalesOrder['status']) => {
        await updateSalesOrderStatus(orderId, newStatus);
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pedidos de Venda</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gestão comercial e faturamento (Integração CRM).</p>
                </div>
                <button className="btn-primary flex items-center"><PlusIcon className="w-5 h-5 mr-2" /> Novo Pedido</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Itens</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allOrders.map((order) => (
                            <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4">{formatDate(order.date)}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.customerName}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{order.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(order.total)}</td>
                                <td className="px-6 py-4 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                                <td className="px-6 py-4 text-center">
                                    {order.status === 'Aberto' && (
                                        <button 
                                            onClick={() => handleStatusChange(order.id, 'Faturado')}
                                            className="text-blue-600 hover:underline mr-3 font-medium"
                                        >
                                            Faturar
                                        </button>
                                    )}
                                    {order.status === 'Faturado' && (
                                        <button 
                                            onClick={() => handleStatusChange(order.id, 'Entregue')}
                                            className="text-green-600 hover:underline mr-3 font-medium"
                                        >
                                            Entregar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allOrders.length === 0 && (
                     <div className="text-center py-10 text-gray-500">
                        <p>Nenhum pedido de venda encontrado.</p>
                        <p className="text-xs mt-2 text-gray-400">Dica: Feche negócios no CRM para gerar pedidos automaticamente.</p>
                    </div>
                )}
            </div>
             <style>{`.btn-primary{display:inline-flex;align-items:center;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;background-color:rgb(var(--color-primary-600));color:white;transition:background-color .2s}.btn-primary:hover{background-color:rgb(var(--color-primary-700))}`}</style>
        </div>
    );
};

export default SalesPage;
