'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import type { Persona } from '@/lib/types';
import { ROLE_DISPLAY_NAMES } from '@/lib/types';
import {
  ChevronDown,
  LogOut,
} from 'lucide-react';
import SwissWaveCanvas from '@/components/SwissWaveCanvas';
import LandingHero from '@/components/LandingHero';
import AuthModal from '@/components/auth-modal';
import { CdscoModal, Eip712Modal, PolygonModal } from '@/components/footer-modals';

export default function Home() {
  const router = useRouter();
  const { user, setAuthOpen, signOut } = useApp();

  const [cdscoOpen, setCdscoOpen] = useState(false);
  const [eip712Open, setEip712Open] = useState(false);
  const [polygonOpen, setPolygonOpen] = useState(false);

  const navigateProtected = (targetTab: Persona) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    router.push(`/dashboard?tab=${targetTab}`);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      <AuthModal />
      <CdscoModal open={cdscoOpen} onClose={() => setCdscoOpen(false)} />
      <Eip712Modal open={eip712Open} onClose={() => setEip712Open(false)} />
      <PolygonModal open={polygonOpen} onClose={() => setPolygonOpen(false)} />

      {/* High-Contrast Black Line Art Wave Canvas */}
      <SwissWaveCanvas />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md font-sans">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-sm">
                MC
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                MEDI<span className="text-emerald-600">CHAIN</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-2 text-xs font-sans lg:flex">
            <button
              onClick={() => navigateProtected('household')}
              className="border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg transition-colors shadow-sm"
            >
              Household
            </button>
            <button
              onClick={() => navigateProtected('pharmacist')}
              className="border border-emerald-200 bg-emerald-50 px-4 py-2 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors"
            >
              Verification Hub
            </button>
            <button
              onClick={() => navigateProtected('ngo')}
              className="border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg transition-colors shadow-sm"
            >
              NGO Redistribution
            </button>
            {(!user || user.role === 'WASTE_COLLECTOR') && (
              <button
                onClick={() => navigateProtected('waste')}
                className="border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg transition-colors shadow-sm"
              >
                Waste Collector
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Role Badge */}
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

      {/* Main Landing Hero Content */}
      <main>
        <LandingHero
          onNavigate={navigateProtected}
          onOpenProofs={() => setEip712Open(true)}
        />
      </main>
    </div>
  );
}
