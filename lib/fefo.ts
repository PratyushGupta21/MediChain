import { differenceInCalendarDays } from 'date-fns';
import type { FefoStatus } from './types';

export function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInCalendarDays(new Date(expiryDate), new Date());
}

export function getFefoStatus(expiryDate: string): FefoStatus {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'hazard';
  if (days < 30) return 'warning';
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

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 8; i++) hash += chars[Math.floor(Math.random() * 16)];
  hash += '...';
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)];
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
