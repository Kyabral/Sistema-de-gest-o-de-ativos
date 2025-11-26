
import React, { useState, useEffect } from 'react';
import { StockItem } from '../../types';
import { validateFileSize } from '../../utils/fileUtils';

interface AddRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: { name: string, quantity: number }[], justification?: string, attachment?: File | null) => Promise<void>;
  initialItem?: StockItem | null;
}

const AddRequisitionModal: React.FC<AddRequisitionModalProps> = ({ isOpen, onClose, onSave, initialItem }) => {
  const [items, setItems] = useState<{ id: number, name: string, quantity: number }[]>([]);
  const [justification, setJustification] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (initialItem) {
            setItems([{ id: 1, name: initialItem.name, quantity: initialItem.threshold > 0 ? initialItem.threshold : 1 }]);
        } else {
            setItems([{ id: 1, name: '', quantity: 1 }]);
        }
        setJustification('');
        setAttachment(null);
    }
  }, [initialItem, isOpen]);

  const handleItemChange = (id: number, field: 'name' | 'quantity', value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), name: '', quantity: 1 }]);
  const removeItem = (id: number) => {
    if (items.length > 1) {
        setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      if (file && !validateFileSize(file)) {
          alert("O arquivo é muito grande (Máx 1MB).");
          e.target.value = '';
          return;
      }
      setAttachment(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const itemsToSave = items.map(({ name, quantity }) => ({ name, quantity: Number(quantity) })).filter(i => i.name && i.quantity > 0);
    if (itemsToSave.length > 0) {
      await onSave(itemsToSave, justification, attachment);
    }
    setIsSaving(false);
    onClose();
  };
  
  const handleClose = () => {
    setItems([]);
    setJustification('');
    setAttachment(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nova Requisição de Compra</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block mb-1 text-sm font-medium dark:text-gray-200">Itens</label>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                <div className="col-span-8"><input type="text" placeholder="Nome do Item" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} required className="input-style"/></div>
                <div className="col-span-3"><input type="number" placeholder="Qtd." value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} min="1" required className="input-style"/></div>
                <div className="col-span-1"><button type="button" onClick={() => removeItem(item.id)} className="text-red-500 font-bold text-xl disabled:opacity-50" disabled={items.length <= 1}>&times;</button></div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:underline">+ Adicionar outro item</button>
          </div>
          <div>
            <label htmlFor="justification" className="block mb-1 text-sm font-medium dark:text-gray-200">Justificativa (Opcional)</label>
            <textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} rows={2} className="input-style" placeholder="Ex: Estoque baixo, novos projetos, etc."></textarea>
          </div>
           <div>
            <label htmlFor="attachment" className="block mb-1 text-sm font-medium dark:text-gray-200">Anexo (Opcional - Máx 1MB)</label>
            <input type="file" id="attachment" onChange={handleFileChange} className="input-style file-input" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Anexe uma cotação, especificação ou outro documento relevante.</p>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-600">
            <button type="button" onClick={handleClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Enviando...' : 'Enviar Requisição'}</button>
          </div>
        </form>
        <style>{`.input-style{width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid #D1D5DB; background-color:#F9FAFB; color: #111827;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;} .file-input::file-selector-button{font-semibold;background-color:#eef2ff;color:#4338ca;border:0;padding:.25rem .5rem;border-radius:.25rem;cursor:pointer;margin-right:.5rem;font-size:0.75rem}.dark .file-input::file-selector-button{background-color:#312e81;color:#c7d2fe;} .btn-primary{background-color:rgb(var(--color-primary-600));color:white; padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:#e5e7eb;color:#1f2937;padding:0.5rem 1rem;border-radius:0.5rem;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;} button:disabled { opacity: 0.5;}`}</style>
      </div>
    </div>
  );
};

export default AddRequisitionModal;
