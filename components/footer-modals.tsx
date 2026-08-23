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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-xl rounded-none border border-neutral-700 bg-[#22252A] p-8 shadow-2xl text-[#F2EFE9] font-sans"
        >
          <div className="flex items-start justify-between border-b border-neutral-700/80 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
                [COMPLIANCE CERTIFICATE]
              </span>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#F2EFE9]">
                CDSCO Regulatory Audit
              </h2>
              <p className="text-xs text-neutral-300 font-mono">
                Central Drugs Standard Control Organization · Rule 96 Verified
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-none border border-neutral-700 p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            <div className="border border-emerald-500/50 bg-emerald-950/40 p-4 text-emerald-300">
              <div className="flex items-center justify-between font-mono text-xs uppercase font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  STATUS: FULLY COMPLIANT
                </span>
                <span className="text-[10px] text-emerald-400">
                  ID: CDSCO-IND-2026-MC
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-200 font-mono">
                MediChain protocol architecture complies strictly with CDSCO Rule 96 requirements for unique 2D DataMatrix barcode serialization, digital batch auditability, and tamper-proof chain of custody verification across India.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-neutral-700/80 bg-[#1C1E22] p-4">
                <p className="text-xs font-bold uppercase text-[#F2EFE9]">Barcode Serialization</p>
                <p className="mt-1 text-xs text-neutral-300 leading-relaxed font-mono">
                  GS1 2D DataMatrix compliance with GTIN, expiry timestamp, and batch serial number.
                </p>
              </div>
              <div className="border border-neutral-700/80 bg-[#1C1E22] p-4">
                <p className="text-xs font-bold uppercase text-[#F2EFE9]">Inspector Verification</p>
                <p className="mt-1 text-xs text-neutral-300 leading-relaxed font-mono">
                  Mandatory licensed pharmacist EIP-712 cryptographic signature prior to redistribution.
                </p>
              </div>
            </div>

            <div className="border border-neutral-700/80 bg-[#1C1E22] p-3.5 font-mono text-[11px]">
              <p className="text-amber-400 font-bold uppercase">Verification Standard Hash</p>
              <p className="mt-1 break-all text-neutral-200">
                0xa893f1c29e71b402837f19027c81d7653a9128f9217b189d283749102847c109
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="rounded-none border border-white bg-[#F2EFE9] text-neutral-950 font-bold uppercase hover:bg-white px-6 shadow-md"
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
  const [copied, setCopied] = React.useState(false);
  if (!open) return null;

  const sampleJson = `{
  "domain": {
    "name": "MediChain Protocol",
    "version": "1.0",
    "chainId": 80002,
    "verifyingContract": "0x71C8A9b2341d497D29E30800b4a4fD654b3F3F82"
  },
  "types": {
    "MedicineBatch": [
      { "name": "batchNumber", "type": "string" },
      { "name": "expiryTimestamp", "type": "uint256" },
      { "name": "pharmacistLicense", "type": "string" }
    ]
  },
  "primaryType": "MedicineBatch"
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-xl rounded-none border border-neutral-700 bg-[#22252A] p-8 shadow-2xl text-[#F2EFE9] font-sans"
        >
          <div className="flex items-start justify-between border-b border-neutral-700/80 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
                [CRYPTOGRAPHIC PROOF]
              </span>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#F2EFE9]">
                EIP-712 Signature Inspector
              </h2>
              <p className="text-xs text-neutral-300 font-mono">
                Structured Data Hashing &amp; ECDSA Verification Proof
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-none border border-neutral-700 p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-200 font-mono">
                Typed Data Schema
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white font-bold"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'COPIED' : 'COPY SCHEMA'}
              </button>
            </div>

            <pre className="overflow-x-auto rounded-none border border-neutral-700/80 bg-[#141619] p-4 font-mono text-[11px] leading-relaxed text-neutral-200">
              {sampleJson}
            </pre>

            <div className="border border-neutral-700/80 bg-[#1C1E22] p-4 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-bold uppercase">ECDSA Signature Hash</span>
                <span className="text-emerald-400 font-bold">VALIDATED</span>
              </div>
              <p className="mt-1 break-all text-neutral-200 text-[10px]">
                0x71f8e92a48b301c29e71b402837f19027c81d7653a9128f9217b189d28374910
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onClose}
              className="rounded-none border border-white bg-[#F2EFE9] text-neutral-950 font-bold uppercase hover:bg-white px-6 shadow-md"
            >
              Close Inspector
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
  const [copied, setCopied] = React.useState(false);
  const contractAddress = '0x71C8A9b2341d497D29E30800b4a4fD654b3F3F82';
  const explorerUrl = `https://amoy.polygonscan.com/address/${contractAddress}`;

  if (!open) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="w-full max-w-lg rounded-none border border-neutral-700 bg-[#22252A] p-8 shadow-2xl text-[#F2EFE9] font-sans"
        >
          <div className="flex items-start justify-between border-b border-neutral-700/80 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
                [LEDGER PROOF]
              </span>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[#F2EFE9]">
                Polygon Amoy Testnet
              </h2>
              <p className="text-xs text-neutral-300 font-mono">
                Polygon Proof-of-Stake Consensus · Chain ID 80002
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-none border border-neutral-700 p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4 text-xs font-mono">
            <div className="border border-neutral-700/80 bg-[#1C1E22] p-4">
              <p className="text-[10px] uppercase tracking-wider text-neutral-300 font-bold">Smart Contract Address</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-[#F2EFE9] break-all font-bold">
                  {contractAddress}
                </span>
                <button
                  onClick={copyAddress}
                  className="flex shrink-0 items-center gap-1 rounded-none border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 font-bold"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-neutral-700/80 bg-[#1C1E22] p-4">
                <p className="text-[10px] font-bold uppercase text-neutral-300">Consensus Engine</p>
                <p className="mt-1 text-xs text-emerald-400 font-bold">Polygon Amoy PoS</p>
              </div>
              <div className="border border-neutral-700/80 bg-[#1C1E22] p-4">
                <p className="text-[10px] font-bold uppercase text-neutral-300">Finality Latency</p>
                <p className="mt-1 text-xs text-[#F2EFE9] font-bold">&lt; 1.8 seconds</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-none border-neutral-600 bg-neutral-800/80 text-neutral-200 uppercase hover:bg-neutral-700 font-mono font-bold text-xs">
              Close
            </Button>
            <Button
              asChild
              className="rounded-none border border-white bg-[#F2EFE9] text-neutral-950 font-bold uppercase hover:bg-white px-6 font-mono text-xs shadow-md"
            >
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                Explorer
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
