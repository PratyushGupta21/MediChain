'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CdscoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-2xl text-slate-900 dark:text-slate-100 font-sans"
        >
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Compliance Certificate
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                CDSCO Regulatory Audit
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Central Drugs Standard Control Organization · Rule 96 Verified
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            <div className="border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-lg text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center justify-between text-xs font-semibold uppercase">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  STATUS: FULLY COMPLIANT
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300">
                  ID: CDSCO-IND-2026-MC
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                MediChain protocol architecture complies strictly with CDSCO Rule 96 requirements for unique 2D DataMatrix barcode serialization, digital batch auditability, and tamper-proof chain of custody verification across India.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Barcode Serialization</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  GS1 2D DataMatrix compliance with GTIN, expiry timestamp, and batch serial number.
                </p>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Inspector Verification</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Mandatory licensed pharmacist EIP-712 cryptographic signature prior to redistribution.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg text-xs">
              <p className="text-amber-700 dark:text-amber-400 font-semibold text-xs">Verification Standard Hash</p>
              <p className="mt-1 break-all text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                0xa893f1c29e71b402837f19027c81d7653a9128f9217b189d283749102847c109
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-6 shadow-md shadow-emerald-600/20"
            >
              Close Record
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function Eip712Modal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-2xl text-slate-900 dark:text-slate-100 font-sans"
        >
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                CRYPTOGRAPHIC PROOF
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                EIP-712 Typed Data Signatures
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Human-Readable Structured Off-Chain Verification Standards
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4 text-xs font-sans">
            <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Domain Separator</p>
              <pre className="mt-2 overflow-x-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 rounded-md">
{`{
  name: 'MediChainProtocolV1',
  version: '1.0.0',
  chainId: 80002, // Polygon Amoy Testnet
  verifyingContract: '0x71C8A9b2341d497D29E30800b4a4fD654b3F3F82'
}`}
              </pre>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Primary Type Standard</p>
              <pre className="mt-2 overflow-x-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 rounded-md">
{`BatchVerification(
  string batchNumber,
  bytes32 qrHash,
  string inspectorRole,
  uint256 timestamp
)`}
              </pre>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-6 shadow-md shadow-emerald-600/20"
            >
              Close Specification
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function PolygonModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-2xl text-slate-900 dark:text-slate-100 font-sans"
        >
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                LEDGER NETWORK
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Polygon Amoy Testnet Deployment
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Chain ID 80002 · High-Throughput Proof-of-Stake Consensus
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4 text-xs font-sans">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Contract Address</p>
                <p className="mt-1 break-all font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  0x71C8A9b2341d497D29E30800b4a4fD654b3F3F82
                </p>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-lg">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Consensus Finality</p>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  ~1.8 Seconds per Batch Commitment
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-6 shadow-md shadow-emerald-600/20"
            >
              Close Network Status
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

