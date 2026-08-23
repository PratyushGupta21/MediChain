'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/app-context';
import type { Persona } from '@/lib/types';
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
import SwissWaveCanvas from '@/components/SwissWaveCanvas';

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

export default function DashboardPage() {
  const { user, loading, setAuthOpen, signOut } = useApp();
  const [activeTab, setActiveTab] = useState<Persona>(user?.persona ?? 'household');
  const [mobileMenu, setMobileMenu] = useState(false);

  const visiblePortalTabs = allPortalTabs;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as Persona | null;
      if (tabParam && ['household', 'pharmacist', 'ngo', 'waste'].includes(tabParam)) {
        setActiveTab(tabParam);
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
    setActiveTab(persona);
    setMobileMenu(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-700 font-sans">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" /> Loading MediChain Ledger...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-slate-900 font-sans antialiased">
      <AuthModal />
      <SwissWaveCanvas />
      
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-slate-900 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-sm">
                MC
              </div>
              <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block font-sans">
                MEDI<span className="text-emerald-600">CHAIN</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 font-sans">
            <div className="hidden items-center gap-2 border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs text-emerald-800 font-semibold sm:flex rounded-full">
              <span className="h-2 w-2 animate-pulse bg-emerald-600 rounded-full" />
              Polygon Amoy · Operational
            </div>

            {/* Compact Role Tag */}
            {user && (
              <div className="hidden border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800 font-semibold sm:block rounded-full">
                ROLE: {ROLE_DISPLAY_NAMES[user.role] ?? user.role}
              </div>
            )}

            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2.5 border border-slate-200 bg-white px-3.5 py-1.5 text-left hover:border-slate-400 text-xs rounded-lg font-sans shadow-sm">
                  <div
                    className="flex h-6 w-6 items-center justify-center font-bold text-white rounded-md text-xs"
                    style={{ backgroundColor: user.avatarColor || '#10B981' }}
                  >
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                  </div>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-500" />
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-52 border border-slate-200 bg-white p-1.5 opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:opacity-100 text-xs rounded-lg font-sans">
                  <div className="border-b border-slate-200 pb-2 mb-1 px-3 pt-2 text-[11px] text-amber-800 font-semibold">
                    ROLE: {user.role}
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      setAuthOpen(true);
                    }}
                    className="flex w-full items-center gap-2 border border-transparent p-2 text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-md"
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 text-xs shadow-md shadow-emerald-600/20"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Navigation Bar */}
      <div className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] px-6 md:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2 text-xs font-sans">
            {visiblePortalTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => switchPortal(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                      : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-6 py-8 md:px-8">
        {activeTab === 'household' && <HouseholdPortal />}
        {activeTab === 'pharmacist' && <PharmacistHub />}
        {activeTab === 'ngo' && <NgoHub />}
        {activeTab === 'waste' && <WasteCollectorModule />}
      </main>
    </div>
  );
}
