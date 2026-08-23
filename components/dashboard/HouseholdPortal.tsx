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
    color: 'border-red-500 bg-red-950/40 text-red-300',
    icon: ShieldAlert,
    rule: 'Expired antibiotics, cytotoxic drugs, controlled hormones.',
    action: 'Requires 850°C high-temperature incineration. Schedule Bio-Clean pickup.',
  },
  {
    category: 'LIQUID / SYRUP QUARANTINE',
    color: 'border-amber-500 bg-amber-950/40 text-amber-300',
    icon: Trash2,
    rule: 'Liquid suspensions, cough syrups, eye drops past 30 days of opening.',
    action: 'Mix with absorbent material (coffee grounds/sand) in sealed container prior to disposal.',
  },
  {
    category: 'GENERAL NON-TOXIC SOLID',
    color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
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
  const [aiParsing, setAiParsing] = useState(false);
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

  function simulateAiScan() {
    setAiParsing(true);
    setTimeout(() => {
      setForm({
        brandName: 'Augmentin 625 Duo',
        genericName: 'Amoxicillin + Clavulanic Acid',
        batchNumber: 'AUG-2026-88',
        expiryDate: '2026-11-30',
        quantity: '10',
      });
      setAiParsing(false);
      setShowAiModal(false);
      setShowForm(true);
    }, 1500);
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

  return (
    <div className="space-y-8 font-sans">
      <SectionHeader
        eyebrow="Personal inventory & AI assistance"
        title="Household Portal"
        description="Log unused medicines with AI OCR parsing, track FEFO expiration timelines, and manage safe disposal."
        action={
          <div className="flex gap-2 font-mono text-xs">
            <Button
              onClick={() => setShowAiModal(true)}
              className="rounded-sm border border-amber-500/60 bg-amber-500/10 text-amber-400 font-bold hover:bg-amber-500/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              GS1 Camera Scan
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-sm border border-amber-500 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Unused Medicine
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Active Medicines" value={active} icon={Package} />
        <StatCard label="Donation-Ready Batches" value={donated} icon={HeartHandshake} tone="safe" />
        <StatCard label="Scheduled Disposals" value={scheduled} icon={Truck} tone="warning" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-700/60 font-mono text-xs">
        <button
          onClick={() => setActiveTabSection('inventory')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'inventory'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [01] Medicine Inventory ({owned.length})
        </button>
        <button
          onClick={() => setActiveTabSection('reminders')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'reminders'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [02] Reminders Engine ({reminders.filter((r) => r.active).length})
        </button>
        <button
          onClick={() => setActiveTabSection('waste_guide')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'waste_guide'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [03] Smart Waste Classifier
        </button>
      </div>

      {/* AI Packaging Scanner Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-sm border border-amber-500/60 bg-[#1B1E26] p-6 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-start justify-between border-b border-slate-700/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold uppercase text-[#F8FAFC]">AI Vision Packaging Parser</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed font-sans">
              Scan pharmaceutical blister packs or boxes to automatically extract GTIN, Batch Number, Expiry Date, and Formula using computer vision.
            </p>
            <div className="border border-dashed border-slate-600 bg-slate-900/80 p-8 text-center rounded-sm space-y-4">
              <Camera className="mx-auto h-10 w-10 text-amber-400 animate-pulse" />
              <p className="text-xs text-slate-300 font-bold uppercase">
                {aiParsing ? 'Extracting OCR Data via Vision Engine...' : 'Position camera over 2D DataMatrix or Expiry Stamp'}
              </p>
              {aiParsing && (
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Reading Batch &amp; Expiry Strings...</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAiModal(false)} className="border-slate-700 text-slate-300 uppercase">
                Cancel
              </Button>
              <Button onClick={simulateAiScan} disabled={aiParsing} className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400">
                Simulate Camera Capture
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manual Entry Form */}
      {showForm && (
        <div className="rounded-sm border border-amber-500/50 bg-[#1B1E26] p-6 shadow-xl font-mono text-xs">
          <div className="mb-5 flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h2 className="font-bold text-base uppercase text-[#F8FAFC]">Log Unused Medicine Batch</h2>
              <p className="mt-1 text-slate-400 font-sans text-xs">
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
            <div className="flex items-end justify-end gap-3 sm:col-span-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300 uppercase">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400">
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
              description="Click 'Log Unused Medicine' or use the AI Packaging Scan to catalog your surplus medicines."
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
        <div className="rounded-sm border border-slate-700/60 bg-[#1B1E26] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Automated Dosage &amp; Expiration Reminders</h3>
              <p className="text-slate-400 font-sans text-xs mt-0.5">
                Configured push notifications for daily dosage and upcoming FEFO dispatch alerts.
              </p>
            </div>
            <Bell className="h-5 w-5 text-amber-400" />
          </div>

          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-slate-700/60 bg-slate-900/60 p-4 rounded-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="font-bold text-slate-100 uppercase">{r.medicine}</p>
                    <p className="text-slate-400 text-[11px]">{r.time} · {r.daysLeft} days until expiry window</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`px-3 py-1 font-bold text-[10px] uppercase border transition-colors ${
                    r.active
                      ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
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
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm">
            <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Interactive Smart Waste Classifier</h3>
            <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
              Standardized regulatory protocol for classifying expired or degraded pharmaceuticals prior to collection.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {WASTE_CATEGORIES.map((cat) => (
              <div key={cat.category} className={`border ${cat.color} p-5 rounded-sm flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <cat.icon className="h-5 w-5 shrink-0" />
                    <h4 className="font-bold text-sm uppercase">{cat.category}</h4>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                    <b className="text-white font-mono uppercase">Scope:</b> {cat.rule}
                  </p>
                </div>
                <div className="border-t border-slate-700/60 pt-3 text-[11px] font-mono text-slate-200">
                  <span className="font-bold text-amber-400 uppercase">Disposal Directive:</span>
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
            className="w-full max-w-md rounded-sm border border-slate-700 bg-[#1B1E26] p-6 shadow-2xl font-sans"
          >
            <div className="flex items-start justify-between border-b border-slate-700/60 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
                  [BIO-HAZARD ROUTE]
                </span>
                <h2 className="mt-1 text-xl font-bold uppercase text-[#F8FAFC]">Schedule Pickup Route</h2>
                <p className="mt-1 text-xs font-mono text-slate-300">
                  Specify location for {pickupTarget.brandName} (Batch #{pickupTarget.batchNumber}).
                </p>
              </div>
              <button onClick={() => setPickupTarget(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  Pickup Address
                </span>
                <textarea
                  rows={3}
                  value={pickupAddressInput}
                  onChange={(e) => setPickupAddressInput(e.target.value)}
                  placeholder="e.g. Flat 402, Green Valley Apartments, MG Road, Bengaluru - 560001"
                  className="w-full rounded-sm border border-slate-700 bg-slate-900 p-3 text-xs font-mono text-[#F8FAFC] outline-none focus:border-amber-500"
                />
              </label>

              <div className="border border-slate-700 bg-slate-900 p-3 text-xs font-mono text-slate-300">
                <p>
                  <b className="text-amber-400 uppercase font-bold">Note:</b> Bio-Clean Disposals will assign a sealed container transport route to collect this hazardous batch.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 font-mono text-xs">
              <Button variant="outline" onClick={() => setPickupTarget(null)} className="border-slate-700 text-slate-300 uppercase">
                Cancel
              </Button>
              <Button
                onClick={confirmPickupSchedule}
                disabled={busyId === pickupTarget.id || !pickupAddressInput.trim()}
                className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400"
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
