import React, { useState, useEffect } from 'react';
import { StockItem, NewStockItemData } from '../../types';

interface EditStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, itemData: Partial<NewStockItemData>) => Promise<void>;
  item: StockItem;
}

const EditStockItemModal: React.FC<EditStockItemModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [itemData, setItemData] = useState<Partial<NewStockItemData>>(item);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItemData({
        ...item,
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    });
  }, [item]);

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
      await onSave(item.id, itemData);
      onClose();
    } catch (err) {
      setError("Falha ao atualizar o item.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Item do Estoque</h2>
          <button onClick={onClose} disabled={isSaving}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="name">Nome do Item</label><input type="text" name="name" id="name" value={itemData.name} onChange={handleChange} required className="input-style"/></div>
            <div><label htmlFor="sku">SKU / Código</label><input type="text" name="sku" id="sku" value={itemData.sku} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="lotNumber">Número do Lote</label><input type="text" name="lotNumber" id="lotNumber" value={itemData.lotNumber || ''} onChange={handleChange} className="input-style"/></div>
            <div><label htmlFor="expiryDate">Data de Validade</label><input type="date" name="expiryDate" id="expiryDate" value={itemData.expiryDate || ''} onChange={handleChange} className="input-style"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="quantity">Quantidade</label><input type="number" name="quantity" id="quantity" value={itemData.quantity} onChange={handleChange} required min="0" className="input-style"/></div>
            <div><label htmlFor="threshold">Limite Mínimo (Alerta)</label><input type="number" name="threshold" id="threshold" value={itemData.threshold} onChange={handleChange} required min="0" className="input-style"/></div>
          </div>
          <div><label htmlFor="location">Localização</label><input type="text" name="location" id="location" value={itemData.location} onChange={handleChange} required className="input-style"/></div>
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t dark:border-gray-600">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
        <style>{`.input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; } .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; } label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; } .btn-primary, .btn-secondary { padding: 0.5rem 1rem; border-radius:0.5rem; font-weight: 500; } .btn-primary { background-color:rgb(var(--color-primary-600)); color:white; } .btn-secondary { background-color:#e5e7eb; color:#1f2937; } .dark .btn-secondary { background-color:#4b5563; color:#e5e7eb; } button:disabled { opacity: 0.5; }`}</style>
      </div>
    </div>
  );
};

export default EditStockItemModal;