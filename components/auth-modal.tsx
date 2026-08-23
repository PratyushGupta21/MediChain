'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { PERSONA_PRESETS } from '@/lib/personas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Home,
  ShieldCheck,
  HeartHandshake,
  Truck,
  Loader2,
  Mail,
  Lock,
  UserRound,
} from 'lucide-react';
import type { Persona } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

const PERSONA_ICONS: Record<Persona, LucideIcon> = {
  household: Home,
  pharmacist: ShieldCheck,
  ngo: HeartHandshake,
  waste: Truck,
};

export default function AuthModal() {
  const { isAuthOpen, setAuthOpen, signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedPersona, setSelectedPersona] = useState<Persona>('household');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);

  function reset() {
    setEmail('');
    setPassword('');
    setFullName('');
    setBusy(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    if (mode === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password, selectedPersona, fullName || email.split('@')[0]);
    }
    setBusy(false);
  }

  function switchMode(newMode: 'signin' | 'signup') {
    setMode(newMode);
    reset();
  }

  return (
    <Dialog
      open={isAuthOpen}
      onOpenChange={(open) => {
        setAuthOpen(open);
        if (!open) reset();
      }}
    >
      <DialogContent className="border border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-md p-6 font-sans rounded-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-xl font-bold tracking-tight text-slate-900">
            {mode === 'signin' ? 'Sign In to MediChain' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-600">
            {mode === 'signin'
              ? 'Enter your credentials to access your portal'
              : 'Choose your role and register to access the ledger'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2 text-center rounded-md transition-all ${
              mode === 'signin'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 text-center rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Persona selector */}
              <div className="space-y-2 text-xs">
                <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Select Your Role
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONA_PRESETS.map((preset) => {
                    const Icon = PERSONA_ICONS[preset.persona];
                    const active = selectedPersona === preset.persona;
                    return (
                      <button
                        key={preset.persona}
                        type="button"
                        onClick={() => setSelectedPersona(preset.persona)}
                        className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left text-xs transition-all ${
                          active
                            ? 'border-emerald-600 bg-emerald-600 text-white font-medium shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-400'
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            active ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">{preset.roleLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <Label htmlFor="fullName" className="text-slate-700 font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Dr. Priya Menon"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-slate-300 bg-white text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg pl-9 text-xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5 text-xs">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-300 bg-white text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg pl-9 text-xs placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-300 bg-white text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg pl-9 text-xs placeholder:text-slate-400"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg py-2.5 text-xs transition-colors shadow-md shadow-emerald-600/20 mt-2"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : mode === 'signin' ? (
              'Sign In to Portal'
            ) : (
              `Create Account`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
