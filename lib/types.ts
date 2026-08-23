export type Persona = 'household' | 'pharmacist' | 'ngo' | 'waste';

export type FefoStatus = 'safe' | 'warning' | 'hazard';

export type MedicineStatus =
  | 'logged'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'donated'
  | 'requested'
  | 'allocated'
  | 'pickup_scheduled'
  | 'disposed';

// Database status values (uppercase)
export type DbMedicineStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUESTED'
  | 'PICKUP_SCHEDULED'
  | 'DISPOSED';

export type DbWasteStatus = 'PICKUP_PENDING' | 'INCINERATED';

export type DbRole = 'HOUSEHOLD' | 'PHARMACIST' | 'NGO' | 'WASTE_COLLECTOR';

export interface User {
  id: string;
  persona: Persona;
  name: string;
  email: string;
  walletAddress: string;
  organization?: string;
  avatarColor: string;
}

export interface MedicineBatch {
  id: string;
  brandName: string;
  genericName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  ownerId: string;
  ownerName: string;
  status: MedicineStatus;
  loggedAt: string;
  verifiedAt?: string;
  txHash?: string;
  requestedBy?: string;
  requestedQuantity?: number;
  pickupId?: string;
}

export interface WasteManifest {
  id: string;
  batchId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  pickupAddress: string;
  status: 'pickup_pending' | 'incinerated';
  scheduledAt: string;
  completedAt?: string;
  operatorId?: string;
  routeId: string;
  temperature?: number;
}

// Database row types
export interface ProfileRow {
  id: string;
  email: string;
  role: DbRole;
  full_name: string | null;
  created_at: string;
}

export interface MedicineRow {
  id: string;
  user_id: string;
  brand_name: string;
  generic_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  status: DbMedicineStatus;
  tx_hash: string | null;
  requested_by: string | null;
  requested_quantity: number | null;
  pickup_id: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface WasteRow {
  id: string;
  batch_id: string | null;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  pickup_address: string;
  status: DbWasteStatus;
  route_id: string | null;
  operator_id: string | null;
  temperature: number | null;
  completed_at: string | null;
  created_at: string;
}
