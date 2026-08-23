'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import type { Persona } from '@/lib/types';
import {
  ShieldCheck,
  ArrowRight,
  Home as HomeIcon,
  HeartHandshake,
  Truck,
  Flame,
} from 'lucide-react';

const CUSTODY_STEPS = [
  {
    step: '01',
    title: 'Household Submission',
    role: 'Individual Donor',
    tab: 'household' as Persona,
    desc: 'Surplus unexpired pharmaceuticals cataloged with GS1 DataMatrix GTIN and packaging telemetry.',
    color: '#059669',
    icon: HomeIcon,
  },
  {
    step: '02',
    title: 'Pharmacist Inspection',
    role: 'CDSCO Licensed Inspector',
    tab: 'pharmacist' as Persona,
    desc: 'Licensed inspectors verify seal integrity and sign EIP-712 typed-data proofs on Polygon.',
    color: '#2563EB',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'NGO Redistribution',
    role: 'Verified Clinic Partner',
    tab: 'ngo' as Persona,
    desc: 'Approved non-expired batches are dynamically allocated to community health centers.',
    color: '#059669',
    icon: HeartHandshake,
  },
  {
    step: '04',
    title: 'Bio-Hazard Destruction',
    role: 'Certified Disposals',
    tab: 'waste' as Persona,
    desc: 'Expired or hazardous batches are sealed in tracked container routes and incinerated at 850°C.',
    color: '#DC2626',
    icon: Flame,
  },
];

export default function LandingHero({
  onNavigate,
  onOpenProofs,
}: {
  onNavigate: (tab: Persona) => void;
  onOpenProofs: () => void;
}) {
  return (
    <div className="space-y-16 font-sans">
      {/* Sleek Modern Hero Section */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 py-16 md:px-8 lg:py-24">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            LIVE PROTOCOL · REGULATORY COMPLIANT
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight">
            Decentralized Pharmaceutical Traceability &amp; Waste Telemetry
          </h1>

          <p className="text-base text-slate-700 sm:text-lg leading-relaxed font-sans">
            MediChain enforces Rule 96 CDSCO verification, FEFO expiry redistribution, and high-temperature bio-hazard incineration on the Polygon Amoy blockchain ledger.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 font-sans text-xs">
            <Button
              size="lg"
              onClick={() => onNavigate('household')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-6 py-3 text-sm shadow-md shadow-emerald-600/20"
            >
              Launch Portal Hub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenProofs}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-6 py-3 text-sm font-semibold shadow-sm"
            >
              View Architecture Proofs
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Architecture Grid */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 py-8 md:px-8">
        <div className="border-b border-slate-200 pb-4 mb-8">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Chain of Custody Protocol</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Platform Hub Architecture</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 font-sans">
          {CUSTODY_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate(step.tab)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-slate-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                      <Icon className="h-5 w-5" style={{ color: step.color }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">[{step.step}]</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 font-medium">{step.role}</p>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-emerald-700 group">
                  <span>Access Module</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
