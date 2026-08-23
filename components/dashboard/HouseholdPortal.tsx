'use client';

import React, { useState } from 'react';
import { Gs1CameraScanner } from '@/components/gs1-camera-scanner';
import { ParsedGs1Data } from '@/lib/gs1-parser';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import type { MedicineBatch } from '@/lib/types';
import { getDaysUntilExpiry, getFefoStatus, formatDate } from '@/lib/fefo';
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
  Sparkles,
  Camera,
  Bell,
  Trash2,
  ShieldAlert,
  Calendar,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

const WASTE_CATEGORIES = [
  {
    category: 'HAZARDOUS BIO-MEDICAL',
    color: 'border-red-800/50 bg-red-950/40 text-red-300',
    icon: ShieldAlert,
    rule: 'Expired antibiotics, cytotoxic drugs, controlled hormones.',
    action: 'Requires 850°C high-temperature incineration. Schedule Bio-Clean pickup.',
  },
  {
    category: 'LIQUID / SYRUP QUARANTINE',
    color: 'border-amber-800/50 bg-amber-950/40 text-amber-300',
    icon: Trash2,
    rule: 'Liquid suspensions, cough syrups, eye drops past 30 days of opening.',
    action: 'Mix with absorbent material (coffee grounds/sand) in sealed container prior to disposal.',
  },
  {
    category: 'GENERAL NON-TOXIC SOLID',
    color: 'border-emerald-800/50 bg-emerald-950/40 text-emerald-300',
    icon: CheckCircle2,
    rule: 'Over-the-counter vitamins, minerals, antacids with >60d remaining.',
    action: 'Eligible for NGO donation or municipal safe solid waste stream.',
  },
];

const REMINDER_PRESETS = [
  { id: '1', medicine: 'Amoxicillin 500mg', time: '08:00 AM & 08:00 PM', daysLeft: 42, active: true },
  { id: '2', medicine: 'Metformin 850mg', time: '01:00 PM (Post Lunch)', daysLeft: 85, active: true },
  { id: '3', medicine: 'Paracetamol 650mg', time: 'As needed (Max 3/day)', daysLeft: 12, active: false },
];

export default function HouseholdPortal() {
  const { user, medicines, addMedicine, donateToNgo, schedulePickup, submitForVerification } =
    useApp();
  const [showForm, setShowForm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'inventory' | 'reminders' | 'waste_guide'>('inventory');
  const [pickupTarget, setPickupTarget] = useState<MedicineBatch | null>(null);
  const [pickupAddressInput, setPickupAddressInput] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reminders, setReminders] = useState(REMINDER_PRESETS);

  const [form, setForm] = useState({
    brandName: '',
    genericName: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
  });

  const owned = medicines.filter((m) => m.ownerId === user?.id || !m.ownerId);
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

  function handleScanSuccess(data: ParsedGs1Data) {
    setForm({
      brandName: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin + Clavulanate',
      batchNumber: data.batchNumber,
      expiryDate: data.expiryDate,
      quantity: '10',
    });
    setShowAiModal(false);
    setShowForm(true);
  }

  async function confirmPickupSchedule() {
    if (!pickupTarget) return;
    setBusyId(pickupTarget.id);
    await schedulePickup(pickupTarget.id, pickupAddressInput);
    setBusyId(null);
    setPickupTarget(null);
    setPickupAddressInput('');
  }

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-8 font-sans">
      <SectionHeader
        eyebrow="Personal Inventory &amp; Packaging Scan"
        title="Household Portal"
        description="Catalog unused medicines with GS1 DataMatrix camera parsing, monitor FEFO timelines, and donate to NGOs."
        action={
          <div className="flex gap-2 text-xs font-sans">
            <Button
              onClick={() => setShowAiModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-sm"
            >
              <Camera className="mr-2 h-4 w-4" />
              GS1 Camera Scan
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Unused Medicine
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Active Medicines" value={active} icon={Package} tone="gold" />
        <StatCard label="Donation-Ready Batches" value={donated} icon={HeartHandshake} tone="safe" />
        <StatCard label="Scheduled Disposals" value={scheduled} icon={Truck} tone="warning" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#22304A] text-xs font-sans">
        <button
          onClick={() => setActiveTabSection('inventory')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'inventory'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Medicine Inventory ({owned.length})
        </button>
        <button
          onClick={() => setActiveTabSection('reminders')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'reminders'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Reminders Engine ({reminders.filter((r) => r.active).length})
        </button>
        <button
          onClick={() => setActiveTabSection('waste_guide')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'waste_guide'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Smart Waste Classifier
        </button>
      </div>

      {/* GS1 Live Scanner Modal */}
      {showAiModal && (
        <Gs1CameraScanner
          title="Household Packaging Scanner"
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* Manual Entry Form */}
      {showForm && (
        <div className="rounded-xl border border-[#22304A] bg-[#131C31] p-6 shadow-sm text-xs font-sans">
          <div className="mb-5 flex items-center justify-between border-b border-[#22304A] pb-3">
            <div>
              <h2 className="font-semibold text-base text-slate-100">Log Unused Medicine Batch</h2>
              <p className="mt-0.5 text-slate-400 text-xs font-sans">
                Enter packaging details to compute FEFO urgency and ledger validation.
              </p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand Name" value={form.brandName} onChange={update('brandName')} placeholder="e.g. Augmentin 625 Duo" />
            <Field label="Generic Formula" value={form.genericName} onChange={update('genericName')} placeholder="e.g. Amoxicillin + Clavulanate" />
            <Field label="Batch Number" value={form.batchNumber} onChange={update('batchNumber')} placeholder="e.g. BATCH-2026-99" />
            <Field label="Expiry Date" type="date" value={form.expiryDate} onChange={update('expiryDate')} />
            <Field label="Quantity (Units)" type="number" value={form.quantity} onChange={update('quantity')} placeholder="e.g. 10" />
            <div className="flex items-end justify-end gap-3 sm:col-span-2 pt-2 font-sans">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-[#0B1120] hover:bg-[#1C2845] text-slate-200 border border-[#22304A] rounded-lg">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2">
                Log Batch Entry
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 1: INVENTORY */}
      {activeTabSection === 'inventory' && (
        <div>
          {owned.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No medicines logged in your vault"
              description="Click 'Log Unused Medicine' or use the GS1 Camera Scan to catalog your surplus medicines."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {owned.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  busy={busyId === medicine.id}
                  onDonate={() => donateToNgo(medicine.id)}
                  onPickup={() => setPickupTarget(medicine)}
                  onSubmit={() => submitForVerification(medicine.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: REMINDERS ENGINE */}
      {activeTabSection === 'reminders' && (
        <div className="rounded-xl border border-[#22304A] bg-[#131C31] p-6 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-[#22304A] pb-3">
            <div>
              <h3 className="font-semibold text-base text-slate-100">Automated Dosage &amp; Expiration Reminders</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Configured push notifications for daily dosage and upcoming FEFO dispatch alerts.
              </p>
            </div>
            <Bell className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-[#22304A] bg-[#0B1120] p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-slate-100">{r.medicine}</p>
                    <p className="text-slate-400 text-xs">{r.time} · {r.daysLeft} days until expiry window</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`px-3 py-1 font-semibold text-xs border rounded-full transition-colors ${
                    r.active
                      ? 'border-emerald-800/50 bg-emerald-950/60 text-emerald-300'
                      : 'border-[#22304A] bg-[#131C31] text-slate-400'
                  }`}
                >
                  {r.active ? 'ACTIVE ALERT' : 'MUTED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SMART WASTE CLASSIFIER */}
      {activeTabSection === 'waste_guide' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-[#22304A] bg-[#131C31] p-6 rounded-xl">
            <h3 className="font-semibold text-base text-slate-100">Interactive Smart Waste Classifier</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Standardized regulatory protocol for classifying expired or degraded pharmaceuticals prior to collection.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {WASTE_CATEGORIES.map((cat) => (
              <div key={cat.category} className={`border ${cat.color} p-5 rounded-xl flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <cat.icon className="h-5 w-5 shrink-0" />
                    <h4 className="font-semibold text-sm">{cat.category}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    <b className="text-white font-semibold">Scope:</b> {cat.rule}
                  </p>
                </div>
                <div className="border-t border-[#22304A] pt-3 text-xs text-slate-200">
                  <span className="font-semibold text-amber-400">Disposal Directive:</span>
                  <p className="mt-1">{cat.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Pickup Modal */}
      {pickupTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl border border-[#22304A] bg-[#131C31] p-6 shadow-2xl font-sans"
          >
            <div className="flex items-start justify-between border-b border-[#22304A] pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Bio-Hazard Route
                </span>
                <h2 className="mt-1 text-xl font-bold text-slate-100">Schedule Pickup Route</h2>
                <p className="mt-1 text-xs text-slate-300">
                  Specify location for {pickupTarget.brandName} (Batch #{pickupTarget.batchNumber}).
                </p>
              </div>
              <button onClick={() => setPickupTarget(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  Pickup Address
                </span>
                <textarea
                  rows={3}
                  value={pickupAddressInput}
                  onChange={(e) => setPickupAddressInput(e.target.value)}
                  placeholder="e.g. Flat 402, Green Valley Apartments, MG Road, Bengaluru - 560001"
                  className="w-full rounded-lg border border-[#22304A] bg-[#0B1120] p-3 text-xs text-slate-100 outline-none focus:border-blue-500 font-sans"
                />
              </label>

              <div className="border border-[#22304A] bg-[#0B1120] p-3 text-xs text-slate-300 rounded-lg">
                <p>
                  <b className="text-amber-400 font-semibold">Note:</b> Bio-Clean Disposals will assign a sealed container transport route to collect this hazardous batch.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 text-xs font-sans">
              <Button variant="outline" onClick={() => setPickupTarget(null)} className="bg-[#0B1120] hover:bg-[#1C2845] text-slate-200 border border-[#22304A] rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={confirmPickupSchedule}
                disabled={busyId === pickupTarget.id || !pickupAddressInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2"
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
