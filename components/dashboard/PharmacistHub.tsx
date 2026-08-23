'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import { formatDate } from '@/lib/fefo';
import type { MedicineBatch } from '@/lib/types';
import { generateEip712Proof, Eip712ProofResult } from '@/lib/polygon-eip712';
import { Gs1CameraScanner } from '@/components/gs1-camera-scanner';
import { ParsedGs1Data } from '@/lib/gs1-parser';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  StatCard,
  EmptyState,
} from './shared';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Package,
  QrCode,
  ShieldCheck,
  X,
  XCircle,
  Zap,
  Camera,
  Tag,
  Check,
  Copy,
} from 'lucide-react';

const SUBSIDIZED_CATALOG = [
  { id: 'sub-1', name: 'Azithromycin 500mg', batch: 'AZ-8819', qty: 250, originalPrice: '₹120', subsidizedPrice: '₹12 (90% Subsidized)', verifiedBy: 'Dr. Priya Menon (CDSCO-REG-09)' },
  { id: 'sub-2', name: 'Pantoprazole 40mg', batch: 'PAN-9920', qty: 500, originalPrice: '₹95', subsidizedPrice: '₹9 (90% Subsidized)', verifiedBy: 'Dr. Priya Menon (CDSCO-REG-09)' },
  { id: 'sub-3', name: 'Paracetamol 650mg', batch: 'PCM-1102', qty: 1200, originalPrice: '₹30', subsidizedPrice: '₹0 (100% Free Donation)', verifiedBy: 'CDSCO Inspection Office' },
];

export default function PharmacistHub() {
  const { medicines, approveBatch, rejectBatch } = useApp();
  const [approved, setApproved] = useState<{ batch: MedicineBatch; proof: Eip712ProofResult } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'queue' | 'cdsco_checks' | 'subsidized'>('queue');
  const [copiedTx, setCopiedTx] = useState(false);

  const queue = medicines.filter((m) =>
    ['logged', 'pending_verification'].includes(m.status)
  );

  async function approve(batch: MedicineBatch) {
    setBusyId(batch.id);
    const proof = await generateEip712Proof(batch.batchNumber);
    const txHash = await approveBatch(batch.id);
    if (txHash) {
      proof.txHash = txHash;
    }
    setBusyId(null);
    setApproved({ batch, proof });
  }

  async function reject(batchId: string) {
    setBusyId(batchId);
    await rejectBatch(batchId);
    setBusyId(null);
  }

  function handleScanSuccess(data: ParsedGs1Data) {
    setShowScanner(false);
  }

  const copyTx = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans">
      <SectionHeader
        eyebrow="CDSCO Verification &amp; Polygon Amoy Proofs"
        title="Pharmacist Verification Hub"
        description="Inspect submitted batches, run automated CDSCO Rule 96 checks, and sign EIP-712 typed-data proofs on Polygon Amoy (Chain ID 80002)."
        action={
          <div className="flex gap-2 text-xs font-sans">
            <Button
              onClick={() => setShowScanner(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-sm"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Live GS1 DataMatrix Scan
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting Inspection" value={queue.length} icon={Clock3} tone="warning" />
        <StatCard label="Verified Today" value={18} icon={ShieldCheck} tone="safe" />
        <StatCard label="Polygon Amoy Finality" value={1.8} icon={Zap} />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#22304A] text-xs font-sans">
        <button
          onClick={() => setActiveTabSection('queue')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'queue'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Inspection Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTabSection('cdsco_checks')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'cdsco_checks'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          CDSCO Rule 96 Panel
        </button>
        <button
          onClick={() => setActiveTabSection('subsidized')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'subsidized'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Subsidized Inventory Catalog
        </button>
      </div>

      {/* Live GS1 Camera Scanner Modal */}
      {showScanner && (
        <Gs1CameraScanner
          title="CDSCO GS1 DataMatrix Package Scanner"
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* EIP-712 Signature Success Modal */}
      {approved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-xl border border-emerald-800/50 bg-[#131C31] p-6 shadow-2xl font-sans text-xs space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-[#22304A] pb-3">
              <div className="flex h-10 w-10 items-center justify-center bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-100">Polygon Amoy EIP-712 Proof Signed</h3>
                <p className="text-slate-400 text-xs">Batch #{approved.batch.batchNumber} committed to Chain ID 80002</p>
              </div>
            </div>

            <div className="border border-[#22304A] bg-[#0B1120] p-4 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Polygon Tx Hash:</span>
                <button onClick={() => copyTx(approved.proof.txHash)} className="flex items-center gap-1 text-emerald-400 hover:underline">
                  {copiedTx ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedTx ? 'COPIED' : 'COPY HASH'}
                </button>
              </div>
              <p className="break-all text-emerald-400 font-mono font-semibold">{approved.proof.txHash}</p>

              <div className="border-t border-[#22304A] pt-2 text-xs space-y-1 text-slate-300 font-mono">
                <p>QR Hash (Keccak256): <span className="text-slate-400">{approved.proof.qrHash.substring(0, 24)}...</span></p>
                <p>EIP-712 Signature: <span className="text-slate-400">{approved.proof.signature.substring(0, 32)}...</span></p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setApproved(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2">
                Dismiss Proof
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* SECTION 1: INSPECTION QUEUE */}
      {activeTabSection === 'queue' && (
        <div className="rounded-xl border border-[#22304A] bg-[#131C31] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#22304A] p-5 font-sans text-xs">
            <div>
              <h2 className="font-semibold text-base text-slate-100">Pending Batch Submissions</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Review GTIN, packaging integrity, and expiry windows before signing.
              </p>
            </div>
            <span className="border border-amber-800/50 bg-amber-950/60 px-3 py-1 font-semibold text-amber-300 rounded-full">
              {queue.length} Awaiting Verification
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ClipboardCheck}
                title="No pending inspection requests"
                description="All submitted medicine batches have been reviewed and signed to the Polygon ledger."
              />
            </div>
          ) : (
            <div className="divide-y divide-[#22304A]">
              {queue.map((batch) => (
                <div key={batch.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between font-sans text-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-800/50 bg-blue-950/60 text-blue-400 rounded-lg">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">
                        {batch.brandName}{' '}
                        <span className="text-xs font-normal text-slate-400">({batch.genericName})</span>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-slate-300 text-xs">
                        <span>Batch: <b className="text-slate-100 font-mono">{batch.batchNumber}</b></span>
                        <span>Quantity: <b className="text-slate-100">{batch.quantity} units</b></span>
                        <span>Expires: <b className="text-slate-100">{formatDate(batch.expiryDate)}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === batch.id}
                      onClick={() => reject(batch.id)}
                      className="border-red-800/50 bg-red-950/40 text-red-300 hover:bg-red-900 font-semibold rounded-lg"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === batch.id}
                      onClick={() => approve(batch)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 shadow-sm"
                    >
                      {busyId === batch.id ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Signing EIP-712...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          Approve &amp; Sign Amoy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CDSCO RULE 96 PANEL */}
      {activeTabSection === 'cdsco_checks' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-[#22304A] bg-[#131C31] p-6 rounded-xl">
            <h3 className="font-semibold text-base text-slate-100">CDSCO Rule 96 Regulatory Cross-Reference Panel</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Automated compliance verification engine matching GS1 2D DataMatrix GTINs against Central Drugs Standard Control Organization databases.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-[#22304A] bg-[#131C31] p-5 rounded-xl">
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">[CHECK 01]</span>
              <h4 className="font-semibold text-sm text-slate-100 mt-1">2D DataMatrix Serialization</h4>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                Requires unique GTIN, expiry timestamp, and serial number printed directly on primary packaging.
              </p>
              <div className="mt-4 border border-emerald-800/50 bg-emerald-950/40 p-2 text-emerald-300 text-xs font-semibold rounded-lg">
                STATUS: COMPLIANT
              </div>
            </div>

            <div className="border border-[#22304A] bg-[#131C31] p-5 rounded-xl">
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">[CHECK 02]</span>
              <h4 className="font-semibold text-sm text-slate-100 mt-1">CDSCO License Registry</h4>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                Verifies licensed inspector signature against active state drug control register.
              </p>
              <div className="mt-4 border border-emerald-800/50 bg-emerald-950/40 p-2 text-emerald-300 text-xs font-semibold rounded-lg">
                STATUS: AUTHORIZED
              </div>
            </div>

            <div className="border border-[#22304A] bg-[#131C31] p-5 rounded-xl">
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">[CHECK 03]</span>
              <h4 className="font-semibold text-sm text-slate-100 mt-1">Polygon Amoy EIP-712</h4>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                EIP-712 structured data hash broadcasted to Polygon Amoy consensus (Chain ID 80002).
              </p>
              <div className="mt-4 border border-emerald-800/50 bg-emerald-950/40 p-2 text-emerald-300 text-xs font-semibold rounded-lg">
                STATUS: IMMUTABLE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SUBSIDIZED CATALOG */}
      {activeTabSection === 'subsidized' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-[#22304A] bg-[#131C31] p-6 rounded-xl">
            <h3 className="font-semibold text-base text-slate-100">Subsidized Community Inventory</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Discounted surplus pharmaceutical batches cleared by CDSCO inspectors for subsidized community distribution.
            </p>
          </div>

          <div className="space-y-3">
            {SUBSIDIZED_CATALOG.map((item) => (
              <div key={item.id} className="border border-[#22304A] bg-[#131C31] p-5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-400" />
                    <h4 className="font-semibold text-sm text-slate-100">{item.name}</h4>
                    <span className="border border-emerald-800/50 bg-emerald-950/60 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {item.subsidizedPrice}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-300 text-xs">
                    Batch: <b className="text-slate-100 font-mono">{item.batch}</b> · Qty: <b className="text-slate-100">{item.qty} units</b> · Retail: <span className="line-through text-slate-400">{item.originalPrice}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Cleared by: {item.verifiedBy}
                  </p>
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shrink-0">
                  Allocate to Clinic
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
