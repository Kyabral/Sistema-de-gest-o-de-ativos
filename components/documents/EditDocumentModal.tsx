import React, { useState, useEffect } from 'react';
import { CompanyDocument, NewCompanyDocumentData } from '../../types';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<NewCompanyDocumentData>) => Promise<void>;
  document: CompanyDocument;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({ isOpen, onClose, onSave, document }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setName(document.name);
      setCategory(document.category);
      setTags(document.tags.join(', '));
      setExpiryDate(document.expiryDate ? document.expiryDate.split('T')[0] : '');
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const docData: Partial<NewCompanyDocumentData> = {
      name,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ...(expiryDate && { expiryDate }),
    };
    await onSave(document.id, docData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Documento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nome</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style"/></div>
          <div><label>Categoria</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} required className="input-style"/></div>
          <div><label>Tags</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="input-style"/></div>
          <div><label>Expiração</label><input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="input-style"/></div>
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

export default EditDocumentModal;
