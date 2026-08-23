import type { Persona, DbRole, MedicineStatus, DbMedicineStatus } from './types';

const PERSONA_TO_ROLE: Record<Persona, DbRole> = {
  household: 'HOUSEHOLD',
  pharmacist: 'PHARMACIST',
  ngo: 'NGO',
  waste: 'WASTE_COLLECTOR',
};

const ROLE_TO_PERSONA: Record<DbRole, Persona> = {
  HOUSEHOLD: 'household',
  PHARMACIST: 'pharmacist',
  NGO: 'ngo',
  WASTE_COLLECTOR: 'waste',
};

const DB_TO_APP_STATUS: Record<DbMedicineStatus, MedicineStatus> = {
  PENDING: 'pending_verification',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUESTED: 'requested',
  PICKUP_SCHEDULED: 'pickup_scheduled',
  DISPOSED: 'disposed',
};

const APP_TO_DB_STATUS: Record<MedicineStatus, DbMedicineStatus> = {
  logged: 'PENDING',
  pending_verification: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  requested: 'REQUESTED',
  allocated: 'REQUESTED',
  pickup_scheduled: 'PICKUP_SCHEDULED',
  disposed: 'DISPOSED',
  donated: 'APPROVED',
};

export function personaToRole(persona: Persona): DbRole {
  return PERSONA_TO_ROLE[persona];
}

export function roleToPersona(role: DbRole): Persona {
  return ROLE_TO_PERSONA[role];
}

export function dbToAppStatus(status: DbMedicineStatus): MedicineStatus {
  return DB_TO_APP_STATUS[status];
}

export function appToDbStatus(status: MedicineStatus): DbMedicineStatus {
  return APP_TO_DB_STATUS[status];
}
