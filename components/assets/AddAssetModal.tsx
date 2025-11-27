
import React, { useState, useEffect } from 'react';
import { NewAssetData, AssetStatus, AssetDocument, DocumentType, AssetComponent, Supplier } from '../../types';
import * as ds from '../../styles/designSystem';
import { fileToBase64, validateFileSize } from '../../utils/fileUtils';

import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Switch from '../common/Switch';
import DatePicker from '../common/DatePicker';
import { PlusIcon, TrashIcon, PaperClipIcon } from '../common/icons';

type Style = React.CSSProperties;
type Tab = 'details' | 'documents' | 'components';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<NewAssetData, 'tenantId'>) => Promise<void>;
  suppliers: Supplier[];
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSave, suppliers }) => {
  const initialState: Omit<NewAssetData, 'tenantId'> = {
    name: '', type: '', location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: '', purchaseValue: 0,
    status: AssetStatus.ACTIVE, documents: [], components: [],
    supplierId: '', isConsumable: false, quantity: 1, reorderLevel: 0,
  };

  const [assetData, setAssetData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  // Document & Component States
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [newDoc, setNewDoc] = useState<{type: DocumentType, expiryDate: string, file: File | null}>({ type: DocumentType.INVOICE, expiryDate: '', file: null });
  const [components, setComponents] = useState<AssetComponent[]>([]);
  const [newComp, setNewComp] = useState({ name: '', serial: '', qty: 1 });

  useEffect(() => { // Reset state when modal opens/closes
    if (isOpen) {
      setAssetData(initialState);
      setDocuments([]);
      setComponents([]);
      setError(null);
      setActiveTab('details');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssetData(p => ({ ...p, [name]: ['purchaseValue', 'quantity', 'reorderLevel'].includes(name) ? parseFloat(value) || 0 : value }));
  };

  const handleAddDocument = async () => {
    if (!newDoc.file) return alert('Selecione um arquivo.');
    if (!validateFileSize(newDoc.file)) return alert('Arquivo excede 1MB.');

    const newDocument: AssetDocument = {
      id: `doc_${Date.now()}`,
      name: newDoc.file.name,
      type: newDoc.type,
      uploadDate: new Date().toISOString().split('T')[0],
      fileUrl: await fileToBase64(newDoc.file) as string, // Assuming backend handles base64
      ...(newDoc.type === DocumentType.WARRANTY && { expiryDate: newDoc.expiryDate }),
    };
    setDocuments(prev => [...prev, newDocument]);
    setNewDoc({ type: DocumentType.INVOICE, expiryDate: '', file: null });
  };

  const handleAddComponent = () => {
    if (!newComp.name) return;
    setComponents(p => [...p, { id: `comp_${Date.now()}`, name: newComp.name, serialNumber: newComp.serial, quantity: newComp.qty }]);
    setNewComp({ name: '', serial: '', qty: 1 });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!assetData.name || !assetData.type || !assetData.location) {
      return setError('Nome, Tipo/Categoria e Localização são obrigatórios.');
    }
    setIsSaving(true);
    try {
      await onSave({ ...assetData, documents, components });
      onClose();
    } catch (err) {
      setError('Falha ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Styles
  const styles: {[key:string]: Style} = {
      tabContainer: { display: 'flex', borderBottom: `1px solid ${ds.colors.dark.border}`, marginBottom: ds.spacing[5] },
      tabButton: { padding: `${ds.spacing[2]} ${ds.spacing[4]}`, borderBottom: '2px solid transparent', color: ds.colors.dark.text_secondary, cursor: 'pointer', fontSize: ds.typography.fontSizes.sm, fontWeight: ds.typography.fontWeights.medium },
      activeTab: { color: ds.colors.primary.main, borderBottom: `2px solid ${ds.colors.primary.main}` },
      formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: ds.spacing[4] },
      switchContainer: { display: 'flex', alignItems: 'center', gap: ds.spacing[3], backgroundColor: ds.colors.dark.background, padding: ds.spacing[3], borderRadius: ds.borders.radius.md },
      listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: ds.spacing[3], backgroundColor: ds.colors.dark.background, borderRadius: ds.borders.radius.md, border: `1px solid ${ds.colors.dark.border}` },
      formSection: { backgroundColor: ds.colors.dark.background, padding: ds.spacing[4], borderRadius: ds.borders.radius.lg, border: `1px solid ${ds.colors.dark.border}` }
  }

  const TabButton = ({ tab, label }: {tab: Tab, label: string}) => (
    <button type="button" style={{...styles.tabButton, ...(activeTab === tab && styles.activeTab)}} onClick={() => setActiveTab(tab)}>{label}</button>
  )

  const renderDetails = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: ds.spacing[4]}}>
        <div style={styles.switchContainer}>
            <Switch checked={assetData.isConsumable} onChange={c => setAssetData(p => ({ ...p, isConsumable: c, components: [], documents: [] }))} />
            <label style={{color: ds.colors.dark.text_primary, fontWeight: ds.typography.fontWeights.medium}}>Item Consumível / Estoque</label>
        </div>
        <Input label={assetData.isConsumable ? 'Nome do Item' : 'Nome do Ativo'} name="name" value={assetData.name} onChange={handleChange} required />
        <div style={styles.formGrid}>
            <Input label={assetData.isConsumable ? 'Categoria' : 'Tipo'} name="type" value={assetData.type} onChange={handleChange} required />
            <Input label="Localização" name="location" value={assetData.location} onChange={handleChange} required />
        </div>
        {assetData.isConsumable ? (
            <div style={styles.formGrid}>
                <Input type="number" label="Qtd. Inicial" name="quantity" value={assetData.quantity.toString()} onChange={handleChange} />
                <Input type="number" label="Nível Mínimo" name="reorderLevel" value={assetData.reorderLevel.toString()} onChange={handleChange} />
            </div>
        ) : (
            <>
                <Select label="Fornecedor / Locador" name="supplierId" value={assetData.supplierId} onChange={handleChange}>
                    <option value="">Nenhum / Compra Própria</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Input type="number" label="Valor de Compra (R$)" name="purchaseValue" value={assetData.purchaseValue.toString()} onChange={handleChange} required />
                <div style={styles.formGrid}>
                    <DatePicker label="Data da Compra" name="purchaseDate" value={assetData.purchaseDate} onChange={handleChange} required />
                    <DatePicker label="Data de Expiração" name="expirationDate" value={assetData.expirationDate || ''} onChange={handleChange} />
                </div>
                <Select label="Status" name="status" value={assetData.status} onChange={handleChange} required>
                    {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
            </>
        )}
    </div>
  );

  const renderDocuments = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: ds.spacing[4]}}>
        <div style={styles.formSection}>
            <div style={{...styles.formGrid, gridTemplateColumns: '1fr 1fr auto', alignItems: 'flex-end'}}>
                <Select label="Tipo" value={newDoc.type} onChange={e => setNewDoc(p => ({...p, type: e.target.value as DocumentType}))}>
                    {Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                 {newDoc.type === DocumentType.WARRANTY && <DatePicker label="Expiração" value={newDoc.expiryDate} onChange={e => setNewDoc(p => ({...p, expiryDate: e.target.value}))} />}
                 <Input type="file" label="Arquivo (1MB max)" onChange={e => setNewDoc(p => ({...p, file: e.target.files?.[0] || null}))} style={{gridColumn: newDoc.type !== DocumentType.WARRANTY ? 'span 2' : 'auto'}} />
            </div>
            <Button variant="secondary" onClick={handleAddDocument} style={{width: '100%', marginTop: ds.spacing[4]}}>Adicionar Documento</Button>
        </div>
        {documents.map(doc => (
            <div key={doc.id} style={styles.listItem}>
                <div style={{display: 'flex', alignItems: 'center', gap: ds.spacing[3]}}>
                    <PaperClipIcon style={{width: 20, height: 20}} />
                    <div>
                        <p style={{fontWeight: ds.typography.fontWeights.medium}}>{doc.name}</p>
                        <p style={{fontSize: ds.typography.fontSizes.xs, color: ds.colors.dark.text_secondary}}>{doc.type}{doc.expiryDate && ` - Expira em ${doc.expiryDate}`}</p>
                    </div>
                </div>
                <Button variant="ghost" icon={<TrashIcon/>} onClick={() => setDocuments(p => p.filter(d => d.id !== doc.id))} />
            </div>
        ))}
    </div>
  );
  
  const renderComponents = () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: ds.spacing[4]}}>
        <div style={styles.formSection}>
            <div style={{...styles.formGrid, gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'flex-end'}}>
                <Input label="Nome do Componente" value={newComp.name} onChange={e => setNewComp(p => ({...p, name: e.target.value}))} />
                <Input label="Nº de Série" value={newComp.serial} onChange={e => setNewComp(p => ({...p, serial: e.target.value}))} />
                <Input type="number" label="Qtd." value={newComp.qty.toString()} onChange={e => setNewComp(p => ({...p, qty: parseInt(e.target.value) || 1}))} />
            </div>
            <Button variant="secondary" onClick={handleAddComponent} style={{width: '100%', marginTop: ds.spacing[4]}}>Adicionar Componente</Button>
        </div>
        {components.map(comp => (
            <div key={comp.id} style={styles.listItem}>
                <div>
                    <p style={{fontWeight: ds.typography.fontWeights.medium}}>{comp.name}</p>
                    <p style={{fontSize: ds.typography.fontSizes.xs, color: ds.colors.dark.text_secondary}}>{comp.serialNumber ? `Serial: ${comp.serialNumber}` : 'Sem serial'}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <p style={{fontWeight: ds.typography.fontWeights.medium}}>Qtd: {comp.quantity}</p>
                </div>
                 <Button variant="ghost" icon={<TrashIcon/>} onClick={() => setComponents(p => p.filter(c => c.id !== comp.id))} />
            </div>
        ))}
    </div>
  );

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancelar</Button>
      <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? 'Salvando...' : 'Salvar Ativo'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Ativo" footer={modalFooter}>
        <nav style={styles.tabContainer}>
            <TabButton tab="details" label="Detalhes" />
            {!assetData.isConsumable && <TabButton tab="documents" label="Documentos" />}
            {!assetData.isConsumable && <TabButton tab="components" label="Componentes" />}
        </nav>

        {error && <div style={{backgroundColor: ds.colors.error.light, color: ds.colors.error.main, padding: ds.spacing[3], borderRadius: ds.borders.radius.md, marginBottom: ds.spacing[4]}}>{error}</div>}

        {activeTab === 'details' && renderDetails()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'components' && renderComponents()}
    </Modal>
  );
};

export default AddAssetModal;
