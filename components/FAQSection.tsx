'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'cdsco-compliance',
    question: 'How does MediChain ensure CDSCO Rule 96 compliance?',
    category: 'Regulatory Verification',
    icon: ShieldCheck,
    answer:
      'MediChain mandates GS1 2D DataMatrix barcode serialization encoded with the (01) GTIN, (17) Expiry Date, (10) Batch Number, and (21) Serial Number. Prior to redistribution, licensed pharmacists generate off-chain EIP-712 structured cryptographic signatures that commit batch verification records immutably to Polygon Amoy PoS, establishing an unforgeable regulatory audit trail.',
  },
  {
    id: 'ai-ocr-privacy',
    question: 'How does the AI prescription scanner protect patient privacy?',
    category: 'Privacy & Security',
    icon: Sparkles,
    answer:
      'The prescription OCR engine utilizes Google Gemini Multimodal Vision API in stateless memory execution. Images are analyzed in ephemeral buffers strictly for medicine dosage, schedule category, and FEFO extraction. No personally identifiable information (PII), patient names, or prescription photos are stored on-chain or retained in database persistence.',
  },
  {
    id: 'waste-destruction',
    question: 'What happens to expired or damaged bio-hazard waste?',
    category: 'Waste Telemetry',
    icon: Flame,
    answer:
      'Damaged and expired medications are routed according to Bio-Medical Waste Management Rules, 2016 and CPCB Form-IV standards. Hazardous cytostatics undergo two-stage high-temperature thermal incineration at 850°C to 1100°C. Live temperature telemetry from CBWTF furnaces is streamed in real-time via Supabase WebSockets and validated with cryptographic proof-of-destruction.',
  },
  {
    id: 'ngo-authenticity',
    question: 'How do NGOs verify medicine authenticity before distribution?',
    category: 'Supply Chain Provenance',
    icon: CheckCircle2,
    answer:
      'NGO partners access an authenticated foundation vault where every listed medicine batch has undergone double-attestation: automated packaging inspection and licensed pharmacist physical review. NGOs can inspect the complete provenance ledger—from initial donor custody to CDSCO pharmacist sign-off—before dispensing to community health centers.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('cdsco-compliance');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative z-10 mx-auto max-w-[1440px] px-6 py-20 lg:px-8 font-sans">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-800/60 bg-emerald-100 dark:bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-4">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Enterprise Architecture &amp; Governance
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Explore how MediChain pairs cryptographic blockchain security, GS1 standards, and AI-driven telemetry to guarantee medicine integrity.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;

          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-emerald-500/80 bg-white/95 dark:bg-zinc-900/95 shadow-lg shadow-emerald-500/5 dark:border-emerald-500/60'
                  : 'border-slate-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 hover:border-slate-300 dark:hover:border-zinc-700 backdrop-blur-md'
              }`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="flex w-full items-center justify-between p-5 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5 pr-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isOpen
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'border-slate-200 bg-slate-100/80 text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-zinc-800 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'text-slate-400'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="border-t border-slate-100 dark:border-zinc-800/80 px-5 pb-5 pt-3">
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
