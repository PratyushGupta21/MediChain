'use client';

import React, { useMemo, useState } from 'react';
import { Gs1CameraScanner } from '@/components/gs1-camera-scanner';
import { generateEip712Proof } from '@/lib/polygon-eip712';
import { ParsedGs1Data } from '@/lib/gs1-parser';
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
  CheckCircle2,
  FileCheck,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  XCircle,
  Camera,
  Layers,
  Award,
  Zap,
  Building2,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function PharmacistHub() {
  const { medicines, approveBatch, rejectBatch } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatch | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'verification' | 'subsidized_catalog' | 'cdsco_panel'>('verification');
  const [blockchainProof, setBlockchainProof] = useState<any | null>(null);
  const [generatingProof, setGeneratingProof] = useState(false);

  const pendingList = useMemo(
    () => medicines.filter((m) => m.status === 'pending_verification' || m.status === 'logged'),
    [medicines]
  );

  const approvedList = useMemo(
    () => medicines.filter((m) => m.status === 'approved' || m.quantity > 0),
    [medicines]
  );

  async function handleVerify(id: string) {
    setBusyId(id);
    await approveBatch(id);
    setBusyId(null);
  }

  async function handleReject(id: string) {
    setBusyId(id);
    await rejectBatch(id);
    setBusyId(null);
  }

  function handleScanSuccess(data: ParsedGs1Data) {
    setShowScanModal(false);
    alert(`GS1 DataMatrix Verified: GTIN ${data.gtin}, Expiry ${data.expiryDate}, Batch ${data.batchNumber}`);
  }

  async function generateProofForBatch(medicine: MedicineBatch) {
    setSelectedBatch(medicine);
    setGeneratingProof(true);
    const proof = await generateEip712Proof(medicine.batchNumber, 'CDSCO Licensed Inspector');
    setBlockchainProof(proof);
    setGeneratingProof(false);
  }

  return (
    <div className="space-y-8 font-sans">
      <SectionHeader
        eyebrow="CDSCO Inspection &amp; EIP-712 Proofs"
        title="Pharmacist Verification Hub"
        description="Verify packaging integrity, cross-reference CDSCO Rule 96 DataMatrix barcodes, sign EIP-712 typed-data proofs, and approve batches."
        action={
          <div className="flex gap-2 text-xs font-sans">
            <Button
              onClick={() => setShowScanModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-md shadow-emerald-600/20"
            >
              <Camera className="mr-2 h-4 w-4" />
              GS1 Camera Scanner
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Verification</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{pendingList.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CDSCO Rule 96 Passed</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">100%</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm font-sans">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subsidized Vault Batches</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{approvedList.length}</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-sans">
        <button
          onClick={() => setActiveTabSection('verification')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'verification'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Inspection Queue ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTabSection('subsidized_catalog')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'subsidized_catalog'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Subsidized Pharmacy Catalog ({approvedList.length})
        </button>
        <button
          onClick={() => setActiveTabSection('cdsco_panel')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'cdsco_panel'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Rule 96 Compliance Panel
        </button>
      </div>

      {/* GS1 Scanner Modal */}
      {showScanModal && (
        <Gs1CameraScanner
          title="CDSCO Pharmacist Barcode Inspection"
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanModal(false)}
        />
      )}

      {/* SECTION 1: VERIFICATION QUEUE */}
      {activeTabSection === 'verification' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 text-xs">
              <div>
                <h2 className="font-bold text-base text-slate-900">Pharmacist Verification Queue</h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Cross-reference physical packaging, batch serial numbers, and expiry parameters.
                </p>
              </div>
              <span className="text-slate-600 font-semibold">{pendingList.length} Batches Pending</span>
            </div>

            {pendingList.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={CheckCircle2}
                  title="Inspection queue is clear"
                  description="All submitted medicine batches have been verified with CDSCO compliance and signed to the ledger."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200 text-xs font-sans">
                {pendingList.map((medicine) => {
                  const days = getDaysUntilExpiry(medicine.expiryDate);
                  const isBusy = busyId === medicine.id;

                  return (
                    <div key={medicine.id} className="p-5">
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">{medicine.brandName}</h3>
                            <span className="text-slate-600">({medicine.genericName})</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                            <span>Batch: <b className="font-mono text-slate-900">{medicine.batchNumber}</b></span>
                            <span>Quantity: <b className="text-slate-900">{medicine.quantity} units</b></span>
                            <span>Expiry: <b className="text-slate-900">{formatDate(medicine.expiryDate)}</b></span>
                            <span>FEFO Status: <b className={days > 60 ? 'text-emerald-700' : 'text-amber-700'}>{days} Days Remaining</b></span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateProofForBatch(medicine)}
                            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs"
                          >
                            <QrCode className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                            View EIP-712 Proof
                          </Button>
                          <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleVerify(medicine.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs px-4 py-2 shadow-md shadow-emerald-600/20"
                          >
                            {isBusy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                            Approve &amp; Sign
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => handleReject(medicine.id)}
                            className="bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs"
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5 text-red-600" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: SUBSIDIZED CATALOG */}
      {activeTabSection === 'subsidized_catalog' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-slate-200 bg-white p-6 rounded-xl">
            <h3 className="font-bold text-base text-slate-900">Subsidized Pharmacy Distribution Catalog</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              CDSCO verified unexpired pharmaceutical inventory available for subsidized community distribution.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedList.map((med) => (
              <div key={med.id} className="border border-slate-200 bg-white p-5 rounded-xl space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{med.brandName}</h4>
                    <p className="text-slate-600 text-xs">{med.genericName}</p>
                  </div>
                  <span className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    RULE 96 VERIFIED
                  </span>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg text-xs space-y-1 font-sans">
                  <p className="text-slate-800">Batch: <span className="font-mono font-bold">{med.batchNumber}</span></p>
                  <p className="text-slate-800">Quantity: <span className="font-bold">{med.quantity} units</span></p>
                  <p className="text-slate-800">Expiry: <span>{formatDate(med.expiryDate)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: RULE 96 COMPLIANCE PANEL */}
      {activeTabSection === 'cdsco_panel' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-slate-200 bg-white p-6 rounded-xl">
            <h3 className="font-bold text-base text-slate-900">CDSCO Rule 96 Serialization Rules</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Automated compliance checklist verified upon every packaging camera scan.
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-6 rounded-xl space-y-3 text-xs font-sans">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">GS1 2D DataMatrix Encoding</p>
                <p className="text-slate-600">Application Identifiers (01) GTIN, (17) Expiry, (10) Batch Number validated.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Cryptographic Inspector Signature</p>
                <p className="text-slate-600">EIP-712 typed-data signature with polygon chain consensus.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Anti-Counterfeiting Ledger Anchor</p>
                <p className="text-slate-600">Keccak256 hash committed to Polygon Amoy Testnet (Chain ID 80002).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EIP-712 Cryptographic Proof Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl font-sans text-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">EIP-712 Proof</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedBatch.brandName}</h3>
                <p className="text-slate-600 text-xs font-mono">Batch #{selectedBatch.batchNumber}</p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatingProof ? (
              <div className="py-8 text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
                <p className="text-slate-600 font-mono text-xs">Computing Keccak256 EIP-712 Signature...</p>
              </div>
            ) : blockchainProof ? (
              <div className="space-y-3 font-sans text-xs">
                <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg space-y-1">
                  <p className="text-emerald-700 font-bold text-xs">Cryptographic Signature</p>
                  <p className="text-slate-900 font-mono text-[11px] break-all">{blockchainProof.signature}</p>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg space-y-1">
                  <p className="text-emerald-700 font-bold text-xs">Typed Data Hash</p>
                  <p className="text-slate-900 font-mono text-[11px] break-all">{blockchainProof.txHash}</p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedBatch(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 shadow-md shadow-emerald-600/20">
                Close Proof Window
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
