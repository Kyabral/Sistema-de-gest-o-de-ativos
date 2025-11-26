import { Asset, AssetStatus, DocumentType, ApprovalStatus, Supplier, StockItem, Invoice, InvoiceStatus, Contract, ContractStatus, PurchaseRequisition, RequisitionStatus, PurchaseOrder, PurchaseStatus, CompanyDocument, StockCount, User } from '../types';

const getFutureDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

export const mockAssets: Asset[] = [
  {
    tenantId: 'mock-tenant-id',
    id: '1',
    name: 'Laptop Dell XPS 15',
    type: 'Equipamento de TI',
    location: 'Escritório 101, Prédio A',
    purchaseDate: '2023-01-15',
    expirationDate: '2028-01-15',
    purchaseValue: 9500,
    status: AssetStatus.ACTIVE,
    supplierId: 'sup-1',
    maintenanceHistory: [
      { id: 'm1-1', description: 'Limpeza interna e troca de pasta térmica', cost: 250, date: '2024-01-20', supplierId: 'sup-3', status: ApprovalStatus.AUTO_APPROVED, approvalHistory: [{actor: 'Sistema', status: ApprovalStatus.AUTO_APPROVED, date: new Date('2024-01-20T12:00:00Z').toISOString(), comment: 'Aprovado automaticamente por baixo valor.'}] },
    ],
    documents: [
      { id: 'd1-1', name: 'Nota Fiscal - Dell XPS 15.pdf', type: DocumentType.INVOICE, uploadDate: '2023-01-15' },
      { id: 'd1-2', name: 'Garantia Estendida.pdf', type: DocumentType.WARRANTY, uploadDate: '2023-01-15', expiryDate: '2025-01-15' }
    ],
    coordinates: { lat: -23.5558, lng: -46.6622 }
  },
  {
    tenantId: 'mock-tenant-id',
    id: '2',
    name: 'Servidor ProLiant DL380',
    type: 'Infraestrutura de Rede',
    location: 'Data Center, Rack 2, Unidade 5',
    purchaseDate: '2022-03-20',
    expirationDate: '2027-03-20',
    purchaseValue: 25000,
    status: AssetStatus.ACTIVE,
    supplierId: 'sup-2',
    maintenanceHistory: [
      { id: 'm2-1', description: 'Upgrade de memória RAM (32GB)', cost: 1200, date: '2023-08-10', supplierId: 'sup-2', status: ApprovalStatus.APPROVED, approvalHistory: [{ actor: 'Gerente', status: ApprovalStatus.APPROVED, date: new Date('2023-08-10T12:00:00Z').toISOString(), comment: 'Upgrade aprovado.' }] },
      { id: 'm2-2', description: 'Troca de fonte redundante', cost: 850, date: '2024-05-02', supplierId: 'sup-3', status: ApprovalStatus.PENDING, nextApprover: 'Gerente', approvalHistory: [{ actor: 'Técnico', status: ApprovalStatus.PENDING, date: new Date('2024-05-01T10:00:00Z').toISOString(), comment: 'Fonte B apresentou falha.' }] },
    ],
     coordinates: { lat: -23.6033, lng: -46.6944 }
  },
  {
    tenantId: 'mock-tenant-id',
    id: '3',
    name: 'Impressora HP LaserJet Pro',
    type: 'Equipamento de Escritório',
    location: 'Área de Impressão, 2º Andar',
    purchaseDate: '2021-11-05',
    expirationDate: '2026-11-05',
    purchaseValue: 1800,
    status: AssetStatus.IN_REPAIR,
    supplierId: 'sup-3',
    maintenanceHistory: [
      { id: 'm3-1', description: 'Troca do kit de fusão', cost: 450, date: '2023-12-01', supplierId: 'sup-3', status: ApprovalStatus.AUTO_APPROVED, approvalHistory: [{ actor: 'Sistema', status: ApprovalStatus.AUTO_APPROVED, date: new Date('2023-12-01T12:00:00Z').toISOString(), comment: 'Aprovado automaticamente por baixo valor.' }] },
      { id: 'm3-2', description: 'Reparo no alimentador de papel', cost: 300, date: '2024-06-15', supplierId: 'sup-3', status: ApprovalStatus.AUTO_APPROVED, approvalHistory: [{ actor: 'Sistema', status: ApprovalStatus.AUTO_APPROVED, date: new Date('2024-06-15T12:00:00Z').toISOString(), comment: 'Aprovado automaticamente por baixo valor.' }] },
    ],
    documents: [
       { id: 'd3-1', name: 'Garantia Padrão HP.pdf', type: DocumentType.WARRANTY, uploadDate: '2021-11-05', expiryDate: '2022-11-05' }
    ],
    coordinates: { lat: -23.5558, lng: -46.6622 }
  },
  {
    tenantId: 'mock-tenant-id',
    id: '4',
    name: 'Projetor Epson PowerLite',
    type: 'Equipamento Audiovisual',
    location: 'Sala de Reunião 3',
    purchaseDate: '2023-05-30',
    expirationDate: '2028-05-30',
    purchaseValue: 3200,
    status: AssetStatus.IDLE,
    maintenanceHistory: [],
    documents: [
       { id: 'd4-1', name: 'Garantia Epson.pdf', type: DocumentType.WARRANTY, uploadDate: '2023-05-30', expiryDate: getFutureDate(25) }
    ],
    coordinates: { lat: -23.5475, lng: -46.6361 }
  },
];

export const mockSuppliers: Supplier[] = [
    { tenantId: 'mock-tenant-id', id: 'sup-1', name: 'Dell Technologies', category: 'Hardware de TI', email: 'vendas@dell.com', phone: '(11) 4004-0108', contactPerson: 'Ana Lima' },
    { tenantId: 'mock-tenant-id', id: 'sup-2', name: 'HPE Brasil', category: 'Infraestrutura de Rede', email: 'contato@hpe.com', phone: '0800 772 5225' },
    { tenantId: 'mock-tenant-id', id: 'sup-3', name: 'InfoReparo', category: 'Manutenção de TI', email: 'suporte@inforeparo.com', phone: '(11) 5555-1234', contactPerson: 'Carlos Silva' },
    { tenantId: 'mock-tenant-id', id: 'sup-4', name: 'Kalunga', category: 'Material de Escritório', email: 'corporativo@kalunga.com.br', phone: '(11) 3346-9966', contactPerson: 'Marcos Ribeiro'},
];

export const mockStockItems: StockItem[] = [
    { tenantId: 'mock-tenant-id', id: 'stk-1', name: 'Memória RAM 16GB DDR4', sku: 'MEM-DDR4-16G-3200', quantity: 8, location: 'Almoxarifado TI, P-A01', threshold: 5, lastUpdated: new Date().toISOString(), movementHistory: [], batches: [{ id: 'batch-1', lotNumber: 'LOT-001', expiryDate: getFutureDate(365), quantity: 8, entryDate: new Date().toISOString() }] },
    { tenantId: 'mock-tenant-id', id: 'stk-2', name: 'Toner HP 85A', sku: 'HP-TN-85A', quantity: 3, location: 'Almoxarifado Escritório, P-C03', threshold: 5, lastUpdated: new Date().toISOString(), movementHistory: [], batches: [{ id: 'batch-2', lotNumber: 'LOT-002', expiryDate: getFutureDate(180), quantity: 3, entryDate: new Date().toISOString() }] },
    { tenantId: 'mock-tenant-id', id: 'stk-3', name: 'Fonte Redundante 500W DL380', sku: 'HPE-PSU-500W-G10', quantity: 2, location: 'Data Center, Armário 1', threshold: 2, lastUpdated: new Date().toISOString(), movementHistory: [], batches: [{ id: 'batch-3', lotNumber: 'LOT-003', expiryDate: getFutureDate(730), quantity: 2, entryDate: new Date().toISOString() }] }
];

export const mockInvoices: Invoice[] = [
  { tenantId: 'mock-tenant-id', id: 'inv-1', invoiceNumber: 1001, clientName: 'Cliente Exemplo A', issueDate: '2024-06-01T10:00:00Z', dueDate: '2024-06-30T10:00:00Z', items: [{id: 'i1', description: 'Serviço de Consultoria', quantity: 10, unitPrice: 150, total: 1500}], total: 1500, status: InvoiceStatus.PAID },
  { tenantId: 'mock-tenant-id', id: 'inv-2', invoiceNumber: 1002, clientName: 'Cliente Exemplo B', issueDate: '2024-06-15T10:00:00Z', dueDate: '2024-07-15T10:00:00Z', items: [{id: 'i2', description: 'Licença de Software', quantity: 1, unitPrice: 800, total: 800}], total: 800, status: InvoiceStatus.PENDING },
];

export const mockContracts: Contract[] = [
  { tenantId: 'mock-tenant-id', id: 'con-1', name: 'Contrato de Limpeza', supplierId: 'sup-3', category: 'Serviços Gerais', startDate: '2024-01-01T10:00:00Z', endDate: '2024-12-31T10:00:00Z', monthlyValue: 2500, status: ContractStatus.ACTIVE },
  { tenantId: 'mock-tenant-id', id: 'con-2', name: 'Licenciamento Microsoft 365', supplierId: 'sup-1', category: 'Software', startDate: '2023-07-01T10:00:00Z', endDate: '2024-06-30T10:00:00Z', monthlyValue: 1200, status: ContractStatus.EXPIRED },
];

export const mockRequisitions: PurchaseRequisition[] = [
    { tenantId: 'mock-tenant-id', id: 'req-1', requesterName: 'Carlos Silva', requestDate: '2024-06-20T14:00:00Z', items: [{description: 'Toner HP 85A', quantity: 5, stockItemId: 'stk-2'}], status: RequisitionStatus.APPROVED, justification: 'Estoque baixo, urgente.' },
    { tenantId: 'mock-tenant-id', id: 'req-2', requesterName: 'Mariana Costa', requestDate: '2024-06-22T10:30:00Z', items: [{description: 'Mouse sem fio', quantity: 10}, {description: 'Teclado ABNT2', quantity: 10}], status: RequisitionStatus.PENDING, justification: 'Novos postos de trabalho.' },
];

export const mockOrders: PurchaseOrder[] = [
    { tenantId: 'mock-tenant-id', id: 'po-1', requisitionId: 'req-1', supplierId: 'sup-4', orderDate: '2024-06-21T11:00:00Z', items: [{description: 'Toner HP 85A', quantity: 5, stockItemId: 'stk-2', unitPrice: 90, totalPrice: 450}], totalValue: 450, status: PurchaseStatus.SENT, receivedItems: [] },
];

export const mockCompanyDocuments: CompanyDocument[] = [];
export const mockStockCounts: StockCount[] = [];
export const mockUsers: User[] = [
    { uid: 'user-1', name: 'Carlos Silva', email: 'carlos.silva@example.com', role: 'manager', tenantId: 'mock-tenant-id', status: 'active' },
    { uid: 'user-2', name: 'Mariana Costa', email: 'mariana.costa@example.com', role: 'user', tenantId: 'mock-tenant-id', status: 'active' },
    { uid: 'user-3', name: 'João Pereira', email: 'joao.pereira@example.com', role: 'user', tenantId: 'mock-tenant-id', status: 'invited' },
];