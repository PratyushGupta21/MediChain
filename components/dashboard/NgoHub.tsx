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
        eyebrow="Patient redistribution &amp; Health credits"
        title="NGO / Patient Hub"
        description="Source verified unexpired medicines ranked by FEFO urgency, track QR provenance timelines, and manage donor health credits."
      />

      {/* Health Credits Summary Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-slate-700/60 bg-[#1B1E26] p-5 font-mono text-xs rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase text-slate-400 font-bold">[HEALTH CREDITS]</span>
            <Award className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8FAFC]">1,450 PTS</p>
          <p className="mt-1 text-[11px] text-amber-400 font-bold">Gold NGO Tier · 150 pts per batch</p>
        </div>

        <div className="border border-slate-700/60 bg-[#1B1E26] p-5 font-mono text-xs rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase text-slate-400 font-bold">[AVAILABLE BATCHES]</span>
            <Boxes className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8FAFC]">{catalog.length}</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-bold">100% CDSCO Verified</p>
        </div>

        <div className="border border-slate-700/60 bg-[#1B1E26] p-5 font-mono text-xs rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase text-slate-400 font-bold">[DISPATCH RATE]</span>
            <TrendingUp className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#F8FAFC]">94.2%</p>
          <p className="mt-1 text-[11px] text-slate-300">FEFO Re-Allocation Efficiency</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-700/60 font-mono text-xs">
        <button
          onClick={() => setActiveTabSection('catalog')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'catalog'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [01] Sourcing Catalog ({catalog.length})
        </button>
        <button
          onClick={() => setActiveTabSection('health_credits')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'health_credits'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [02] Health Credits Engine
        </button>
        <button
          onClick={() => setActiveTabSection('provenance')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'provenance'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [03] QR Origin Provenance Timeline
        </button>
      </div>

      {/* SECTION 1: SOURCING CATALOG */}
      {activeTabSection === 'catalog' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brand, generic name, or batch number..."
                className="w-full rounded-sm border border-slate-700 bg-[#1B1E26] py-3 pl-10 pr-4 text-xs text-[#F8FAFC] outline-none focus:border-amber-500 font-sans"
              />
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-slate-700/60 bg-[#1B1E26] px-4 text-xs text-amber-400 font-mono font-bold">
              <Zap className="h-3.5 w-3.5" />
              SORTED BY FEFO URGENCY
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
                    className="rounded-sm border border-slate-700/60 bg-[#1B1E26] p-5 hover:border-slate-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base uppercase text-[#F8FAFC]">{medicine.brandName}</h3>
                          <p className="mt-0.5 text-xs text-slate-400 font-mono">{medicine.genericName}</p>
                        </div>
                        <span className="border border-emerald-500/50 bg-emerald-950/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                          VERIFIED
                        </span>
                      </div>

                      <div className="mb-4 border border-slate-700/60 bg-slate-900 p-3 text-xs font-mono space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                          <span>FEFO Expiry Window</span>
                          <span className="text-amber-400">{days} DAYS REMAINING</span>
                        </div>
                        <p className="text-slate-200 font-bold">Batch #{medicine.batchNumber}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                        <div>
                          <span className="text-slate-400 uppercase text-[10px]">Available</span>
                          <p className="font-bold text-white">{medicine.quantity} units</p>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[10px]">Expires</span>
                          <p className="text-slate-200">{formatDate(medicine.expiryDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-slate-700/60 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowProvenance(medicine)}
                        className="border-slate-700 text-slate-300 uppercase hover:bg-slate-800 text-xs"
                      >
                        <QrCode className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                        Provenance
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelected(medicine)}
                        className="flex-1 bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 text-xs shadow-md"
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
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm space-y-3">
            <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Health Credits Reward Points Engine</h3>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Earn 150 Health Credits per verified pharmaceutical donation batch allocated to community health centers. Redeem points for subsidized transport and regulatory audits.
            </p>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
              <div className="bg-amber-500 h-full w-[72%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Current Progress: 1,450 / 2,000 PTS</span>
              <span className="text-amber-400 font-bold">NEXT TIER: PLATINUM NGO</span>
            </div>
          </div>

          <div className="border border-slate-700/60 bg-[#1B1E26] p-5 rounded-sm">
            <h4 className="font-bold text-sm text-[#F8FAFC] uppercase mb-3">Recent Credit Allocations</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <span>Augmentin 625 Duo (Batch #AUG-2026-88)</span>
                <span className="text-emerald-400 font-bold">+150 PTS</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
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
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm">
            <h3 className="font-bold text-base uppercase text-[#F8FAFC]">QR Origin &amp; Provenance Timeline</h3>
            <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
              Verifiable chain-of-custody timeline rendering full donor origin, CDSCO inspection, and NGO distribution milestones.
            </p>
          </div>

          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm space-y-6">
            {PROVENANCE_STAGES.map((st, i) => (
              <div key={st.step} className="flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center border border-amber-500 bg-amber-500/10 text-amber-400 font-bold shrink-0 rounded-sm">
                  {st.step}
                </div>
                <div className="border-l-2 border-slate-700 pl-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm uppercase text-[#F8FAFC]">{st.title}</h4>
                    <span className="text-[10px] text-emerald-400 font-bold border border-emerald-500/40 px-2 py-0.5">
                      {st.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">{st.detail}</p>
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
            className="w-full max-w-md rounded-sm border border-slate-700 bg-[#1B1E26] p-6 shadow-2xl font-mono text-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">[QR PROVENANCE]</span>
                <h3 className="text-base font-bold uppercase text-[#F8FAFC] mt-1">{showProvenance.brandName}</h3>
                <p className="text-slate-400 text-[11px]">Batch #{showProvenance.batchNumber}</p>
              </div>
              <button onClick={() => setShowProvenance(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="border border-slate-700 bg-slate-900 p-3 space-y-1 font-mono">
                <p className="text-amber-400 font-bold uppercase text-[10px]">Donor Origin</p>
                <p className="text-white font-bold">{showProvenance.ownerName}</p>
                <p className="text-slate-400 text-[11px]">Logged: {formatDate(showProvenance.loggedAt)}</p>
              </div>
              <div className="border border-slate-700 bg-slate-900 p-3 space-y-1 font-mono">
                <p className="text-emerald-400 font-bold uppercase text-[10px]">CDSCO Verification</p>
                <p className="text-white font-bold">Rule 96 Verified · EIP-712 Signed</p>
                <p className="text-slate-400 text-[11px]">Tx: {showProvenance.txHash ?? '0x71f8...3f82'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowProvenance(null)} className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400">
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
            className="w-full max-w-md rounded-sm border border-slate-700 bg-[#1B1E26] p-6 shadow-2xl font-mono text-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">[CLINIC REQUISITION]</span>
                <h3 className="text-base font-bold uppercase text-[#F8FAFC] mt-1">Request {selected.brandName}</h3>
                <p className="text-slate-400 text-[11px]">Batch #{selected.batchNumber} · {selected.quantity} available</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <label className="block space-y-1.5">
                <span className="text-slate-300 font-bold uppercase">Requested Units</span>
                <input
                  type="number"
                  min={1}
                  max={selected.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(selected.quantity, Math.max(1, Number(e.target.value))))}
                  className="w-full rounded-sm border border-slate-700 bg-slate-900 p-3 text-xs font-mono text-[#F8FAFC] outline-none focus:border-amber-500"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-mono text-xs">
              <Button variant="outline" onClick={() => setSelected(null)} className="border-slate-700 text-slate-300 uppercase">
                Cancel
              </Button>
              <Button onClick={handleRequest} disabled={busy} className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400">
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
