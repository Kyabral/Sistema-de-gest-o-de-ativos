
import React, { useState, useEffect } from 'react';
import { Deal, DealStage } from '../types';
import { PlusIcon, CurrencyDollarIcon } from '../components/common/icons';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../hooks/useApp';
import Toast from '../components/common/Toast';
import AddDealModal from '../components/crm/AddDealModal';

const stages: DealStage[] = ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'];

const CRMPage: React.FC = () => {
  const { deals: contextDeals, addDeal, updateDeal, addSalesOrder } = useApp();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
      setDeals(contextDeals);
  }, [contextDeals]);

  const getStageColor = (stage: DealStage) => {
    switch (stage) {
      case 'Lead': return 'border-gray-400 bg-gray-50 dark:bg-gray-700/50';
      case 'Qualificado': return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'Proposta': return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Negociação': return 'border-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'Fechado': return 'border-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-200';
    }
  };

  const moveDeal = async (id: string, direction: 'next' | 'prev') => {
    const dealIndex = deals.findIndex(d => d.id === id);
    if (dealIndex === -1) return;
    
    const deal = deals[dealIndex];
    const currentIndex = stages.indexOf(deal.stage);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= stages.length) return;
      
    const newStage = stages[newIndex];
    let newProb = deal.probability;
    if (newStage === 'Lead') newProb = 10;
    if (newStage === 'Qualificado') newProb = 30;
    if (newStage === 'Proposta') newProb = 60;
    if (newStage === 'Negociação') newProb = 80;
    if (newStage === 'Fechado') newProb = 100;
      
    const updatedDeal = { ...deal, stage: newStage, probability: newProb };
    
    // Optimistic UI update
    const newDeals = [...deals];
    newDeals[dealIndex] = updatedDeal;
    setDeals(newDeals);
    
    await updateDeal(updatedDeal);

    // BUSINESS RULE 4.3: Auto-Generate Sales Order on Win
    if (newStage === 'Fechado' && deal.stage !== 'Fechado') {
        try {
            await addSalesOrder({
                customerName: deal.clientName,
                date: new Date().toISOString(),
                total: deal.value,
                status: 'Aberto',
                items: [{ description: deal.title, quantity: 1, unitPrice: deal.value }]
            });
            setToast({ show: true, message: `Regra 4.3 Aplicada: Pedido de venda gerado automaticamente para ${deal.clientName}!` });
        } catch (error) {
            console.error("Failed to auto-generate sales order", error);
            setToast({ show: true, message: "Erro ao gerar pedido automático." });
        }
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }
  };

  const totalPipeline = deals.reduce((acc, deal) => acc + (deal.stage !== 'Fechado' ? deal.value : 0), 0);
  const weightedPipeline = deals.reduce((acc, deal) => acc + (deal.stage !== 'Fechado' ? deal.value * (deal.probability / 100) : 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pipeline de Vendas (CRM)</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestão de pipeline de vendas e oportunidades.</p>
          <div className="flex gap-4 mt-2">
            <div className="text-sm"><span className="text-gray-500">Pipeline Total:</span> <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(totalPipeline)}</span></div>
            <div className="text-sm"><span className="text-gray-500">Ponderado:</span> <span className="font-bold text-primary-600">{formatCurrency(weightedPipeline)}</span></div>
          </div>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center"><PlusIcon className="w-5 h-5 mr-2" /> Novo Negócio</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            
            return (
                <div key={stage} className="min-w-[280px] w-full max-w-xs flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                    <div className={`p-3 mb-3 border-b-4 ${getStageColor(stage).split(' ')[0]} rounded-t-md bg-white dark:bg-gray-700 shadow-sm`}>
                        <h3 className="font-bold text-gray-700 dark:text-white flex justify-between">
                            {stage}
                            <span className="bg-gray-200 dark:bg-gray-600 text-xs px-2 py-1 rounded-full">{stageDeals.length}</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatCurrency(stageValue)}</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar px-1">
                        {stageDeals.map(deal => (
                            <div key={deal.id} className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600 group">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{deal.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{deal.clientName}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <span className="flex items-center"><CurrencyDollarIcon className="w-3 h-3 mr-1"/>{formatCurrency(deal.value)}</span>
                                    <span>{deal.owner}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-600 mb-3">
                                    <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${deal.probability}%` }}></div>
                                </div>
                                
                                <div className="flex justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => moveDeal(deal.id, 'prev')}
                                        disabled={stage === 'Lead'}
                                        className="text-xs text-gray-500 hover:text-primary-600 disabled:opacity-30"
                                    >
                                        &larr; Voltar
                                    </button>
                                    <button 
                                        onClick={() => moveDeal(deal.id, 'next')}
                                        disabled={stage === 'Fechado'}
                                        className="text-xs text-primary-600 font-semibold hover:text-primary-800 disabled:opacity-30"
                                    >
                                        {stage === 'Negociação' ? 'Fechar & Gerar Pedido' : 'Avançar'} &rarr;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>
      <AddDealModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={addDeal} />
      <Toast isOpen={toast.show} message={toast.message} type="success" onClose={() => setToast({show: false, message: ''})} />
      <style>{`.btn-primary{display:inline-flex;align-items:center;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;background-color:rgb(var(--color-primary-600));color:white;transition:background-color .2s}.btn-primary:hover{background-color:rgb(var(--color-primary-700))}`}</style>
    </div>
  );
};

export default CRMPage;
