
import React, { useState } from 'react';
import { NewExpenseData, ExpenseStatus } from '../../types';
import { useApp } from '../../hooks/useApp';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: NewExpenseData) => Promise<void>;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
  const { suppliers } = useApp();
  const initialState: NewExpenseData = { 
      tenantId: '', 
      description: '', 
      supplierId: '', 
      category: '', 
      issueDate: new Date().toISOString().split('T')[0], 
      dueDate: new Date().toISOString().split('T')[0], 
      totalValue: 0,
      installments: 1,
      paymentMethod: '' 
  };
  
  const [expenseData, setExpenseData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({ 
        ...prev, 
        [name]: ['totalValue', 'installments'].includes(name) ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(expenseData);
    setIsSaving(false);
    handleClose();
  };
  
  const handleClose = () => {
    setExpenseData(initialState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Nova Conta a Pagar</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="dark:text-gray-300">Descrição</label>
              <input type="text" name="description" value={expenseData.description} onChange={handleChange} required className="input-style"/>
          </div>
          <div>
            <label className="dark:text-gray-300">Fornecedor</label>
            <select name="supplierId" value={expenseData.supplierId} onChange={handleChange} required className="input-style">
              <option value="">Selecione</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="dark:text-gray-300">Categoria</label><input type="text" name="category" value={expenseData.category} onChange={handleChange} required className="input-style" placeholder="Ex: Manutenção"/></div>
             <div><label className="dark:text-gray-300">Valor Total (R$)</label><input type="number" name="totalValue" value={expenseData.totalValue} onChange={handleChange} required className="input-style" step="0.01"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="dark:text-gray-300">Data de Emissão</label><input type="date" name="issueDate" value={expenseData.issueDate} onChange={handleChange} required className="input-style"/></div>
            <div><label className="dark:text-gray-300">1º Vencimento</label><input type="date" name="dueDate" value={expenseData.dueDate} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="dark:text-gray-300">Nº de Parcelas</label>
                  <input type="number" name="installments" value={expenseData.installments} onChange={handleChange} min="1" max="60" required className="input-style"/>
                  <p className="text-xs text-gray-500 mt-1">Regra 2.1.1: Gera títulos vinculados.</p>
              </div>
              <div>
                   <label className="dark:text-gray-300">Forma de Pagamento (Opcional)</label>
                   <select name="paymentMethod" value={expenseData.paymentMethod} onChange={handleChange} className="input-style">
                       <option value="">Selecione...</option>
                       <option value="Boleto">Boleto Bancário</option>
                       <option value="PIX">PIX</option>
                       <option value="Transferência">Transferência</option>
                       <option value="Cartão de Crédito">Cartão de Crédito</option>
                   </select>
              </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Título(s)'}</button>
          </div>
        </form>
        <style>{`label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;}.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:#e5e7eb;color:#333;padding:0.5rem 1rem;border-radius:0.5rem;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}`}</style>
      </div>
    </div>
  );
};

export default AddExpenseModal;