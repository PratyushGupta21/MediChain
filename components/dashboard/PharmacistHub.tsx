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
  ExternalLink,
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
    // Generate EIP-712 typed-data signature for Polygon Amoy Testnet (Chain ID 80002)
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
        eyebrow="CDSCO Inspection &amp; Polygon Amoy Proofs"
        title="Pharmacist Verification Hub"
        description="Inspect submitted batches, run automated CDSCO Rule 96 checks, and sign EIP-712 typed-data proofs on Polygon Amoy (Chain ID 80002)."
        action={
          <div className="flex gap-2 font-mono text-xs">
            <Button
              onClick={() => setShowScanner(true)}
              className="rounded-sm border border-amber-500 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-md"
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
      <div className="flex border-b border-slate-700/60 font-mono text-xs">
        <button
          onClick={() => setActiveTabSection('queue')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'queue'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [01] Inspection Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTabSection('cdsco_checks')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'cdsco_checks'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [02] CDSCO Rule 96 Panel
        </button>
        <button
          onClick={() => setActiveTabSection('subsidized')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'subsidized'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [03] Subsidized Inventory Catalog
        </button>
      </div>

      {/* Live GS1 DataMatrix Camera Scanner Modal */}
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
            className="w-full max-w-lg rounded-sm border border-emerald-500/60 bg-[#1B1E26] p-6 shadow-2xl font-mono text-xs space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-700/60 pb-3">
              <div className="flex h-10 w-10 items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Polygon Amoy EIP-712 Proof Signed</h3>
                <p className="text-slate-400 text-[11px]">Batch #{approved.batch.batchNumber} committed to Chain ID 80002</p>
              </div>
            </div>

            <div className="border border-slate-700 bg-slate-900/90 p-4 space-y-2 text-[11px]">
              <div className="flex justify-between items-center text-slate-300">
                <span>Polygon Tx Hash:</span>
                <button onClick={() => copyTx(approved.proof.txHash)} className="flex items-center gap-1 text-amber-400 hover:underline">
                  {copiedTx ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedTx ? 'COPIED' : 'COPY HASH'}
                </button>
              </div>
              <p className="break-all text-emerald-400 font-bold">{approved.proof.txHash}</p>

              <div className="border-t border-slate-800 pt-2 text-[10px] space-y-1 text-slate-300">
                <p>QR Hash (Keccak256): <span className="text-slate-400">{approved.proof.qrHash.substring(0, 24)}...</span></p>
                <p>EIP-712 Signature: <span className="text-slate-400">{approved.proof.signature.substring(0, 32)}...</span></p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setApproved(null)} className="bg-emerald-500 text-slate-950 font-bold uppercase hover:bg-emerald-400">
                Dismiss Proof
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* SECTION 1: INSPECTION QUEUE */}
      {activeTabSection === 'queue' && (
        <div className="rounded-sm border border-slate-700/60 bg-[#1B1E26]">
          <div className="flex items-center justify-between border-b border-slate-700/60 p-5 font-mono text-xs">
            <div>
              <h2 className="font-bold text-base uppercase text-[#F8FAFC]">Pending Batch Submissions</h2>
              <p className="text-slate-400 font-sans text-xs mt-0.5">
                Review GTIN, packaging integrity, and expiry windows before signing.
              </p>
            </div>
            <span className="border border-amber-500/60 bg-amber-500/10 px-3 py-1 font-bold text-amber-400">
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
            <div className="divide-y divide-slate-700/60">
              {queue.map((batch) => (
                <div key={batch.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between font-mono text-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-amber-500/40 bg-amber-500/10 text-amber-400 rounded-sm">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#F8FAFC] text-sm uppercase">
                        {batch.brandName}{' '}
                        <span className="font-mono text-xs font-normal text-slate-400">({batch.genericName})</span>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-slate-300 text-[11px]">
                        <span>Batch: <b className="text-white">{batch.batchNumber}</b></span>
                        <span>Quantity: <b className="text-white">{batch.quantity} units</b></span>
                        <span>Expires: <b className="text-white">{formatDate(batch.expiryDate)}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === batch.id}
                      onClick={() => reject(batch.id)}
                      className="border-red-500/60 bg-red-950/40 text-red-300 hover:bg-red-900 font-bold uppercase"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === batch.id}
                      onClick={() => approve(batch)}
                      className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 uppercase shadow-md"
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
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm">
            <h3 className="font-bold text-base uppercase text-[#F8FAFC]">CDSCO Rule 96 Regulatory Cross-Reference Panel</h3>
            <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
              Automated compliance verification engine matching GS1 2D DataMatrix GTINs against Central Drugs Standard Control Organization databases.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-slate-700/60 bg-[#1B1E26] p-5 rounded-sm">
              <span className="text-[10px] text-amber-400 font-bold uppercase">[CHECK 01]</span>
              <h4 className="font-bold text-sm uppercase text-white mt-1">2D DataMatrix Serialization</h4>
              <p className="text-slate-300 font-sans text-xs mt-2 leading-relaxed">
                Requires unique GTIN, expiry timestamp, and serial number printed directly on primary packaging.
              </p>
              <div className="mt-4 border border-emerald-500/40 bg-emerald-950/40 p-2 text-emerald-300 text-[11px] font-bold">
                STATUS: COMPLIANT
              </div>
            </div>

            <div className="border border-slate-700/60 bg-[#1B1E26] p-5 rounded-sm">
              <span className="text-[10px] text-amber-400 font-bold uppercase">[CHECK 02]</span>
              <h4 className="font-bold text-sm uppercase text-white mt-1">CDSCO License Registry</h4>
              <p className="text-slate-300 font-sans text-xs mt-2 leading-relaxed">
                Verifies licensed inspector signature against active state drug control register.
              </p>
              <div className="mt-4 border border-emerald-500/40 bg-emerald-950/40 p-2 text-emerald-300 text-[11px] font-bold">
                STATUS: AUTHORIZED
              </div>
            </div>

            <div className="border border-slate-700/60 bg-[#1B1E26] p-5 rounded-sm">
              <span className="text-[10px] text-amber-400 font-bold uppercase">[CHECK 03]</span>
              <h4 className="font-bold text-sm uppercase text-white mt-1">Polygon Amoy EIP-712</h4>
              <p className="text-slate-300 font-sans text-xs mt-2 leading-relaxed">
                EIP-712 structured data hash broadcasted to Polygon Amoy consensus (Chain ID 80002).
              </p>
              <div className="mt-4 border border-emerald-500/40 bg-emerald-950/40 p-2 text-emerald-300 text-[11px] font-bold">
                STATUS: IMMUTABLE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SUBSIDIZED CATALOG */}
      {activeTabSection === 'subsidized' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm">
            <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Subsidized Community Inventory</h3>
            <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
              Discounted surplus pharmaceutical batches cleared by CDSCO inspectors for subsidized community distribution.
            </p>
          </div>

          <div className="space-y-3">
            {SUBSIDIZED_CATALOG.map((item) => (
              <div key={item.id} className="border border-slate-700/60 bg-[#1B1E26] p-5 rounded-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-[#F8FAFC] uppercase">{item.name}</h4>
                    <span className="border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                      {item.subsidizedPrice}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-300 text-xs font-mono">
                    Batch: <b className="text-white">{item.batch}</b> · Qty: <b className="text-white">{item.qty} units</b> · Retail: <span className="line-through text-slate-400">{item.originalPrice}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Cleared by: {item.verifiedBy}
                  </p>
                </div>
                <Button size="sm" className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 shrink-0">
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
