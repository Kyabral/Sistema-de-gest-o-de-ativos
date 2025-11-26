import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus, AssetComponent, DocumentType, AssetDocument } from '../types';
import { useApp } from '../../hooks/useApp';
import { formatCurrency, formatDate } from '../../utils/formatters';


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
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'components' | 'maintenance'>('details');

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
      setAssetData({ ...asset, documents: asset.documents || [], components: asset.components || [], maintenanceHistory: asset.maintenanceHistory || [] });
    }
  }, [asset]);

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'N/A';
    return suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssetData(prev => ({ ...prev, [name]: ['purchaseValue', 'quantity', 'reorderLevel'].includes(name) ? parseFloat(value) || 0 : value }));
  };
  
  const handleDocumentChange = (docId: string, field: keyof AssetDocument, value: any) => {
    setAssetData(prev => ({
      ...prev,
      documents: (prev.documents || []).map(doc =>
        doc.id === docId ? { ...doc, [field]: value } : doc
      )
    }));
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

  const handleComponentChange = (compId: string, field: keyof AssetComponent, value: any) => {
    setAssetData(prev => ({
      ...prev,
      components: (prev.components || []).map(comp => {
        if (comp.id === compId) {
          const updatedComp = { ...comp, [field]: value };
          if (field === 'quantity') {
            updatedComp.quantity = parseInt(value, 10) || 0;
          }
          return updatedComp;
        }
        return comp;
      })
    }));
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
    if (assetData.isConsumable) {
        if (!assetData.name || !assetData.type || !assetData.location) {
            setError("Por favor, preencha Nome, Categoria e Localização.");
            return;
        }
    } else {
        if (!assetData.name || !assetData.type || !assetData.location || assetData.purchaseValue <= 0 || !assetData.expirationDate) {
            setError("Por favor, preencha todos os campos obrigatórios na aba 'Detalhes'.");
            setActiveTab('details');
            return;
        }
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3"><h2 className="text-xl font-bold">Editar Ativo: {asset.name}</h2><button onClick={onClose} disabled={isSaving}>&times;</button></div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6">
            <TabButton tab="details" label="Detalhes"/>
            {!assetData.isConsumable && (
              <>
                <TabButton tab="documents" label="Documentos"/>
                <TabButton tab="components" label="Componentes"/>
                <TabButton tab="maintenance" label="Histórico" />
              </>
            )}
          </nav>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pt-4 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

          {activeTab === 'details' && (<div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
                <input type="checkbox" id="isConsumable" checked={!!assetData.isConsumable} readOnly disabled className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-70"/>
                <label htmlFor="isConsumable" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Este é um item consumível (não pode ser alterado)</label>
            </div>
            
            <hr className="dark:border-gray-600"/>
            
            <div><label>{assetData.isConsumable ? 'Nome do Item' : 'Nome do Ativo'}</label><input type="text" name="name" value={assetData.name} onChange={handleChange} required className="input-style"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label>{assetData.isConsumable ? 'Categoria' : 'Tipo'}</label><input type="text" name="type" value={assetData.type} onChange={handleChange} required className="input-style"/></div>
              <div><label>Localização</label><input type="text" name="location" value={assetData.location} onChange={handleChange} required className="input-style"/></div>
            </div>

            {assetData.isConsumable ? (
              <>
                <div><label>SKU</label><input type="text" name="sku" value={assetData.sku || ''} onChange={handleChange} className="input-style"/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label>Quantidade</label><input type="number" name="quantity" value={assetData.quantity || 0} onChange={handleChange} required min="0" className="input-style"/></div>
                    <div><label>Nível de Reabastecimento</label><input type="number" name="reorderLevel" value={assetData.reorderLevel || 0} onChange={handleChange} required min="0" className="input-style"/></div>
                </div>
              </>
            ) : (
              <>
                {renderConditionalFields()}
                <div><label>Valor de Compra (R$)</label><input type="number" name="purchaseValue" value={assetData.purchaseValue} onChange={handleChange} required min="0.01" step="0.01" className="input-style"/></div>
                <div className="grid grid-cols-2 gap-4"><div><label>Data da Compra</label><input type="date" name="purchaseDate" value={assetData.purchaseDate} onChange={handleChange} required className="input-style"/></div><div><label>Data de Expiração</label><input type="date" name="expirationDate" value={assetData.expirationDate} onChange={handleChange} required className="input-style"/></div></div>
                <select name="status" value={assetData.status} onChange={handleChange} required className="input-style">{Object.values(AssetStatus).map(s => (<option key={s} value={s}>{s}</option>))}</select>
              </>
            )}
          </div>)}
          
          {activeTab === 'documents' && !assetData.isConsumable && (<div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos e Garantias</h3>
            {(assetData.documents && assetData.documents.length > 0) ? (<ul className="space-y-3 mb-4 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-gray-600">{assetData.documents.map(doc => (
              <li key={doc.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                <div className="flex justify-between items-start mb-2">
                    <input type="text" value={doc.name} onChange={e => handleDocumentChange(doc.id, 'name', e.target.value)} className="input-style-sm font-medium flex-grow" placeholder="Nome do arquivo"/>
                    <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-700 font-bold ml-2 text-lg leading-none flex-shrink-0">&times;</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div><label className="label-style-sm">Tipo</label><select value={doc.type} onChange={e => handleDocumentChange(doc.id, 'type', e.target.value as DocumentType)} className="input-style-sm">{Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    {doc.type === DocumentType.WARRANTY && (<div><label className="label-style-sm">Expiração</label><input type="date" value={doc.expiryDate || ''} onChange={e => handleDocumentChange(doc.id, 'expiryDate', e.target.value)} className="input-style-sm" required /></div>)}
                </div>
              </li>
            ))}</ul>) : <p className="text-sm text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">Nenhum documento adicionado.</p>}
            <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg"><form onSubmit={handleAddDocument} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="sm:col-span-2"><label className="label-style-sm">Arquivo</label><input type="file" id="editNewDocFile" onChange={e=>setNewDocFile(e.target.files?e.target.files[0]:null)} className="input-style-sm file-input"/></div>
              <div><label className="label-style-sm">Tipo</label><select value={newDocType} onChange={e=>setNewDocType(e.target.value as DocumentType)} className="input-style-sm">{Object.values(DocumentType).map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              {newDocType===DocumentType.WARRANTY&&(<div><label className="label-style-sm">Expiração</label><input type="date" value={newDocExpiry} onChange={e=>setNewDocExpiry(e.target.value)} className="input-style-sm" required/></div>)}
              <div className={newDocType===DocumentType.WARRANTY?'sm:col-span-2':''}><button type="submit" className="w-full btn-primary btn-sm">Adicionar Documento</button></div>
            </form></div>
          </div>)}

          {activeTab === 'components' && !assetData.isConsumable && (<div className="space-y-4">
            <h3 className="text-lg font-semibold">Componentes</h3>
            {(assetData.components && assetData.components.length > 0) ? (<ul className="space-y-3 mb-4 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-gray-600">{assetData.components.map(comp => (
              <li key={comp.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                <div className="flex justify-end"><button type="button" onClick={() => handleRemoveComponent(comp.id)} className="text-red-500 hover:text-red-700 font-bold text-lg -mt-2 -mr-1">&times;</button></div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                    <div className="sm:col-span-3"><label className="label-style-sm">Nome</label><input type="text" value={comp.name} onChange={e => handleComponentChange(comp.id, 'name', e.target.value)} className="input-style-sm" /></div>
                    <div className="sm:col-span-2"><label className="label-style-sm">Qtd.</label><input type="number" value={comp.quantity} onChange={e => handleComponentChange(comp.id, 'quantity', e.target.value)} className="input-style-sm" min="1" /></div>
                    <div className="sm:col-span-5"><label className="label-style-sm">Nº de Série (Opcional)</label><input type="text" value={comp.serialNumber || ''} onChange={e => handleComponentChange(comp.id, 'serialNumber', e.target.value)} className="input-style-sm" /></div>
                </div>
              </li>
            ))}</ul>) : <p className="text-sm text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">Nenhum componente adicionado.</p>}
            <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg"><form onSubmit={handleAddComponent} className="space-y-3">
              <div className="grid grid-cols-3 gap-2 items-end">
                <div><label className="label-style-sm">Nome</label><input type="text" value={newComponentName} onChange={e=>setNewComponentName(e.target.value)} className="input-style-sm" required/></div>
                <div><label className="label-style-sm">Nº de Série</label><input type="text" value={newComponentSerial} onChange={e=>setNewComponentSerial(e.target.value)} className="input-style-sm"/></div>
                <div><label className="label-style-sm">Qtd.</label><input type="number" value={newComponentQty} onChange={e=>setNewComponentQty(parseInt(e.target.value)||1)} className="input-style-sm" min="1" required/></div>
              </div>
              <button type="submit" className="w-full btn-primary btn-sm">Adicionar Componente</button>
            </form></div>
          </div>)}
          
          {activeTab === 'maintenance' && !assetData.isConsumable && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Manutenção</h3>
              {(assetData.maintenanceHistory && assetData.maintenanceHistory.length > 0) ? (
                <div className="overflow-y-auto max-h-96 border rounded-lg dark:border-gray-600">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-4 py-3">Data</th>
                        <th scope="col" className="px-4 py-3">Descrição</th>
                        <th scope="col" className="px-4 py-3">Fornecedor</th>
                        <th scope="col" className="px-4 py-3 text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetData.maintenanceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                        <tr key={record.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap">{formatDate(record.date)}</td>
                          <td className="px-4 py-3">{record.description}</td>
                          <td className="px-4 py-3">{getSupplierName(record.supplierId)}</td>
                          <td className="px-4 py-3 text-right font-mono">{formatCurrency(record.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  Nenhum registro de manutenção para este ativo.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 mt-auto border-t">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
        <style>{`
          .label-style { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #111827; } .dark .label-style { color: white; }
          .label-style-sm { display: block; margin-bottom: 0.25rem; font-size: 0.75rem; font-weight: 500; color: #374151; } .dark .label-style-sm { color: #D1D5DB; }
          .input-style{width:100%;padding:.625rem;border-radius:.5rem;border:1px solid #D1D5DB;}
          .input-style-sm { background-color: #FFF; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.5rem; } .dark .input-style-sm { background-color: #4B5563; border-color: #6B7280; color: white; }
          .file-input::file-selector-button{font-semibold;background-color:#eef2ff;color:#4338ca;border:0;padding:.25rem .5rem;border-radius:.25rem;cursor:pointer;margin-right:.5rem;font-size:0.75rem}.dark .file-input::file-selector-button{background-color:#312e81;color:#c7d2fe;}
          .btn-primary{background-color:rgb(var(--color-primary-600));color:#fff;}.btn-secondary{background-color:#e5e7eb;color:#1f2937;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}button{padding:.5rem 1rem;border-radius:.5rem;font-weight:500;}button:disabled{opacity:.5;}.btn-sm{padding:.25rem .75rem; font-size: 0.875rem;}
        `}</style>
      </div>
    </div>
  );
};

export default EditAssetModal;