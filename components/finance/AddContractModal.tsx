import React, { useState } from 'react';
import { NewContractData, ContractStatus } from '../../types';
import { useApp } from '../../hooks/useApp';

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contractData: Omit<NewContractData, 'tenantId'>) => Promise<void>;
}

const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onClose, onSave }) => {
  const { suppliers } = useApp();
  const initialState: Omit<NewContractData, 'tenantId'> = { name: '', supplierId: '', category: '', startDate: '', endDate: '', monthlyValue: 0, status: ContractStatus.ACTIVE };
  const [contractData, setContractData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContractData(prev => ({ ...prev, [name]: name === 'monthlyValue' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(contractData);
    setIsSaving(false);
    onClose();
  };
  
  const handleClose = () => {
    setContractData(initialState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Adicionar Novo Contrato</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nome do Contrato</label><input type="text" name="name" value={contractData.name} onChange={handleChange} required className="input-style"/></div>
          <div><label>Fornecedor</label><select name="supplierId" value={contractData.supplierId} onChange={handleChange} required className="input-style"><option value="">Selecione</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label>Categoria</label><input type="text" name="category" value={contractData.category} onChange={handleChange} required className="input-style"/></div>
          <div><label>Valor Mensal (R$)</label><input type="number" name="monthlyValue" value={contractData.monthlyValue} onChange={handleChange} required className="input-style"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label>Data de Início</label><input type="date" name="startDate" value={contractData.startDate} onChange={handleChange} required className="input-style"/></div>
            <div><label>Data de Fim</label><input type="date" name="endDate" value={contractData.endDate} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div><label>Status</label><select name="status" value={contractData.status} onChange={handleChange} required className="input-style">{Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Contrato'}</button>
          </div>
        </form>
        <style>{`label{display:block;margin-bottom:0.5rem;}.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}button{padding:0.5rem 1rem;border-radius:0.5rem;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#eee;color:#333;}`}</style>
      </div>
    </div>
  );
};

export default AddContractModal;