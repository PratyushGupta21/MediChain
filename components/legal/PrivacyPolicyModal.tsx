'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, EyeOff, Server, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 font-sans"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                <ShieldCheck className="h-3 w-3" />
                <span>DATA GOVERNANCE &amp; PRIVACY</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                MediChain Privacy Policy
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Effective Date: January 1, 2026 · Version 1.4
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="mt-6 flex-1 overflow-y-auto space-y-6 pr-2 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
            {/* Section 1 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                1. Data Minimization &amp; Zero PII on Ledger
              </h3>
              <p>
                MediChain is architected on the principle of strict data minimization. No Patient Personally Identifiable Information (PII), names, national IDs, or financial information are ever stored on public or consortium blockchain smart contracts. Only cryptographic commitments, batch serial hashes, and digital inspector attestations are committed to Polygon Amoy.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                2. AI Vision OCR &amp; Ephemeral Processing
              </h3>
              <p>
                When you scan medicine boxes or doctor prescriptions using Google Gemini 1.5 Flash Vision OCR, all image parsing occurs inside volatile in-memory buffers. Once dosage and expiry metadata are structured, the raw photo artifacts are permanently discarded and never sold, monetized, or shared with third-party advertising vendors.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                3. Telemetry &amp; Bio-Hazard Sensor Logs
              </h3>
              <p>
                Real-time temperature telemetry from Common Bio-medical Waste Treatment Facilities (CBWTF) incinerators and GPS routing timestamps are transmitted via encrypted TLS 1.3 WebSockets. These logs serve exclusively for regulatory compliance under Central Pollution Control Board (CPCB) Form-IV guidelines.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                4. HIPAA, GDPR &amp; Digital Personal Data Protection (DPDP) Alignment
              </h3>
              <p>
                MediChain protocols are engineered to comply with the Indian Digital Personal Data Protection Act, 2023, HIPAA Security Rules, and GDPR standards. You retain the permanent right to request audit logs and purge account preferences.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-4">
            <span className="text-[11px] text-slate-400">
              For privacy inquiries: security@medichain.org
            </span>
            <Button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-6 text-xs shadow-md shadow-emerald-600/20"
            >
              Acknowledge &amp; Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
