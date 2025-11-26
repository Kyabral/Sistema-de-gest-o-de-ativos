import React, { useState } from 'react';
import { PurchaseOrder, ReceivedItem, StockItem } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import ReceiveItemsModal from './ReceiveItemsModal';

interface ViewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PurchaseOrder;
    onReceiveItems: (orderId: string, receivedItems: { description: string; quantityReceived: number; stockItemId?: string }[]) => Promise<void>;
}

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, onClose, order, onReceiveItems }) => {
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

    if (!isOpen) return null;

    const totalQuantityOrdered = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalQuantityReceived = order.receivedItems.reduce((sum, item) => sum + item.quantityReceived, 0);
    const isReceivable = order.status !== 'Recebido' && order.status !== 'Cancelado';

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h2 className="text-xl font-bold">Detalhes da Ordem de Compra</h2>
                        <button onClick={onClose}>&times;</button>
                    </div>
                    <div className="overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong>Data:</strong> {formatDate(order.orderDate)}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Total:</strong> {formatCurrency(order.totalValue)}</p>
                            <p><strong>Entrega Prevista:</strong> {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'N/A'}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold mt-4">Itens Pedidos ({totalQuantityOrdered})</h3>
                            <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-3 rounded mt-2 text-sm">
                                {order.items.map((item, i) => <li key={i}>{item.quantity}x {item.description}</li>)}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mt-4">Itens Recebidos ({totalQuantityReceived})</h3>
                            {order.receivedItems.length > 0 ? (
                                <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-3 rounded mt-2 text-sm">
                                    {order.receivedItems.map((item, i) => <li key={i}>{formatDate(item.receivedDate)}: {item.quantityReceived}x {item.description}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 mt-2">Nenhum item recebido ainda.</p>
                            )}
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 pt-4 mt-auto border-t">
                        {isReceivable && <button onClick={() => setIsReceiveModalOpen(true)} className="btn-primary">Receber Itens</button>}
                        <button onClick={onClose} className="btn-secondary">Fechar</button>
                    </div>
                </div>
                 <style>{`button{padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#e5e7eb;color:#1f2937;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}`}</style>
            </div>
            {isReceivable && 
                <ReceiveItemsModal 
                    isOpen={isReceiveModalOpen}
                    onClose={() => setIsReceiveModalOpen(false)}
                    order={order}
                    onSave={onReceiveItems}
                />
            }
        </>
    );
};

export default ViewOrderModal;
