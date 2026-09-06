'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Award, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsModal({
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
                <Scale className="h-3 w-3" />
                <span>LEGAL TERMS &amp; REGULATORY CONDITIONS</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                MediChain Terms of Service
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Effective Date: January 1, 2026 · Version 2.0
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
                <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                1. Role-Based Verification &amp; Licensing Requirements
              </h3>
              <p>
                Participation in the Verification Hub is restricted to pharmacists possessing active State Pharmacy Council registration. Pharmacists are legally responsible for verifying blister foil integrity, liquid syrup seals, and Schedule H/X restrictions in accordance with Drugs and Cosmetics Rules, 1945 (CDSCO Rule 96).
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                2. Bio-Medical Waste Handling Disclaimers
              </h3>
              <p>
                Operators executing bio-hazard collection and destruction manifests must hold valid Common Bio-medical Waste Treatment Facility (CBWTF) operating permits. All cytotoxic incineration must strictly maintain 850°C (primary) and 1050°C (secondary) chamber temperatures as mandated by CPCB guidelines.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                3. Smart Contract Immutability &amp; Cryptographic Signatures
              </h3>
              <p>
                Users acknowledge that batch verification proofs, EIP-712 digital signatures, and manifest commitments recorded on Polygon Amoy are immutable and tamper-evident. Falsification of inspection telemetry constitutes a violation of institutional protocols and applicable pharmaceutical statutes.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                4. NGO Redistribution &amp; Non-Commercial Guarantee
              </h3>
              <p>
                Verified NGO partners and health foundations receiving redistributed medicines via MediChain certify that all allocated batches will be distributed free of charge or at strictly subsidized non-profit rates to underserved populations. Resale or commercial diversion is strictly prohibited.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-4">
            <span className="text-[11px] text-slate-400">
              Protocol Governance: compliance@medichain.org
            </span>
            <Button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-6 text-xs shadow-md shadow-emerald-600/20"
            >
              Accept Terms &amp; Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
