
import React, { useState, useEffect } from 'react';
import { NewInvoiceData, InvoiceItem, InvoiceStatus } from '../../types';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: Omit<NewInvoiceData, 'tenantId'>) => Promise<void>;
}

const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [clientName, setClientName] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = (Number(updatedItem.quantity) || 0) * (Number(updatedItem.unitPrice) || 0);
          }
          return updatedItem;
        }
        return item;
      });
    });
  };

  const addItem = () => setItems([...items, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  
  const calculateGrandTotal = () => items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // RULE 1 (2.1.2): Validate Client Data before emission
    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API validation delay
    
    if (clientName.length < 3) {
        setValidationError("Erro de Validação: Nome do cliente inválido ou cadastro incompleto.");
        setIsValidating(false);
        return;
    }
    setIsValidating(false);

    setIsSaving(true);
    const total = calculateGrandTotal();
    
    const invoiceData: Omit<NewInvoiceData, 'tenantId'> = {
      clientName,
      issueDate,
      dueDate,
      items,
      total,
      status: InvoiceStatus.PENDING,
    };
    
    await onSave(invoiceData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Gerar Nova Nota Fiscal</h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
          {validationError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">{validationError}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="dark:text-gray-300">Cliente</label><input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required className="input-style" placeholder="Nome ou Razão Social"/></div>
            <div><label className="dark:text-gray-300">Data de Emissão</label><input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required className="input-style"/></div>
            <div><label className="dark:text-gray-300">Data de Vencimento</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="input-style"/></div>
          </div>
          <hr className="my-4 dark:border-gray-700"/>
          <h3 className="font-semibold dark:text-white">Itens da Nota Fiscal</h3>
          {items.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5"><input type="text" placeholder="Descrição" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} required className="input-style"/></div>
              <div className="col-span-2"><input type="number" placeholder="Qtd." value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} min="1" required className="input-style"/></div>
              <div className="col-span-2"><input type="number" placeholder="Preço Unit." value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} min="0" step="0.01" required className="input-style"/></div>
              <div className="col-span-2 text-right font-medium dark:text-gray-200">R$ {item.total.toFixed(2)}</div>
              <div className="col-span-1"><button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">&times;</button></div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn-secondary btn-sm">Adicionar Item</button>
          <div className="text-right text-xl font-bold mt-4 dark:text-white">Total: R$ {calculateGrandTotal().toFixed(2)}</div>
        </form>
        <div className="flex justify-end gap-4 pt-4 mt-auto border-t dark:border-gray-700">
          <button type="button" onClick={onClose} disabled={isSaving || isValidating} className="btn-secondary">Cancelar</button>
          <button type="submit" onClick={handleSubmit} disabled={isSaving || isValidating} className="btn-primary">
              {isValidating ? 'Validando dados...' : isSaving ? 'Emitindo...' : 'Emitir Cobrança'}
          </button>
        </div>
        <style>{`label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;}.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}button{padding:0.5rem 1rem;border-radius:0.5rem;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#e5e7eb;color:#333;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}.btn-sm{padding:0.25rem 0.75rem;}`}</style>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
