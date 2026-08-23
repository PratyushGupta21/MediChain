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
  pending_verification: 'Awaiting Review',
  approved: 'Approved',
  rejected: 'Rejected',
  donated: 'Donated',
  requested: 'Allocation Requested',
  pickup_scheduled: 'Pickup Scheduled',
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
    <label className="block space-y-1.5 text-xs font-sans">
      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 font-sans"
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
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end font-sans">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
          {eyebrow}
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 font-sans">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config =
    status === 'approved' || status === 'incinerated'
      ? ['bg-emerald-50 text-emerald-700 border-emerald-200', statusLabels[status] ?? 'Approved']
      : status === 'rejected' || status === 'disposed'
        ? ['bg-red-50 text-red-700 border-red-200', statusLabels[status] ?? 'Rejected']
        : status === 'pickup_scheduled' || status === 'requested'
          ? ['bg-amber-50 text-amber-700 border-amber-200', statusLabels[status] ?? status]
          : [
              'bg-slate-100 text-slate-700 border-slate-200',
              statusLabels[status] ?? status,
            ];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config[0]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config[1]}
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
  tone?: 'gold' | 'safe' | 'warning' | 'hazard';
}) {
  const color =
    tone === 'safe'
      ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
      : tone === 'warning'
        ? 'text-amber-700 border-amber-200 bg-amber-50'
        : tone === 'hazard'
          ? 'text-red-700 border-red-200 bg-red-50'
          : 'text-blue-700 border-blue-200 bg-blue-50';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${color}`}>
          <Icon className="h-5 w-5" />
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
    <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center font-sans">
      <Icon className="mx-auto h-8 w-8 text-slate-400" />
      <h3 className="mt-4 font-bold text-slate-900 text-base">{title}</h3>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
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
  const days = getDaysUntilExpiry(medicine.expiryDate);
  const isExpired = days < 0;

  return (
    <motion.div
      layout
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-sans flex flex-col justify-between"
    >
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">{medicine.brandName}</h3>
            <p className="mt-0.5 text-xs text-slate-600">{medicine.genericName}</p>
          </div>
          <StatusBadge status={medicine.status} />
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1 font-sans">
          <div className="flex justify-between text-[11px] text-slate-600 uppercase font-semibold">
            <span>FEFO Expiry Window</span>
            <span className={days > 60 ? 'text-emerald-700 font-bold' : days >= 30 ? 'text-amber-700 font-bold' : 'text-red-700 font-bold'}>
              {days < 0 ? 'EXPIRED' : `${days} DAYS REMAINING`}
            </span>
          </div>
          <p className="text-slate-800 font-mono text-xs">Batch: <span className="font-bold">{medicine.batchNumber}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-sans">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-medium">Quantity</span>
            <p className="font-bold text-slate-900">{medicine.quantity} units</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-medium">Expires</span>
            <p className="text-slate-800 font-semibold">{formatDate(medicine.expiryDate)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4 font-sans text-xs">
        {medicine.status === 'logged' && (
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-2 transition-colors shadow-sm"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Submit for CDSCO Verification
          </Button>
        )}
        {medicine.status === 'approved' && !isExpired && (
          <Button
            size="sm"
            onClick={onDonate}
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg py-2 transition-colors shadow-md shadow-emerald-600/20"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <HeartHandshake className="h-4 w-4 mr-1.5" />}
            Donate to NGO
          </Button>
        )}
        {medicine.status === 'approved' && isExpired && (
          <Button
            size="sm"
            onClick={onPickup}
            disabled={busy}
            className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg py-2 transition-colors"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Truck className="h-4 w-4 mr-1.5 text-amber-600" />}
            Schedule Bio-Clean Pickup
          </Button>
        )}
      </div>
    </motion.div>
  );
}
