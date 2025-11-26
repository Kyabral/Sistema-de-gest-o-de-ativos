import React, { useState } from 'react';
import { NewStockItemData } from '../../types';

interface AddStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<NewStockItemData, 'tenantId'>) => Promise<void>;
}

const AddStockItemModal: React.FC<AddStockItemModalProps> = ({ isOpen, onClose, onSave }) => {
  const initialState: Omit<NewStockItemData, 'tenantId'> = { name: '', sku: '', quantity: 0, location: '', threshold: 10, lotNumber: '', expiryDate: '' };
  const [itemData, setItemData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItemData(prev => ({ ...prev, [name]: ['quantity', 'threshold'].includes(name) ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemData.name || !itemData.sku || !itemData.location) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(itemData);
      handleClose();
    } catch (err) {
      setError("Falha ao salvar o item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setItemData(initialState);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Item ao Estoque</h2>
          <button onClick={handleClose} disabled={isSaving}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="name">Nome do Item</label><input type="text" name="name" id="name" value={itemData.name} onChange={handleChange} required className="input-style" placeholder="Ex: Memória RAM 16GB DDR4"/></div>
            <div><label htmlFor="sku">SKU / Código</label><input type="text" name="sku" id="sku" value={itemData.sku} onChange={handleChange} required className="input-style" placeholder="Ex: MEM-DDR4-16G-3200"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="lotNumber">Número do Lote</label><input type="text" name="lotNumber" id="lotNumber" value={itemData.lotNumber} onChange={handleChange} className="input-style"/></div>
            <div><label htmlFor="expiryDate">Data de Validade</label><input type="date" name="expiryDate" id="expiryDate" value={itemData.expiryDate} onChange={handleChange} className="input-style"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="quantity">Quantidade Inicial</label><input type="number" name="quantity" id="quantity" value={itemData.quantity} onChange={handleChange} required min="0" className="input-style"/></div>
            <div><label htmlFor="threshold">Limite Mínimo (Alerta)</label><input type="number" name="threshold" id="threshold" value={itemData.threshold} onChange={handleChange} required min="0" className="input-style"/></div>
          </div>
          <div><label htmlFor="location">Localização</label><input type="text" name="location" id="location" value={itemData.location} onChange={handleChange} required className="input-style" placeholder="Ex: Almoxarifado TI, Prateleira B-05"/></div>
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t dark:border-gray-600">
            <button type="button" onClick={handleClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Item'}</button>
          </div>
        </form>
        <style>{`.input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; } .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; } label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; } .btn-primary, .btn-secondary { padding: 0.5rem 1rem; border-radius:0.5rem; font-weight: 500; } .btn-primary { background-color:rgb(var(--color-primary-600)); color:white; } .btn-secondary { background-color:#e5e7eb; color:#1f2937; } .dark .btn-secondary { background-color:#4b5563; color:#e5e7eb; } button:disabled { opacity: 0.5; }`}</style>
      </div>
    </div>
  );
};

export default AddStockItemModal;