import React, { useState, useEffect } from 'react';
import { Contract, NewContractData, ContractStatus } from '../../types';
import { useApp } from '../../hooks/useApp';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<NewContractData>) => Promise<void>;
  contract: Contract;
}

const EditContractModal: React.FC<EditContractModalProps> = ({ isOpen, onClose, onSave, contract }) => {
  const { suppliers } = useApp();
  const [contractData, setContractData] = useState<Partial<NewContractData>>(contract);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContractData({
      ...contract,
      startDate: contract.startDate.split('T')[0],
      endDate: contract.endDate.split('T')[0],
    });
  }, [contract]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContractData(prev => ({ ...prev, [name]: name === 'monthlyValue' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(contract.id, contractData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Contrato</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div><label>Nome</label><input type="text" name="name" value={contractData.name} onChange={handleChange} required className="input-style"/></div>
           <div>
            <label>Fornecedor</label>
            <select name="supplierId" value={contractData.supplierId} onChange={handleChange} required className="input-style">
              <option value="">Selecione</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
           </div>
           <div><label>Valor Mensal (R$)</label><input type="number" name="monthlyValue" value={contractData.monthlyValue} onChange={handleChange} required className="input-style"/></div>
           <div className="grid grid-cols-2 gap-4">
              <div><label>Início</label><input type="date" name="startDate" value={contractData.startDate} onChange={handleChange} required className="input-style"/></div>
              <div><label>Fim</label><input type="date" name="endDate" value={contractData.endDate} onChange={handleChange} required className="input-style"/></div>
           </div>
           <div><label>Status</label><select name="status" value={contractData.status} onChange={handleChange} required className="input-style">{Object.values(ContractStatus).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
        <style>{`label{display:block;margin-bottom:0.5rem;}.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}button{padding:0.5rem 1rem;border-radius:0.5rem;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#eee;color:#333;}`}</style>
      </div>
    </div>
  );
};

export default EditContractModal;