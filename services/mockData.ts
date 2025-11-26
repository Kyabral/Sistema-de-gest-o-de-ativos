

import { Asset, AssetStatus, DocumentType, ApprovalStatus } from '../types';

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
    ]
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
    ]
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
    supplierId: 'sup-2',
    maintenanceHistory: [
      { id: 'm3-1', description: 'Troca do kit de fusão', cost: 450, date: '2023-12-01', supplierId: 'sup-3', status: ApprovalStatus.AUTO_APPROVED, approvalHistory: [{ actor: 'Sistema', status: ApprovalStatus.AUTO_APPROVED, date: new Date('2023-12-01T12:00:00Z').toISOString(), comment: 'Aprovado automaticamente por baixo valor.' }] },
      { id: 'm3-2', description: 'Reparo no alimentador de papel', cost: 300, date: '2024-06-15', supplierId: 'sup-3', status: ApprovalStatus.AUTO_APPROVED, approvalHistory: [{ actor: 'Sistema', status: ApprovalStatus.AUTO_APPROVED, date: new Date('2024-06-15T12:00:00Z').toISOString(), comment: 'Aprovado automaticamente por baixo valor.' }] },
    ],
    documents: [
       { id: 'd3-1', name: 'Garantia Padrão HP.pdf', type: DocumentType.WARRANTY, uploadDate: '2021-11-05', expiryDate: '2022-11-05' } // Expired warranty
    ]
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
       { id: 'd4-1', name: 'Garantia Epson.pdf', type: DocumentType.WARRANTY, uploadDate: '2023-05-30', expiryDate: getFutureDate(25) } // Warranty expiring soon
    ]
  },
  {
    tenantId: 'mock-tenant-id',
    id: '5',
    name: 'Estação de Trabalho HP Z4',
    type: 'Equipamento de TI',
    location: 'Departamento de Engenharia, Mesa 5',
    purchaseDate: '2022-08-12',
    expirationDate: '2027-08-12',
    purchaseValue: 12000,
    status: AssetStatus.ACTIVE,
    supplierId: 'sup-2',
    maintenanceHistory: [
       { id: 'm5-1', description: 'Instalação de placa de vídeo NVIDIA RTX A4000', cost: 6000, date: '2023-02-25', supplierId: 'sup-1', status: ApprovalStatus.APPROVED, approvalHistory: [{ actor: 'Diretor', status: ApprovalStatus.APPROVED, date: new Date('2023-02-25T12:00:00Z').toISOString(), comment: 'Aprovado.' }] },
    ],
  },
  {
    tenantId: 'mock-tenant-id',
    id: '6',
    name: 'Tablet Samsung Galaxy Tab S8',
    type: 'Equipamento de TI',
    location: 'Em posse de: Gerente de Vendas',
    purchaseDate: '2023-09-01',
    expirationDate: '2028-09-01',
    purchaseValue: 4500,
    status: AssetStatus.ACTIVE,
    maintenanceHistory: [],
  },
  {
    tenantId: 'mock-tenant-id',
    id: '7',
    name: 'Roteador Cisco Catalyst 9120',
    type: 'Infraestrutura de Rede',
    location: 'Ponto de Acesso - 3º Andar',
    purchaseDate: '2022-06-18',
    expirationDate: '2027-06-18',
    purchaseValue: 3800,
    status: AssetStatus.DECOMMISSIONED,
    maintenanceHistory: [
      { id: 'm7-1', description: 'Atualização de firmware', cost: 150, date: '2023-10-10', supplierId: 'sup-3', status: ApprovalStatus.AUTO_APPROVED, approvalHistory: [{ actor: 'Sistema', status: ApprovalStatus.AUTO_APPROVED, date: new Date('2023-10-10T12:00:00Z').toISOString(), comment: 'Aprovado automaticamente por baixo valor.' }] },
    ],
  },
];