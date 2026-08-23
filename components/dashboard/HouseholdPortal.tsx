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
  FileText,
  ScanLine,
  Award,
  Upload,
  Syringe,
  Boxes,
} from 'lucide-react';

const MOBILENET_WASTE_PRESETS = [
  {
    type: 'Expired Antibiotic Packaging (Augmentin)',
    confidence: '98.4%',
    bin: 'YELLOW BIN',
    action: 'High-Temperature 850°C Incineration',
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    desc: 'Cytotoxic / Pharmaceutical waste requiring thermal destruction.',
  },
  {
    type: 'Contaminated IV Drip Tubing',
    confidence: '96.2%',
    bin: 'RED BIN',
    action: '121°C Autoclave & Shredding',
    color: 'bg-red-50 border-red-200 text-red-900',
    desc: 'Recyclable contaminated polymer plastic waste.',
  },
  {
    type: 'Glass Insulin Ampoule / Vial',
    confidence: '99.1%',
    bin: 'BLUE BIN',
    action: 'Sodium Hypochlorite Disinfection',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    desc: 'Glassware & broken vials requiring chemical neutralization.',
  },
  {
    type: 'Discarded Syringe Needle',
    confidence: '97.8%',
    bin: 'SHARPS CONTAINER',
    action: 'Puncture-Proof Encapsulation',
    color: 'bg-slate-50 border-slate-200 text-slate-900',
    desc: 'Sharps & needles requiring tamper-evident rigid disposal.',
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
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  const [activeTabSection, setActiveTabSection] = useState<
    'inventory' | 'ocr_reader' | 'waste_classifier' | 'reminders'
  >('inventory');
  const [pickupTarget, setPickupTarget] = useState<MedicineBatch | null>(null);
  const [pickupAddressInput, setPickupAddressInput] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reminders, setReminders] = useState(REMINDER_PRESETS);
  const [selectedMobileNetWaste, setSelectedMobileNetWaste] = useState(MOBILENET_WASTE_PRESETS[0]);

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

  async function simulateOcrParse() {
    setOcrBusy(true);
    await new Promise((res) => setTimeout(res, 1200));
    const result = {
      brandName: 'Pantocid 40mg',
      genericName: 'Pantoprazole Sodium',
      batchNumber: 'PNT-2026-88A',
      expiryDate: '2026-10-15',
      quantity: '20',
      dosage: '1 tablet before breakfast',
      confidence: '99.2%',
    };
    setOcrResult(result);
    setOcrBusy(false);
  }

  async function acceptOcrResult() {
    if (!ocrResult) return;
    await addMedicine({
      brandName: ocrResult.brandName,
      genericName: ocrResult.genericName,
      batchNumber: ocrResult.batchNumber,
      expiryDate: ocrResult.expiryDate,
      quantity: Number(ocrResult.quantity),
    });
    setOcrResult(null);
    setShowOcrModal(false);
    setActiveTabSection('inventory');
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
        eyebrow="Personal Cabinet &amp; AI Scanning Tools"
        title="Household Portal"
        description="Scan prescription photos with AI TrOCR, classify drug waste with MobileNet V2, and monitor FEFO expiration urgency."
        action={
          <div className="flex gap-2 text-xs font-sans">
            <Button
              onClick={() => setShowOcrModal(true)}
              className="bg-[#131C31] hover:bg-[#1C2845] text-slate-200 border border-[#22304A] rounded-lg px-4 py-2 font-medium"
            >
              <FileText className="mr-2 h-4 w-4 text-blue-400" />
              AI Prescription Reader
            </Button>
            <Button
              onClick={() => setShowAiModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-md shadow-emerald-600/20"
            >
              <Camera className="mr-2 h-4 w-4" />
              GS1 DataMatrix Scanner
            </Button>
          </div>
        }
      />

      {/* Health Credits & Cabinet Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-sans">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-500 font-semibold">Health Credits</span>
            <Award className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">1,450 PTS</p>
          <p className="mt-1 text-xs text-emerald-700 font-bold">Gold Household Donor Tier</p>
        </div>

        <StatCard label="Active Cabinet Inventory" value={active} icon={Package} tone="gold" />
        <StatCard label="Donation-Ready Batches" value={donated} icon={HeartHandshake} tone="safe" />
        <StatCard label="Scheduled Disposals" value={scheduled} icon={Truck} tone="warning" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-sans overflow-x-auto">
        <button
          onClick={() => setActiveTabSection('inventory')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTabSection === 'inventory'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          FEFO Cabinet Inventory ({owned.length})
        </button>
        <button
          onClick={() => setActiveTabSection('ocr_reader')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTabSection === 'ocr_reader'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          AI Prescription Reader (TrOCR)
        </button>
        <button
          onClick={() => setActiveTabSection('waste_classifier')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTabSection === 'waste_classifier'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          AI Waste Classifier (MobileNet V2)
        </button>
        <button
          onClick={() => setActiveTabSection('reminders')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTabSection === 'reminders'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Expiry Reminders ({reminders.filter((r) => r.active).length})
        </button>
      </div>

      {/* GS1 Live Scanner Modal */}
      {showAiModal && (
        <Gs1CameraScanner
          title="Household Packaging GS1 DataMatrix Scanner"
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* AI Prescription Reader Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-sans text-xs">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">TrOCR &amp; OpenCV OCR</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">AI Prescription Reader</h3>
                <p className="text-slate-600 text-xs">Upload prescription image or PDF to extract medicine parameters.</p>
              </div>
              <button onClick={() => setShowOcrModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!ocrResult ? (
              <div className="border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center rounded-xl space-y-3">
                <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Upload Prescription Document</p>
                  <p className="text-slate-600 text-xs mt-0.5">Supports PNG, JPG, JPEG, and PDF</p>
                </div>
                <Button
                  onClick={simulateOcrParse}
                  disabled={ocrBusy}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2"
                >
                  {ocrBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanLine className="h-4 w-4 mr-2" />}
                  {ocrBusy ? 'Extracting Text via TrOCR...' : 'Simulate OCR Extraction'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-emerald-800">
                    <span>EXTRACTED MEDICINE DATA</span>
                    <span>Confidence: {ocrResult.confidence}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 pt-1 font-sans">
                    <p>Brand: <b className="text-slate-900">{ocrResult.brandName}</b></p>
                    <p>Generic: <b>{ocrResult.genericName}</b></p>
                    <p>Batch #: <b className="font-mono">{ocrResult.batchNumber}</b></p>
                    <p>Expiry: <b>{formatDate(ocrResult.expiryDate)}</b></p>
                    <p>Units: <b>{ocrResult.quantity}</b></p>
                    <p>Schedule: <b>{ocrResult.dosage}</b></p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOcrResult(null)} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg">
                    Re-scan
                  </Button>
                  <Button onClick={acceptOcrResult} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-md shadow-emerald-600/20">
                    Add to FEFO Inventory
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Manual Entry Form Modal */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-xs font-sans">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">Log Unused Medicine Batch</h2>
              <p className="mt-0.5 text-slate-600 text-xs font-sans">
                Enter packaging details to compute FEFO urgency and ledger validation.
              </p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-900">
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-md shadow-emerald-600/20">
                Log Batch Entry
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 1: FEFO CABINET INVENTORY */}
      {activeTabSection === 'inventory' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-900">Active FEFO Stock</h3>
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-3 py-1.5 text-xs shadow-sm"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Manual Entry
            </Button>
          </div>

          {owned.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No medicines logged in your vault"
              description="Click 'Add Manual Entry', use TrOCR Prescription Reader, or scan with GS1 Camera to populate your inventory."
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

      {/* SECTION 2: AI PRESCRIPTION READER TAB */}
      {activeTabSection === 'ocr_reader' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-slate-200 bg-white p-6 rounded-xl space-y-3 shadow-sm">
            <h3 className="font-bold text-base text-slate-900">AI TrOCR &amp; OpenCV Prescription Parsing Engine</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Optical Character Recognition pipeline trained on pharmaceutical doctor handwriting and digital prescription formats.
            </p>
            <Button
              onClick={() => setShowOcrModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2"
            >
              <ScanLine className="mr-2 h-4 w-4" />
              Launch Prescription OCR Scanner
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 3: AI BIO-MEDICAL WASTE CLASSIFIER */}
      {activeTabSection === 'waste_classifier' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-base text-slate-900">MobileNet V2 Bio-Medical Waste Classifier</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Neural network image classifier mapping discarded drug waste to regulatory bin streams.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {MOBILENET_WASTE_PRESETS.map((item) => (
              <div key={item.type} className={`border p-5 rounded-xl space-y-2 shadow-sm ${item.color}`}>
                <div className="flex justify-between items-start font-bold">
                  <span>{item.type}</span>
                  <span className="text-xs">{item.confidence} Match</span>
                </div>
                <p className="text-sm font-extrabold">{item.bin}: {item.action}</p>
                <p className="text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: EXPIRY REMINDERS */}
      {activeTabSection === 'reminders' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 font-sans text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Automated 90d, 30d &amp; 7d Expiration Alerts</h3>
              <p className="text-slate-600 text-xs mt-0.5">
                Configured push notifications for daily dosage and upcoming FEFO dispatch alerts.
              </p>
            </div>
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-900">{r.medicine}</p>
                    <p className="text-slate-600 text-xs">{r.time} · {r.daysLeft} days until expiry window</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`px-3 py-1 font-semibold text-xs border rounded-full transition-colors ${
                    r.active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  {r.active ? 'ACTIVE ALERT' : 'MUTED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Pickup Modal */}
      {pickupTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl font-sans text-xs"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Bio-Hazard Route
                </span>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Schedule Pickup Route</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Specify location for {pickupTarget.brandName} (Batch #{pickupTarget.batchNumber}).
                </p>
              </div>
              <button onClick={() => setPickupTarget(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  Pickup Address
                </span>
                <textarea
                  rows={3}
                  value={pickupAddressInput}
                  onChange={(e) => setPickupAddressInput(e.target.value)}
                  placeholder="e.g. Flat 402, Green Valley Apartments, MG Road, Bengaluru - 560001"
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-sans"
                />
              </label>

              <div className="border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 rounded-lg">
                <p>
                  <b className="text-amber-700 font-semibold">Note:</b> Bio-Clean Disposals will assign a sealed container transport route to collect this hazardous batch.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 text-xs font-sans">
              <Button variant="outline" onClick={() => setPickupTarget(null)} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={confirmPickupSchedule}
                disabled={busyId === pickupTarget.id || !pickupAddressInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-md shadow-emerald-600/20"
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
