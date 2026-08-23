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
    focal: 'FORM FOLLOWS FOCUS',
    title: 'Household Submission',
    role: 'Individual Donor',
    tab: 'household' as Persona,
    desc: 'Surplus unexpired pharmaceuticals are cataloged with GS1 DataMatrix GTIN, manufacture date, and packaging telemetry.',
    color: '#10B981', // Emerald Safe
    icon: HomeIcon,
  },
  {
    step: '02',
    focal: 'STRICT VERIFICATION',
    title: 'Pharmacist Inspection',
    role: 'CDSCO Licensed Inspector',
    tab: 'pharmacist' as Persona,
    desc: 'Licensed inspectors verify seal integrity and sign immutable EIP-712 typed data signatures to the Polygon ledger.',
    color: '#F59E0B', // Premium Amber
    icon: ShieldCheck,
  },
  {
    step: '03',
    focal: 'ADAPTIVE FLOW',
    title: 'NGO Redistribution',
    role: 'Verified Clinic Partner',
    tab: 'ngo' as Persona,
    desc: 'Approved non-expired batches (>60d remaining) are dynamically allocated and dispatched to community health centers.',
    color: '#10B981', // Emerald Safe
    icon: HeartHandshake,
  },
  {
    step: '04',
    focal: 'ZERO LANDFILL WASTE',
    title: 'Bio-Hazard Destruction',
    role: 'Certified Disposals',
    tab: 'waste' as Persona,
    desc: 'Expired or hazardous batches (<30d) are sealed in tracked container routes and incinerated at 850°C.',
    color: '#EF4444', // Crimson Alert
    icon: Flame,
  },
];

const STATS = [
  { label: 'Medicines Logged', value: '12,400+', tone: 'gold', sub: 'Tamper-proof ledger entries' },
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
    <div className="relative min-h-screen bg-[#0D0F12] text-[#F8FAFC] font-sans selection:bg-amber-500 selection:text-slate-950">
      <AuthModal />
      <CdscoModal open={cdscoOpen} onClose={() => setCdscoOpen(false)} />
      <Eip712Modal open={eip712Open} onClose={() => setEip712Open(false)} />
      <PolygonModal open={polygonOpen} onClose={() => setPolygonOpen(false)} />

      {/* Generative Wave Canvas */}
      <SwissWaveCanvas />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-[#0D0F12]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center border border-amber-500 bg-amber-500 text-slate-950 font-extrabold text-sm shadow-md rounded-sm">
                MC
              </div>
              <span className="text-base font-bold uppercase tracking-tight text-slate-100 font-sans">
                MEDICHAIN
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-2 font-mono text-xs lg:flex">
            <button
              onClick={() => navigateProtected('household')}
              className="border border-slate-700 bg-slate-800/60 px-3.5 py-1.5 uppercase transition hover:border-slate-500 hover:text-white text-slate-200 font-semibold rounded-sm"
            >
              <span className="text-slate-400 mr-1.5">[01]</span> Household
            </button>
            <button
              onClick={() => navigateProtected('pharmacist')}
              className="border border-amber-500/60 bg-amber-500/10 px-3.5 py-1.5 uppercase transition hover:bg-amber-500/20 text-amber-400 font-bold rounded-sm"
            >
              <span className="text-amber-500 mr-1.5">[02]</span> Verification Hub
            </button>
            <button
              onClick={() => navigateProtected('ngo')}
              className="border border-slate-700 bg-slate-800/60 px-3.5 py-1.5 uppercase transition hover:border-slate-500 hover:text-white text-slate-200 font-semibold rounded-sm"
            >
              <span className="text-slate-400 mr-1.5">[03]</span> NGO Redistribution
            </button>
            <button
              onClick={() => navigateProtected('waste')}
              className="border border-slate-700 bg-slate-800/60 px-3.5 py-1.5 uppercase transition hover:border-slate-500 hover:text-white text-slate-200 font-semibold rounded-sm"
            >
              <span className="text-slate-400 mr-1.5">[04]</span> Waste Collector
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Compact Role Badge */}
            {user && (
              <div className="hidden border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 font-mono text-xs text-amber-400 uppercase font-bold sm:block rounded-sm">
                [ROLE: {ROLE_DISPLAY_NAMES[user.role] ?? user.role}]
              </div>
            )}

            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2 border border-slate-700 bg-[#1B1E26] px-3 py-1.5 text-left hover:border-slate-500 font-mono text-xs rounded-sm">
                  <div
                    className="flex h-6 w-6 items-center justify-center font-bold text-slate-950 rounded-sm"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-bold text-[#F8FAFC] uppercase">{user.name}</p>
                  </div>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-400" />
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-52 border border-slate-700 bg-[#1B1E26] p-1.5 opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:opacity-100 font-mono text-xs rounded-sm">
                  <div className="border-b border-slate-700/60 pb-2 mb-1 px-2 pt-1 text-[10px] text-amber-400 font-bold uppercase">
                    ROLE: {user.role}
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard?tab=${user.persona}`)}
                    className="flex w-full items-center gap-2 border border-transparent p-2 text-left text-slate-200 hover:bg-slate-800 uppercase font-bold rounded-sm mb-1"
                  >
                    Workspace Dashboard
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      setAuthOpen(true);
                    }}
                    className="flex w-full items-center gap-2 border border-transparent p-2 text-left text-slate-300 hover:border-slate-600 hover:text-white uppercase font-bold rounded-sm"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="rounded-sm border border-amber-500 bg-amber-500 text-slate-950 font-mono font-bold uppercase hover:bg-amber-400 text-xs px-4 h-9 shadow-md"
              >
                <UserRound className="mr-1.5 h-3.5 w-3.5" />
                Sign In
              </Button>
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-sm border border-slate-700 p-2 text-slate-300 hover:text-white lg:hidden"
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenu && (
          <div className="border-b border-slate-700/60 bg-[#1B1E26] p-4 lg:hidden space-y-2 font-mono text-xs">
            <button
              onClick={() => { setMobileMenu(false); navigateProtected('household'); }}
              className="flex w-full items-center justify-between border border-slate-700 p-3 uppercase text-slate-200 font-semibold rounded-sm text-left"
            >
              <span>[01] Household Portal</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => { setMobileMenu(false); navigateProtected('pharmacist'); }}
              className="flex w-full items-center justify-between border border-amber-500/60 bg-amber-500/10 p-3 uppercase text-amber-400 font-bold rounded-sm text-left"
            >
              <span>[02] CDSCO Verification Hub</span>
              <ArrowUpRight className="h-4 w-4 text-amber-400" />
            </button>
            <button
              onClick={() => { setMobileMenu(false); navigateProtected('ngo'); }}
              className="flex w-full items-center justify-between border border-slate-700 p-3 uppercase text-slate-200 font-semibold rounded-sm text-left"
            >
              <span>[03] NGO Redistribution</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => { setMobileMenu(false); navigateProtected('waste'); }}
              className="flex w-full items-center justify-between border border-slate-700 p-3 uppercase text-slate-200 font-semibold rounded-sm text-left"
            >
              <span>[04] Waste Management</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 pt-20 pb-24 md:px-12">
        <div className="flex flex-col items-start text-left">
          {/* Clean Regulatory Status Pill */}
          <div className="mb-6 inline-flex items-center gap-2 border border-slate-700/60 bg-[#1B1E26] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-slate-300 font-semibold rounded-sm">
            <span className="h-2 w-2 bg-emerald-400 animate-pulse rounded-full" />
            • LIVE PROTOCOL • REGULATORY COMPLIANT
          </div>

          <h1 className="max-w-5xl font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] uppercase text-[#F8FAFC]">
            MEDICHAIN: <span className="text-amber-400">FEFO PHARMACEUTICAL</span> TRACKING &amp; HAZARDOUS WASTE LIFECYCLE
          </h1>

          <p className="mt-6 max-w-2xl text-sm md:text-base text-slate-300 font-mono leading-relaxed">
            A strict First-Expired, First-Out (FEFO) protocol for verifiable pharmaceutical redistribution and high-temperature bio-medical incineration tracking across India.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 font-mono text-xs">
            <Button
              size="lg"
              onClick={() => {
                if (user) {
                  router.push(`/dashboard?tab=${user.persona}`);
                } else {
                  setAuthOpen(true);
                }
              }}
              className="rounded-sm border border-amber-500 bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 px-8 h-12 shadow-xl"
            >
              LAUNCH WORKSPACE
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a
              href="#architecture"
              className="inline-flex items-center justify-center rounded-sm border border-slate-700 bg-slate-800/80 px-6 h-12 font-bold uppercase text-slate-200 hover:border-slate-400 hover:text-white"
            >
              VIEW ARCHITECTURE
            </a>
          </div>
        </div>
      </section>

      {/* Strict 1px Grid Metric Section */}
      <section className="relative z-10 border-y border-slate-700/60 bg-[#1B1E26]">
        <div className="mx-auto max-w-[1440px]">
          <div className="swiss-grid-container grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="swiss-grid-tile">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold">
                  [METRIC 0{i + 1}]
                </span>
                <p className="mt-3 font-extrabold text-4xl tracking-tight text-[#F8FAFC] font-mono">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-bold uppercase text-amber-400 font-mono">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs font-mono text-slate-300">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Chain of Custody Protocol */}
      <section id="architecture" className="relative z-10 mx-auto max-w-[1440px] px-6 py-24 md:px-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-700/60 pb-6">
          <div>
            <span className="swiss-tag">[ARCHITECTURE INDEX]</span>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-[#F8FAFC] md:text-4xl">
              Chain of Custody Protocol
            </h2>
          </div>
          <p className="mt-3 md:mt-0 text-xs font-mono text-slate-300 max-w-md">
            End-to-end cryptographic verification from household submission to CDSCO validation, NGO allocation, and high-temp incineration.
          </p>
        </div>

        <div className="swiss-grid-container grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {CUSTODY_STEPS.map((step) => (
            <div
              key={step.step}
              onClick={() => navigateProtected(step.tab)}
              className="swiss-grid-tile flex flex-col justify-between min-h-[320px] cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
                  <span className="font-mono text-xs font-bold text-slate-300">
                    [{step.step}]
                  </span>
                  <step.icon className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                  {step.focal}
                </span>
                <h3 className="text-lg font-bold uppercase text-[#F8FAFC] mb-1 group-hover:text-amber-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs font-mono text-amber-400 mb-3 font-bold">
                  {step.role}
                </p>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                <span>Verification</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  IMMUTABLE
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEFO Classification Matrix */}
      <section className="relative z-10 border-t border-slate-700/60 bg-[#1B1E26] py-20 px-6 md:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 text-left border-b border-slate-700/60 pb-6">
            <span className="swiss-tag">[ALGORITHMIC MATRIX]</span>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-[#F8FAFC]">
              FEFO Classification Matrix
            </h2>
            <p className="mt-1 text-xs font-mono text-slate-300">
              Automated status classification rules based on verified expiration timelines.
            </p>
          </div>

          <div className="swiss-grid-container grid-cols-1 md:grid-cols-3">
            <div className="swiss-grid-tile border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">[WINDOW &gt; 60 DAYS]</span>
              <h3 className="mt-2 text-xl font-bold uppercase text-[#F8FAFC]">Safe Status</h3>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-mono">
                Verified unexpired batch with full shelf stability. Instantly available for CDSCO inspector signing and NGO patient redistribution.
              </p>
              <div className="mt-6 border border-emerald-500/40 bg-emerald-950/40 p-3 font-mono text-xs text-emerald-300 uppercase font-bold">
                Action: NGO Donation Allocation
              </div>
            </div>

            <div className="swiss-grid-tile border-l-4 border-l-amber-500">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">[WINDOW 30-60 DAYS]</span>
              <h3 className="mt-2 text-xl font-bold uppercase text-[#F8FAFC]">Warning Status</h3>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-mono">
                High-priority FEFO dispatch window. Expedited for immediate local community allocation prior to quality degradation.
              </p>
              <div className="mt-6 border border-amber-500/40 bg-amber-950/40 p-3 font-mono text-xs text-amber-300 uppercase font-bold">
                Action: Priority Dispatch Route
              </div>
            </div>

            <div className="swiss-grid-tile border-l-4 border-l-red-500">
              <span className="text-[10px] font-mono uppercase text-red-400 font-bold">[WINDOW &lt; 30 DAYS]</span>
              <h3 className="mt-2 text-xl font-bold uppercase text-[#F8FAFC]">Hazard Status</h3>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-mono">
                Expired or near-expiry batches strictly quarantined. Automated assignment to sealed collector routes for 850°C incineration.
              </p>
              <div className="mt-6 border border-red-500/40 bg-red-950/40 p-3 font-mono text-xs text-red-300 uppercase font-bold">
                Action: High-Temp Destruction Route
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="relative z-10 border-t border-slate-700/60 bg-[#0D0F12] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="swiss-grid-container grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="swiss-grid-tile">
              <span className="swiss-tag">[PROTOCOL IDENTITY]</span>
              <h4 className="mt-2 text-lg font-bold uppercase text-[#F8FAFC]">MediChain</h4>
              <p className="mt-2 text-xs font-mono text-slate-300 leading-relaxed">
                Decentralized FEFO Pharmaceutical Redistribution &amp; Bio-Medical Hazardous Waste Lifecycle Protocol.
              </p>
            </div>

            <div className="swiss-grid-tile">
              <span className="swiss-tag">[PORTALS]</span>
              <div className="mt-3 space-y-2 font-mono text-xs">
                <button onClick={() => navigateProtected('household')} className="w-full text-left border border-slate-700 bg-slate-800/80 p-2.5 uppercase text-slate-200 hover:border-slate-500 font-semibold rounded-sm">
                  01. Household Portal
                </button>
                <button onClick={() => navigateProtected('pharmacist')} className="w-full text-left border border-amber-500/60 bg-amber-500/10 p-2.5 uppercase text-amber-400 font-bold hover:bg-amber-500/20 rounded-sm">
                  02. CDSCO Verification Hub
                </button>
                <button onClick={() => navigateProtected('ngo')} className="w-full text-left border border-slate-700 bg-slate-800/80 p-2.5 uppercase text-slate-200 hover:border-slate-500 font-semibold rounded-sm">
                  03. NGO Redistribution
                </button>
                <button onClick={() => navigateProtected('waste')} className="w-full text-left border border-slate-700 bg-slate-800/80 p-2.5 uppercase text-slate-200 hover:border-slate-500 font-semibold rounded-sm">
                  04. Waste Management
                </button>
              </div>
            </div>

            <div className="swiss-grid-tile">
              <span className="swiss-tag">[COMPLIANCE &amp; PROOFS]</span>
              <div className="mt-3 space-y-2 font-mono text-xs">
                <button onClick={() => setCdscoOpen(true)} className="w-full text-left border border-slate-700 bg-slate-800/80 p-2.5 uppercase text-slate-200 hover:border-slate-500 flex justify-between font-semibold rounded-sm">
                  <span>CDSCO Rule 96</span>
                  <span className="text-emerald-400 font-bold">[INSPECT]</span>
                </button>
                <button onClick={() => setPolygonOpen(true)} className="w-full text-left border border-slate-700 bg-slate-800/80 p-2.5 uppercase text-slate-200 hover:border-slate-500 flex justify-between font-semibold rounded-sm">
                  <span>Polygon Amoy</span>
                  <span className="text-slate-300 font-bold">[EXPLORE]</span>
                </button>
                <button onClick={() => setEip712Open(true)} className="w-full text-left border border-slate-700 bg-slate-800/80 p-2.5 uppercase text-amber-400 hover:border-amber-500 flex justify-between font-bold rounded-sm">
                  <span>EIP-712 Signatures</span>
                  <span className="text-amber-400 font-bold">[PROOF]</span>
                </button>
              </div>
            </div>

            <div className="swiss-grid-tile">
              <span className="swiss-tag">[LEDGER STATUS]</span>
              <div className="mt-3 border border-slate-700 bg-slate-800/80 p-3.5 font-mono text-xs space-y-2 rounded-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">CONSENSUS:</span>
                  <span className="text-emerald-400 font-bold">OPERATIONAL 99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">CONTRACT:</span>
                  <button onClick={() => { copyContractAddress(); setPolygonOpen(true); }} className="text-[#F8FAFC] font-bold hover:underline">
                    0x71C8...3F82
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">LATENCY:</span>
                  <span className="text-slate-200 font-bold">&lt; 1.8S</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
            <p>© {new Date().getFullYear()} MEDICHAIN PROTOCOL. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 uppercase font-semibold">
              <span>[POLYGON POS]</span>
              <span>[CDSCO RULE 96]</span>
              <span>[EIP-712]</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
