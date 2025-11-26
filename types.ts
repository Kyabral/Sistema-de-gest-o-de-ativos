

// A base entity that all top-level documents should extend.
export interface BaseEntity {
  tenantId: string;
}

export enum DocumentType {
  INVOICE = 'Nota Fiscal',
  MANUAL = 'Manual',
  WARRANTY = 'Garantia',
  OTHER = 'Outro',
}

export interface AssetDocument {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD, only for warranty
}

export interface AssetComponent {
  id: string;
  name: string;
  serialNumber?: string;
  quantity: number;
}

export enum AssetStatus {
  ACTIVE = 'Ativo',
  IN_REPAIR = 'Em Reparo',
  DECOMMISSIONED = 'Descomissionado',
  IDLE = 'Ocioso',
}

export enum ApprovalStatus {
  PENDING = 'Pendente',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado',
  AUTO_APPROVED = 'Aprovado Automaticamente',
}

export interface ApprovalEvent {
  actor: string; // 'Sistema', 'Gerente', 'Diretor'
  status: ApprovalStatus;
  comment?: string;
  date: string; // ISO String
}

export interface MaintenanceRecord {
  id: string;
  description: string;
  cost: number;
  date: string; // YYYY-MM-DD
  supplierId?: string;
  images?: { name: string; url: string }[];
  status: ApprovalStatus;
  nextApprover?: 'Gerente' | 'Diretor';
  approvalHistory: ApprovalEvent[];
}

export interface Asset extends BaseEntity {
  id: string;
  name: string;
  type: string;
  location: string;
  purchaseDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  purchaseValue: number;
  status: AssetStatus;
  maintenanceHistory: MaintenanceRecord[];
  documents?: AssetDocument[];
  components?: AssetComponent[];
  healthScore?: number;
  images?: { name: string; url: string }[];
  serialNumber?: string;
  vehiclePlate?: string;
  vehicleRenavam?: string;
  coordinates?: { lat: number; lng: number; };
  // FIX: Added properties for consumable items. This allows the Asset type to handle both standard assets and stock items, fixing type errors across components.
  isConsumable?: boolean;
  quantity?: number;
  reorderLevel?: number;
  sku?: string;
  supplierId?: string;
}

export type NewAssetData = Omit<Asset, 'id' | 'maintenanceHistory' | 'healthScore'>;

export interface NewMaintenanceData {
  assetId: string;
  description: string;
  cost: number;
  date: string; // YYYY-MM-DD
  supplierId?: string;
  images?: { name: string, url: string }[];
}

// --- STOCK & MOVEMENTS (Rule 2.3.1, 2.3.2) ---

export type MovementType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';

export interface StockBatch {
  id: string;
  lotNumber: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  entryDate: string; // ISO
}

export interface StockMovement {
  id: string;
  date: string; // ISO String
  type: MovementType;
  quantity: number;
  user: string; // Name of user performing action
  origin?: string; // For transfers
  destination?: string; // For transfers
  reason?: string;
  batchesAffected?: string[]; // List of batch IDs affected
}

export interface StockItem extends BaseEntity {
  id: string;
  name: string;
  sku: string;
  quantity: number; // Total quantity across all batches
  location: string;
  threshold: number;
  lastUpdated: string; // ISO String
  lotNumber?: string; // Deprecated: kept for legacy, use batches
  expiryDate?: string; // Deprecated: kept for legacy, use batches
  batches: StockBatch[]; // Rule 2.3.2: Multiple batches support
  movementHistory: StockMovement[]; // Log of all actions
}

export type NewStockItemData = Omit<StockItem, 'id' | 'lastUpdated' | 'movementHistory' | 'batches'> & {
    initialBatch?: { lotNumber: string; expiryDate: string; };
};

export interface Supplier extends BaseEntity {
    id: string;
    name: string;
    category: string;
    contactPerson?: string;
    email: string;
    phone: string;
    address?: string;
}

export type NewSupplierData = Omit<Supplier, 'id'>;

export interface UserRegistrationData {
  name: string;
  email: string;
  password?: string;
  companyName: string;
  phone?: string;
}

export interface CustomClaims {
  role: 'admin' | 'manager' | 'user';
  tenantId: string;
}

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  role: CustomClaims['role'];
  tenantId: CustomClaims['tenantId'];
  status?: 'active' | 'invited';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface BrandingSettings {
  companyName: string;
  slogan?: string;
  logoUrl?: string;
  primaryColor: string;
  institutionalMessage?: string;
  
  // Fiscal & Address Info
  cnpj?: string;
  stateRegistration?: string; // Inscrição Estadual
  municipalRegistration?: string; // Inscrição Municipal
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Banking Info
  bankInfo?: {
    bankName: string;
    agency: string;
    accountNumber: string;
    pixKey?: string;
  };
}

// Company Document Management
export interface CompanyDocument extends BaseEntity {
  id: string;
  name: string;
  category: string;
  tags: string[];
  uploadDate: string; // ISO String
  expiryDate?: string; // ISO String
  fileUrl?: string; // Base64 string or URL
  mimeType?: string; // e.g., 'application/pdf', 'image/png'
  fileName?: string; // Original file name
}

export type NewCompanyDocumentData = Omit<CompanyDocument, 'id'>;

// Financial Module
export enum InvoiceStatus {
  PENDING = 'Pendente',
  PAID = 'Paga',
  OVERDUE = 'Atrasada',
  CANCELED = 'Cancelada',
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice extends BaseEntity {
  id: string;
  invoiceNumber: number;
  clientName: string;
  issueDate: string; // ISO String
  dueDate: string; // ISO String
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
}

export type NewInvoiceData = Omit<Invoice, 'id' | 'invoiceNumber'>;

export enum ContractStatus {
  ACTIVE = 'Ativo',
  EXPIRED = 'Expirado',
  CANCELED = 'Cancelado',
}

export interface Contract extends BaseEntity {
  id: string;
  name: string;
  supplierId: string;
  category: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  monthlyValue: number;
  status: ContractStatus;
}

export type NewContractData = Omit<Contract, 'id'>;

// --- NEW: ACCOUNTS PAYABLE (CONTAS A PAGAR) ---

export enum ExpenseStatus {
  OPEN = 'Em Aberto',
  PAID = 'Pago',
  PARTIAL = 'Parcial',
  OVERDUE = 'Vencido',
}

export interface PaymentHistory {
  date: string; // ISO
  amount: number;
  method: string; // 'Boleto', 'PIX', 'Transferência', etc.
  user: string;
}

export interface Expense extends BaseEntity {
  id: string;
  description: string;
  supplierId: string; // Link to Supplier
  category: string; // 'Manutenção', 'Material', 'Serviços', 'Impostos'
  issueDate: string;
  dueDate: string;
  totalValue: number;
  amountPaid: number;
  remainingValue: number;
  status: ExpenseStatus;
  paymentMethod?: string; // Required for rule 2.1.1
  isReconciled: boolean; // Rule: Cannot delete if reconciled
  groupId?: string; // For installments linking
  installmentNumber?: number; // 1 of 12
  totalInstallments?: number;
  paymentHistory: PaymentHistory[]; // Rule: Partial payment history
  attachmentUrl?: string;
}

export type NewExpenseData = Omit<Expense, 'id' | 'amountPaid' | 'remainingValue' | 'status' | 'paymentHistory' | 'isReconciled'> & {
  installments?: number; // Helper for creation
};

// --- NEW: BANK RECONCILIATION (CONCILIAÇÃO BANCÁRIA) ---
export enum ReconciliationStatus {
  PENDING = 'Pendente',
  MATCHED = 'Conciliado',
  REVIEW = 'Revisar',
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Negative for expense, positive for income
  status: ReconciliationStatus;
  matchId?: string; // ID of the system transaction (Invoice or Expense)
  matchType?: 'Invoice' | 'Expense';
}

// Purchasing Module
export enum RequisitionStatus {
  PENDING = 'Pendente',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado',
  ORDERED = 'Pedido Gerado',
  RFQ_CREATED = 'Cotação Gerada',
  CANCELED = 'Cancelado',
}

export interface PurchaseItem {
  stockItemId?: string;
  description: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface PurchaseRequisition extends BaseEntity {
  id: string;
  requesterName: string; 
  requestDate: string; // ISO
  items: PurchaseItem[];
  status: RequisitionStatus;
  justification?: string;
  attachmentName?: string;
  attachmentUrl?: string; // In a real app, this would point to a cloud storage URL
  cancellationReason?: string; // Rule 2.2.1: Mandatory reason for cancellation/rejection
}
export type NewPurchaseRequisitionData = Omit<PurchaseRequisition, 'id'>;


export enum RFQStatus {
    DRAFT = 'Rascunho',
    SENT = 'Enviado',
    CLOSED = 'Fechado',
}

export interface Quote {
    id: string;
    supplierId: string;
    supplierName: string;
    quoteDate: string; // ISO
    items: PurchaseItem[];
    totalValue: number;
    validUntil: string; // ISO
}

export interface RequestForQuotation extends BaseEntity {
    id: string;
    requisitionId: string;
    creationDate: string; // ISO
    sentToSupplierIds: string[];
    items: PurchaseItem[];
    status: RFQStatus;
    quotes: Quote[];
}
export type NewRequestForQuotationData = Omit<RequestForQuotation, 'id'>;

export enum PurchaseStatus {
  PENDING = 'Pendente',
  SENT = 'Enviado',
  PARTIALLY_RECEIVED = 'Recebido Parcialmente',
  RECEIVED = 'Recebido',
  CANCELED = 'Cancelado',
}

export interface ReceivedItem {
    description: string;
    quantityReceived: number;
    receivedDate: string; // ISO
    stockItemId?: string;
}

export interface PurchaseOrder extends BaseEntity {
  id: string;
  requisitionId: string;
  supplierId: string;
  orderDate: string; // ISO
  items: PurchaseItem[];
  totalValue: number;
  status: PurchaseStatus;
  receivedItems: ReceivedItem[]; // For tracking reception
  expectedDeliveryDate?: string; // ISO
}
export type NewPurchaseOrderData = Omit<PurchaseOrder, 'id'>;


// AI Predictions Module
export interface FailurePrediction {
  assetId: string;
  assetName: string;
  probability: number; // 0 to 1
  predictedDate: string; // ISO String
}

// Stock Reconciliation Module
export interface StockCountItem {
  itemId: string;
  itemName: string;
  sku: string;
  systemQty: number;
  countedQty: number;
  variance: number;
}

export interface StockCount extends BaseEntity {
  id: string;
  date: string; // ISO String
  countedBy: string;
  items: StockCountItem[];
  status: 'Em Andamento' | 'Concluído';
}
export type NewStockCountData = Omit<StockCount, 'id'>;

// --- ERP EXTENSIONS ---

// HR Module
export interface Employee extends BaseEntity {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  admissionDate: string;
  salary: number;
  status: 'Ativo' | 'Férias' | 'Desligado';
  avatarUrl?: string;
}

// Projects Module
export interface Project extends BaseEntity {
  id: string;
  name: string;
  client: string;
  status: 'Planejamento' | 'Em Andamento' | 'Concluído' | 'Atrasado';
  progress: number; // 0-100
  startDate: string;
  endDate: string;
  budget: number;
  manager: string;
}

// CRM Module
export type DealStage = 'Lead' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Fechado';

export interface Deal extends BaseEntity {
  id: string;
  title: string;
  clientName: string;
  value: number;
  stage: DealStage;
  probability: number; // 0-100
  expectedCloseDate: string;
  owner: string;
}

// Sales Module
export interface SalesOrder extends BaseEntity {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'Aberto' | 'Faturado' | 'Entregue';
  items: { description: string; quantity: number; unitPrice: number }[];
}
