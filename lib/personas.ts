import type { Persona, DbRole } from './types';

export const PERSONA_PRESETS: {
  persona: Persona;
  role: DbRole;
  roleLabel: string;
  name: string;
  organization: string;
  walletAddress: string;
  avatarColor: string;
}[] = [
  {
    persona: 'household',
    role: 'HOUSEHOLD',
    roleLabel: 'Household / Donor',
    name: 'Aarav Sharma',
    organization: 'Household',
    walletAddress: '0x4A2b3C...8eF9',
    avatarColor: '#C29B72',
  },
  {
    persona: 'pharmacist',
    role: 'PHARMACIST',
    roleLabel: 'Pharmacist / CDSCO Inspector',
    name: 'Dr. Priya Menon',
    organization: 'CDSCO Regional Office',
    walletAddress: '0x7F1c9D...3aB2',
    avatarColor: '#3A4027',
  },
  {
    persona: 'ngo',
    role: 'NGO',
    roleLabel: 'NGO Healthcare Partner',
    name: 'Kavya Reddy',
    organization: 'MedAid Foundation',
    walletAddress: '0x2E8d4A...9cC1',
    avatarColor: '#8D321F',
  },
  {
    persona: 'waste',
    role: 'WASTE_COLLECTOR',
    roleLabel: 'Waste & Incineration Operator',
    name: 'Rohan Gupta',
    organization: 'BioClean Disposals',
    walletAddress: '0x9B3f7E...1dD4',
    avatarColor: '#710014',
  },
];
