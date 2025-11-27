
import React, { useState, useEffect, useCallback } from 'react';
import * as ds from '../styles/designSystem';
import { BrandingSettings, ErpSystem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { updateTenantBranding, getTenantBranding } from '../api/usersService';
import { searchCep } from '../api/viaCepService';
import { syncAssetsToERP, pullFinancialsFromERP } from '../api/erpService';
import { fileToBase64, validateFileSize } from '../utils/fileUtils';
import { formatCep } from '../utils/formatters';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Toast from '../components/common/Toast';
import { CheckCircleIcon, PhotoIcon, XCircleIcon, ArrowPathIcon } from '../components/common/icons';

type Style = React.CSSProperties;
type Tab = 'branding' | 'plans' | 'preferences' | 'integrations' | 'access' | 'security';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { branding, setBranding } = useBranding();
    
    const [activeTab, setActiveTab] = useState<Tab>('branding');
    const [localBranding, setLocalBranding] = useState<BrandingSettings>(branding);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', isOpen: false });

    // ERP State
    const [selectedErp, setSelectedErp] = useState<ErpSystem>('SAP');
    const [isErpSyncing, setIsErpSyncing] = useState(false);
    const [isErpPulling, setIsErpPulling] = useState(false);

    const loadServerSettings = useCallback(async () => {
        if (user?.tenantId) {
            try {
                const serverSettings = await getTenantBranding(user.tenantId);
                if (serverSettings) {
                    const mergedSettings = { ...branding, ...serverSettings };
                    setBranding(mergedSettings);
                    setLocalBranding(mergedSettings);
                }
            } catch (err) {
                showToast('Erro ao carregar configurações do servidor.', 'error');
            }
        }
    }, [user?.tenantId, setBranding]);

    useEffect(() => {
        loadServerSettings();
    }, [loadServerSettings]);
    
    useEffect(() => {
        setLocalBranding(branding);
    }, [branding]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, isOpen: true });
        setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 4000);
    };

    const handleFieldChange = (section: keyof BrandingSettings, field: string, value: string) => {
        setLocalBranding(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value,
            },
        }));
    };
    
    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalBranding(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!validateFileSize(file, 1)) {
                showToast('O arquivo de logo não pode exceder 1MB.', 'error');
                return;
            }
            const base64 = await fileToBase64(file);
            setLocalBranding(prev => ({ ...prev, logoUrl: base64 as string }));
        }
    };
    
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setIsLoadingCep(true);
        try {
            const data = await searchCep(cep);
            if (data) {
                setLocalBranding(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }
                }));
                showToast('Endereço preenchido automaticamente!', 'success');
            }
        } catch {
            showToast('CEP não encontrado.', 'error');
        } finally {
            setIsLoadingCep(false);
        }
    };

    const handleSave = async () => {
        if (!user?.tenantId) return;
        setIsSaving(true);
        try {
            await updateTenantBranding(user.tenantId, localBranding);
            setBranding(localBranding);
            showToast('Configurações salvas com sucesso!', 'success');
        } catch {
            showToast('Falha ao salvar as configurações.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Styles
    const styles: { [key: string]: Style } = {
        page: { padding: `${ds.spacing[4]} ${ds.spacing[8]}`, display: 'flex', flexDirection: 'column', gap: ds.spacing[6] },
        tabsNav: { borderBottom: `1px solid ${ds.colors.dark.border}`, marginBottom: -1 },
        tabsContainer: { display: 'flex', gap: ds.spacing[6], overflowX: 'auto' },
        tabButton: {
            padding: `${ds.spacing[3]} ${ds.spacing[1]}`,
            fontSize: ds.typography.fontSizes.sm,
            fontWeight: ds.typography.fontWeights.medium,
            borderBottom: '2px solid transparent',
            color: ds.colors.dark.text_secondary,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },
        activeTab: {
            color: ds.colors.primary.main,
            borderBottom: `2px solid ${ds.colors.primary.main}`,
        },
        sectionTitle: { fontSize: ds.typography.fontSizes.lg, fontWeight: ds.typography.fontWeights.semibold, color: ds.colors.dark.text_primary, borderBottom: `1px solid ${ds.colors.dark.border}`, paddingBottom: ds.spacing[3], marginBottom: ds.spacing[5] },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: ds.spacing[5] },
        formGroup: { display: 'flex', flexDirection: 'column', gap: ds.spacing[2] },
        label: { fontSize: ds.typography.fontSizes.sm, fontWeight: ds.typography.fontWeights.medium, color: ds.colors.dark.text_secondary },
        logoDropzone: { border: `2px dashed ${ds.colors.dark.border}`, borderRadius: ds.borders.radius.md, padding: ds.spacing[6], textAlign: 'center', cursor: 'pointer' },
        logoPreview: { maxWidth: '200px', maxHeight: '60px', margin: 'auto', marginBottom: ds.spacing[3] },
        colorPickerContainer: { position: 'relative', width: '100%' },
        colorPickerInput: { ...ds.componentStyles.input, backgroundColor: ds.colors.dark.background, color: ds.colors.dark.text_primary, border: `1px solid ${ds.colors.dark.border}`, width: '100%' },
        colorSwatch: { position: 'absolute', right: ds.spacing[2], top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', border: `2px solid ${ds.colors.dark.border}`},
        footer: { paddingTop: ds.spacing[6], marginTop: ds.spacing[6], borderTop: `1px solid ${ds.colors.dark.border}`, display: 'flex', justifyContent: 'flex-end', gap: ds.spacing[3] },
    };

    const TabButton: React.FC<{tab: Tab; label: string}> = ({ tab, label }) => (
        <button style={{...styles.tabButton, ...(activeTab === tab ? styles.activeTab : {})}} onClick={() => setActiveTab(tab)}>
            {label}
        </button>
    );

    const renderBrandingTab = () => (
        <form onSubmit={(e) => e.preventDefault()}>
            <h2 style={styles.sectionTitle}>Identidade Visual e Dados da Empresa</h2>
            
            <div style={{ ...styles.grid, gridTemplateColumns: '2fr 1fr', alignItems: 'flex-start' }}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Logotipo</label>
                    <div style={styles.logoDropzone} onClick={() => document.getElementById('logo-upload')?.click()}>
                        <input type="file" id="logo-upload" hidden accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
                        {localBranding.logoUrl ? (
                            <>
                                <img src={localBranding.logoUrl} alt="Logo Preview" style={styles.logoPreview} />
                                <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setLocalBranding(p => ({...p, logoUrl: ''}))}}>Remover Logo</Button>
                            </>
                        ) : (
                            <>
                               <PhotoIcon style={{ width: 48, height: 48, color: ds.colors.dark.text_secondary, margin: 'auto', marginBottom: ds.spacing[2]}} />
                                <p style={styles.label}>Arraste ou clique para enviar</p>
                                <p style={{fontSize: ds.typography.fontSizes.xs, color: ds.colors.dark.text_disabled}}>PNG, JPG, SVG (Máx 1MB)</p>
                            </>
                        )}
                    </div>
                </div>
                <div style={styles.formGroup}>
                     <label htmlFor="primaryColor" style={styles.label}>Cor Primária</label>
                    <div style={styles.colorPickerContainer}>
                        <Input id="primaryColor" name="primaryColor" value={localBranding.primaryColor} onChange={handleSimpleChange} style={{paddingLeft: ds.spacing[10]}}/>
                         <input type="color" value={localBranding.primaryColor} onChange={handleSimpleChange} name="primaryColor" style={{...styles.colorSwatch, padding: 0, appearance: 'none', backgroundColor: 'transparent', width: 28, height: 28, cursor: 'pointer'}} />
                    </div>
                </div>
            </div>

            <div style={{height: ds.spacing[6]}}></div>

            <div style={styles.grid}>
                 <div style={styles.formGroup}><label htmlFor="companyName" style={styles.label}>Nome da Empresa</label><Input id="companyName" name="companyName" value={localBranding.companyName} onChange={handleSimpleChange}/></div>
                 <div style={styles.formGroup}><label htmlFor="slogan" style={styles.label}>Slogan</label><Input id="slogan" name="slogan" value={localBranding.slogan || ''} onChange={handleSimpleChange}/></div>
                 <div style={styles.formGroup}><label htmlFor="cnpj" style={styles.label}>CNPJ</label><Input id="cnpj" name="cnpj" value={localBranding.cnpj || ''} onChange={handleSimpleChange}/></div>
                 <div style={styles.formGroup}><label htmlFor="stateRegistration" style={styles.label}>Inscrição Estadual</label><Input id="stateRegistration" name="stateRegistration" value={localBranding.stateRegistration || ''} onChange={handleSimpleChange}/></div>
            </div>

            <h3 style={{...styles.sectionTitle, fontSize: ds.typography.fontSizes.base, marginTop: ds.spacing[6] }}>Endereço</h3>
            <div style={styles.grid}>
                <div style={styles.formGroup}>
                    <label htmlFor="zipCode" style={styles.label}>CEP</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: ds.spacing[2]}}>
                        <Input id="zipCode" name="zipCode" value={formatCep(localBranding.address.zipCode)} onChange={(e) => handleFieldChange('address', 'zipCode', e.target.value)} onBlur={handleCepBlur}/>
                        {isLoadingCep && <ArrowPathIcon className="animate-spin" style={{width: 20, height: 20}} />}
                    </div>
                </div>
                <div style={styles.formGroup}><label htmlFor="street" style={styles.label}>Logradouro</label><Input id="street" name="street" value={localBranding.address.street} onChange={(e) => handleFieldChange('address', 'street', e.target.value)}/></div>
                <div style={styles.formGroup}><label htmlFor="number" style={styles.label}>Número</label><Input id="number" name="number" value={localBranding.address.number} onChange={(e) => handleFieldChange('address', 'number', e.target.value)}/></div>
                <div style={styles.formGroup}><label htmlFor="neighborhood" style={styles.label}>Bairro</label><Input id="neighborhood" name="neighborhood" value={localBranding.address.neighborhood} onChange={(e) => handleFieldChange('address', 'neighborhood', e.target.value)}/></div>
                <div style={styles.formGroup}><label htmlFor="city" style={styles.label}>Cidade</label><Input id="city" name="city" value={localBranding.address.city} onChange={(e) => handleFieldChange('address', 'city', e.target.value)}/></div>
                <div style={styles.formGroup}><label htmlFor="state" style={styles.label}>Estado</label><Input id="state" name="state" value={localBranding.address.state} onChange={(e) => handleFieldChange('address', 'state', e.target.value)}/></div>
            </div>

            <h3 style={{...styles.sectionTitle, fontSize: ds.typography.fontSizes.base, marginTop: ds.spacing[6] }}>Dados Bancários</h3>
            <div style={styles.grid}>
                 <div style={styles.formGroup}><label htmlFor="bankName" style={styles.label}>Banco</label><Input id="bankName" name="bankName" value={localBranding.bankInfo.bankName} onChange={(e) => handleFieldChange('bankInfo', 'bankName', e.target.value)}/></div>
                 <div style={styles.formGroup}><label htmlFor="agency" style={styles.label}>Agência</label><Input id="agency" name="agency" value={localBranding.bankInfo.agency} onChange={(e) => handleFieldChange('bankInfo', 'agency', e.target.value)}/></div>
                 <div style={styles.formGroup}><label htmlFor="accountNumber" style={styles.label}>Conta</label><Input id="accountNumber" name="accountNumber" value={localBranding.bankInfo.accountNumber} onChange={(e) => handleFieldChange('bankInfo', 'accountNumber', e.target.value)}/></div>
                 <div style={styles.formGroup}><label htmlFor="pixKey" style={styles.label}>Chave PIX</label><Input id="pixKey" name="pixKey" value={localBranding.bankInfo.pixKey} onChange={(e) => handleFieldChange('bankInfo', 'pixKey', e.target.value)}/></div>
            </div>

            <footer style={styles.footer}>
                <Button variant="secondary" onClick={loadServerSettings} disabled={isSaving}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </footer>
        </form>
    );

    // Dummy placeholders for other tabs
    const renderComingSoon = (tabName: string) => <div style={{textAlign: 'center', padding: ds.spacing[10]}}><h2 style={styles.sectionTitle}>Em Breve</h2><p style={{color: ds.colors.dark.text_secondary}}>A seção de {tabName} está sendo preparada e será lançada em breve.</p></div>;

    return (
        <div style={styles.page}>
            <header style={styles.tabsNav}>
                <nav style={styles.tabsContainer} aria-label="Tabs">
                    <TabButton tab="branding" label="Dados da Empresa" />
                    <TabButton tab="plans" label="Planos e Assinatura" />
                    <TabButton tab="preferences" label="Preferências" />
                    <TabButton tab="integrations" label="Integrações (ERP)" />
                    <TabButton tab="access" label="Controle de Acesso" />
                    <TabButton tab="security" label="Segurança" />
                </nav>
            </header>

            <Card style={{padding: ds.spacing[6]}}>
                {activeTab === 'branding' && renderBrandingTab()}
                {activeTab === 'plans' && renderComingSoon('Planos e Assinatura')}
                {activeTab === 'preferences' && renderComingSoon('Preferências')}
                {activeTab === 'integrations' && renderComingSoon('Integrações (ERP)')}
                {activeTab === 'access' && renderComingSoon('Controle de Acesso')}
                {activeTab === 'security' && renderComingSoon('Segurança')}
            </Card>

            <Toast 
                message={toast.message} 
                type={toast.type} 
                isOpen={toast.isOpen} 
                onClose={() => setToast(p => ({...p, isOpen: false}))} 
            />
        </div>
    );
};

export default SettingsPage;
