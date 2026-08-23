'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import {
  getDaysUntilExpiry,
  getFefoColorClasses,
  getFefoStatus,
  formatDate,
} from '@/lib/fefo';
import type { MedicineBatch } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  EmptyState,
} from './shared';
import {
  Check,
  HeartHandshake,
  Loader2,
  Search,
  X,
  Zap,
  Award,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  TrendingUp,
  Boxes,
} from 'lucide-react';

const PROVENANCE_STAGES = [
  { step: '01', title: 'Household / Pharmacy Donor', detail: 'Cataloged with GS1 GTIN barcode & packaging telemetry.', status: 'COMPLETED' },
  { step: '02', title: 'CDSCO Inspector Verification', detail: 'Pharmacist inspection & EIP-712 cryptographic signature.', status: 'VERIFIED' },
  { step: '03', title: 'NGO Foundation Vault Intake', detail: 'Allocated to quality-sourced clinic distribution queue.', status: 'IN_STOCK' },
  { step: '04', title: 'Community Patient Dispatch', detail: 'Distributed to community health centers for subsidized care.', status: 'PENDING_DISPATCH' },
];

export default function NgoHub() {
  const { medicines, requestAllocation } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MedicineBatch | null>(null);
  const [showProvenance, setShowProvenance] = useState<MedicineBatch | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'catalog' | 'health_credits' | 'provenance'>('catalog');
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  const catalog = useMemo(
    () =>
      medicines
        .filter(
          (m) =>
            (m.status === 'approved' || m.quantity > 0) &&
            m.quantity > 0 &&
            getDaysUntilExpiry(m.expiryDate) >= 0 &&
            `${m.brandName} ${m.genericName} ${m.batchNumber}`
              .toLowerCase()
              .includes(search.toLowerCase())
        )
        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate)),
    [medicines, search]
  );

  async function handleRequest() {
    if (!selected) return;
    setBusy(true);
    await requestAllocation(selected.id, quantity);
    setBusy(false);
    setSelected(null);
  }

  return (
    <div className="space-y-8 font-sans">
      <SectionHeader
        eyebrow="Patient Redistribution &amp; Health Credits"
        title="NGO / Patient Hub"
        description="Source verified unexpired medicines ranked by FEFO urgency, track QR provenance timelines, and manage donor health credits."
      />

      {/* Health Credits Summary Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[#22304A] bg-[#131C31] p-5 text-xs font-sans rounded-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">Health Credits</span>
            <Award className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-100">1,450 PTS</p>
          <p className="mt-1 text-xs text-emerald-400 font-semibold">Gold NGO Tier · 150 pts per batch</p>
        </div>

        <div className="border border-[#22304A] bg-[#131C31] p-5 text-xs font-sans rounded-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">Available Batches</span>
            <Boxes className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-100">{catalog.length}</p>
          <p className="mt-1 text-xs text-emerald-400 font-semibold">100% CDSCO Verified</p>
        </div>

        <div className="border border-[#22304A] bg-[#131C31] p-5 text-xs font-sans rounded-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase text-slate-400 font-medium">Dispatch Rate</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-100">94.2%</p>
          <p className="mt-1 text-xs text-slate-300">FEFO Re-Allocation Efficiency</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#22304A] text-xs font-sans">
        <button
          onClick={() => setActiveTabSection('catalog')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'catalog'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sourcing Catalog ({catalog.length})
        </button>
        <button
          onClick={() => setActiveTabSection('health_credits')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'health_credits'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Health Credits Engine
        </button>
        <button
          onClick={() => setActiveTabSection('provenance')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'provenance'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          QR Origin Provenance Timeline
        </button>
      </div>

      {/* SECTION 1: SOURCING CATALOG */}
      {activeTabSection === 'catalog' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brand, generic name, or batch number..."
                className="w-full rounded-lg border border-[#22304A] bg-[#0B1120] py-3 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-blue-500 font-sans"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#22304A] bg-[#131C31] px-4 text-xs text-emerald-400 font-medium">
              <Zap className="h-3.5 w-3.5" />
              Sorted by FEFO Urgency
            </div>
          </div>

          {catalog.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No available batches found"
              description="Try a different search or check back as pharmacists verify new donations."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catalog.map((medicine) => {
                const days = getDaysUntilExpiry(medicine.expiryDate);
                const fefo = getFefoStatus(medicine.expiryDate);
                return (
                  <motion.div
                    layout
                    key={medicine.id}
                    className="rounded-xl border border-[#22304A] bg-[#131C31] p-5 shadow-sm hover:border-slate-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-base text-slate-100">{medicine.brandName}</h3>
                          <p className="mt-0.5 text-xs text-slate-400 font-sans">{medicine.genericName}</p>
                        </div>
                        <span className="border border-emerald-800/50 bg-emerald-950/60 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          VERIFIED
                        </span>
                      </div>

                      <div className="mb-4 rounded-lg border border-[#22304A] bg-[#0B1120] p-3 text-xs font-sans space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 uppercase font-medium">
                          <span>FEFO Expiry Window</span>
                          <span className="text-amber-400 font-semibold">{days} DAYS REMAINING</span>
                        </div>
                        <p className="text-slate-200 font-mono text-xs">Batch: <span className="font-semibold">{medicine.batchNumber}</span></p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-sans">
                        <div>
                          <span className="text-slate-400 uppercase text-[10px] font-medium">Available</span>
                          <p className="font-semibold text-slate-100">{medicine.quantity} units</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[10px] font-medium">Expires</span>
                          <p className="text-slate-200">{formatDate(medicine.expiryDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-[#22304A] pt-4 font-sans text-xs">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowProvenance(medicine)}
                        className="bg-[#0B1120] hover:bg-[#1C2845] text-slate-200 border border-[#22304A] rounded-lg"
                      >
                        <QrCode className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        Provenance
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelected(medicine)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
                      >
                        <HeartHandshake className="mr-1.5 h-3.5 w-3.5" />
                        Request Batch
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: HEALTH CREDITS ENGINE */}
      {activeTabSection === 'health_credits' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-[#22304A] bg-[#131C31] p-6 rounded-xl space-y-3">
            <h3 className="font-semibold text-base text-slate-100">Health Credits Reward Points Engine</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Earn 150 Health Credits per verified pharmaceutical donation batch allocated to community health centers. Redeem points for subsidized transport and regulatory audits.
            </p>
            <div className="w-full bg-[#0B1120] h-3 rounded-full overflow-hidden border border-[#22304A]">
              <div className="bg-emerald-500 h-full w-[72%]" />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Current Progress: 1,450 / 2,000 PTS</span>
              <span className="text-emerald-400 font-semibold">NEXT TIER: PLATINUM NGO</span>
            </div>
          </div>

          <div className="border border-[#22304A] bg-[#131C31] p-5 rounded-xl">
            <h4 className="font-semibold text-sm text-slate-100 uppercase mb-3">Recent Credit Allocations</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#22304A] pb-2">
                <span>Augmentin 625 Duo (Batch #AUG-2026-88)</span>
                <span className="text-emerald-400 font-bold">+150 PTS</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#22304A] pb-2">
                <span>Amoxicillin 500mg (Batch #AMX-9921)</span>
                <span className="text-emerald-400 font-bold">+150 PTS</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Metformin 850mg (Batch #MET-4412)</span>
                <span className="text-emerald-400 font-bold">+150 PTS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PROVENANCE TIMELINE */}
      {activeTabSection === 'provenance' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-[#22304A] bg-[#131C31] p-6 rounded-xl">
            <h3 className="font-semibold text-base text-slate-100">QR Origin &amp; Provenance Timeline</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Verifiable chain-of-custody timeline rendering full donor origin, CDSCO inspection, and NGO distribution milestones.
            </p>
          </div>

          <div className="border border-[#22304A] bg-[#131C31] p-6 rounded-xl space-y-6">
            {PROVENANCE_STAGES.map((st, i) => (
              <div key={st.step} className="flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center border border-emerald-500 bg-emerald-950/60 text-emerald-400 font-semibold shrink-0 rounded-lg">
                  {st.step}
                </div>
                <div className="border-l-2 border-[#22304A] pl-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-100">{st.title}</h4>
                    <span className="text-xs text-emerald-400 font-medium border border-emerald-800/50 px-2 py-0.5 rounded-full">
                      {st.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{st.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provenance Modal Popup */}
      {showProvenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl border border-[#22304A] bg-[#131C31] p-6 shadow-2xl font-sans text-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-[#22304A] pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">QR Provenance</span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{showProvenance.brandName}</h3>
                <p className="text-slate-400 text-xs font-mono">Batch #{showProvenance.batchNumber}</p>
              </div>
              <button onClick={() => setShowProvenance(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="border border-[#22304A] bg-[#0B1120] p-3 rounded-lg space-y-1">
                <p className="text-emerald-400 font-semibold text-xs uppercase">Donor Origin</p>
                <p className="text-slate-100 font-semibold">{showProvenance.ownerName}</p>
                <p className="text-slate-400 text-xs">Logged: {formatDate(showProvenance.loggedAt)}</p>
              </div>
              <div className="border border-[#22304A] bg-[#0B1120] p-3 rounded-lg space-y-1">
                <p className="text-emerald-400 font-semibold text-xs uppercase">CDSCO Verification</p>
                <p className="text-slate-100 font-semibold">Rule 96 Verified · EIP-712 Signed</p>
                <p className="text-slate-400 text-xs font-mono">Tx: {showProvenance.txHash ?? '0x71f8...3f82'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowProvenance(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2">
                Close Timeline
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Allocation Request Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl border border-[#22304A] bg-[#131C31] p-6 shadow-2xl font-sans text-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-[#22304A] pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Clinic Requisition</span>
                <h3 className="text-base font-bold text-slate-100 mt-1">Request {selected.brandName}</h3>
                <p className="text-slate-400 text-xs font-mono">Batch #{selected.batchNumber} · {selected.quantity} available</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <label className="block space-y-1.5">
                <span className="text-slate-300 font-medium">Requested Units</span>
                <input
                  type="number"
                  min={1}
                  max={selected.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(selected.quantity, Math.max(1, Number(e.target.value))))}
                  className="w-full rounded-lg border border-[#22304A] bg-[#0B1120] p-3 text-xs text-slate-100 outline-none focus:border-blue-500 font-sans"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-sans text-xs">
              <Button variant="outline" onClick={() => setSelected(null)} className="bg-[#0B1120] hover:bg-[#1C2845] text-slate-200 border border-[#22304A] rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleRequest} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HeartHandshake className="h-4 w-4 mr-2" />}
                Confirm Requisition
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
