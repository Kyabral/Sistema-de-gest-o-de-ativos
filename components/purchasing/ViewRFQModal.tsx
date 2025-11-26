import React, { useState } from 'react';
// FIX: Added 'RFQStatus' to the import to resolve type error.
import { RequestForQuotation, Quote, Supplier, PurchaseItem, PurchaseRequisition, RequisitionStatus, PurchaseOrder, NewPurchaseOrderData, PurchaseStatus, RFQStatus } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface ViewRFQModalProps {
    isOpen: boolean;
    onClose: () => void;
    rfq: RequestForQuotation;
    suppliers: Supplier[];
    onUpdateRFQ: (rfq: RequestForQuotation) => Promise<void>;
    onCreateOrder: (order: Omit<NewPurchaseOrderData, 'tenantId'>) => Promise<void>;
    onUpdateRequisition: (req: PurchaseRequisition) => Promise<void>;
    requisition: PurchaseRequisition | undefined;
}

const ViewRFQModal: React.FC<ViewRFQModalProps> = ({ isOpen, onClose, rfq, suppliers, onUpdateRFQ, onCreateOrder, onUpdateRequisition, requisition }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [showAddQuote, setShowAddQuote] = useState(false);
    const [newQuote, setNewQuote] = useState<{supplierId: string, items: PurchaseItem[]}>({ supplierId: '', items: rfq.items.map(i => ({...i, unitPrice: 0, totalPrice: 0})) });

    const handleItemPriceChange = (index: number, unitPrice: number) => {
        const updatedItems = [...newQuote.items];
        updatedItems[index].unitPrice = unitPrice;
        updatedItems[index].totalPrice = unitPrice * updatedItems[index].quantity;
        setNewQuote(prev => ({ ...prev, items: updatedItems }));
    };

    const handleAddQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        const supplier = suppliers.find(s => s.id === newQuote.supplierId);
        if (!supplier) return;

        const totalValue = newQuote.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        
        const quote: Quote = {
            id: `quote-${Date.now()}`,
            supplierId: newQuote.supplierId,
            supplierName: supplier.name,
            quoteDate: new Date().toISOString(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days validity
            items: newQuote.items,
            totalValue,
        };

        const updatedRfq = { ...rfq, quotes: [...rfq.quotes, quote] };
        await onUpdateRFQ(updatedRfq);
        setShowAddQuote(false);
        setNewQuote({ supplierId: '', items: rfq.items.map(i => ({...i, unitPrice: 0, totalPrice: 0})) });
    };
    
    const handleSelectWinner = async (quote: Quote) => {
        setIsSaving(true);
        const orderData: Omit<NewPurchaseOrderData, 'tenantId'> = {
            requisitionId: rfq.requisitionId,
            supplierId: quote.supplierId,
            orderDate: new Date().toISOString(),
            items: quote.items,
            totalValue: quote.totalValue,
            status: PurchaseStatus.PENDING,
            receivedItems: [],
        };
        await onCreateOrder(orderData);
        if (requisition) {
            await onUpdateRequisition({ ...requisition, status: RequisitionStatus.ORDERED });
        }
        await onUpdateRFQ({ ...rfq, status: RFQStatus.CLOSED });
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Analisar Cotação (RFQ)</h2><button onClick={onClose}>&times;</button></div>
                <div className="overflow-y-auto space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Itens Solicitados</h3>
                        <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-3 rounded">{rfq.items.map((item, i) => <li key={i}>{item.quantity}x {item.description}</li>)}</ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Cotações Recebidas</h3>
                        <div className="space-y-4">
                            {rfq.quotes.sort((a,b) => a.totalValue - b.totalValue).map(quote => (
                                <div key={quote.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">{quote.supplierName}</p>
                                            <p className="text-sm">Total: <span className="font-bold text-primary-600">{formatCurrency(quote.totalValue)}</span></p>
                                        </div>
                                        <button onClick={() => handleSelectWinner(quote)} disabled={isSaving} className="btn-primary btn-sm">Selecionar Vencedor e Gerar Pedido</button>
                                    </div>
                                    <details className="text-xs mt-2"><summary>Ver detalhes</summary><ul className="mt-1">{quote.items.map((item, i) => <li key={i}>{item.quantity}x {item.description} @ {formatCurrency(item.unitPrice || 0)}</li>)}</ul></details>
                                </div>
                            ))}
                            {rfq.quotes.length === 0 && <p className="text-sm text-center p-4">Nenhuma cotação recebida ainda.</p>}
                        </div>
                    </div>
                    {!showAddQuote && <button onClick={() => setShowAddQuote(true)} className="btn-secondary">Simular Recebimento de Cotação</button>}
                    {showAddQuote && (
                        <form onSubmit={handleAddQuote} className="space-y-4 pt-4 border-t">
                             <h3 className="font-semibold">Nova Cotação</h3>
                             <div><label>Fornecedor</label><select value={newQuote.supplierId} onChange={e => setNewQuote(p => ({...p, supplierId: e.target.value}))} required className="input-style"><option value="">Selecione</option>{suppliers.filter(s => !rfq.quotes.find(q => q.supplierId === s.id)).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                             {newQuote.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-2 gap-4 items-center">
                                    <p>{item.quantity}x {item.description}</p>
                                    <div><label className="text-xs">Preço Unitário (R$)</label><input type="number" value={item.unitPrice} onChange={e => handleItemPriceChange(i, Number(e.target.value))} required min="0" step="0.01" className="input-style"/></div>
                                </div>
                             ))}
                             <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowAddQuote(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Adicionar Cotação</button></div>
                        </form>
                    )}
                </div>
                 <style>{`.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-secondary{background-color:#eee;color:#333;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}button{padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;}.btn-sm{padding:0.25rem 0.5rem;font-size:0.875rem;}`}</style>
            </div>
        </div>
    );
};

export default ViewRFQModal;
