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

export const ROLE_DISPLAY_NAMES: Record<DbRole, string> = {
  HOUSEHOLD: 'HOUSEHOLD DONOR',
  PHARMACIST: 'CDSCO INSPECTOR',
  NGO: 'NGO PARTNER',
  WASTE_COLLECTOR: 'WASTE OPERATOR',
};

export const PERSONA_ROLES: Record<Persona, DbRole> = {
  household: 'HOUSEHOLD',
  pharmacist: 'PHARMACIST',
  ngo: 'NGO',
  waste: 'WASTE_COLLECTOR',
};

export interface User {
  id: string;
  persona: Persona;
  role: DbRole;
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

export interface MedicineRow {
  id: string;
  user_id: string;
  donor_id?: string | null;
  brand_name: string;
  name?: string | null;
  generic_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  unit?: string | null;
  fefo_status?: 'SAFE' | 'WARNING' | 'EXPIRED' | null;
  cdsco_verified?: boolean | null;
  qr_code_hash?: string | null;
  current_location?: string | null;
  status: DbMedicineStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  tx_hash?: string | null;
  requested_by?: string | null;
  requested_quantity?: number | null;
  pickup_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface WasteRow {
  id: string;
  batch_id?: string | null;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  pickup_address: string;
  status: DbWasteStatus;
  operator_id?: string | null;
  collector_id?: string | null;
  color_code?: string | null;
  weight_kg?: number | null;
  waste_type?: string | null;
  origin_facility?: string | null;
  disposal_facility?: string | null;
  primary_temp_c?: number | null;
  secondary_temp_c?: number | null;
  temperature?: number | null;
  route_id?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProfileRow {
  id: string;
  email?: string | null;
  full_name: string | null;
  role: DbRole;
  created_at: string;
  updated_at?: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface RequisitionRow {
  id: string;
  ngo_id: string;
  medicine_id: string;
  requested_quantity: number;
  status: 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'REJECTED';
  created_at: string;
}
