
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

    const currentPlanName = 'Profissional'; // Simulation

    // Load initial branding from Server on mount
    useEffect(() => {
        const loadServerSettings = async () => {
            if (user?.tenantId) {
                try {
                    const serverSettings = await getTenantBranding(user.tenantId);
                    if (serverSettings) {
                        // Merge server settings with default/current
                        const mergedSettings = { 
                            ...branding, 
                            ...serverSettings,
                            // Ensure nested objects exist if not present in server data
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
        const cleanCep = cep.replace(/\D/g, '');

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
            // 1. Save to Backend (Firestore)
            await updateTenantBranding(user.tenantId, localBranding);
            
            // 2. Update Global Context (Immediate UI update)
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

    const countRoles = (role: string) => users.filter(u => u.role === role).length;

    const TabButton: React.FC<{tabName: string; label: string;}> = ({ tabName, label }) => (
         <button
            onClick={() => setActiveTab(tabName)}
            className={`${
                activeTab === tabName
                    ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
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
                    <TabButton tabName="access" label="Controle de Acesso" />
                    <TabButton tabName="security" label="Segurança" />
                </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {activeTab === 'branding' && (
                    <div>
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Dados e Personalização</h2>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 border-b pb-2">Identidade Visual & Básicos</h3>
                                
                                {/* Logo Upload Section */}
                                <div className="flex items-start space-x-4 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex-shrink-0">
                                        {localBranding.logoUrl ? (
                                            <img src={localBranding.logoUrl} alt="Logo da Empresa" className="h-20 w-auto object-contain border rounded bg-white" />
                                        ) : (
                                            <div className="h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs text-center">
                                                Sem Logo
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logotipo (para Relatórios e Notas)</label>
                                        <div className="flex space-x-2">
                                            <label className="cursor-pointer bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 shadow-sm transition-colors">
                                                <span>{localBranding.logoUrl ? 'Alterar' : 'Carregar'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            </label>
                                            {localBranding.logoUrl && (
                                                <button 
                                                    onClick={handleRemoveLogo}
                                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Formatos: PNG, JPG. Máx: 1MB.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="label-style">Nome da Empresa</label>
                                    <input type="text" name="companyName" value={localBranding.companyName} onChange={handleBrandingChange} className="input-style w-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-style">Cor Primária</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" name="primaryColor" value={localBranding.primaryColor} onChange={handleBrandingChange} className="h-10 w-14 cursor-pointer rounded border" />
                                            <input type="text" value={localBranding.primaryColor} onChange={handleBrandingChange} name="primaryColor" className="input-style w-full"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-style">CNPJ</label>
                                        <input type="text" name="cnpj" value={localBranding.cnpj || ''} onChange={handleBrandingChange} className="input-style w-full" placeholder="00.000.000/0000-00"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="label-style">Inscrição Estadual</label>
                                        <input type="text" name="stateRegistration" value={localBranding.stateRegistration || ''} onChange={handleBrandingChange} className="input-style w-full"/>
                                     </div>
                                     <div>
                                        <label className="label-style">Inscrição Municipal</label>
                                        <input type="text" name="municipalRegistration" value={localBranding.municipalRegistration || ''} onChange={handleBrandingChange} className="input-style w-full"/>
                                     </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 border-b pb-2">Endereço Corporativo (Integração ViaCEP)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-style">CEP</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={localBranding.address?.zipCode || ''} 
                                                onChange={(e) => handleNestedBrandingChange('address', 'zipCode', e.target.value)} 
                                                onBlur={handleCepBlur}
                                                className="input-style w-full pr-8"
                                                placeholder="00000-000"
                                                maxLength={9}
                                            />
                                            {isLoadingCep && (
                                                <div className="absolute right-2 top-2">
                                                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">Digite o CEP para busca automática.</p>
                                    </div>
                                    <div>
                                        <label className="label-style">Bairro</label>
                                        <input type="text" value={localBranding.address?.neighborhood || ''} onChange={(e) => handleNestedBrandingChange('address', 'neighborhood', e.target.value)} className="input-style w-full bg-gray-50 dark:bg-gray-700" readOnly={!localBranding.address?.neighborhood}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="label-style">Logradouro</label>
                                        <input type="text" value={localBranding.address?.street || ''} onChange={(e) => handleNestedBrandingChange('address', 'street', e.target.value)} className="input-style w-full bg-gray-50 dark:bg-gray-700" readOnly={!localBranding.address?.street}/>
                                    </div>
                                    <div>
                                        <label className="label-style">Número</label>
                                        <input type="text" value={localBranding.address?.number || ''} onChange={(e) => handleNestedBrandingChange('address', 'number', e.target.value)} className="input-style w-full"/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="label-style">Cidade</label>
                                        <input type="text" value={localBranding.address?.city || ''} onChange={(e) => handleNestedBrandingChange('address', 'city', e.target.value)} className="input-style w-full bg-gray-50 dark:bg-gray-700" readOnly={!localBranding.address?.city}/>
                                    </div>
                                    <div>
                                        <label className="label-style">Estado (UF)</label>
                                        <input type="text" value={localBranding.address?.state || ''} onChange={(e) => handleNestedBrandingChange('address', 'state', e.target.value)} className="input-style w-full bg-gray-50 dark:bg-gray-700" maxLength={2} readOnly={!localBranding.address?.state}/>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 border-b pb-2">Dados Bancários (Para Faturas)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div>
                                        <label className="label-style">Banco</label>
                                        <input type="text" value={localBranding.bankInfo?.bankName || ''} onChange={(e) => handleNestedBrandingChange('bankInfo', 'bankName', e.target.value)} className="input-style w-full" placeholder="Ex: Banco Inter"/>
                                    </div>
                                    <div>
                                        <label className="label-style">Agência</label>
                                        <input type="text" value={localBranding.bankInfo?.agency || ''} onChange={(e) => handleNestedBrandingChange('bankInfo', 'agency', e.target.value)} className="input-style w-full"/>
                                    </div>
                                    <div>
                                        <label className="label-style">Conta Corrente</label>
                                        <input type="text" value={localBranding.bankInfo?.accountNumber || ''} onChange={(e) => handleNestedBrandingChange('bankInfo', 'accountNumber', e.target.value)} className="input-style w-full"/>
                                    </div>
                                    <div>
                                        <label className="label-style">Chave PIX</label>
                                        <input type="text" value={localBranding.bankInfo?.pixKey || ''} onChange={(e) => handleNestedBrandingChange('bankInfo', 'pixKey', e.target.value)} className="input-style w-full"/>
                                    </div>
                                </div>
                            </div>
                         </div>

                         <div className="flex justify-end pt-6 mt-6 border-t dark:border-gray-700">
                            <button onClick={handleSaveBranding} disabled={isSaving} className="btn-primary flex items-center px-6 py-3">
                                {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                            </button>
                         </div>
                    </div>
                )}
                {activeTab === 'plans' && (
                    <div>
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Gerencie sua Assinatura</h2>
                        <div className="grid max-w-none grid-cols-1 gap-6 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <div key={plan.name} className={`rounded-2xl p-8 flex flex-col relative ${plan.name === currentPlanName ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border border-gray-200 dark:border-gray-700'}`}>
                                    {plan.name === currentPlanName && ( <div className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">Plano Atual</div> )}
                                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                                    <p className="mt-4">{plan.description}</p>
                                    <div className="mt-6"><span className="text-4xl font-bold">{plan.price}</span>{plan.price.startsWith('R$') && <span className="text-base font-medium">/mês</span>}</div>
                                    <ul role="list" className="mt-8 space-y-3 text-sm flex-grow">{plan.features.map((f) => (<li key={f} className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-primary-600"/>{f}</li>))}</ul>
                                    <button onClick={() => handlePlanSelection(plan.name)} disabled={plan.name === currentPlanName} className={`mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm w-full ${plan.name === currentPlanName ? 'bg-gray-400 text-white cursor-not-allowed' : plan.isPopular ? 'bg-primary-600 text-white hover:bg-primary-500' : 'text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300 dark:text-primary-400 dark:ring-primary-700 dark:hover:ring-primary-600'}`}>{plan.name === currentPlanName ? 'Seu Plano Atual' : (plan.price === 'Sob Consulta' ? 'Fale com Vendas' : 'Mudar para este Plano')}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'preferences' && (
                    <div>
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preferências do Sistema</h2>
                         <div className="space-y-6 max-w-lg">
                            <div>
                                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tema Visual</label>
                                <select 
                                  id="theme" 
                                  name="theme" 
                                  value={theme}
                                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white input-style"
                                >
                                    <option value="light">Claro</option>
                                    <option value="dark">Escuro</option>
                                    <option value="system">Padrão do Sistema</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="depreciation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Método de Depreciação Padrão</label>
                                <select id="depreciation" name="depreciation" className="mt-1 block w-full input-style">
                                    <option>Linear (5 anos)</option>
                                    <option>Soma dos Dígitos dos Anos (SDA)</option>
                                    <option>Saldo Decrescente Duplo</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Este será o método padrão para novos ativos, mas pode ser alterado individualmente.</p>
                            </div>
                         </div>
                    </div>
                )}
                 {activeTab === 'access' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Controle de Acesso (RBAC)</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Visão geral da distribuição de acessos na sua organização. 
                            Para gerenciar convites e permissões individuais, acesse o módulo de <strong>Usuários</strong>.
                        </p>
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Papel</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição & Permissões</th>
                                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuários Ativos</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">Administrador</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        Acesso irrestrito a todos os módulos, configurações de sistema, gestão de usuários e dados financeiros.
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-center bg-gray-50 dark:bg-gray-700/30">
                                        {countRoles('admin')}
                                    </td>
                                </tr>
                                 <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">Gerente</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        Gestão tática: Aprovação de manutenções e compras, visualização de relatórios e gestão de ativos/estoque.
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-center bg-gray-50 dark:bg-gray-700/30">
                                        {countRoles('manager')}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">Usuário</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        Acesso operacional: Consulta de ativos, abertura de chamados, movimentação básica de estoque e visualização de tarefas.
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-center bg-gray-50 dark:bg-gray-700/30">
                                        {countRoles('user')}
                                    </td>
                                </tr>
                              </tbody>
                           </table>
                        </div>
                    </div>
                )}
                 {activeTab === 'security' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Segurança e Privacidade</h2>
                        <div className="space-y-6 max-w-lg">
                            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                <div>
                                    <h4 className="font-medium dark:text-white">Autenticação Multifator (MFA)</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Adicione uma camada extra de segurança à sua conta.</p>
                                </div>
                                <button className="btn-sm btn-primary">Ativar</button>
                            </div>
                            <div>
                               <label htmlFor="backup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Política de Backup</label>
                                <select id="backup" name="backup" className="mt-1 block w-full input-style">
                                    <option>Backup diário automático</option>
                                    <option>Backup semanal automático</option>
                                </select>
                            </div>
                            <div>
                                <h4 className="font-medium dark:text-white">Trilha de Auditoria</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Exporte um registro detalhado de todas as ações realizadas no sistema.</p>
                                <button className="btn-sm btn-outline">Exportar Log de Auditoria</button>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
             <Toast {...toast} onClose={() => setToast(prev => ({...prev, isOpen: false}))} />
             <style>{`
              .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; border-radius: 0.5rem; transition: all 0.2s; background-color: rgb(var(--color-primary-600)); color: white; }
              .btn-primary:hover { background-color: rgb(var(--color-primary-700)); }
              .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; }
              .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
              .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; border-radius: 0.375rem; transition: all 0.2s; }
              .btn-outline { border: 1px solid #d1d5db; color: #374151; }
              .btn-outline:hover { background-color: #f3f4f6; }
              .dark .btn-outline { border-color: #4b5563; color: #e5e7eb; }
              .dark .btn-outline:hover { background-color: #374151; }
              .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
              .dark .label-style { color: #D1D5DB; }
            `}</style>
        </div>
    );
};

export default SettingsPage;
