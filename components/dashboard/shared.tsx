'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  getDaysUntilExpiry,
  getFefoColorClasses,
  getFefoLabel,
  getFefoStatus,
  formatDate,
} from '@/lib/fefo';
import type { MedicineBatch } from '@/lib/types';
import {
  ArrowRight,
  HeartHandshake,
  Loader2,
  Package,
  Search,
  Truck,
} from 'lucide-react';

export const statusLabels: Record<string, string> = {
  logged: 'Logged',
  pending_verification: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Rejected',
  donated: 'Donated',
  requested: 'Allocation requested',
  pickup_scheduled: 'Pickup scheduled',
  disposed: 'Disposed',
  incinerated: 'Incinerated',
};

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-gold"
      />
    </label>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config =
    status === 'approved' || status === 'incinerated'
      ? ['bg-safe', 'text-safe-foreground', statusLabels[status] ?? 'Approved']
      : status === 'rejected'
        ? ['bg-hazard', 'text-hazard-foreground', 'Rejected']
        : [
            'bg-warning',
            'text-warning-foreground',
            statusLabels[status] ?? status,
          ];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${config[0]} ${config[1]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config[2]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'gold',
}: {
  label: string;
  value: number;
  icon: typeof Package;
  tone?: 'gold' | 'safe' | 'warning';
}) {
  const color =
    tone === 'safe'
      ? 'text-safe-foreground bg-safe'
      : tone === 'warning'
        ? 'text-warning-foreground bg-warning'
        : 'text-gold bg-gold/15';
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function MedicineCard({
  medicine,
  onDonate,
  onPickup,
  onSubmit,
  busy,
}: {
  medicine: MedicineBatch;
  onDonate: () => void;
  onPickup: () => void;
  onSubmit: () => void;
  busy?: boolean;
}) {
  const fefo = getFefoStatus(medicine.expiryDate);
  const colors = getFefoColorClasses(fefo);
  const days = getDaysUntilExpiry(medicine.expiryDate);
  const isExpired = days < 0;
  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      className={`group rounded-xl border bg-card p-5 transition-all hover:border-gold/50 ${colors.border}/40`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{medicine.brandName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {medicine.genericName}
          </p>
        </div>
        <StatusBadge status={medicine.status} />
      </div>
      <div className="mb-4 rounded-lg border border-border bg-secondary/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">FEFO classification</span>
          <span className={`h-2 w-2 rounded-full ${colors.bg}`} />
        </div>
        <p className={`mt-1 text-xs font-semibold ${colors.text}`}>
          {isExpired ? 'Expired' : `${days} days remaining`}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {getFefoLabel(fefo)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Batch number</p>
          <p className="mt-1 font-mono text-foreground">{medicine.batchNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Quantity</p>
          <p className="mt-1 text-foreground">{medicine.quantity} units</p>
        </div>
        <div>
          <p className="text-muted-foreground">Expires</p>
          <p className="mt-1 text-foreground">{formatDate(medicine.expiryDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Logged</p>
          <p className="mt-1 text-foreground">{formatDate(medicine.loggedAt)}</p>
        </div>
      </div>
      {(medicine.status === 'logged' ||
        medicine.status === 'approved' ||
        medicine.status === 'pending_verification') && (
        <div className="mt-5 flex gap-2 border-t border-border pt-4">
          {busy ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
            </div>
          ) : isExpired ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onPickup}
              className="flex-1 border-hazard text-hazard hover:bg-hazard/20"
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" />
              Schedule Pickup
            </Button>
          ) : medicine.status === 'approved' ? (
            <Button
              size="sm"
              onClick={onDonate}
              className="flex-1 bg-safe text-safe-foreground hover:bg-safe/80"
            >
              <HeartHandshake className="mr-1.5 h-3.5 w-3.5" />
              Donate to NGO
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSubmit}
              className="flex-1 bg-gold text-charcoal hover:bg-gold/90"
            >
              <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
              Submit for review
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
