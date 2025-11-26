import React, { useState, useMemo } from 'react';
import { PurchaseOrder, PurchaseItem } from '../../types';

interface ReceiveItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PurchaseOrder;
    onSave: (orderId: string, receivedItems: { description: string; quantityReceived: number; stockItemId?: string }[]) => Promise<void>;
}

const ReceiveItemsModal: React.FC<ReceiveItemsModalProps> = ({ isOpen, onClose, order, onSave }) => {
    
    const initialCounts = useMemo(() => {
        const counts = new Map<string, number>();
        order.items.forEach(item => {
            const alreadyReceived = order.receivedItems
                .filter(ri => ri.description === item.description)
                .reduce((sum, ri) => sum + ri.quantityReceived, 0);
            const remaining = item.quantity - alreadyReceived;
            counts.set(item.description, remaining);
        });
        return counts;
    }, [order]);

    const [receivedCounts, setReceivedCounts] = useState<Map<string, number>>(initialCounts);
    const [isSaving, setIsSaving] = useState(false);

    const handleCountChange = (description: string, value: string) => {
        const qty = parseInt(value, 10);
        setReceivedCounts(new Map(receivedCounts.set(description, isNaN(qty) ? 0 : qty)));
    };
    
    const handleSubmit = async () => {
        setIsSaving(true);
        const receivedItems = Array.from(receivedCounts.entries())
            .filter(([, quantity]) => quantity > 0)
            .map(([description, quantityReceived]) => {
                const originalItem = order.items.find(i => i.description === description);
                return {
                    description,
                    quantityReceived,
                    stockItemId: originalItem?.stockItemId
                };
            });
        
        await onSave(order.id, receivedItems);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Receber Itens do Pedido</h2>
                <div className="space-y-3">
                    {order.items.map(item => {
                        const alreadyReceived = order.receivedItems
                            .filter(ri => ri.description === item.description)
                            .reduce((sum, ri) => sum + ri.quantityReceived, 0);
                        const remaining = item.quantity - alreadyReceived;
                        
                        if (remaining <= 0) return null;
                        
                        return (
                            <div key={item.description} className="grid grid-cols-3 gap-4 items-center">
                                <span>{item.description} (Pedido: {item.quantity}, Restante: {remaining})</span>
                                <input 
                                    type="number" 
                                    value={receivedCounts.get(item.description) || 0}
                                    onChange={e => handleCountChange(item.description, e.target.value)}
                                    max={remaining}
                                    min="0"
                                    className="input-style"
                                />
                            </div>
                        );
                    })}
                </div>
                 <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
                    <button onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="btn-primary">{isSaving ? 'Processando...' : 'Confirmar Recebimento'}</button>
                </div>
            </div>
             <style>{`.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;padding:0.5rem 1rem;}.btn-secondary{background-color:#eee;color:#333;padding:0.5rem 1rem;}`}</style>
        </div>
    );
};

export default ReceiveItemsModal;
