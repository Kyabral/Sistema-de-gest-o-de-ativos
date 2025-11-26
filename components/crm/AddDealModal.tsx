import React, { useState } from 'react';
import { Deal, DealStage } from '../../types';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dealData: Omit<Deal, 'id' | 'tenantId'>) => Promise<void>;
}

const AddDealModal: React.FC<AddDealModalProps> = ({ isOpen, onClose, onSave }) => {
  const initialState = {
    title: '',
    clientName: '',
    value: 0,
    stage: 'Lead' as DealStage,
    probability: 10,
    expectedCloseDate: '',
    owner: '',
  };
  const [deal, setDeal] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeal(prev => ({ ...prev, [name]: name === 'value' || name === 'probability' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(deal);
    setDeal(initialState);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Novo Negócio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="dark:text-gray-300">Título</label><input type="text" name="title" value={deal.title} onChange={handleChange} required className="input-style"/></div>
          <div><label className="dark:text-gray-300">Cliente</label><input type="text" name="clientName" value={deal.clientName} onChange={handleChange} required className="input-style"/></div>
          <div><label className="dark:text-gray-300">Valor (R$)</label><input type="number" name="value" value={deal.value} onChange={handleChange} required className="input-style"/></div>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="dark:text-gray-300">Estágio</label><select name="stage" value={deal.stage} onChange={handleChange} className="input-style"><option>Lead</option><option>Qualificado</option><option>Proposta</option><option>Negociação</option><option>Fechado</option></select></div>
              <div><label className="dark:text-gray-300">Probabilidade (%)</label><input type="number" name="probability" value={deal.probability} onChange={handleChange} className="input-style"/></div>
          </div>
          <div><label className="dark:text-gray-300">Fechamento Previsto</label><input type="date" name="expectedCloseDate" value={deal.expectedCloseDate} onChange={handleChange} required className="input-style"/></div>
          <div><label className="dark:text-gray-300">Responsável</label><input type="text" name="owner" value={deal.owner} onChange={handleChange} required className="input-style"/></div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
        <style>{`.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:#e5e7eb;color:#333;padding:0.5rem 1rem;border-radius:0.5rem;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}`}</style>
      </div>
    </div>
  );
};

export default AddDealModal;
