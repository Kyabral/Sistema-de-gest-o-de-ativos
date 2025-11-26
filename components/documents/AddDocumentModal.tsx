
import React, { useState } from 'react';
import { NewCompanyDocumentData } from '../../types';
import { fileToBase64, validateFileSize } from '../../utils/fileUtils';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Omit<NewCompanyDocumentData, 'tenantId'>) => Promise<void>;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files ? e.target.files[0] : null;
      if (selectedFile) {
          if (!validateFileSize(selectedFile, 2)) { // 2MB limit
             setError("O arquivo deve ter no máximo 2MB.");
             setFile(null);
             e.target.value = '';
             return;
          }
          setError(null);
          setFile(selectedFile);
          // Auto-fill name if empty
          if (!name) setName(selectedFile.name);
      }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    let fileUrl = '';
    let mimeType = '';
    let fileName = '';

    if (file) {
        try {
            fileUrl = await fileToBase64(file);
            mimeType = file.type;
            fileName = file.name;
        } catch (err) {
            setError("Erro ao processar o arquivo.");
            setIsSaving(false);
            return;
        }
    }

    const docData: Omit<NewCompanyDocumentData, 'tenantId'> = {
      name,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      uploadDate: new Date().toISOString(),
      ...(expiryDate && { expiryDate }),
      ...(file && { fileUrl, mimeType, fileName })
    };
    
    try {
        await onSave(docData);
        handleClose();
    } catch (err) {
        setError("Falha ao salvar documento.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleClose = () => {
      setName('');
      setCategory('');
      setTags('');
      setExpiryDate('');
      setFile(null);
      setError(null);
      onClose();
  }
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 dark:text-white">Adicionar Documento Corporativo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>}
          
          <div>
              <label className="label-style">Arquivo do Documento (Max 2MB)</label>
              <input type="file" onChange={handleFileChange} className="input-style file-input" required />
              <p className="text-xs text-gray-500 mt-1">Contratos, Certidões, Manuais, etc.</p>
          </div>

          <div><label className="label-style">Nome de Exibição</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" placeholder="Ex: Contrato Social"/></div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="label-style">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required className="input-style">
                      <option value="">Selecione...</option>
                      <option value="Contratos">Contratos</option>
                      <option value="Fiscal">Fiscal/Tributário</option>
                      <option value="RH">Recursos Humanos</option>
                      <option value="Técnico">Manuais Técnicos</option>
                      <option value="Legal">Legal/Jurídico</option>
                      <option value="Outros">Outros</option>
                  </select>
              </div>
              <div><label className="label-style">Validade (Opcional)</label><input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="input-style"/></div>
          </div>
          
          <div><label className="label-style">Tags (separadas por vírgula)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="input-style" placeholder="Ex: importante, matriz, 2025"/></div>
          
          <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Enviando...' : 'Salvar Documento'}</button>
          </div>
        </form>
        <style>{`
            .label-style{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500; color: #374151;} .dark .label-style {color: #d1d5db;}
            .input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #D1D5DB;background-color:#F9FAFB; color: #111827;} .dark .input-style {background-color: #374151; border-color: #4b5563; color: white;}
            .file-input::file-selector-button{font-weight:600;background-color:#e0e7ff;color:#4338ca;border:0;padding:0.25rem 0.75rem;border-radius:0.25rem;cursor:pointer;margin-right:0.75rem;font-size:0.875rem;} .dark .file-input::file-selector-button{background-color:#312e81;color:#c7d2fe;}
            .btn-primary{background-color:rgb(var(--color-primary-600));color:white;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;}
            .btn-secondary{background-color:#e5e7eb;color:#374151;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;} .dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}
            button:disabled{opacity:0.6;}
        `}</style>
      </div>
    </div>
  );
};

export default AddDocumentModal;
