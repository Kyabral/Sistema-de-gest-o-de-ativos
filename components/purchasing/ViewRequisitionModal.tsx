
import React, { useState } from 'react';
// FIX: Added 'PurchaseStatus' to the import to resolve type error.
import { PurchaseRequisition, RequisitionStatus, PurchaseOrder, NewPurchaseOrderData, Supplier, RFQStatus, NewRequestForQuotationData, PurchaseStatus } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ViewRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: PurchaseRequisition;
  onUpdateRequisition: (req: PurchaseRequisition) => Promise<void>;
  onCreateRFQ: (rfq: Omit<NewRequestForQuotationData, 'tenantId'>) => Promise<void>;
  onCreateOrder: (order: Omit<NewPurchaseOrderData, 'tenantId'>) => Promise<void>;
  suppliers: Supplier[];
}

const ViewRequisitionModal: React.FC<ViewRequisitionModalProps> = ({ isOpen, onClose, requisition, onUpdateRequisition, onCreateRFQ, onCreateOrder, suppliers }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'details' | 'create_rfq' | 'create_po'>('details');
  
  // Form state
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [orderSupplier, setOrderSupplier] = useState('');
  const [orderValue, setOrderValue] = useState(0);

  // Reason state (Rule 2.2.1)
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [actionType, setActionType] = useState<RequisitionStatus | null>(null);
  const [reason, setReason] = useState('');

  const initiateAction = (status: RequisitionStatus) => {
    if (status === RequisitionStatus.REJECTED || status === RequisitionStatus.CANCELED) {
        setActionType(status);
        setShowReasonInput(true);
    } else {
        handleUpdateStatus(status);
    }
  };

  const handleConfirmActionWithReason = async () => {
      if (!reason.trim()) {
          alert("Regra 2.2.1: O motivo é obrigatório para rejeição ou cancelamento.");
          return;
      }
      if (actionType) {
          setIsSaving(true);
          await onUpdateRequisition({ ...requisition, status: actionType, cancellationReason: reason });
          setIsSaving(false);
          onClose();
      }
  };

  const handleUpdateStatus = async (status: RequisitionStatus) => {
    setIsSaving(true);
    await onUpdateRequisition({ ...requisition, status });
    setIsSaving(false);
    onClose();
  };

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuppliers.length === 0) return;
    setIsSaving(true);
    const rfqData: Omit<NewRequestForQuotationData, 'tenantId'> = {
        requisitionId: requisition.id,
        creationDate: new Date().toISOString(),
        sentToSupplierIds: selectedSuppliers,
        items: requisition.items,
        status: RFQStatus.SENT,
        quotes: [],
    };
    await onCreateRFQ(rfqData);
    await onUpdateRequisition({ ...requisition, status: RequisitionStatus.RFQ_CREATED });
    setIsSaving(false);
    onClose();
  };
  
  const handleCreateDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const orderData: Omit<NewPurchaseOrderData, 'tenantId'> = {
        requisitionId: requisition.id,
        supplierId: orderSupplier,
        orderDate: new Date().toISOString(),
        items: requisition.items.map(i => ({...i, unitPrice: 0, totalPrice: 0})),
        totalValue: orderValue,
        status: PurchaseStatus.PENDING,
        receivedItems: [],
    };
    await onCreateOrder(orderData);
    await onUpdateRequisition({ ...requisition, status: RequisitionStatus.ORDERED });
    setIsSaving(false);
    onClose();
  };

  const handleClose = () => {
    setShowReasonInput(false);
    setReason('');
    setActionType(null);
    onClose();
  };

  if (!isOpen) return null;

  const isPending = requisition.status === RequisitionStatus.PENDING;
  const isApproved = requisition.status === RequisitionStatus.APPROVED;

  const renderContent = () => {
    if (showReasonInput) {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">
                    {actionType === RequisitionStatus.REJECTED ? 'Rejeitar Requisição' : 'Cancelar Requisição'}
                </h3>
                <p className="text-sm">Por favor, informe o motivo obrigatório (Regra 2.2.1):</p>
                <textarea 
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={4}
                    placeholder="Descreva o motivo..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-600">
                    <button type="button" onClick={() => setShowReasonInput(false)} className="btn-secondary">Voltar</button>
                    <button type="button" onClick={handleConfirmActionWithReason} disabled={isSaving} className="btn-danger">Confirmar</button>
                </div>
            </div>
        );
    }

    if (view === 'create_rfq') {
        return (
            <form onSubmit={handleCreateRFQ} className="space-y-4">
                <h3 className="font-semibold text-lg">Gerar Cotação (RFQ)</h3>
                <p className="text-sm">Selecione os fornecedores para os quais a cotação será enviada.</p>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                    {suppliers.map(s => (
                        <div key={s.id}>
                            <input type="checkbox" id={`supplier-${s.id}`} value={s.id} onChange={e => {
                                if (e.target.checked) setSelectedSuppliers(prev => [...prev, s.id]);
                                else setSelectedSuppliers(prev => prev.filter(id => id !== s.id));
                            }}/>
                            <label htmlFor={`supplier-${s.id}`} className="ml-2">{s.name} ({s.category})</label>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-600">
                    <button type="button" onClick={() => setView('details')} className="btn-secondary">Voltar</button>
                    <button type="submit" disabled={isSaving || selectedSuppliers.length === 0} className="btn-primary">Enviar Cotação</button>
                </div>
            </form>
        );
    }
    
    if (view === 'create_po') {
         return (
            <form onSubmit={handleCreateDirectOrder} className="space-y-4">
                <h3 className="font-semibold text-lg">Gerar Ordem de Compra Direta</h3>
                <div><label>Fornecedor</label><select value={orderSupplier} onChange={e => setOrderSupplier(e.target.value)} required className="input-style"><option value="">Selecione</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label>Valor Total do Pedido (R$)</label><input type="number" value={orderValue} onChange={e => setOrderValue(Number(e.target.value))} required min="0" step="0.01" className="input-style"/></div>
                 <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-600">
                    <button type="button" onClick={() => setView('details')} className="btn-secondary">Voltar</button>
                    <button type="submit" disabled={isSaving} className="btn-primary">Criar Pedido</button>
                </div>
            </form>
          );
    }

    return (
        <div className="space-y-4">
            <p><strong>Solicitante:</strong> {requisition.requesterName}</p>
            <p><strong>Data:</strong> {formatDate(requisition.requestDate)}</p>
            {requisition.justification && <p><strong>Justificativa:</strong> {requisition.justification}</p>}
            {requisition.attachmentName && (
              <p>
                <strong>Anexo:</strong> 
                <a href={requisition.attachmentUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline ml-2">
                  {requisition.attachmentName}
                </a>
              </p>
            )}
            {requisition.cancellationReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-red-800 dark:text-red-300 font-semibold text-sm">Motivo do Cancelamento/Rejeição:</p>
                    <p className="text-red-700 dark:text-red-200 text-sm">{requisition.cancellationReason}</p>
                </div>
            )}

            <p><strong>Itens:</strong></p>
            <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700 p-3 rounded">{requisition.items.map((item, i) => <li key={i}>{item.quantity}x {item.description}</li>)}</ul>
            <p><strong>Status:</strong> {requisition.status}</p>

            {isPending && (
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-600">
                    <button onClick={() => initiateAction(RequisitionStatus.CANCELED)} disabled={isSaving} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">Cancelar</button>
                    <button onClick={() => initiateAction(RequisitionStatus.REJECTED)} disabled={isSaving} className="btn-danger">Rejeitar</button>
                    <button onClick={() => handleUpdateStatus(RequisitionStatus.APPROVED)} disabled={isSaving} className="btn-success">Aprovar</button>
                </div>
            )}
            
            {isApproved && (
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t dark:border-gray-600">
                    <button onClick={() => setView('create_rfq')} className="btn-secondary">Gerar Cotação (RFQ)</button>
                    <button onClick={() => setView('create_po')} className="btn-primary">Gerar Ordem de Compra Direta</button>
                </div>
            )}

            {!isPending && !isApproved && <div className="flex justify-end pt-4 border-t dark:border-gray-600"><button onClick={handleClose} className="btn-secondary">Fechar</button></div>}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">Revisar Requisição</h2>
             <button onClick={handleClose}>&times;</button>
        </div>
        {renderContent()}
        <style>{`.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.btn-danger{background-color:#dc2626;color:white;}.btn-success{background-color:#16a34a;color:white;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#e5e7eb;color:#1f2937;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}button{padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
      </div>
    </div>
  );
};

export default ViewRequisitionModal;
