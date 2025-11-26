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

// FIX: Added AssetComponent interface for type consistency.
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

export interface Asset {
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
  // FIX: Added 'components' property for type consistency.
  components?: AssetComponent[];
  coordinates?: { lat: number; lng: number; };
  healthScore?: number;
  images?: { name: string; url: string }[];
  serialNumber?: string;
  vehiclePlate?: string;
  vehicleRenavam?: string;
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

export interface UserRegistrationData {
  name: string;
  email: string;
  password?: string;
  companyName: string;
  phone?: string;
}

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}