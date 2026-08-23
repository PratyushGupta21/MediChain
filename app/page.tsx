'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import type { Persona, DbRole } from '@/lib/types';
import { ROLE_DISPLAY_NAMES } from '@/lib/types';
import {
  ShieldCheck,
  PackageCheck,
  Truck,
  ArrowRight,
  Activity,
  Lock,
  Boxes,
  QrCode,
  Flame,
  Clock,
  Home as HomeIcon,
  HeartHandshake,
  UserRound,
  Menu,
  X,
  FileCheck2,
  Cpu,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  ArrowUpRight,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import SwissWaveCanvas from '@/components/SwissWaveCanvas';
import AuthModal from '@/components/auth-modal';
import { CdscoModal, Eip712Modal, PolygonModal } from '@/components/footer-modals';

const CUSTODY_STEPS = [
  {
    step: '01',
    focal: 'DATA MATRIX CAPTURE',
    title: 'Household Submission',
    role: 'Individual Donor',
    tab: 'household' as Persona,
    desc: 'Surplus unexpired pharmaceuticals are cataloged with GS1 DataMatrix GTIN, manufacture date, and packaging telemetry.',
    color: '#10B981', // Clinical Emerald
    icon: HomeIcon,
  },
  {
    step: '02',
    focal: 'STRICT VERIFICATION',
    title: 'Pharmacist Inspection',
    role: 'CDSCO Licensed Inspector',
    tab: 'pharmacist' as Persona,
    desc: 'Licensed inspectors verify seal integrity and sign immutable EIP-712 typed data signatures to the Polygon ledger.',
    color: '#2563EB', // Royal Blue
    icon: ShieldCheck,
  },
  {
    step: '03',
    focal: 'ADAPTIVE FLOW',
    title: 'NGO Redistribution',
    role: 'Verified Clinic Partner',
    tab: 'ngo' as Persona,
    desc: 'Approved non-expired batches (>60d remaining) are dynamically allocated and dispatched to community health centers.',
    color: '#10B981', // Clinical Emerald
    icon: HeartHandshake,
  },
  {
    step: '04',
    focal: 'ZERO LANDFILL WASTE',
    title: 'Bio-Hazard Destruction',
    role: 'Certified Disposals',
    tab: 'waste' as Persona,
    desc: 'Expired or hazardous batches (<30d) are sealed in tracked container routes and incinerated at 850°C.',
    color: '#DC2626', // Crimson Alert
    icon: Flame,
  },
];

const STATS = [
  { label: 'Medicines Logged', value: '12,400+', tone: 'safe', sub: 'Tamper-proof ledger entries' },
  { label: 'FEFO Redistribution Rate', value: '94.2%', tone: 'safe', sub: 'Surplus re-allocated before expiry' },
  { label: 'Bio-Hazard Incinerated', value: '3,200 kg', tone: 'hazard', sub: 'Zero landfill contamination' },
  { label: 'Active Partner Network', value: '148+', tone: 'warning', sub: 'CDSCO verified clinics' },
];

export default function Home() {
  const router = useRouter();
  const { user, setAuthOpen, signOut } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);

  const [cdscoOpen, setCdscoOpen] = useState(false);
  const [eip712Open, setEip712Open] = useState(false);
  const [polygonOpen, setPolygonOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyContractAddress = () => {
    navigator.clipboard.writeText('0x71C8A9b2341d497D29E30800b4a4fD654b3F3F82');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const navigateProtected = (targetTab: Persona) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    router.push(`/dashboard?tab=${targetTab}`);
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <AuthModal />
      <CdscoModal open={cdscoOpen} onClose={() => setCdscoOpen(false)} />
      <Eip712Modal open={eip712Open} onClose={() => setEip712Open(false)} />
      <PolygonModal open={polygonOpen} onClose={() => setPolygonOpen(false)} />

      {/* Background Canvas */}
      <SwissWaveCanvas />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#22304A] bg-[#0B1120]/95 backdrop-blur-md font-sans">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-sm">
                MC
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-100 font-sans">
                MEDI<span className="text-emerald-500">CHAIN</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-2 text-xs font-sans lg:flex">
            <button
              onClick={() => navigateProtected('household')}
              className="border border-[#22304A] bg-[#131C31] px-4 py-2 hover:bg-[#1C2845] text-slate-200 font-medium rounded-lg transition-colors"
            >
              Household
            </button>
            <button
              onClick={() => navigateProtected('pharmacist')}
              className="border border-blue-800/50 bg-blue-950/60 px-4 py-2 hover:bg-blue-900 text-blue-300 font-semibold rounded-lg transition-colors"
            >
              Verification Hub
            </button>
            <button
              onClick={() => navigateProtected('ngo')}
              className="border border-[#22304A] bg-[#131C31] px-4 py-2 hover:bg-[#1C2845] text-slate-200 font-medium rounded-lg transition-colors"
            >
              NGO Redistribution
            </button>
            <button
              onClick={() => navigateProtected('waste')}
              className="border border-[#22304A] bg-[#131C31] px-4 py-2 hover:bg-[#1C2845] text-slate-200 font-medium rounded-lg transition-colors"
            >
              Waste Collector
            </button>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Role Badge */}
            {user && (
              <div className="hidden border border-[#22304A] bg-[#131C31] px-3 py-1 text-xs text-amber-400 font-semibold sm:block rounded-full">
                ROLE: {ROLE_DISPLAY_NAMES[user.role] ?? user.role}
              </div>
            )}

            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2.5 border border-[#22304A] bg-[#131C31] px-3.5 py-1.5 text-left hover:border-slate-500 text-xs rounded-lg font-sans">
                  <div
                    className="flex h-6 w-6 items-center justify-center font-bold text-white rounded-md text-xs"
                    style={{ backgroundColor: user.avatarColor || '#10B981' }}
                  >
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-100">{user.name}</p>
                  </div>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-400" />
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-52 border border-[#22304A] bg-[#131C31] p-1.5 opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:opacity-100 text-xs rounded-lg font-sans">
                  <div className="border-b border-[#22304A] pb-2 mb-1 px-3 pt-2 text-[11px] text-amber-400 font-semibold">
                    ROLE: {user.role}
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      setAuthOpen(true);
                    }}
                    className="flex w-full items-center gap-2 border border-transparent p-2 text-left text-slate-300 hover:bg-[#0B1120] hover:text-white font-medium rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 py-16 md:px-8 lg:py-24">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE PROTOCOL · REGULATORY COMPLIANT
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl leading-tight">
            Decentralized Pharmaceutical Traceability &amp; Waste Telemetry
          </h1>

          <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
            MediChain enforces Rule 96 CDSCO verification, FEFO expiry redistribution, and high-temperature bio-hazard incineration on the Polygon Amoy blockchain ledger.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 font-sans text-xs">
            <Button
              size="lg"
              onClick={() => navigateProtected('household')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-6 py-3 text-sm shadow-md"
            >
              Launch Portal Hub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setEip712Open(true)}
              className="bg-[#131C31] hover:bg-[#1C2845] text-slate-200 border border-[#22304A] rounded-lg px-6 py-3 text-sm font-medium"
            >
              View Architecture Proofs
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Architecture Grid */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 py-12 md:px-8">
        <div className="border-b border-[#22304A] pb-4 mb-8">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Chain of Custody Protocol</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">Platform Hub Architecture</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 font-sans">
          {CUSTODY_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                whileHover={{ y: -3 }}
                onClick={() => navigateProtected(step.tab)}
                className="cursor-pointer rounded-xl border border-[#22304A] bg-[#131C31] p-6 shadow-sm flex flex-col justify-between hover:border-slate-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1120] border border-[#22304A] text-slate-200">
                      <Icon className="h-5 w-5" style={{ color: step.color }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">[{step.step}]</span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-100">{step.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{step.role}</p>
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-6 flex items-center text-xs font-semibold text-blue-400 group">
                  <span>Access Module</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="relative z-10 border-t border-b border-[#22304A] bg-[#131C31]/60 py-12">
        <div className="mx-auto max-w-[1440px] px-6 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[#22304A] bg-[#131C31] p-6 shadow-sm font-sans">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
