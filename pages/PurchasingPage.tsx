
import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import { NewPurchaseRequisitionData, PurchaseRequisition, RequisitionStatus, RequestForQuotation, NewRequestForQuotationData, RFQStatus, PurchaseOrder, NewPurchaseOrderData } from '../types';
import RequisitionTable from '../components/purchasing/RequisitionTable';
import RFQList from '../components/purchasing/RFQList';
import OrderTable from '../components/purchasing/OrderTable';
import AddRequisitionModal from '../components/purchasing/AddRequisitionModal';
import ViewRequisitionModal from '../components/purchasing/ViewRequisitionModal';
import ViewRFQModal from '../components/purchasing/ViewRFQModal';
import ViewOrderModal from '../components/purchasing/ViewOrderModal';
import { PlusIcon } from '../components/common/icons';
import { fileToBase64 } from '../utils/fileUtils';

type Tab = 'requisitions' | 'rfqs' | 'orders';

const PurchasingPage: React.FC = () => {
  const { 
    purchaseRequisitions, 
    rfqs, 
    purchaseOrders, 
    addPurchaseRequisition, 
    updatePurchaseRequisition, 
    addRequestForQuotation,
    updateRequestForQuotation,
    addPurchaseOrder,
    receiveOrderItems,
    suppliers,
  } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('requisitions');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewReqModalOpen, setIsViewReqModalOpen] = useState(false);
  const [isViewRFQModalOpen, setIsViewRFQModalOpen] = useState(false);
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
  
  const [selectedRequisition, setSelectedRequisition] = useState<PurchaseRequisition | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<RequestForQuotation | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);


  const handleSaveRequisition = async (items: { name: string, quantity: number }[], justification?: string, attachment?: File | null) => {
    if (!user?.name) return;

    let attachmentUrl = '';
    if (attachment) {
        try {
            attachmentUrl = await fileToBase64(attachment);
        } catch (e) {
            console.error("Failed to convert attachment", e);
        }
    }

    const requisitionData: Omit<NewPurchaseRequisitionData, 'tenantId'> = {
        requesterName: user.name,
        requestDate: new Date().toISOString(),
        items: items.map(i => ({ description: i.name, quantity: i.quantity })),
        status: RequisitionStatus.PENDING,
        ...(justification && { justification }),
        ...(attachment && { 
            attachmentName: attachment.name,
            attachmentUrl: attachmentUrl // Save Base64 string directly
        }),
    };
    await addPurchaseRequisition(requisitionData);
  };

  const handleViewRequisition = (req: PurchaseRequisition) => {
    setSelectedRequisition(req);
    setIsViewReqModalOpen(true);
  };
  
  const handleViewRFQ = (rfq: RequestForQuotation) => {
    setSelectedRFQ(rfq);
    setIsViewRFQModalOpen(true);
  };
  
  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewOrderModalOpen(true);
  };

  const TabButton: React.FC<{tabName: Tab; label: string;}> = ({ tabName, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`${ activeTab === tabName ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-500' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
      {label}
    </button>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <p className="text-gray-500 dark:text-gray-400">Gerencie requisições, cotações e ordens de compra.</p>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Nova Requisição de Compra
          </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton tabName="requisitions" label="Requisições" />
          <TabButton tabName="rfqs" label="Cotações (RFQ)" />
          <TabButton tabName="orders" label="Ordens de Compra" />
        </nav>
      </div>

      <div>
        {activeTab === 'requisitions' && <RequisitionTable requisitions={purchaseRequisitions} onView={handleViewRequisition} />}
        {activeTab === 'rfqs' && <RFQList rfqs={rfqs} onView={handleViewRFQ} />}
        {activeTab === 'orders' && <OrderTable orders={purchaseOrders} onView={handleViewOrder} />}
      </div>

      <AddRequisitionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveRequisition}
      />
      
      {selectedRequisition && (
        <ViewRequisitionModal
            isOpen={isViewReqModalOpen}
            onClose={() => setIsViewReqModalOpen(false)}
            requisition={selectedRequisition}
            onUpdateRequisition={updatePurchaseRequisition}
            onCreateRFQ={addRequestForQuotation}
            onCreateOrder={addPurchaseOrder}
            suppliers={suppliers}
        />
      )}
      
      {selectedRFQ && (
        <ViewRFQModal
            isOpen={isViewRFQModalOpen}
            onClose={() => setIsViewRFQModalOpen(false)}
            rfq={selectedRFQ}
            suppliers={suppliers}
            onUpdateRFQ={updateRequestForQuotation}
            onCreateOrder={addPurchaseOrder}
            onUpdateRequisition={updatePurchaseRequisition}
            requisition={purchaseRequisitions.find(r => r.id === selectedRFQ.requisitionId)}
        />
      )}
      
      {selectedOrder && (
        <ViewOrderModal
            isOpen={isViewOrderModalOpen}
            onClose={() => setIsViewOrderModalOpen(false)}
            order={selectedOrder}
            onReceiveItems={receiveOrderItems}
        />
      )}

      <style>{`.btn {display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;transition:background-color .2s}.btn-primary {background-color:rgb(var(--color-primary-600));color:#fff}.btn-primary:hover {background-color:rgb(var(--color-primary-700))}`}</style>
    </div>
  );
};

export default PurchasingPage;
