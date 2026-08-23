'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/app-context';
import type { Persona, DbRole } from '@/lib/types';
import { ROLE_DISPLAY_NAMES } from '@/lib/types';
import {
  Activity,
  ChevronDown,
  CircleAlert,
  HeartHandshake,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth-modal';

import HouseholdPortal from '@/components/dashboard/HouseholdPortal';
import PharmacistHub from '@/components/dashboard/PharmacistHub';
import NgoHub from '@/components/dashboard/NgoHub';
import WasteCollectorModule from '@/components/dashboard/WasteCollectorModule';

const allPortalTabs: {
  id: Persona;
  index: string;
  label: string;
  shortLabel: string;
  icon: typeof Home;
}[] = [
  { id: 'household', index: '01', label: 'Household Portal', shortLabel: 'Household', icon: Home },
  { id: 'pharmacist', index: '02', label: 'CDSCO Verification', shortLabel: 'Pharmacist', icon: ShieldCheck },
  { id: 'ngo', index: '03', label: 'NGO Redistribution', shortLabel: 'NGO / Patient', icon: HeartHandshake },
  { id: 'waste', index: '04', label: 'Waste Collector', shortLabel: 'Waste', icon: Truck },
];

function getPermittedTabs(role?: DbRole): Persona[] {
  if (!role) return ['household', 'pharmacist', 'ngo', 'waste'];
  switch (role) {
    case 'HOUSEHOLD':
      return ['household', 'waste'];
    case 'PHARMACIST':
      return ['pharmacist', 'waste'];
    case 'NGO':
      return ['ngo', 'waste'];
    case 'WASTE_COLLECTOR':
      return ['waste', 'household', 'pharmacist', 'ngo'];
    default:
      return ['household', 'waste'];
  }
}

export default function DashboardPage() {
  const { user, loading, setAuthOpen, signOut } = useApp();
  const [activeTab, setActiveTab] = useState<Persona>(user?.persona ?? 'household');
  const [mobileMenu, setMobileMenu] = useState(false);

  const permittedTabs = getPermittedTabs(user?.role);
  const visiblePortalTabs = allPortalTabs.filter((t) => permittedTabs.includes(t.id));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as Persona | null;
      if (tabParam && ['household', 'pharmacist', 'ngo', 'waste'].includes(tabParam)) {
        if (user) {
          const userPermitted = getPermittedTabs(user.role);
          if (userPermitted.includes(tabParam)) {
            setActiveTab(tabParam);
          } else {
            setActiveTab(user.persona);
          }
        } else {
          setActiveTab(tabParam);
        }
        return;
      }
    }
    if (user) {
      setActiveTab(user.persona);
    }
  }, [user]);

  const switchPortal = (persona: Persona) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    const userPermitted = getPermittedTabs(user.role);
    if (!userPermitted.includes(persona)) {
      setAuthOpen(true);
      return;
    }
    setActiveTab(persona);
    setMobileMenu(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0F12] font-mono text-xs text-slate-300">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-500" /> LOADING MEDICHAIN LEDGER...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F8FAFC] font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <AuthModal />
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-[#0D0F12]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-sm border border-slate-700 p-2 text-slate-300 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center border border-amber-500 bg-amber-500 text-slate-950 font-extrabold text-sm shadow-md rounded-sm">
                MC
              </div>
              <span className="hidden text-base font-bold uppercase tracking-tight text-[#F8FAFC] sm:block font-sans">
                MEDICHAIN
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 border border-slate-700 bg-[#1B1E26] px-3 py-1.5 font-mono text-xs text-emerald-400 sm:flex uppercase font-bold rounded-sm">
              <span className="h-2 w-2 animate-pulse bg-emerald-400 rounded-full" />
              POLYGON AMOY · OPERATIONAL
            </div>

            {/* Compact Role Tag */}
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
                className="rounded-sm border border-amber-500 bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 text-xs px-4 h-9 shadow-md"
              >
                <UserRound className="mr-1.5 h-3.5 w-3.5" />
                Sign In
              </Button>
            )}
          </div>
        </div>
        {mobileMenu && (
          <div className="border-t border-slate-700/60 bg-[#1B1E26] p-3 md:hidden font-mono text-xs">
            {visiblePortalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchPortal(tab.id)}
                className={`flex w-full items-center gap-3 border p-2.5 text-left uppercase font-bold rounded-sm ${
                  activeTab === tab.id
                    ? 'border-amber-500 bg-amber-500 text-slate-950'
                    : 'border-slate-700 text-slate-300'
                }`}
              >
                <span>[{tab.index}]</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-700/60 px-4 py-8 md:block font-mono">
          <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            [PERMITTED PORTALS]
          </div>
          <nav className="space-y-1.5">
            {visiblePortalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchPortal(tab.id)}
                className={`flex w-full items-center gap-3 border px-3.5 py-3 text-left transition-colors text-xs font-mono uppercase font-bold rounded-sm ${
                  activeTab === tab.id
                    ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-md'
                    : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-slate-950 font-bold' : 'text-slate-400'}>
                  [{tab.index}]
                </span>
                <span>{tab.shortLabel}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 border border-slate-700/60 bg-[#1B1E26] p-4 text-xs font-mono rounded-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-400 animate-pulse rounded-full" />
              <span className="font-bold text-[#F8FAFC] uppercase">LEDGER SYNCED</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
              CDSCO digital signature verification live on Polygon PoS.
            </p>
            {user ? (
              <div className="mt-3 border-t border-slate-700/60 pt-2 space-y-1">
                <p className="text-[10px] text-amber-400 font-bold uppercase">
                  {ROLE_DISPLAY_NAMES[user.role] ?? user.role}
                </p>
                <p className="truncate text-[10px] text-slate-300 font-mono">
                  {user.walletAddress}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[10px] text-slate-400 font-bold border-t border-slate-700/60 pt-2">
                GUEST SESSION ACTIVE
              </p>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-12">
          {!user && (
            <div className="mb-8 border border-slate-700/60 bg-[#1B1E26] p-5 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm">
              <div className="flex items-center gap-3">
                <CircleAlert className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-[#F8FAFC] uppercase">GUEST SESSION ACTIVE</p>
                  <p className="text-[11px] text-slate-300">Sign in to submit batches, inspect digital signatures, and access restricted role modules.</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="rounded-sm border border-amber-500 bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 text-xs px-5 shrink-0 shadow-md"
              >
                Sign In / Sign Up
              </Button>
            </div>
          )}

          {activeTab === 'household' && <HouseholdPortal />}
          {activeTab === 'pharmacist' && <PharmacistHub />}
          {activeTab === 'ngo' && <NgoHub />}
          {activeTab === 'waste' && <WasteCollectorModule />}
        </main>
      </div>

      <footer className="border-t border-slate-700/60 bg-[#0D0F12] px-6 py-6 text-center text-xs font-mono text-slate-400">
        MEDICHAIN · PHARMACEUTICAL &amp; BIO-HAZARD TRACKING PROTOCOL
      </footer>
    </div>
  );
}
