import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus, AssetComponent, DocumentType, AssetDocument } from '../../types';
import { useApp } from '../../hooks/useApp';
import DatePicker from '../common/DatePicker';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => Promise<void>;
  asset: Asset;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({ isOpen, onClose, onSave, asset }) => {
  const { suppliers } = useApp();
  const [assetData, setAssetData] = useState<Asset>(asset);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'components'>('details');

  // Document State
  const [newDocType, setNewDocType] = useState<DocumentType>(DocumentType.INVOICE);
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  // Component State
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentSerial, setNewComponentSerial] = useState('');
  const [newComponentQty, setNewComponentQty] = useState(1);
  
  useEffect(() => {
    if (asset) {
      setAssetData({ ...asset, documents: asset.documents || [], components: asset.components || [] });
    }
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssetData(prev => ({ ...prev, [name]: name === 'purchaseValue' ? parseFloat(value) || 0 : value }));
  };
  
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile) return;
    const newDocument: AssetDocument = { id: `doc_${Date.now()}`, name: newDocFile.name, type: newDocType, uploadDate: new Date().toISOString().split('T')[0], ...(newDocType === DocumentType.WARRANTY && newDocExpiry && { expiryDate: newDocExpiry }) };
    setAssetData(prev => ({ ...prev, documents: [...(prev.documents || []), newDocument] }));
    setNewDocFile(null); setNewDocType(DocumentType.INVOICE); setNewDocExpiry('');
    const fileInput = document.getElementById('editNewDocFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleRemoveDocument = (docId: string) => {
    setAssetData(prev => ({ ...prev, documents: prev.documents?.filter(d => d.id !== docId) }));
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponentName.trim() || newComponentQty <= 0) return;
    const newComponent: AssetComponent = { id: `comp_${Date.now()}`, name: newComponentName, serialNumber: newComponentSerial, quantity: newComponentQty };
    setAssetData(prev => ({ ...prev, components: [...(prev.components || []), newComponent] }));
    setNewComponentName(''); setNewComponentSerial(''); setNewComponentQty(1);
  };
  
  const handleRemoveComponent = (compId: string) => {
    setAssetData(prev => ({ ...prev, components: prev.components?.filter(c => c.id !== compId) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetData.name || !assetData.type || !assetData.location || assetData.purchaseValue <= 0 || !assetData.expirationDate) {
        setError("Por favor, preencha todos os campos obrigatórios na aba 'Detalhes'.");
        setActiveTab('details');
        return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(assetData);
      onClose();
    } catch (err) {
      setError("Falha ao atualizar o ativo.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderConditionalFields = () => {
    const type = assetData.type.toLowerCase();
    if (type.includes('ti') || type.includes('eletrônico')) {
      return <div><label>Número de Série</label><input type="text" name="serialNumber" value={assetData.serialNumber || ''} onChange={handleChange} className="input-style" /></div>;
    }
    if (type.includes('veículo')) {
      return <div className="grid grid-cols-2 gap-4"><div><label>Placa</label><input type="text" name="vehiclePlate" value={assetData.vehiclePlate || ''} onChange={handleChange} className="input-style"/></div><div><label>RENAVAM</label><input type="text" name="vehicleRenavam" value={assetData.vehicleRenavam || ''} onChange={handleChange} className="input-style"/></div></div>;
    }
    return null;
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
        <div className="flex justify-between items-center mb-4 border-b pb-3"><h2 className="text-xl font-bold">Editar Ativo</h2><button onClick={onClose} disabled={isSaving}>&times;</button></div>
        <div className="border-b border-gray-200 dark:border-gray-700"><nav className="-mb-px flex space-x-6"><TabButton tab="details" label="Detalhes"/><TabButton tab="documents" label="Documentos"/><TabButton tab="components" label="Componentes"/></nav></div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pt-4 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

          {activeTab === 'details' && (<div className="space-y-4">
            <div><label>Nome</label><input type="text" name="name" value={assetData.name} onChange={handleChange} required className="input-style"/></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Categoria</label><input type="text" name="type" value={assetData.type} onChange={handleChange} required className="input-style"/></div><div><label>Localização</label><input type="text" name="location" value={assetData.location} onChange={handleChange} required className="input-style"/></div></div>
            
            <div>
                <label htmlFor="supplierId">Fornecedor / Locador</label>
                <select name="supplierId" id="supplierId" value={assetData.supplierId || ''} onChange={handleChange} className="input-style">
                    <option value="">Nenhum / Compra Própria</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {renderConditionalFields()}
            <div><label>Valor de Compra (R$)</label><input type="number" name="purchaseValue" value={assetData.purchaseValue} onChange={handleChange} required min="0.01" step="0.01" className="input-style"/></div>
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Data da Compra"
                id="purchaseDate"
                name="purchaseDate"
                value={assetData.purchaseDate}
                onChange={handleChange}
                required
              />
              <DatePicker
                label="Data de Expiração"
                id="expirationDate"
                name="expirationDate"
                value={assetData.expirationDate}
                onChange={handleChange}
                required
              />
            </div>
            <select name="status" value={assetData.status} onChange={handleChange} required className="input-style">{Object.values(AssetStatus).map(s => (<option key={s} value={s}>{s}</option>))}</select>
          </div>)}
          
          {activeTab === 'documents' && (<div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos e Garantias</h3>
            {assetData.documents && assetData.documents.length > 0 ? (<ul className="space-y-2">{assetData.documents.map(d=>(<li key={d.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"><span>{d.name} ({d.type})</span><button type="button" onClick={()=>handleRemoveDocument(d.id)}>&times;</button></li>))}</ul>) : <p className="text-sm text-center">Nenhum documento.</p>}
            <div className="bg-gray-100 p-3 rounded-lg"><form onSubmit={handleAddDocument} className="grid grid-cols-2 gap-3 items-end"><div className="col-span-2"><label className="text-xs">Arquivo</label><input type="file" id="editNewDocFile" onChange={e=>setNewDocFile(e.target.files?e.target.files[0]:null)} className="input-style-sm file-input"/></div><div><label className="text-xs">Tipo</label><select value={newDocType} onChange={e=>setNewDocType(e.target.value as DocumentType)} className="input-style-sm">{Object.values(DocumentType).map(t=><option key={t} value={t}>{t}</option>)}</select></div>{newDocType===DocumentType.WARRANTY&&(
              <DatePicker
                label="Expiração"
                id="editNewDocExpiry"
                value={newDocExpiry}
                onChange={e=>setNewDocExpiry(e.target.value)}
                className="input-style-sm"
                labelClassName="text-xs"
                required
              />
            )}<div className={newDocType===DocumentType.WARRANTY?'col-span-2':''}><button type="submit" className="w-full btn-primary btn-sm">Adicionar Documento</button></div></form></div>
          </div>)}

          {activeTab === 'components' && (<div className="space-y-4">
            <h3 className="text-lg font-semibold">Componentes</h3>
            {assetData.components && assetData.components.length > 0 ? (<ul className="space-y-2">{assetData.components.map(c=>(<li key={c.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"><span>{c.quantity}x {c.name} {c.serialNumber && `(S/N: ${c.serialNumber})`}</span><button type="button" onClick={()=>handleRemoveComponent(c.id)}>&times;</button></li>))}</ul>) : <p className="text-sm text-center">Nenhum componente.</p>}
            <div className="bg-gray-100 p-3 rounded-lg"><form onSubmit={handleAddComponent} className="space-y-3"><div className="grid grid-cols-3 gap-2 items-end"><div><label className="text-xs">Nome</label><input type="text" value={newComponentName} onChange={e=>setNewComponentName(e.target.value)} className="input-style-sm" required/></div><div><label className="text-xs">Nº de Série</label><input type="text" value={newComponentSerial} onChange={e=>setNewComponentSerial(e.target.value)} className="input-style-sm"/></div><div><label className="text-xs">Qtd.</label><input type="number" value={newComponentQty} onChange={e=>setNewComponentQty(parseInt(e.target.value)||1)} className="input-style-sm" min="1" required/></div></div><button type="submit" className="w-full btn-primary btn-sm">Adicionar Componente</button></form></div>
          </div>)}

          <div className="flex justify-end gap-4 pt-4 mt-auto border-t">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
        <style>{`label{display:block;margin-bottom:.5rem;font-size:.875rem;font-weight:500;}.input-style{width:100%;padding:.625rem;border-radius:.5rem;border:1px solid #D1D5DB;}.input-style-sm{width:100%;padding:.5rem;border-radius:.5rem;font-size:.875rem;border:1px solid #D1D5DB;}.file-input::file-selector-button{font-semibold;background-color:#eef2ff;color:#4338ca;border:0;padding:.5rem;border-radius:.25rem;cursor:pointer;margin-right:1rem;}.dark .file-input::file-selector-button{background-color:#312e81;color:#c7d2fe;}.btn-primary{background-color:rgb(var(--color-primary-600));color:#fff;}.btn-secondary{background-color:#e5e7eb;color:#1f2937;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}button{padding:.5rem 1rem;border-radius:.5rem;font-weight:500;}button:disabled{opacity:.5;}.btn-sm{padding:.25rem .75rem;}`}</style>
      </div>
    </div>
  );
};

export default EditAssetModal;