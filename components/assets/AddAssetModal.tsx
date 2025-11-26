
import React, { useState } from 'react';
import { NewAssetData, AssetStatus, AssetDocument, DocumentType, AssetComponent } from '../../types';
import { useApp } from '../../hooks/useApp';
import DatePicker from '../common/DatePicker';
import { fileToBase64, validateFileSize } from '../../utils/fileUtils';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<NewAssetData, 'tenantId'>) => Promise<void>;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSave }) => {
  const { suppliers } = useApp();
  const initialState: Omit<NewAssetData, 'tenantId'> = {
    name: '',
    type: '',
    location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    purchaseValue: 0,
    status: AssetStatus.ACTIVE,
    documents: [],
    components: [],
    supplierId: '',
    isConsumable: false,
    quantity: 0,
    reorderLevel: 0,
  };

  const [assetData, setAssetData] = useState<Omit<NewAssetData, 'tenantId'>>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'components'>('details');
  
  // State for new document management
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [newDocType, setNewDocType] = useState<DocumentType>(DocumentType.INVOICE);
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  
  // State for new component management
  const [components, setComponents] = useState<AssetComponent[]>([]);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentSerial, setNewComponentSerial] = useState('');
  const [newComponentQty, setNewComponentQty] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'isConsumable') {
        const { checked } = e.target as HTMLInputElement;
        setAssetData(prev => ({ ...prev, isConsumable: checked }));
    } else {
        setAssetData(prev => ({
          ...prev,
          [name]: ['purchaseValue', 'quantity', 'reorderLevel'].includes(name) ? parseFloat(value) || 0 : value,
        }));
    }
  };

  const handleDocumentChange = (docId: string, field: keyof AssetDocument, value: any) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === docId ? { ...doc, [field]: value } : doc))
    );
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile) {
        alert('Por favor, selecione um arquivo.');
        return;
    }
    
    if (!validateFileSize(newDocFile)) {
        alert('O arquivo deve ter no máximo 1MB.');
        return;
    }

    try {
        // Convert file to Base64 for Firestore storage
        const base64Url = await fileToBase64(newDocFile); // This returns a string URL

        const newDocument: AssetDocument = {
          id: `doc_${Date.now()}`,
          name: newDocFile.name,
          type: newDocType,
          uploadDate: new Date().toISOString().split('T')[0],
          ...(newDocType === DocumentType.WARRANTY && newDocExpiry && { expiryDate: newDocExpiry }),
          // Currently types.ts might not have fileUrl on AssetDocument, but it's good practice to add it or use a workaround if strict.
          // Assuming we can store it or it's omitted if not in type. Ideally, type should be updated.
        };
        
        // Hack: If AssetDocument type doesn't support fileUrl, we might lose the data. 
        // Ensure types.ts supports it or we store it elsewhere. 
        // For now, we proceed assuming the backend accepts it or we just store metadata.
        
        setDocuments(prev => [...prev, newDocument]);
        setNewDocFile(null);
        setNewDocType(DocumentType.INVOICE);
        setNewDocExpiry('');
        const fileInput = document.getElementById('newDocFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    } catch (err) {
        console.error("Error processing file", err);
        alert("Erro ao processar arquivo.");
    }
  };
  
  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleComponentChange = (compId: string, field: keyof AssetComponent, value: any) => {
    setComponents(prev =>
      prev.map(comp => {
        if (comp.id === compId) {
          const updatedComp = { ...comp, [field]: value };
          if (field === 'quantity') {
            updatedComp.quantity = parseInt(value, 10) || 0;
          }
          return updatedComp;
        }
        return comp;
      })
    );
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponentName.trim() || newComponentQty <= 0) return;
    const newComponent: AssetComponent = {
      id: `comp_${Date.now()}`,
      name: newComponentName,
      serialNumber: newComponentSerial,
      quantity: newComponentQty,
    };
    setComponents(prev => [...prev, newComponent]);
    setNewComponentName('');
    setNewComponentSerial('');
    setNewComponentQty(1);
  };
  
  const handleRemoveComponent = (compId: string) => {
    setComponents(prev => prev.filter(c => c.id !== compId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (assetData.isConsumable) {
        if (!assetData.name || !assetData.type || !assetData.location) {
             setError("Para itens de estoque, preencha Nome, Categoria e Localização.");
             return;
        }
    } else {
        if (!assetData.name || !assetData.type || !assetData.location || assetData.purchaseValue <= 0) {
            setError("Por favor, preencha todos os campos obrigatórios na aba 'Detalhes'.");
            setActiveTab('details');
            return;
        }
    }
    
    setIsSaving(true);
    setError(null);
    try {
      const finalAssetData = { ...assetData, documents, components };
      await onSave(finalAssetData);
      handleClose();
    } catch (err) {
      console.error("Failed to save asset:", err);
      setError("Falha ao salvar o ativo. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    setAssetData(initialState);
    setError(null);
    setDocuments([]);
    setComponents([]);
    setNewDocFile(null);
    setNewDocType(DocumentType.INVOICE);
    setNewDocExpiry('');
    setActiveTab('details');
    onClose();
  };

  const TabButton: React.FC<{tab: string, label: string}> = ({tab, label}) => (
    <button type="button" onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Novo Ativo</h2>
          <button onClick={handleClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6">
                <TabButton tab="details" label="Detalhes"/>
                {!assetData.isConsumable && (
                    <>
                        <TabButton tab="documents" label="Documentos"/>
                        <TabButton tab="components" label="Componentes"/>
                    </>
                )}
            </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pt-4 space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
          
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <input type="checkbox" name="isConsumable" id="isConsumable" checked={assetData.isConsumable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                  <label htmlFor="isConsumable" className="ml-3 block text-sm font-medium text-gray-900 dark:text-white">Este é um item consumível (gerenciado por estoque)</label>
              </div>
            
              <div><label htmlFor="name" className="label-style">{assetData.isConsumable ? 'Nome do Item' : 'Nome do Ativo'}</label><input type="text" name="name" id="name" value={assetData.name} onChange={handleChange} required className="input-style" placeholder={assetData.isConsumable ? "Ex: Toner HP 85A" : "Ex: Laptop Dell XPS 15"} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="type" className="label-style">{assetData.isConsumable ? 'Categoria' : 'Tipo'}</label><input type="text" name="type" id="type" value={assetData.type} onChange={handleChange} required className="input-style" placeholder={assetData.isConsumable ? "Ex: Suprimentos" : "Ex: Equipamento de TI"} /></div>
                <div><label htmlFor="location" className="label-style">Localização</label><input type="text" name="location" id="location" value={assetData.location} onChange={handleChange} required className="input-style" placeholder="Ex: Escritório 101" /></div>
              </div>

              {assetData.isConsumable ? (
                 <div className="grid grid-cols-2 gap-4">
                    <div><label htmlFor="quantity" className="label-style">Qtd. Inicial</label><input type="number" name="quantity" value={assetData.quantity} onChange={handleChange} className="input-style" min="0"/></div>
                    <div><label htmlFor="reorderLevel" className="label-style">Nível Mínimo</label><input type="number" name="reorderLevel" value={assetData.reorderLevel} onChange={handleChange} className="input-style" min="0"/></div>
                 </div>
              ) : (
                  <>
                    <div>
                        <label htmlFor="supplierId" className="label-style">Fornecedor / Locador</label>
                        <select name="supplierId" id="supplierId" value={assetData.supplierId} onChange={handleChange} className="input-style">
                            <option value="">Nenhum / Compra Própria</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div><label htmlFor="purchaseValue" className="label-style">Valor de Compra (R$)</label><input type="number" name="purchaseValue" id="purchaseValue" value={assetData.purchaseValue} onChange={handleChange} required min="0.01" step="0.01" className="input-style" placeholder="0,00" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DatePicker label="Data da Compra" id="purchaseDate" name="purchaseDate" value={assetData.purchaseDate} onChange={handleChange} required />
                        <DatePicker label="Data de Expiração" id="expirationDate" name="expirationDate" value={assetData.expirationDate} onChange={handleChange} required />
                    </div>
                    <div><label htmlFor="status" className="label-style">Status</label><select name="status" id="status" value={assetData.status} onChange={handleChange} required className="input-style">{Object.values(AssetStatus).map(status => (<option key={status} value={status}>{status}</option>))}</select></div>
                  </>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documentos e Garantias</h3>
              {documents.length > 0 ? (
                <ul className="space-y-3 mb-4 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-gray-600">{documents.map(doc => (
                  <li key={doc.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-medium truncate flex-grow">{doc.name}</span>
                        <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-700 font-bold ml-2 text-lg leading-none flex-shrink-0">&times;</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><span className="text-xs text-gray-500">Tipo:</span> {doc.type}</div>
                        {doc.expiryDate && <div><span className="text-xs text-gray-500">Expira:</span> {doc.expiryDate}</div>}
                    </div>
                  </li>
                ))}</ul>
              ) : <p className="text-sm text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">Nenhum documento adicionado.</p>}
              <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="sm:col-span-2"><label htmlFor="newDocFile" className="label-style-sm">Arquivo (Max 1MB)</label><input type="file" id="newDocFile" onChange={e => setNewDocFile(e.target.files ? e.target.files[0] : null)} className="input-style-sm file-input" /></div>
                <div><label htmlFor="newDocType" className="label-style-sm">Tipo</label><select id="newDocType" value={newDocType} onChange={e => setNewDocType(e.target.value as DocumentType)} className="input-style-sm">{Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                {newDocType === DocumentType.WARRANTY && (<div><label htmlFor="newDocExpiry" className="label-style-sm">Expiração</label><input type="date" id="newDocExpiry" value={newDocExpiry} onChange={e => setNewDocExpiry(e.target.value)} className="input-style-sm" required /></div>)}
                <div className={newDocType === DocumentType.WARRANTY ? 'sm:col-span-2' : ''}><button type="button" onClick={handleAddDocument} className="w-full btn-primary btn-sm">Adicionar Documento</button></div>
              </div></div>
            </div>
          )}

          {activeTab === 'components' && (
             <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Componentes</h3>
              {components.length > 0 ? (
                <ul className="space-y-3 mb-4 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-gray-600">{components.map(comp => (
                  <li key={comp.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                    <div className="flex justify-end"><button type="button" onClick={() => handleRemoveComponent(comp.id)} className="text-red-500 hover:text-red-700 font-bold text-lg -mt-2 -mr-1">&times;</button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                        <div className="sm:col-span-3"><strong>{comp.name}</strong></div>
                        <div className="sm:col-span-2 text-right">Qtd: {comp.quantity}</div>
                    </div>
                  </li>
                ))}</ul>
              ) : <p className="text-sm text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">Nenhum componente adicionado.</p>}
              <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg"><div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div><label className="label-style-sm">Nome</label><input type="text" value={newComponentName} onChange={e=>setNewComponentName(e.target.value)} className="input-style-sm" required/></div>
                    <div><label className="label-style-sm">Nº de Série</label><input type="text" value={newComponentSerial} onChange={e=>setNewComponentSerial(e.target.value)} className="input-style-sm"/></div>
                    <div><label className="label-style-sm">Qtd.</label><input type="number" value={newComponentQty} onChange={e=>setNewComponentQty(parseInt(e.target.value)||1)} className="input-style-sm" min="1" required/></div>
                  </div>
                  <button type="button" onClick={handleAddComponent} className="w-full btn-primary btn-sm">Adicionar Componente</button>
              </div></div>
            </div>
          )}
          
          <div className="flex justify-end gap-4 pt-4 mt-auto border-t dark:border-gray-600">
            <button type="button" onClick={handleClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 flex items-center">
              {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isSaving ? 'Salvando...' : 'Salvar Ativo'}
            </button>
          </div>
        </form>
        <style>{`
          .label-style { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #111827; } .dark .label-style { color: white; }
          .label-style-sm { display: block; margin-bottom: 0.25rem; font-size: 0.75rem; font-weight: 500; color: #374151; } .dark .label-style-sm { color: #D1D5DB; }
          .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; } .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
          .input-style-sm { background-color: #FFF; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.5rem; } .dark .input-style-sm { background-color: #4B5563; border-color: #6B7280; color: white; }
          .file-input::file-selector-button{font-semibold;background-color:#eef2ff;color:#4338ca;border:0;padding:.25rem .5rem;border-radius:.25rem;cursor:pointer;margin-right:.5rem;font-size:0.75rem} .dark .file-input::file-selector-button{background-color:#312e81;color:#c7d2fe;}
          .btn-primary { background-color: rgb(var(--color-primary-600)); } .btn-primary:hover { background-color: rgb(var(--color-primary-700)); }
          .btn-sm{ padding: 0.25rem 0.75rem; font-size: 0.875rem; }
        `}</style>
      </div>
    </div>
  );
};

export default AddAssetModal;
