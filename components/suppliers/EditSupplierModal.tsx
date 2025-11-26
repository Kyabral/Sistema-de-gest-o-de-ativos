import React, { useState, useEffect } from 'react';
import { Supplier, NewSupplierData } from '../../types';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierId: string, supplierData: Partial<NewSupplierData>) => Promise<void>;
  supplier: Supplier;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({ isOpen, onClose, onSave, supplier }) => {
  const [supplierData, setSupplierData] = useState<Partial<NewSupplierData>>(supplier);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupplierData(supplier);
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplierData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierData.name || !supplierData.category || !supplierData.email || !supplierData.phone) {
      setError("Por favor, preencha os campos obrigatórios.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(supplier.id, supplierData);
      onClose();
    } catch (err) {
      setError("Falha ao atualizar o fornecedor.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-600">
          <h2 className="text-xl font-bold">Editar Fornecedor</h2>
          <button onClick={onClose} disabled={isSaving}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 p-3 rounded text-red-700">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="name">Nome*</label><input type="text" name="name" value={supplierData.name} onChange={handleChange} required className="input-style"/></div>
            <div><label htmlFor="category">Categoria*</label><input type="text" name="category" value={supplierData.category} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div><label htmlFor="contactPerson">Pessoa de Contato</label><input type="text" name="contactPerson" value={supplierData.contactPerson} onChange={handleChange} className="input-style"/></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="email">E-mail*</label><input type="email" name="email" value={supplierData.email} onChange={handleChange} required className="input-style"/></div>
            <div><label htmlFor="phone">Telefone*</label><input type="tel" name="phone" value={supplierData.phone} onChange={handleChange} required className="input-style"/></div>
          </div>
          <div><label htmlFor="address">Endereço</label><input type="text" name="address" value={supplierData.address} onChange={handleChange} className="input-style"/></div>
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t dark:border-gray-600">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
        <style>{`.input-style { width: 100%; padding: 0.625rem; border-radius: 0.5rem; border: 1px solid #D1D5DB; } label { display: block; margin-bottom: 0.5rem; font-weight: 500; } .btn-primary, .btn-secondary { padding: 0.5rem 1rem; border-radius:0.5rem; font-weight: 500; } .btn-primary { background-color:rgb(var(--color-primary-600)); color:white; } .btn-secondary { background-color:#e5e7eb; color:#1f2937; } .dark .btn-secondary { background-color:#4b5563; color:#e5e7eb; } button:disabled { opacity: 0.5; }`}</style>
      </div>
    </div>
  );
};

export default EditSupplierModal;
