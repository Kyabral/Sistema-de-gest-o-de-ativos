import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
// FIX: Corrected import path for types.
import { MaintenanceRecord, Asset, ApprovalStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import ApprovalTimelineModal from '../components/approvals/ApprovalTimelineModal';

interface EnrichedMaintenanceRecord extends MaintenanceRecord {
    assetId: string;
    assetName: string;
    assetType: string;
}

const ApprovalWorkflowPage: React.FC = () => {
    const { assets, updateMaintenanceRecord } = useApp();
    const [selectedRecord, setSelectedRecord] = useState<EnrichedMaintenanceRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pendingApprovals = useMemo((): EnrichedMaintenanceRecord[] => {
        return assets
            .flatMap((asset: Asset) =>
                asset.maintenanceHistory.map((record: MaintenanceRecord) => ({
                    ...record,
                    assetId: asset.id,
                    assetName: asset.name,
                    assetType: asset.type,
                }))
            )
            .filter(record => record.status === ApprovalStatus.PENDING)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [assets]);

    const handleViewDetails = (record: EnrichedMaintenanceRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block text-white";
        const statusMap: Record<ApprovalStatus, string> = {
            [ApprovalStatus.PENDING]: "bg-yellow-500",
            [ApprovalStatus.APPROVED]: "bg-green-500",
            [ApprovalStatus.REJECTED]: "bg-red-500",
            [ApprovalStatus.AUTO_APPROVED]: "bg-blue-500",
        };
        return `${baseClasses} ${statusMap[status]}`;
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fluxo de Aprovação de Manutenção</h1>
                <p className="text-gray-500 dark:text-gray-400">Revise e aprove as solicitações de manutenção pendentes.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Solicitações Pendentes de Aprovação ({pendingApprovals.length})
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data da Solicitação</th>
                                <th scope="col" className="px-6 py-3">Ativo</th>
                                <th scope="col" className="px-6 py-3">Descrição</th>
                                <th scope="col" className="px-6 py-3">Próximo Aprovador</th>
                                <th scope="col" className="px-6 py-3 text-right">Custo</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingApprovals.map(record => (
                                <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">{formatDate(record.date)}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {record.assetName}
                                    </th>
                                    <td className="px-6 py-4 max-w-xs truncate">{record.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{record.nextApprover}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">{formatCurrency(record.cost)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleViewDetails(record)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">
                                            Revisar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {pendingApprovals.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            Nenhuma solicitação de manutenção pendente.
                        </div>
                     )}
                </div>
            </div>
            
            {isModalOpen && selectedRecord && (
                <ApprovalTimelineModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    record={selectedRecord}
                    onUpdate={updateMaintenanceRecord}
                />
            )}
        </div>
    );
};

export default ApprovalWorkflowPage;
