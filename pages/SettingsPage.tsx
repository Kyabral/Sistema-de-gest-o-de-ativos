
import React, { useState, useEffect } from 'react';
import { plans } from '../api/plansData';
import { CheckCircleIcon, MapPinIcon } from '../components/common/icons';
import { useBranding } from '../hooks/useBranding';
import { useTheme } from '../hooks/useTheme';
import Toast from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';
import { updateTenantBranding, getTenantBranding } from '../api/usersService';
import { BrandingSettings } from '../types';
import { fileToBase64, validateFileSize } from '../utils/fileUtils';
import { searchCep } from '../api/viaCepService';
import { formatCep } from '../utils/formatters';
import { syncAssetsToERP, pullFinancialsFromERP, ErpSystem } from '../api/erpService';

const SettingsPage: React.FC = () => {
    const { branding, setBranding } = useBranding();
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { users } = useApp();
    
    const [activeTab, setActiveTab] = useState('branding');
    const [localBranding, setLocalBranding] = useState<BrandingSettings>(branding);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; isOpen: boolean }>({ message: '', type: 'success', isOpen: false });
    
    // State for ERP Integration
    const [selectedErp, setSelectedErp] = useState<ErpSystem>('SAP');
    const [isErpSyncing, setIsErpSyncing] = useState(false);
    const [isErpPulling, setIsErpPulling] = useState(false);


    const currentPlanName = 'Profissional'; // Simulation

    // Load initial branding from Server on mount
    useEffect(() => {
        const loadServerSettings = async () => {
            if (user?.tenantId) {
                try {
                    const serverSettings = await getTenantBranding(user.tenantId);
                    if (serverSettings) {
                        const mergedSettings = { 
                            ...branding, 
                            ...serverSettings,
                            address: { ...branding.address, ...(serverSettings.address || {}) },
                            bankInfo: { ...branding.bankInfo, ...(serverSettings.bankInfo || {}) }
                        };
                        setBranding(mergedSettings as BrandingSettings);
                        setLocalBranding(mergedSettings as BrandingSettings);
                    }
                } catch (err) {
                    console.error("Error loading settings", err);
                }
            }
        };
        loadServerSettings();
    }, [user?.tenantId]);

    const handlePlanSelection = (planName: string) => {
        if (planName === currentPlanName) return;
        if (planName === 'Enterprise') {
            window.location.href = 'mailto:vendas@sga-plus.com?subject=Interesse no Plano Enterprise da SGA+';
        } else {
            alert(`Simulando a mudança para o plano "${planName}".`);
        }
    };
    
    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalBranding(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!validateFileSize(file, 1)) { // 1MB limit
                setToast({ message: 'A logo deve ter no máximo 1MB.', type: 'error', isOpen: true });
                return;
            }
            try {
                const base64 = await fileToBase64(file);
                setLocalBranding(prev => ({ ...prev, logoUrl: base64 }));
            } catch (err) {
                console.error(err);
                setToast({ message: 'Erro ao processar imagem.', type: 'error', isOpen: true });
            }
        }
    };

    const handleRemoveLogo = () => {
        setLocalBranding(prev => ({ ...prev, logoUrl: '' }));
    };

    const handleNestedBrandingChange = (section: 'address' | 'bankInfo', field: string, value: string) => {
        let formattedValue = value;
        if (section === 'address' && field === 'zipCode') {
            formattedValue = formatCep(value);
        }

        setLocalBranding(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: formattedValue
            }
        }));
    };

    // ViaCEP Integration
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value;
        const cleanCep = cep.replace(/\\D/g, '');

        if (cleanCep.length === 8) {
            setIsLoadingCep(true);
            try {
                const addressData = await searchCep(cleanCep);
                if (addressData) {
                    setLocalBranding(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: addressData.logradouro,
                            neighborhood: addressData.bairro,
                            city: addressData.localidade,
                            state: addressData.uf,
                            zipCode: cep // Keep formatted
                        }
                    }));
                    setToast({ message: 'Endereço encontrado!', type: 'success', isOpen: true });
                } else {
                    setToast({ message: 'CEP não encontrado.', type: 'error', isOpen: true });
                }
            } catch (error) {
                setToast({ message: 'Erro ao buscar CEP.', type: 'error', isOpen: true });
            } finally {
                setIsLoadingCep(false);
                setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 3000);
            }
        }
    };

    const handleSaveBranding = async () => {
        if (!user?.tenantId) {
            setToast({ message: 'Erro: Usuário não identificado.', type: 'error', isOpen: true });
            return;
        }

        setIsSaving(true);
        try {
            await updateTenantBranding(user.tenantId, localBranding);
            setBranding(localBranding);
            setToast({ message: 'Configurações salvas com sucesso!', type: 'success', isOpen: true });
        } catch (error) {
            console.error(error);
            setToast({ message: 'Erro ao salvar configurações.', type: 'error', isOpen: true });
        } finally {
            setIsSaving(false);
            setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 3000);
        }
    };

    const handleErpSync = async () => {
        setIsErpSyncing(true);
        setToast({ message: `Sincronizando ativos com ${selectedErp}...`, type: 'info', isOpen: true });
        try {
            await syncAssetsToERP(selectedErp);
            setToast({ message: 'Sincronização de ativos concluída com sucesso!', type: 'success', isOpen: true });
        } catch (error) {
            setToast({ message: 'Falha na sincronização com o ERP.', type: 'error', isOpen: true });
        } finally {
            setIsErpSyncing(false);
            setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 4000);
        }
    };

    const handleErpPull = async () => {
        setIsErpPulling(true);
        setToast({ message: `Buscando dados financeiros de ${selectedErp}...`, type: 'info', isOpen: true });
        try {
            const result = await pullFinancialsFromERP(selectedErp);
            setToast({ message: `${result.data.length} registros financeiros foram puxados do ERP.`, type: 'success', isOpen: true });
        } catch (error) {
            setToast({ message: 'Falha ao buscar dados do ERP.', type: 'error', isOpen: true });
        } finally {
            setIsErpPulling(false);
            setTimeout(() => setToast(prev => ({ ...prev, isOpen: false })), 4000);
        }
    };

    const countRoles = (role: string) => users.filter(u => u.role === role).length;

    const TabButton: React.FC<{tabName: string; label: string;}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                activeTab === tabName
                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            ].join(' ')}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabName="branding" label="Dados da Empresa" />
                    <TabButton tabName="plans" label="Planos e Assinatura" />
                    <TabButton tabName="preferences" label="Preferências" />
                    <TabButton tabName="integrations" label="Integrações (ERP)" />
                    <TabButton tabName="access" label="Controle de Acesso" />
                    <TabButton tabName="security" label="Segurança" />
                </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {activeTab === 'branding' && (
                    <div>
                         {/* Branding Content Here */}
                    </div>
                )}
                 {activeTab === 'integrations' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Integração com ERP</h2>
                        <div className="space-y-6 max-w-xl">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Sincronize os dados do SGA+ com seu sistema de gestão empresarial (ERP). Esta é uma funcionalidade Enterprise.
                                    A implementação atual é uma simulação para demonstrar o fluxo de dados.
                                </p>
                                <label htmlFor="erp" className="label-style">Selecione o Sistema ERP</label>
                                <select 
                                  id="erp" 
                                  name="erp"
                                  value={selectedErp}
                                  onChange={(e) => setSelectedErp(e.target.value as ErpSystem)}
                                  className="input-style"
                                >
                                    <option value="SAP">SAP</option>
                                    <option value="Totvs">Totvs</option>
                                    <option value="Oracle">Oracle</option>
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
                                <button onClick={handleErpSync} disabled={isErpSyncing || isErpPulling} className="btn-primary flex items-center justify-center px-4 py-2 w-full sm:w-auto">
                                     {isErpSyncing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                                     Sincronizar Ativos para o ERP
                                </button>
                                <button onClick={handleErpPull} disabled={isErpSyncing || isErpPulling} className="btn-outline flex items-center justify-center px-4 py-2 w-full sm:w-auto">
                                    {isErpPulling && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>}
                                    Puxar Dados Financeiros do ERP
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'plans' && (
                    <div>
                         {/* Plans Content Here */}
                    </div>
                )}
                {activeTab === 'preferences' && (
                    <div>
                         {/* Preferences Content Here */}
                    </div>
                )}
                 {activeTab === 'access' && (
                    <div>
                        {/* Access Control Content Here */}
                    </div>
                )}
                 {activeTab === 'security' && (
                    <div>
                        {/* Security Content Here */}
                    </div>
                 )}
            </div>
             <Toast {...toast} onClose={() => setToast(prev => ({...prev, isOpen: false}))} />
             <style>{`
              .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; border-radius: 0.5rem; transition: all 0.2s; background-color: rgb(var(--color-primary-600)); color: white; }
              .btn-primary:hover { background-color: rgb(var(--color-primary-700)); }
              .btn-primary:disabled { background-color: #9CA3AF; cursor: not-allowed; }
              .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; }
              .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
              .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; border-radius: 0.375rem; transition: all 0.2s; }
              .btn-outline { border: 1px solid #d1d5db; color: #374151; }
              .btn-outline:hover { background-color: #f3f4f6; }
              .btn-outline:disabled { color: #9CA3AF; border-color: #D1D5DB; cursor: not-allowed; }
              .dark .btn-outline { border-color: #4b5563; color: #e5e7eb; }
              .dark .btn-outline:hover { background-color: #374151; }
              .dark .btn-outline:disabled { color: #6B7280; border-color: #4B5563; }
              .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
              .dark .label-style { color: #D1D5DB; }
            `}</style>
        </div>
    );
};

export default SettingsPage;
