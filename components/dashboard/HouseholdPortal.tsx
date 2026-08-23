'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import type { MedicineBatch } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  StatCard,
  EmptyState,
  MedicineCard,
  Field,
} from './shared';
import {
  Check,
  HeartHandshake,
  Loader2,
  MapPin,
  Package,
  Plus,
  Truck,
  X,
} from 'lucide-react';

export default function HouseholdPortal() {
  const { user, medicines, addMedicine, donateToNgo, schedulePickup, submitForVerification } =
    useApp();
  const [showForm, setShowForm] = useState(false);
  const [pickupTarget, setPickupTarget] = useState<MedicineBatch | null>(null);
  const [pickupAddressInput, setPickupAddressInput] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    brandName: '',
    genericName: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
  });

  const owned = medicines.filter((m) => m.ownerId === user?.id);
  const active = owned.filter((m) => m.status !== 'disposed').length;
  const donated = owned.filter((m) =>
    ['approved', 'donated', 'requested', 'allocated'].includes(m.status)
  ).length;
  const scheduled = owned.filter((m) => m.status === 'pickup_scheduled').length;

  const update =
    (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brandName || !form.genericName || !form.batchNumber || !form.expiryDate || !form.quantity)
      return;
    await addMedicine({
      brandName: form.brandName,
      genericName: form.genericName,
      batchNumber: form.batchNumber,
      expiryDate: form.expiryDate,
      quantity: Number(form.quantity),
    });
    setForm({ brandName: '', genericName: '', batchNumber: '', expiryDate: '', quantity: '' });
    setShowForm(false);
  }

  async function handleAction(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    await fn();
    setBusyId(null);
  }

  async function confirmPickupSchedule() {
    if (!pickupTarget) return;
    setBusyId(pickupTarget.id);
    await schedulePickup(pickupTarget.id, pickupAddressInput);
    setBusyId(null);
    setPickupTarget(null);
    setPickupAddressInput('');
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Personal inventory"
        title="Household Portal"
        description="Log, donate, and safely dispose of medicines from your home."
        action={
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gold text-charcoal hover:bg-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Log unused medicine
          </Button>
        }
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total active medicines" value={active} icon={Package} />
        <StatCard label="Donation-ready batches" value={donated} icon={HeartHandshake} tone="safe" />
        <StatCard label="Scheduled disposal" value={scheduled} icon={Truck} tone="warning" />
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-gold/50 bg-card p-5 glow-gold">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Log unused medicine</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Add batch details to begin the FEFO lifecycle.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name" value={form.brandName} onChange={update('brandName')} placeholder="e.g. Dolo 650" />
            <Field label="Generic name" value={form.genericName} onChange={update('genericName')} placeholder="e.g. Paracetamol 650mg" />
            <Field label="Batch number" value={form.batchNumber} onChange={update('batchNumber')} placeholder="e.g. DOL-2024-0567" />
            <Field label="Expiry date" type="date" value={form.expiryDate} onChange={update('expiryDate')} />
            <Field label="Quantity (units)" type="number" value={form.quantity} onChange={update('quantity')} placeholder="e.g. 20" />
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-gold text-charcoal hover:bg-gold/90">
                <Check className="mr-2 h-4 w-4" />
                Save to inventory
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Medicine inventory</h2>
        <span className="text-xs text-muted-foreground">
          {owned.length} batches · FEFO prioritized
        </span>
      </div>
      {owned.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No medicines logged yet"
          description="Click 'Log unused medicine' to add your first batch."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {owned.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              busy={busyId === medicine.id}
              onDonate={() => handleAction(medicine.id, () => donateToNgo(medicine.id))}
              onPickup={() => {
                setPickupTarget(medicine);
                setPickupAddressInput('');
              }}
              onSubmit={() => handleAction(medicine.id, () => submitForVerification(medicine.id))}
            />
          ))}
        </div>
      )}

      {/* Schedule Waste Pickup Modal with Address Field */}
      {pickupTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-warning/60 bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
                  <Truck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Schedule Bio-Hazard Pickup</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Specify pickup location for {pickupTarget.brandName} (Batch #{pickupTarget.batchNumber}).
                </p>
              </div>
              <button
                onClick={() => setPickupTarget(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  Pickup Address
                </span>
                <textarea
                  rows={3}
                  value={pickupAddressInput}
                  onChange={(e) => setPickupAddressInput(e.target.value)}
                  placeholder="e.g. Flat 402, Green Valley Apartments, MG Road, Bengaluru - 560001"
                  className="w-full rounded-lg border border-border bg-secondary/60 p-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </label>

              <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
                <p>
                  <b className="text-foreground">Note:</b> Bio-Clean Disposals will assign a sealed container transport route to collect this hazardous batch.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPickupTarget(null)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPickupSchedule}
                disabled={busyId === pickupTarget.id || !pickupAddressInput.trim()}
                className="bg-warning text-warning-foreground hover:bg-warning/90"
              >
                {busyId === pickupTarget.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Confirm Pickup Route
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
