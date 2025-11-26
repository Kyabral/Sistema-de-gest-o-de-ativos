
import React, { useMemo, useState } from 'react';
import { MaintenanceRecord, AssetStatus, ApprovalStatus, Asset } from '../types';
import { useApp } from '../hooks/useApp';
import { formatCurrency, formatDate } from '../utils/formatters';
import ApprovalTimelineModal from '../components/approvals/ApprovalTimelineModal';
import PredictionList from '../components/assets/PredictionList';
import { ClipboardCheckIcon, WrenchScrewdriverIcon, LightBulbIcon } from '../components/common/icons';

interface EnrichedMaintenanceRecord extends MaintenanceRecord {
    assetId: string;
    assetName: string;
    assetStatus: AssetStatus;
    assetType: string;
}

type Tab = 'history' | 'approvals' | 'predictions';

const MaintenancePage: React.FC = () => {
    const { assets, suppliers, failurePredictions, updateMaintenanceRecord } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('history');
    const [filter, setFilter] = useState('all');
    
    // Approval States
    const [selectedApproval, setSelectedApproval] = useState<EnrichedMaintenanceRecord | null>(null);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

    const getSupplierName = (supplierId?: string) => {
        if (!supplierId) return 'N/A';
        return suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
    };

    const allMaintenanceRecords: EnrichedMaintenanceRecord[] = useMemo(() => {
        return assets.flatMap(asset =>
                asset.maintenanceHistory.map(record => ({
                    ...record,
                    assetId: asset.id,
                    assetName: asset.name,
                    assetStatus: asset.status,
                    assetType: asset.type,
                }))
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [assets]);

    const filteredRecords = useMemo(() => {
        if (filter === 'in_repair') return allMaintenanceRecords.filter(rec => rec.assetStatus === AssetStatus.IN_REPAIR);
        return allMaintenanceRecords;
    }, [allMaintenanceRecords, filter]);

    const pendingApprovals = useMemo(() => allMaintenanceRecords.filter(r => r.status === ApprovalStatus.PENDING), [allMaintenanceRecords]);

    const TabButton: React.FC<{tab: Tab, label: string, icon: React.ReactNode, count?: number}> = ({tab, label, icon, count}) => (
        <button onClick={() => setActiveTab(tab)} className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            {icon} <span className="ml-2">{label}</span>
            {count !== undefined && count > 0 && <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
        </button>
    );

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Centro de Manutenção</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie manutenções corretivas, preventivas e aprovações.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex border-b dark:border-gray-700 overflow-x-auto">
                    <TabButton tab="history" label="Histórico Geral" icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} />
                    <TabButton tab="approvals" label="Aprovações Pendentes" icon={<ClipboardCheckIcon className="w-5 h-5"/>} count={pendingApprovals.length} />
                    <TabButton tab="predictions" label="IA Preditiva" icon={<LightBulbIcon className="w-5 h-5"/>} />
                </div>

                <div className="p-6">
                    {activeTab === 'history' && (
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <div className="flex space-x-2">
                                    <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>Todos</button>
                                    <button onClick={() => setFilter('in_repair')} className={`px-3 py-1 text-sm rounded-md ${filter === 'in_repair' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>Em Reparo</button>
                                </div>
                                <p className="text-sm font-bold dark:text-white">Total: {formatCurrency(filteredRecords.reduce((sum, r) => sum + r.cost, 0))}</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Ativo</th><th className="px-6 py-3">Serviço</th><th className="px-6 py-3">Fornecedor</th><th className="px-6 py-3 text-right">Custo</th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.map(r => (
                                            <tr key={r.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">{formatDate(r.date)}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{r.assetName}</td>
                                                <td className="px-6 py-4">{r.description}</td>
                                                <td className="px-6 py-4">{getSupplierName(r.supplierId)}</td>
                                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(r.cost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredRecords.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum registro encontrado.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Ativo</th><th className="px-6 py-3">Descrição</th><th className="px-6 py-3">Aprovador</th><th className="px-6 py-3 text-right">Valor</th><th className="px-6 py-3 text-center">Ação</th></tr>
                                    </thead>
                                    <tbody>
                                        {pendingApprovals.map(r => (
                                            <tr key={r.id} className="border-b dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
                                                <td className="px-6 py-4">{formatDate(r.date)}</td>
                                                <td className="px-6 py-4 font-bold">{r.assetName}</td>
                                                <td className="px-6 py-4">{r.description}</td>
                                                <td className="px-6 py-4">{r.nextApprover}</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(r.cost)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => {setSelectedApproval(r); setIsApprovalModalOpen(true)}} className="text-primary-600 hover:underline font-medium">Revisar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {pendingApprovals.length === 0 && <div className="flex flex-col items-center justify-center py-10"><ClipboardCheckIcon className="w-12 h-12 text-green-500 mb-2"/><p className="text-gray-500">Tudo certo! Nenhuma aprovação pendente.</p></div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'predictions' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 dark:text-white">Análise de Risco (IA)</h3>
                                <p className="text-sm text-gray-500 mb-4">O sistema analisa idade, histórico e frequência de quebras para prever falhas.</p>
                                <PredictionList predictions={failurePredictions} />
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Dica do Especialista</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-200">Ativos com mais de 5 anos e manutenções frequentes devem ser priorizados para substituição no próximo ciclo orçamentário.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isApprovalModalOpen && selectedApproval && (
                <ApprovalTimelineModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => {setIsApprovalModalOpen(false); setSelectedApproval(null)}}
                    record={selectedApproval}
                    onUpdate={updateMaintenanceRecord}
                />
            )}
        </div>
    );
};

export default MaintenancePage;
