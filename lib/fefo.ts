import { differenceInCalendarDays } from 'date-fns';
import type { FefoStatus } from './types';

export function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInCalendarDays(new Date(expiryDate), new Date());
}

export function getFefoStatus(expiryDate: string): FefoStatus {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 30) return 'hazard';
  if (days <= 60) return 'warning';
  return 'safe';
}

export function getFefoLabel(status: FefoStatus): string {
  switch (status) {
    case 'safe':
      return 'Safe for NGO Donation';
    case 'warning':
      return 'Priority Redistribution';
    case 'hazard':
      return 'Bio-Hazardous Waste Pick-up';
  }
}

export function getFefoColorClasses(status: FefoStatus): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (status) {
    case 'safe':
      return {
        bg: 'bg-safe',
        text: 'text-safe-foreground',
        border: 'border-safe',
        glow: 'glow-safe',
      };
    case 'warning':
      return {
        bg: 'bg-warning',
        text: 'text-warning-foreground',
        border: 'border-warning',
        glow: 'glow-warning',
      };
    case 'hazard':
      return {
        bg: 'bg-hazard',
        text: 'text-hazard-foreground',
        border: 'border-hazard',
        glow: 'glow-hazard',
      };
  }
}

export async function generateTxHash(batchId?: string, batchNumber?: string): Promise<string> {
  // Simulate realistic Web3 smart contract execution delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const domain = 'MediChain Ledger Protocol (EIP-712)';
  const payload = `${domain}:${batchId || 'batch'}:${batchNumber || '0'}:${Date.now()}`;

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return `0x${hexHash}`;
    } catch {
      // Fallback if subtle crypto is unavailable
    }
  }

  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateQRData(batchId: string, txHash: string): string {
  return `MEDICHAIN://verify?batch=${batchId}&tx=${txHash}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
