import React, { useState } from 'react';
// FIX: Corrected import path for plansData to point to the new 'api' directory.
import { plans } from '../api/plansData';
// FIX: Corrected icon import path to point to the new 'common' subdirectory.
import { CheckCircleIcon } from './common/icons';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('plans');
    const currentPlanName = 'Profissional'; // Simulation of the user's current plan

    const handlePlanSelection = (planName: string) => {
        if (planName === currentPlanName) return;

        if (planName === 'Enterprise') {
            window.location.href = 'mailto:vendas@sga-plus.com?subject=Interesse no Plano Enterprise da SGA+&body=Olá, gostaria de saber mais sobre o plano Enterprise e solicitar uma demonstração.';
        } else {
            alert(`Simulando a mudança para o plano "${planName}". Em um aplicativo real, você seria redirecionado para a página de pagamento.`);
        }
    };

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
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Configurações</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie sua conta, integrações, segurança e preferências do sistema.</p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tabName="plans" label="Planos e Assinatura" />
                    <TabButton tabName="preferences" label="Preferências do Sistema" />
                    <TabButton tabName="access" label="Controle de Acesso" />
                    <TabButton tabName="integrations" label="Integrações" />
                    <TabButton tabName="security" label="Segurança e Privacidade" />
                </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {activeTab === 'plans' && (
                    <div>
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Gerencie sua Assinatura
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Escolha o plano que melhor se adapta às necessidades da sua empresa.
                        </p>
                        <div className="grid max-w-none grid-cols-1 gap-6 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <div key={plan.name} className={`rounded-2xl p-8 flex flex-col relative ${plan.name === currentPlanName ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border border-gray-200 dark:border-gray-700'}`}>
                                    {plan.name === currentPlanName && (
                                        <div className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Plano Atual
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-semibold leading-8 text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">{plan.description}</p>
                                    <div className="mt-6">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{plan.price}</span>
                                        {plan.price.startsWith('R$') && <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mês</span>}
                                    </div>
                                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300 flex-grow">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex gap-x-3">
                                                <CheckCircleIcon className="h-6 w-5 flex-none text-primary-600" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handlePlanSelection(plan.name)}
                                        disabled={plan.name === currentPlanName}
                                        className={`mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full transition-colors duration-200 ${
                                            plan.name === currentPlanName
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : plan.isPopular
                                                    ? 'bg-primary-600 text-white hover:bg-primary-500 focus-visible:outline-primary-600'
                                                    : 'text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300 dark:text-primary-400 dark:ring-primary-700 dark:hover:ring-primary-600'
                                        }`}>
                                        {plan.name === currentPlanName ? 'Seu Plano Atual' : (plan.price === 'Sob Consulta' ? 'Fale com Vendas' : 'Mudar para este Plano')}
                                    </button>
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
                                <select id="theme" name="theme" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option>Claro</option>
                                    <option>Escuro</option>
                                    <option>Padrão do Sistema</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="depreciation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Método de Depreciação Padrão</label>
                                <select id="depreciation" name="depreciation" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option>Linear (5 anos)</option>
                                    <option>Soma dos Dígitos dos Anos (SDA)</option>
                                    <option>Saldo Decrescente Duplo</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Este será o método padrão para novos ativos, mas pode ser alterado individualmente.</p>
                            </div>
                             <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                                <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Salvar Preferências</button>
                             </div>
                         </div>
                    </div>
                )}
                 {activeTab === 'access' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Controle de Acesso (RBAC)</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Gerencie papéis e permissões para garantir que cada usuário tenha o acesso apropriado. (Funcionalidade de demonstração)</p>
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Papel</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuários</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Administrador</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Acesso total a todas as funcionalidades e configurações.</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">2</td>
                                </tr>
                                 <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Gerente Financeiro</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Visualiza relatórios financeiros, custos e depreciação.</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">5</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Técnico de Manutenção</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Pode adicionar e atualizar registros de manutenção.</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">12</td>
                                </tr>
                              </tbody>
                           </table>
                        </div>
                    </div>
                )}
                {activeTab === 'integrations' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Integrações ERP e API</h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sistemas ERP</h3>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="border rounded-lg p-4 flex items-center justify-between dark:border-gray-700"><span>SAP</span><button className="btn-sm btn-outline">Conectar</button></div>
                                    <div className="border rounded-lg p-4 flex items-center justify-between dark:border-gray-700"><span>TOTVS Protheus</span><button className="btn-sm btn-outline">Conectar</button></div>
                                    <div className="border rounded-lg p-4 flex items-center justify-between dark:border-gray-700"><span>Oracle NetSuite</span><span className="text-green-600 text-sm font-medium">Conectado</span></div>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Acesso via API</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Use a API do SGA+ para criar integrações customizadas.</p>
                                 <div className="mt-4">
                                     <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sua Chave de API</label>
                                     <input type="text" id="api-key" readOnly value="********************_DEMO_****************" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm" />
                                 </div>
                            </div>
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
                                <select id="backup" name="backup" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
             <style>{`
              .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; border-radius: 0.375rem; transition: all 0.2s; }
              .btn-primary { background-color: #4f46e5; color: white; }
              .btn-primary:hover { background-color: #4338ca; }
              .btn-outline { border: 1px solid #d1d5db; color: #374151; }
              .btn-outline:hover { background-color: #f3f4f6; }
              .dark .btn-outline { border-color: #4b5563; color: #e5e7eb; }
              .dark .btn-outline:hover { background-color: #374151; }
            `}</style>
        </div>
    );
};

export default Settings;
