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
    <label className="block space-y-1.5 font-mono text-xs">
      <span className="text-[10px] uppercase font-bold text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs text-[#F8FAFC] outline-none transition focus:border-amber-500 font-sans"
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
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-700/60 pb-6 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
          [{eyebrow}]
        </p>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">{title}</h1>
        <p className="mt-1 text-xs font-mono text-slate-300">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config =
    status === 'approved' || status === 'incinerated'
      ? ['border-emerald-500/50 bg-emerald-950/60 text-emerald-300', statusLabels[status] ?? 'Approved']
      : status === 'rejected' || status === 'disposed'
        ? ['border-red-500/50 bg-red-950/60 text-red-300', statusLabels[status] ?? 'Rejected']
        : status === 'pickup_scheduled' || status === 'requested'
          ? ['border-amber-500/60 bg-amber-950/60 text-amber-300', statusLabels[status] ?? status]
          : [
              'border-slate-600 bg-slate-800 text-slate-200',
              statusLabels[status] ?? status,
            ];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${config[0]}`}
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
      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40'
      : tone === 'warning'
        ? 'text-amber-300 border-amber-500/40 bg-amber-950/40'
        : tone === 'hazard'
          ? 'text-red-300 border-red-500/40 bg-red-950/40'
          : 'text-slate-100 border-slate-700 bg-slate-800/80';
  return (
    <div className="rounded-sm border border-slate-700/60 bg-[#1B1E26] p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">{label}</p>
          <p className="mt-2 text-3xl font-extrabold font-mono tracking-tight text-[#F8FAFC]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-sm border ${color}`}>
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
    <div className="mt-6 rounded-sm border border-dashed border-slate-700/60 bg-[#1B1E26] p-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-slate-400" />
      <h3 className="mt-4 font-bold uppercase text-[#F8FAFC]">{title}</h3>
      <p className="mt-1 text-xs font-mono text-slate-300">{description}</p>
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
      whileHover={{ y: -2 }}
      className="group rounded-sm border border-slate-700/60 bg-[#1B1E26] p-5 transition-all hover:border-slate-500 shadow-xl relative flex flex-col justify-between"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div>
            <h3 className="font-bold uppercase text-[#F8FAFC] text-base">{medicine.brandName}</h3>
            <p className="mt-0.5 text-xs font-mono text-slate-300">
              {medicine.genericName}
            </p>
          </div>
          <StatusBadge status={medicine.status} />
        </div>
        <div className="mb-4 border border-slate-700/60 bg-[#0D0F12] p-3 font-mono text-xs rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold">FEFO Index</span>
            <span className="text-[10px] uppercase font-bold text-amber-400">{getFefoLabel(fefo)}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-[#F8FAFC]">
            {isExpired ? 'EXPIRED (<30D HAZARD)' : `${days} DAYS REMAINING`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Batch ID</p>
            <p className="mt-1 font-bold text-[#F8FAFC]">{medicine.batchNumber}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Quantity</p>
            <p className="mt-1 font-bold text-[#F8FAFC]">{medicine.quantity} UNITS</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Expires</p>
            <p className="mt-1 text-slate-300">{formatDate(medicine.expiryDate)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Logged</p>
            <p className="mt-1 text-slate-300">{formatDate(medicine.loggedAt)}</p>
          </div>
        </div>
      </div>

      {(medicine.status === 'logged' ||
        medicine.status === 'approved' ||
        medicine.status === 'pending_verification') && (
        <div className="mt-6 flex gap-2 border-t border-slate-700/60 pt-4 font-mono text-xs">
          {busy ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-xs font-mono text-slate-300 font-bold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> PROCESSING...
            </div>
          ) : isExpired || fefo === 'hazard' ? (
            <Button
              size="sm"
              onClick={onPickup}
              className="flex-1 rounded-sm border border-red-500/60 bg-red-950/80 text-red-300 hover:bg-red-900 font-bold uppercase text-xs shadow-md"
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" />
              Schedule Pickup
            </Button>
          ) : medicine.status === 'approved' ? (
            <Button
              size="sm"
              onClick={onDonate}
              className="flex-1 rounded-sm border border-emerald-500/60 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 font-bold uppercase text-xs shadow-md"
            >
              <HeartHandshake className="mr-1.5 h-3.5 w-3.5" />
              Donate to NGO
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSubmit}
              className="flex-1 rounded-sm border border-amber-500 bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold uppercase text-xs shadow-md"
            >
              <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
              Submit Review
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
