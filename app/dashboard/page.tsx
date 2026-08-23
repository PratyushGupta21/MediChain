'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/app-context';
import type { Persona } from '@/lib/types';
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

const portalTabs: {
  id: Persona;
  label: string;
  shortLabel: string;
  icon: typeof Home;
}[] = [
  { id: 'household', label: 'Household Portal', shortLabel: 'Household', icon: Home },
  { id: 'pharmacist', label: 'Verification Hub', shortLabel: 'Pharmacist', icon: ShieldCheck },
  { id: 'ngo', label: 'NGO / Patient Hub', shortLabel: 'NGO / Patient', icon: HeartHandshake },
  { id: 'waste', label: 'Waste Collector', shortLabel: 'Waste', icon: Truck },
];

export default function DashboardPage() {
  const { user, loading, setAuthOpen, signOut } = useApp();
  const [activeTab, setActiveTab] = useState<Persona>(user?.persona ?? 'household');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (user) setActiveTab(user.persona);
  }, [user]);

  const switchPortal = (persona: Persona) => {
    setActiveTab(persona);
    setMobileMenu(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthModal />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold bg-card">
                <Activity className="h-4 w-4 text-gold" />
              </div>
              <span className="hidden text-lg font-bold text-gold sm:block">MediChain</span>
            </Link>
            <div className="ml-3 hidden items-center gap-2 border-l border-border pl-4 md:flex">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Unified workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-safe/40 bg-safe/20 px-3 py-1.5 text-xs text-safe-foreground sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-safe-foreground" />
              Polygon Amoy · Online
            </div>
            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left hover:border-gold">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-charcoal"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.organization}</p>
                  </div>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-card p-1 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100">
                  <button
                    onClick={async () => {
                      await signOut();
                      setAuthOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="bg-gold text-charcoal hover:bg-gold/90"
              >
                <UserRound className="mr-1.5 h-3.5 w-3.5" />
                Sign in
              </Button>
            )}
          </div>
        </div>
        {mobileMenu && (
          <div className="border-t border-border p-3 md:hidden">
            {portalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchPortal(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  activeTab === tab.id ? 'bg-gold/15 text-gold' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-border px-4 py-6 md:block">
          <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Portals
          </div>
          <nav className="space-y-1">
            {portalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchPortal(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gold/15 text-gold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                )}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-safe-foreground" />
              <span className="text-xs font-medium text-foreground">Ledger synced</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              All verification events are recorded on the MediChain test network.
            </p>
            <p className="mt-3 font-mono text-[9px] text-gold">
              {user ? `${user.walletAddress}` : 'Not connected'}
            </p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-12">
          {!user && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-gold/40 bg-gold/10 p-4">
              <div className="flex items-center gap-3">
                <CircleAlert className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    You&apos;re exploring in guest mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sign in to log medicines, approve batches, and manage disposal.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="bg-gold text-charcoal hover:bg-gold/90"
              >
                Sign in
              </Button>
            </div>
          )}
          {activeTab === 'household' && <HouseholdPortal />}
          {activeTab === 'pharmacist' && <PharmacistHub />}
          {activeTab === 'ngo' && <NgoHub />}
          {activeTab === 'waste' && <WasteCollectorModule />}
        </main>
      </div>
      <footer className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        MediChain · FEFO Pharmaceutical Tracking &amp; Bio-Medical Waste Lifecycle · Demo environment
      </footer>
    </div>
  );
}
