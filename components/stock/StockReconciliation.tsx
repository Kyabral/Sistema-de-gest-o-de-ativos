import React, { useState, useEffect } from 'react';
import { StockItem, StockCountItem, NewStockCountData } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface StockReconciliationProps {
  stockItems: StockItem[];
  onSave: (data: Omit<NewStockCountData, 'tenantId'>) => Promise<void>;
  onCancel: () => void;
}

const StockReconciliation: React.FC<StockReconciliationProps> = ({ stockItems, onSave, onCancel }) => {
    const { user } = useAuth();
    const [countedItems, setCountedItems] = useState<Map<string, number>>(new Map());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const initialMap = new Map<string, number>();
        stockItems.forEach(item => {
            initialMap.set(item.id, item.quantity);
        });
        setCountedItems(initialMap);
    }, [stockItems]);

    const handleCountChange = (itemId: string, newCount: string) => {
        const count = parseInt(newCount, 10);
        setCountedItems(new Map(countedItems.set(itemId, isNaN(count) ? 0 : count)));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const stockCountItems: StockCountItem[] = stockItems.map(item => {
            const countedQty = countedItems.get(item.id) ?? 0;
            return {
                itemId: item.id,
                itemName: item.name,
                sku: item.sku,
                systemQty: item.quantity,
                countedQty: countedQty,
                variance: countedQty - item.quantity,
            };
        });

        const data: Omit<NewStockCountData, 'tenantId'> = {
            date: new Date().toISOString(),
            countedBy: user?.name || 'Usuário Desconhecido',
            items: stockCountItems,
            status: 'Concluído',
        };
        await onSave(data);
        setIsSaving(false);
        onCancel(); // Go back to the list
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Contagem de Estoque</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Item</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3 text-center">Qtd. no Sistema</th>
                                <th scope="col" className="px-6 py-3 text-center">Qtd. Contada</th>
                                <th scope="col" className="px-6 py-3 text-center">Divergência</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItems.map(item => {
                                const countedQty = countedItems.get(item.id) ?? 0;
                                const variance = countedQty - item.quantity;
                                return (
                                    <tr key={item.id} className="border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4">{item.sku}</td>
                                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                value={countedQty}
                                                onChange={e => handleCountChange(item.id, e.target.value)}
                                                className="w-24 text-center input-style"
                                            />
                                        </td>
                                        <td className={`px-6 py-4 text-center font-bold ${variance === 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {variance > 0 ? `+${variance}` : variance}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t dark:border-gray-600">
                    <button onClick={onCancel} disabled={isSaving} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                        {isSaving ? 'Salvando...' : 'Finalizar e Salvar Contagem'}
                    </button>
                </div>
            </div>
            <style>{`.input-style{padding:0.5rem;border-radius:0.5rem;border:1px solid #D1D5DB;background-color:#F9FAFB;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}.btn-primary{background-color:rgb(var(--color-primary-600));color:#fff; padding: 0.5rem 1rem; border-radius:0.5rem;}.btn-secondary{background-color:#e5e7eb;color:#1f2937; padding: 0.5rem 1rem; border-radius:0.5rem;}`}</style>
        </div>
    );
};

export default StockReconciliation;