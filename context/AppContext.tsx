
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  Asset, NewAssetData, NewMaintenanceData, MaintenanceRecord, 
  StockItem, NewStockItemData, Supplier, NewSupplierData, 
  Invoice, NewInvoiceData, Contract, NewContractData, CompanyDocument, NewCompanyDocumentData, PurchaseRequisition, NewPurchaseRequisitionData, PurchaseOrder, NewPurchaseOrderData, StockCount, NewStockCountData, User, FailurePrediction, RequestForQuotation, NewRequestForQuotationData, ReceivedItem, PurchaseStatus, RequisitionStatus, SalesOrder,
  Deal, Project, Employee, InvoiceStatus, Expense, NewExpenseData, ExpenseStatus, MovementType
} from '../types';
import * as predictionsService from '../api/predictionsService';
import { useAuth } from '../hooks/useAuth';
import { determineApprovalFlow } from '../utils/approvalWorkflowEngine';
import { logger } from '../utils/logger';
import * as assetsService from '../api/assetsService';
import * as stockService from '../api/stockService';
import * as suppliersService from '../api/suppliersService';
import * as financeService from '../api/financeService';
import * as documentsService from '../api/documentsService';
import * as purchasingService from '../api/purchasingService';
import * as usersService from '../api/usersService';
import * as salesService from '../api/salesService';
import * as crmService from '../api/crmService';
import * as projectsService from '../api/projectsService';
import * as hrService from '../api/hrService';
import * as expensesService from '../api/expensesService';
import { getExpiringItems, Notification } from '../utils/notificationUtils';


interface AppContextType {
  assets: Asset[];
  stockItems: StockItem[];
  suppliers: Supplier[];
  invoices: Invoice[];
  contracts: Contract[];
  expenses: Expense[]; // Accounts Payable
  companyDocuments: CompanyDocument[];
  purchaseRequisitions: PurchaseRequisition[];
  rfqs: RequestForQuotation[];
  purchaseOrders: PurchaseOrder[];
  stockCounts: StockCount[];
  users: User[];
  salesOrders: SalesOrder[];
  deals: Deal[];
  projects: Project[];
  employees: Employee[];
  failurePredictions: FailurePrediction[];
  systemNotifications: Notification[];
  isLoading: boolean;
  error: string | null;
  addAsset: (assetData: Omit<NewAssetData, 'tenantId'>) => Promise<Asset>;
  updateAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  addMaintenance: (maintenanceData: NewMaintenanceData) => Promise<void>;
  updateMaintenanceRecord: (assetId: string, record: MaintenanceRecord) => Promise<void>;
  addStockItem: (itemData: Omit<NewStockItemData, 'tenantId'>) => Promise<void>;
  updateStockItem: (itemId: string, itemData: Partial<NewStockItemData>) => Promise<void>;
  deleteStockItem: (itemId: string) => Promise<void>;
  registerStockMovement: (itemId: string, type: MovementType, quantity: number, destination?: string) => Promise<void>;
  addSupplier: (supplierData: Omit<NewSupplierData, 'tenantId'>) => Promise<void>;
  updateSupplier: (supplierId: string, supplierData: Partial<NewSupplierData>) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
  addInvoice: (invoiceData: Omit<NewInvoiceData, 'tenantId'>) => Promise<void>;
  updateInvoice: (invoiceId: string, invoiceData: Partial<Invoice>) => Promise<void>;
  addContract: (contractData: Omit<NewContractData, 'tenantId'>) => Promise<void>;
  updateContract: (contractId: string, contractData: Partial<NewContractData>) => Promise<void>;
  deleteContract: (contractId: string) => Promise<void>;
  addCompanyDocument: (docData: Omit<NewCompanyDocumentData, 'tenantId'>, file?: File) => Promise<void>;
  updateCompanyDocument: (docId: string, docData: Partial<NewCompanyDocumentData>, file?: File) => Promise<void>;
  deleteCompanyDocument: (docId: string) => Promise<void>;
  addPurchaseRequisition: (reqData: Omit<NewPurchaseRequisitionData, 'tenantId'>) => Promise<void>;
  updatePurchaseRequisition: (req: PurchaseRequisition) => Promise<void>;
  addRequestForQuotation: (rfqData: Omit<NewRequestForQuotationData, 'tenantId'>) => Promise<void>;
  updateRequestForQuotation: (rfq: RequestForQuotation) => Promise<void>;
  addPurchaseOrder: (orderData: Omit<PurchaseOrder, 'id' | 'tenantId'>) => Promise<void>;
  updatePurchaseOrder: (order: PurchaseOrder) => Promise<void>;
  receiveOrderItems: (orderId: string, receivedItemsData: { description: string; quantityReceived: number; stockItemId?: string }[]) => Promise<void>;
  addStockCount: (stockCountData: Omit<NewStockCountData, 'tenantId'>) => Promise<void>;
  inviteUser: (userData: { name: string; email: string; role: User['role'] }) => Promise<void>;
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addSalesOrder: (orderData: Omit<SalesOrder, 'id' | 'tenantId'>) => Promise<void>;
  updateSalesOrderStatus: (orderId: string, status: SalesOrder['status']) => Promise<void>;
  addDeal: (dealData: Omit<Deal, 'id' | 'tenantId'>) => Promise<void>;
  updateDeal: (deal: Deal) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  addProject: (projectData: Omit<Project, 'id' | 'tenantId'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addEmployee: (empData: Omit<Employee, 'id' | 'tenantId'>) => Promise<void>;
  updateEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (empId: string) => Promise<void>;
  addExpense: (expenseData: NewExpenseData) => Promise<void>;
  settleExpense: (expenseId: string, amount: number, method: string, date: string) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState<PurchaseRequisition[]>([]);
  const [rfqs, setRfqs] = useState<RequestForQuotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]); 
  const [deals, setDeals] = useState<Deal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [failurePredictions, setFailurePredictions] = useState<FailurePrediction[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenantId) {
        const loadData = async () => {
            logger.info("Loading data from Firestore for tenant", { tenant: tenantId });
            setIsLoading(true);
            setError(null);
            try {
              const [
                fetchedAssets,
                fetchedStockItems,
                fetchedSuppliers,
                fetchedInvoices,
                fetchedContracts,
                fetchedExpenses,
                fetchedDocs,
                fetchedReqs,
                fetchedRfqs,
                fetchedOrders,
                fetchedCounts,
                fetchedUsers,
                fetchedSalesOrders,
                fetchedDeals,
                fetchedProjects,
                fetchedEmployees
              ] = await Promise.all([
                  assetsService.getAssets(tenantId),
                  stockService.getStockItems(tenantId),
                  suppliersService.getSuppliers(tenantId),
                  financeService.getInvoices(tenantId),
                  financeService.getContracts(tenantId),
                  expensesService.getExpenses(tenantId),
                  documentsService.getCompanyDocuments(tenantId),
                  purchasingService.getPurchaseRequisitions(tenantId),
                  purchasingService.getRequestForQuotations(tenantId),
                  purchasingService.getPurchaseOrders(tenantId),
                  stockService.getStockCounts(tenantId),
                  usersService.getUsersForTenant(tenantId),
                  salesService.getSalesOrders(tenantId),
                  crmService.getDeals(tenantId),
                  projectsService.getProjects(tenantId),
                  hrService.getEmployees(tenantId)
              ]);

              setAssets(fetchedAssets);
              setStockItems(fetchedStockItems);
              setSuppliers(fetchedSuppliers);
              
              // RULE 2.1.2 (Automatic Overdue Status): Check for overdue invoices and update them locally + DB
              const todayStr = new Date().toISOString().split('T')[0];
              const updatedInvoices = await Promise.all(fetchedInvoices.map(async (inv) => {
                  if (inv.status === InvoiceStatus.PENDING && inv.dueDate < todayStr) {
                      // Update in DB asynchronously
                      financeService.updateInvoice(tenantId, { id: inv.id, data: { status: InvoiceStatus.OVERDUE } }).catch(console.error);
                      return { ...inv, status: InvoiceStatus.OVERDUE };
                  }
                  return inv;
              }));
              setInvoices(updatedInvoices);

              setContracts(fetchedContracts);
              setExpenses(fetchedExpenses);
              setCompanyDocuments(fetchedDocs);
              setPurchaseRequisitions(fetchedReqs);
              setRfqs(fetchedRfqs);
              setPurchaseOrders(fetchedOrders);
              setStockCounts(fetchedCounts);
              setUsers(fetchedUsers);
              setSalesOrders(fetchedSalesOrders);
              setDeals(fetchedDeals);
              setProjects(fetchedProjects);
              setEmployees(fetchedEmployees);

              const fetchedPredictions = await predictionsService.getFailurePredictions(tenantId, fetchedAssets);
              setFailurePredictions(fetchedPredictions);
              
              // Generate notifications
              let notifications = getExpiringItems(fetchedAssets, 30);
              
              // RULE 2.1.1: Overdue Bills Alert
              fetchedExpenses.forEach(exp => {
                  if (exp.status !== ExpenseStatus.PAID && exp.dueDate < todayStr) {
                      notifications.push({
                          id: `overdue-${exp.id}`,
                          type: 'ativo', // reusing type for generic alert
                          assetName: 'Financeiro',
                          message: `ALERTA: Título vencido "${exp.description}" (${exp.dueDate})!`,
                          daysRemaining: -1
                      });
                  }
              });
              setSystemNotifications(notifications);
    
            } catch (err: any) {
              setError("Falha ao carregar os dados. Verifique sua conexão e tente novamente.");
              logger.error("Failed to load Firestore data", err);
            } finally {
              setIsLoading(false);
            }
        };
        loadData();
    } else {
      setIsLoading(false);
      // Clear data on logout
      setAssets([]); setStockItems([]); setSuppliers([]); setInvoices([]); setExpenses([]);
      setContracts([]); setCompanyDocuments([]); setPurchaseRequisitions([]);
      setRfqs([]); setPurchaseOrders([]); setStockCounts([]); setUsers([]);
      setFailurePredictions([]); setSalesOrders([]); setDeals([]); setProjects([]); setEmployees([]);
    }
  }, [tenantId]);

  // ... Existing functions ...
  
  // Expenses (Accounts Payable) Methods
  const addExpense = async (expenseData: NewExpenseData) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const newExpenses = await expensesService.addExpense(tenantId, expenseData);
      setExpenses(prev => [...prev, ...newExpenses].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  // RULE 5 (2.1.1): Partial Payment Logic
  const settleExpense = async (expenseId: string, amount: number, method: string, date: string) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) throw new Error("Despesa não encontrada");

      if (!method) throw new Error("Forma de pagamento obrigatória.");

      const newAmountPaid = expense.amountPaid + amount;
      const newRemaining = Math.max(0, expense.totalValue - newAmountPaid);
      
      const newStatus = newRemaining <= 0.01 ? ExpenseStatus.PAID : ExpenseStatus.PARTIAL;

      const updatedExpense: Expense = {
          ...expense,
          amountPaid: newAmountPaid,
          remainingValue: newRemaining,
          status: newStatus,
          paymentMethod: method, // Store the latest method or maintain primary
          paymentHistory: [
              ...expense.paymentHistory, 
              { date, amount, method, user: user?.name || 'Sistema' }
          ]
      };

      await expensesService.updateExpense(tenantId, updatedExpense);
      setExpenses(prev => prev.map(e => e.id === expenseId ? updatedExpense : e));
  };

  // RULE 3 (2.1.1): Prevent deletion of reconciled items
  const deleteExpense = async (expenseId: string) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) throw new Error("Despesa não encontrada");

      if (expense.isReconciled) {
          throw new Error("Não é permitido excluir títulos já conciliados.");
      }

      await expensesService.deleteExpense(tenantId, expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };


  const addAsset = async (assetData: Omit<NewAssetData, 'tenantId'>): Promise<Asset> => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newAsset = await assetsService.addAsset(tenantId, assetData);
    setAssets(prev => [newAsset, ...prev].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
    return newAsset;
  };

  const updateAsset = async (asset: Asset) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await assetsService.updateAsset(tenantId, asset);
    setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
  };

  const deleteAsset = async (assetId: string) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await assetsService.deleteAsset(tenantId, assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const addMaintenance = async (maintenanceData: NewMaintenanceData): Promise<void> => {
    if (!tenantId || !user) throw new Error("Usuário não autenticado.");
    const asset = assets.find(a => a.id === maintenanceData.assetId);
    if (!asset) throw new Error("Ativo não encontrado.");
    const approvalFlow = determineApprovalFlow(asset, Number(maintenanceData.cost), user.name || 'Usuário');
    const newRecord: MaintenanceRecord = { id: `maint-${Date.now()}`, ...maintenanceData, cost: Number(maintenanceData.cost), ...approvalFlow };
    const updatedAsset = { ...asset, maintenanceHistory: [...asset.maintenanceHistory, newRecord] };
    await updateAsset(updatedAsset);
  };
  
  const updateMaintenanceRecord = async (assetId: string, record: MaintenanceRecord) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const asset = assets.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found");
    const updatedHistory = asset.maintenanceHistory.map(r => r.id === record.id ? record : r);
    const updatedAsset = { ...asset, maintenanceHistory: updatedHistory };
    await updateAsset(updatedAsset);
  };

  const addStockItem = async (data: Omit<NewStockItemData, 'tenantId'>) => { 
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newItem = await stockService.addStockItem(tenantId, data);
    setStockItems(prev => [...prev, newItem].sort((a,b) => a.name.localeCompare(b.name)));
  };
  
  const updateStockItem = async (id: string, data: Partial<NewStockItemData>) => { 
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await stockService.updateStockItem(tenantId, { id, data });
    
    // Automation: Trigger Purchase Requisition on Low Stock
    const currentItem = stockItems.find(i => i.id === id);
    const newQuantity = data.quantity !== undefined ? data.quantity : currentItem?.quantity;

    if (currentItem && newQuantity !== undefined) {
        if (newQuantity <= currentItem.threshold) {
            const existingRequisition = purchaseRequisitions.find(req => 
                req.status === RequisitionStatus.PENDING && 
                req.items.some(i => i.stockItemId === id)
            );

            if (!existingRequisition) {
                const refillAmount = Math.max(10, currentItem.threshold * 2); 
                const reqData = {
                    requesterName: 'Sistema (Automação de Estoque)',
                    requestDate: new Date().toISOString(),
                    status: RequisitionStatus.PENDING,
                    items: [{
                        stockItemId: id,
                        description: currentItem.name,
                        quantity: refillAmount
                    }],
                    justification: `Alerta Automático (Regra 2.3): Estoque (${newQuantity}) atingiu o nível mínimo (${currentItem.threshold}).`
                };
                await addPurchaseRequisition(reqData);
                logger.info(`Automatic purchase requisition triggered for item ${currentItem.name}`);
            }
        }
    }

    setStockItems(prev => prev.map(i => i.id === id ? { ...i, ...data, lastUpdated: new Date().toISOString() } as StockItem : i));
  };
  
  const deleteStockItem = async (id: string) => { 
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await stockService.deleteStockItem(tenantId, id);
    setStockItems(prev => prev.filter(i => i.id !== id));
  };
  
  // RULE 2.3.1 Register Movements with Checks
  const registerStockMovement = async (itemId: string, type: MovementType, quantity: number, destination?: string) => {
      if (!tenantId || !user) throw new Error("Usuário não autenticado.");
      try {
          const updatedItem = await stockService.registerStockMovement(tenantId, itemId, type, quantity, user.name || 'Usuário', destination);
          setStockItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));
      } catch (e: any) {
          console.error(e);
          throw new Error(e.message); // Propagate error to UI
      }
  };

  const addStockCount = async (data: Omit<NewStockCountData, 'tenantId'>) => { 
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newCount = await stockService.addStockCount(tenantId, data);
    setStockCounts(prev => [newCount, ...prev]);
  };
  
  const addSupplier = async (data: Omit<NewSupplierData, 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newSupplier = await suppliersService.addSupplier(tenantId, data);
    setSuppliers(prev => [...prev, newSupplier].sort((a,b) => a.name.localeCompare(b.name)));
  };
  const updateSupplier = async (id: string, data: Partial<NewSupplierData>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await suppliersService.updateSupplier(tenantId, { id, data });
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } as Supplier : s));
  };
  const deleteSupplier = async (id: string) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await suppliersService.deleteSupplier(tenantId, id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addInvoice = async (data: Omit<NewInvoiceData, 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newInvoice = await financeService.addInvoice(tenantId, data);
    setInvoices(prev => [newInvoice, ...prev]);
  };
  
  const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    
    // RULE 2 (2.1.2): Immutable Value. Check if total is being changed on an issued invoice.
    const currentInvoice = invoices.find(i => i.id === id);
    if (currentInvoice && data.total !== undefined && Math.abs(data.total - currentInvoice.total) > 0.01) {
        throw new Error("Regra 2.1.2: Não é permitido alterar o valor de uma cobrança após emissão.");
    }

    await financeService.updateInvoice(tenantId, { id, data });
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } as Invoice : i));
  };
  
  const addContract = async (data: Omit<NewContractData, 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newContract = await financeService.addContract(tenantId, data);
    setContracts(prev => [...prev, newContract]);
  };
  const updateContract = async (id: string, data: Partial<NewContractData>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await financeService.updateContract(tenantId, { id, data });
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...data } as Contract : c));
  };
  const deleteContract = async (id: string) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await financeService.deleteContract(tenantId, id);
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const addCompanyDocument = async (docData: Omit<NewCompanyDocumentData, 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newDoc = await documentsService.addCompanyDocument(tenantId, docData);
    setCompanyDocuments(prev => [newDoc, ...prev]);
  };
  const updateCompanyDocument = async (id: string, data: Partial<NewCompanyDocumentData>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await documentsService.updateCompanyDocument(tenantId, { id, data });
    setCompanyDocuments(prev => prev.map(d => (d.id === id ? { ...d, ...data } as CompanyDocument : d)));
  };
  const deleteCompanyDocument = async (id: string) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await documentsService.deleteCompanyDocument(tenantId, id);
    setCompanyDocuments(prev => prev.filter(d => d.id !== id));
  };
  
  const addPurchaseRequisition = async (reqData: Omit<NewPurchaseRequisitionData, 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newReq = await purchasingService.addPurchaseRequisition(tenantId, reqData);
    setPurchaseRequisitions(prev => [newReq, ...prev]);
  };
  const updatePurchaseRequisition = async (req: PurchaseRequisition) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await purchasingService.updatePurchaseRequisition(tenantId, req);
    setPurchaseRequisitions(prev => prev.map(r => r.id === req.id ? req : r));
  };
  
  const addRequestForQuotation = async (rfqData: Omit<NewRequestForQuotationData, 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newRfq = await purchasingService.addRequestForQuotation(tenantId, rfqData);
    setRfqs(prev => [newRfq, ...prev]);
  };
  const updateRequestForQuotation = async (rfq: RequestForQuotation) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await purchasingService.updateRequestForQuotation(tenantId, rfq);
      setRfqs(prev => prev.map(r => r.id === rfq.id ? rfq : r));
    };

  const addPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'tenantId'>) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newOrder = await purchasingService.addPurchaseOrder(tenantId, orderData);
    setPurchaseOrders(prev => [newOrder, ...prev]);
  };
  const updatePurchaseOrder = async (order: PurchaseOrder) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await purchasingService.updatePurchaseOrder(tenantId, order);
      setPurchaseOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const receiveOrderItems = async (orderId: string, receivedItemsData: { description: string; quantityReceived: number; stockItemId?: string }[]) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      
      const orderToUpdate = purchaseOrders.find(o => o.id === orderId);
      if (!orderToUpdate) throw new Error("Ordem de compra não encontrada.");

      for (const received of receivedItemsData) {
          if (received.stockItemId) {
              const stockItem = stockItems.find(si => si.id === received.stockItemId);
              if (stockItem) {
                  // Using registerStockMovement ensures history is kept for receiving items too
                  await registerStockMovement(stockItem.id, 'ENTRADA', received.quantityReceived);
              }
          }
      }

      const newReceivedItems: ReceivedItem[] = receivedItemsData.map(ri => ({
          ...ri,
          receivedDate: new Date().toISOString()
      }));
      
      const updatedReceivedItems = [...orderToUpdate.receivedItems, ...newReceivedItems];
      
      const totalOrderedMap = new Map<string, number>();
      orderToUpdate.items.forEach(item => {
          totalOrderedMap.set(item.description, (totalOrderedMap.get(item.description) || 0) + item.quantity);
      });

      const totalReceivedMap = new Map<string, number>();
      updatedReceivedItems.forEach(item => {
          totalReceivedMap.set(item.description, (totalReceivedMap.get(item.description) || 0) + item.quantityReceived);
      });
      
      let allItemsReceived = true;
      for (const [desc, qty] of totalOrderedMap.entries()) {
          if ((totalReceivedMap.get(desc) || 0) < qty) {
              allItemsReceived = false;
              break;
          }
      }

      const newStatus = allItemsReceived ? PurchaseStatus.RECEIVED : PurchaseStatus.PARTIALLY_RECEIVED;

      const updatedOrder: PurchaseOrder = {
          ...orderToUpdate,
          receivedItems: updatedReceivedItems,
          status: newStatus,
      };

      await purchasingService.updatePurchaseOrder(tenantId, updatedOrder);
      setPurchaseOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
  };


  const inviteUser = async (userData: { name: string; email: string; role: User['role'] }) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    const newUser = await usersService.inviteUser(tenantId, userData);
    setUsers(prev => [...prev, newUser]);
  };
  const updateUserRole = async (userId: string, role: User['role']) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await usersService.updateUserRole(tenantId, { userId, role });
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role } : u));
  };
  const deleteUser = async (userId: string) => {
    if (!tenantId) throw new Error("Usuário não autenticado.");
    await usersService.deleteUser(tenantId, userId);
    setUsers(prev => prev.filter(u => u.uid !== userId));
  };

  // --- CRM Integration & Sales ---
  const addSalesOrder = async (orderData: Omit<SalesOrder, 'id' | 'tenantId'>) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const newOrder = await salesService.addSalesOrder(tenantId, orderData);
      setSalesOrders(prev => [newOrder, ...prev]);
  };

  const updateSalesOrderStatus = async (orderId: string, status: SalesOrder['status']) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      
      const order = salesOrders.find(o => o.id === orderId);
      if (order && status === 'Faturado' && order.status !== 'Faturado') {
          const invoiceData: Omit<NewInvoiceData, 'tenantId'> = {
              clientName: order.customerName,
              issueDate: new Date().toISOString(),
              dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Default 30 days term
              items: order.items.map(i => ({
                  id: `inv-item-${Date.now()}-${Math.random()}`,
                  description: i.description,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                  total: i.quantity * i.unitPrice
              })),
              total: order.total,
              status: InvoiceStatus.PENDING
          };
          await addInvoice(invoiceData);
          logger.info(`Generated Invoice for Sales Order ${orderId}`);
      }

      await salesService.updateSalesOrderStatus(tenantId, orderId, status);
      setSalesOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // --- NEW: CRM, Projects, HR Methods ---
  const addDeal = async (dealData: Omit<Deal, 'id' | 'tenantId'>) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const newDeal = await crmService.addDeal(tenantId, dealData);
      setDeals(prev => [...prev, newDeal]);
  };

  const updateDeal = async (deal: Deal) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await crmService.updateDeal(tenantId, deal);
      setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
  };
  
  const deleteDeal = async (dealId: string) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await crmService.deleteDeal(tenantId, dealId);
      setDeals(prev => prev.filter(d => d.id !== dealId));
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'tenantId'>) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const newProject = await projectsService.addProject(tenantId, projectData);
      setProjects(prev => [...prev, newProject]);
  };
  
  const updateProject = async (project: Project) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await projectsService.updateProject(tenantId, project);
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };
  
  const deleteProject = async (projectId: string) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await projectsService.deleteProject(tenantId, projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addEmployee = async (empData: Omit<Employee, 'id' | 'tenantId'>) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      const newEmp = await hrService.addEmployee(tenantId, empData);
      setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = async (emp: Employee) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await hrService.updateEmployee(tenantId, emp);
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
  };
  
  const deleteEmployee = async (empId: string) => {
      if (!tenantId) throw new Error("Usuário não autenticado.");
      await hrService.deleteEmployee(tenantId, empId);
      setEmployees(prev => prev.filter(e => e.id !== empId));
  };


  const value = { 
    assets, stockItems, suppliers, invoices, contracts, expenses, companyDocuments, 
    purchaseRequisitions, rfqs, purchaseOrders, stockCounts, users, 
    salesOrders, deals, projects, employees, failurePredictions, systemNotifications, isLoading, error, 
    addAsset, updateAsset, deleteAsset, addMaintenance, updateMaintenanceRecord, 
    addStockItem, updateStockItem, deleteStockItem, registerStockMovement, addSupplier, updateSupplier, 
    deleteSupplier, addInvoice, updateInvoice, addContract, updateContract, 
    deleteContract, addCompanyDocument, updateCompanyDocument, deleteCompanyDocument, 
    addPurchaseRequisition, updatePurchaseRequisition, addRequestForQuotation, 
    updateRequestForQuotation, addPurchaseOrder, updatePurchaseOrder, receiveOrderItems, 
    addStockCount, inviteUser, updateUserRole, deleteUser, addSalesOrder, updateSalesOrderStatus,
    addDeal, updateDeal, deleteDeal, addProject, updateProject, deleteProject, 
    addEmployee, updateEmployee, deleteEmployee, addExpense, settleExpense, deleteExpense
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
