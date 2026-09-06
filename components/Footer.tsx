'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ChevronUp,
  Cpu,
  Layers,
  FileCheck,
  Flame,
  ScanLine,
  FileCode2,
  Lock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CdscoModal, Eip712Modal, PolygonModal } from '@/components/footer-modals';
import PrivacyPolicyModal from '@/components/legal/PrivacyPolicyModal';
import TermsModal from '@/components/legal/TermsModal';

export default function Footer() {
  const [cdscoOpen, setCdscoOpen] = useState(false);
  const [eip712Open, setEip712Open] = useState(false);
  const [polygonOpen, setPolygonOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [activeSpecModal, setActiveSpecModal] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Compliance & Verification Modals */}
      <CdscoModal open={cdscoOpen} onClose={() => setCdscoOpen(false)} />
      <Eip712Modal open={eip712Open} onClose={() => setEip712Open(false)} />
      <PolygonModal open={polygonOpen} onClose={() => setPolygonOpen(false)} />
      <PrivacyPolicyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />

      {/* Generic Technical Specification Modal */}
      {activeSpecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-7 shadow-2xl text-slate-900 dark:text-slate-100 font-sans">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Technical Specification
                </span>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {activeSpecModal === 'gs1' && 'GS1 2D DataMatrix Standard'}
                  {activeSpecModal === 'ocr' && 'Gemini 1.5 Flash Vision OCR'}
                  {activeSpecModal === 'incineration' && '850°C - 1100°C Thermal Standards'}
                  {activeSpecModal === 'repo' && 'MediChain Architecture Repository'}
                  {activeSpecModal === 'api' && 'REST API & Supabase Telemetry'}
                  {activeSpecModal === 'whitepaper' && 'MediChain Security Protocol'}
                </h3>
              </div>
              <button
                onClick={() => setActiveSpecModal(null)}
                className="rounded-lg border border-slate-200 dark:border-zinc-700 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {activeSpecModal === 'gs1' && (
                <>
                  <p>
                    Strict adherence to Global Standards One (GS1) Application Identifiers:
                  </p>
                  <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/40 p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
                    <div>(01) GTIN: 08901234567890</div>
                    <div>(17) EXPIRY: YYMMDD</div>
                    <div>(10) BATCH: MC-BATCH-2026-X</div>
                    <div>(21) SERIAL: S982147321098</div>
                  </div>
                  <p>
                    Enables zero-latency batch recall and prevents counterfeit distribution through deterministic hashing.
                  </p>
                </>
              )}

              {activeSpecModal === 'ocr' && (
                <>
                  <p>
                    Powered by Google Gemini Multimodal Vision models with structured JSON schema output:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Multi-item medicine identification from blister packs, boxes, and foil sheets.</li>
                    <li>Automated FEFO expiry extraction and Schedule H/X regulatory classification.</li>
                    <li>Sub-second inference with confidence scoring.</li>
                  </ul>
                </>
              )}

              {activeSpecModal === 'incineration' && (
                <>
                  <p>
                    Bio-Medical Waste Management Rules, 2016 &amp; CPCB Form-IV validation:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Primary Chamber: 850°C (±50°C) for complete cytotoxic thermal destruction.</li>
                    <li>Secondary Chamber: 1050°C (±50°C) with 2-second gas residence time.</li>
                    <li>Real-time IoT temperature telemetry logged immutably.</li>
                  </ul>
                </>
              )}

              {activeSpecModal === 'repo' && (
                <>
                  <p>
                    MediChain is an enterprise open-architecture distributed pharmaceutical and bio-hazard ledger:
                  </p>
                  <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/40 p-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    git clone https://github.com/PratyushGupta21/MediChain.git
                  </div>
                  <p>
                    Full stack includes Next.js App Router, Tailwind CSS, Polygon PoS contracts, Supabase Realtime, and Gemini Vision API.
                  </p>
                </>
              )}

              {activeSpecModal === 'api' && (
                <>
                  <p>
                    Comprehensive REST &amp; WebSocket Endpoints:
                  </p>
                  <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/40 p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
                    <div>POST /api/gemini - Multimodal Vision OCR</div>
                    <div>WSS supabase.co - Realtime Waste Telemetry</div>
                    <div>RPC amoy.polygon.technology - EIP-712 Verification</div>
                  </div>
                </>
              )}

              {activeSpecModal === 'whitepaper' && (
                <>
                  <p>
                    <strong>Security Architecture:</strong>
                  </p>
                  <p>
                    Dual-layer verification combining off-chain EIP-712 structured data signing by CDSCO-registered pharmacists with on-chain cryptographic commitment on Polygon Amoy. Zero PII stored on-chain.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveSpecModal(null)}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Global Footer Container */}
      <footer className="relative z-20 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-black/90 text-slate-600 dark:text-zinc-400 backdrop-blur-xl font-sans transition-colors duration-300">
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
          {/* 4-Column Responsive Grid */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Column 1: Brand & Live Telemetry */}
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-transform group-hover:scale-105">
                  MC
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  MEDI<span className="text-emerald-600 dark:text-emerald-400">CHAIN</span>
                </span>
              </Link>

              {/* Live Status Indicator */}
              <button
                onClick={() => setPolygonOpen(true)}
                className="flex items-center gap-2 rounded-full border border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-100/70 dark:bg-emerald-950/50 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Polygon Amoy Protocol · Fully Operational</span>
              </button>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                Next-generation pharmaceutical provenance, anti-counterfeiting verification, and bio-hazard disposal telemetry.
              </p>

              {/* Regulatory Interactive Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setCdscoOpen(true)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>CDSCO Rule 96 Verified</span>
                </button>
                <button
                  onClick={() => setActiveSpecModal('incineration')}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>CPCB Form-IV Compliant</span>
                </button>
              </div>
            </div>

            {/* Column 2: Role-Based Portals */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Role-Based Portals
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                {[
                  { label: 'Household Donor Portal', tab: 'household' },
                  { label: 'Licensed Pharmacist Hub', tab: 'pharmacist' },
                  { label: 'NGO Redistribution Network', tab: 'ngo' },
                  { label: 'Bio-Hazard Waste Telemetry', tab: 'waste' },
                ].map((item) => (
                  <li key={item.tab}>
                    <Link
                      href={`/dashboard?tab=${item.tab}`}
                      className="group flex items-center justify-between text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600 dark:text-emerald-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Technical & Compliance Specifications */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Technical Specifications
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => setActiveSpecModal('gs1')}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <ScanLine className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      GS1 2D DataMatrix Encoding
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setEip712Open(true)}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      EIP-712 Cryptographic Signatures
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSpecModal('ocr')}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      Multi-Item Gemini Vision OCR
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSpecModal('incineration')}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      850°C Incineration Standards
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Architecture & Open Specifications */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Architecture &amp; Docs
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                  Team EMPYRA
                </span>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => setActiveSpecModal('repo')}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <FileCode2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      Source Code Repository
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSpecModal('api')}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      REST API Reference
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPolygonOpen(true)}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      Smart Contract Audit Log
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSpecModal('whitepaper')}
                    className="group flex items-center justify-between w-full text-left text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      Security Protocol Whitepaper
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Lower Legal & Utility Dock */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 dark:border-zinc-800/80 pt-8 lg:flex-row text-xs text-slate-500 dark:text-zinc-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
              <p>
                &copy; 2026 MediChain. All rights reserved. Enterprise Pharmaceutical Provenance &amp; Waste Management Protocol.
              </p>
              <div className="flex items-center gap-4 text-slate-600 dark:text-zinc-400">
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 underline-offset-4 hover:underline transition-colors"
                >
                  Privacy Policy
                </button>
                <span>·</span>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 underline-offset-4 hover:underline transition-colors"
                >
                  Terms of Service
                </button>
                <span>·</span>
                <button
                  onClick={() => setCdscoOpen(true)}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 underline-offset-4 hover:underline transition-colors"
                >
                  Compliance
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={scrollToTop}
                aria-label="Scroll back to top"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm group"
              >
                <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
