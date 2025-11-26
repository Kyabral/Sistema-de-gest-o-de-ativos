import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import StockCountList from '../components/stock/StockCountList';
import StockReconciliation from '../components/stock/StockReconciliation';
import { PlusIcon } from '../components/common/icons';

const StockReconciliationPage: React.FC = () => {
    const { stockCounts, stockItems, addStockCount } = useApp();
    const [isCounting, setIsCounting] = useState(false);

    if (isCounting) {
        return (
            <StockReconciliation
                stockItems={stockItems}
                onSave={addStockCount}
                onCancel={() => setIsCounting(false)}
            />
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <p className="text-gray-500 dark:text-gray-400">Inicie uma nova contagem ou revise o histórico de reconciliações de estoque.</p>
                <button onClick={() => setIsCounting(true)} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Iniciar Nova Contagem
                </button>
            </div>
            
            <StockCountList stockCounts={stockCounts} />
            <style>{`.btn {display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;transition:background-color .2s}.btn-primary {background-color:rgb(var(--color-primary-600));color:#fff}.btn-primary:hover {background-color:rgb(var(--color-primary-700))}`}</style>
        </div>
    );
};

export default StockReconciliationPage;