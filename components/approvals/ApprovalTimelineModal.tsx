import React, { useState } from 'react';
// FIX: Corrected import path for types.
import { MaintenanceRecord, ApprovalStatus, ApprovalEvent, Asset } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useApp';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '../common/icons';

interface ApprovalTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecord & { assetId: string, assetName: string, assetType: string };
  onUpdate: (assetId: string, record: MaintenanceRecord) => Promise<void>;
}

const ApprovalTimelineModal: React.FC<ApprovalTimelineModalProps> = ({ isOpen, onClose, record, onUpdate }) => {
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();
    const { assets } = useApp();
    const currentUserRole = 'Gerente'; // Simulação do papel do usuário logado

    if (!isOpen) return null;
    
    const canTakeAction = record.status === ApprovalStatus.PENDING && record.nextApprover === currentUserRole;

    const handleAction = async (newStatus: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED) => {
        setIsSaving(true);
        const asset = assets.find(a => a.id === record.assetId);
        if (!asset) return;

        const newEvent: ApprovalEvent = {
            actor: currentUserRole,
            status: newStatus,
            comment,
            date: new Date().toISOString(),
        };

        const updatedHistory = [...record.approvalHistory, newEvent];
        let nextApprover: 'Gerente' | 'Diretor' | undefined = undefined;
        // FIX: Explicitly type 'finalStatus' to allow assignment of ApprovalStatus.PENDING.
        let finalStatus: ApprovalStatus = newStatus;

        // Lógica de múltiplos níveis
        if (newStatus === ApprovalStatus.APPROVED && record.nextApprover === 'Gerente' && record.cost > 5000) {
            finalStatus = ApprovalStatus.PENDING;
            nextApprover = 'Diretor';
        }

        const updatedRecord: MaintenanceRecord = {
            ...record,
            status: finalStatus,
            nextApprover: nextApprover,
            approvalHistory: updatedHistory,
        };
        
        try {
            await onUpdate(record.assetId, updatedRecord);
            onClose();
        } catch (error) {
            console.error("Failed to update maintenance record:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const getTimelineIcon = (status: ApprovalStatus) => {
        switch(status) {
            case ApprovalStatus.APPROVED:
            case ApprovalStatus.AUTO_APPROVED:
                return <div className="bg-green-500 rounded-full h-8 w-8 flex items-center justify-center ring-8 ring-white dark:ring-gray-800"><CheckCircleIcon className="h-5 w-5 text-white" /></div>;
            case ApprovalStatus.REJECTED:
                return <div className="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center ring-8 ring-white dark:ring-gray-800"><XCircleIcon className="h-5 w-5 text-white" /></div>;
            case ApprovalStatus.PENDING:
            default:
                return <div className="bg-yellow-500 rounded-full h-8 w-8 flex items-center justify-center ring-8 ring-white dark:ring-gray-800"><ClockIcon className="h-5 w-5 text-white" /></div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-600">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalhes da Solicitação</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ativo: {record.assetName}</p>
                    </div>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Timeline */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Linha do Tempo</h3>
                        <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
                            {record.approvalHistory.map((event, index) => (
                                <li key={index} className="mb-10 ml-8">
                                    <span className="absolute -left-4 flex items-center justify-center">
                                        {getTimelineIcon(event.status)}
                                    </span>
                                    <h4 className="flex items-center mb-1 text-md font-semibold text-gray-900 dark:text-white">
                                        {event.actor}
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-3">{event.status}</span>
                                    </h4>
                                    <time className="block mb-2 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{new Date(event.date).toLocaleString('pt-BR')}</time>
                                    {event.comment && <p className="text-sm font-normal text-gray-500 dark:text-gray-400 italic">"{event.comment}"</p>}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Action Panel */}
                    <div>
                         <h3 className="text-lg font-semibold mb-4 dark:text-white">Detalhes e Ações</h3>
                         <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <div><span className="font-semibold dark:text-gray-200">Descrição:</span><p className="text-sm dark:text-gray-300">{record.description}</p></div>
                            <div><span className="font-semibold dark:text-gray-200">Fornecedor:</span><p className="text-sm dark:text-gray-300">{record.supplier || 'N/A'}</p></div>
                            <div><span className="font-semibold dark:text-gray-200">Custo:</span><p className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(record.cost)}</p></div>
                         </div>
                         {canTakeAction && (
                            <div className="mt-6">
                                <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Adicionar Comentário (Opcional)</label>
                                <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="input-style" placeholder="Justificativa para a ação..."></textarea>
                                <div className="flex justify-end gap-4 mt-4">
                                    <button onClick={() => handleAction(ApprovalStatus.REJECTED)} disabled={isSaving} className="btn-danger">Rejeitar</button>
                                    <button onClick={() => handleAction(ApprovalStatus.APPROVED)} disabled={isSaving} className="btn-success">Aprovar</button>
                                </div>
                            </div>
                         )}
                         {record.status !== ApprovalStatus.PENDING && (
                            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">Esta solicitação já foi finalizada.</p>
                         )}
                    </div>
                </div>
                 <style>{`
                    .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; } .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
                    .btn-danger { background-color: #dc2626; color:white; padding: 0.5rem 1rem; border-radius:0.5rem; font-weight: 500;} .btn-danger:hover:not(:disabled) { background-color: #b91c1c; } .btn-danger:disabled { opacity: 0.5; }
                    .btn-success { background-color: #16a34a; color:white; padding: 0.5rem 1rem; border-radius:0.5rem; font-weight: 500;} .btn-success:hover:not(:disabled) { background-color: #15803d; } .btn-success:disabled { opacity: 0.5; }
                `}</style>
            </div>
        </div>
    );
};

export default ApprovalTimelineModal;
