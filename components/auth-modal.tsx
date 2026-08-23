'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  household: 'Log unused medicines, donate to NGOs, schedule waste pick-up',
  pharmacist: 'Verify donations, approve batches, sign to the ledger',
  ngo: 'Search FEFO catalog, request batch allocations for patients',
  waste: 'Manage bio-medical disposal manifests, confirm incineration',
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
      <DialogContent className="border border-slate-700/80 bg-[#14171D] text-slate-100 shadow-2xl sm:max-w-md p-6 font-sans">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-xl font-bold uppercase tracking-tight text-slate-100">
            {mode === 'signin' ? 'Sign In to MediChain' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-center font-mono text-xs text-slate-400">
            {mode === 'signin'
              ? 'Enter your credentials to access your workspace'
              : 'Choose your role and create an account to get started'}
          </DialogDescription>
        </DialogHeader>

        {/* High-Contrast Tab Toggle */}
        <div className="flex border-b border-slate-700/80 mb-4 font-mono text-xs">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2.5 text-center font-semibold transition-all ${
              mode === 'signin'
                ? 'border-b-2 border-amber-500 text-amber-400 font-bold'
                : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 text-center font-semibold transition-all ${
              mode === 'signup'
                ? 'border-b-2 border-amber-500 text-amber-400 font-bold'
                : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Persona selector */}
              <div className="space-y-2 font-mono text-xs">
                <Label className="text-[10px] font-bold uppercase text-slate-400">
                  Select your role
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONA_PRESETS.map((preset) => {
                    const Icon = PERSONA_ICONS[preset.persona];
                    const active = selectedPersona === preset.persona;
                    return (
                      <motion.button
                        key={preset.persona}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedPersona(preset.persona)}
                        className={`flex items-center gap-2 rounded-sm border p-2.5 text-left text-xs transition-colors ${
                          active
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm"
                          style={{
                            backgroundColor: `${preset.avatarColor}25`,
                            border: `1px solid ${preset.avatarColor}60`,
                          }}
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: preset.avatarColor }}
                          />
                        </div>
                        <span
                          className={`font-semibold ${
                            active ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          {preset.persona === 'household'
                            ? 'Household'
                            : preset.persona === 'pharmacist'
                              ? 'Pharmacist'
                              : preset.persona === 'ngo'
                                ? 'NGO'
                                : 'Waste Op.'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {PERSONA_DESCRIPTIONS[selectedPersona]}
                </p>
              </div>

              {/* Full name */}
              <div className="space-y-1.5 font-mono text-xs">
                <Label htmlFor="fullName" className="text-[10px] font-bold uppercase text-slate-400">
                  Full name
                </Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="pl-10 bg-slate-900/80 border border-slate-700 focus:border-amber-500 text-slate-100 placeholder-slate-500 font-mono text-xs rounded-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5 font-mono text-xs">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase text-slate-400">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 bg-slate-900/80 border border-slate-700 focus:border-amber-500 text-slate-100 placeholder-slate-500 font-mono text-xs rounded-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 font-mono text-xs">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase text-slate-400">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="pl-10 bg-slate-900/80 border border-slate-700 focus:border-amber-500 text-slate-100 placeholder-slate-500 font-mono text-xs rounded-sm"
                minLength={6}
                required
              />
            </div>
          </div>

          {/* Styled High-Contrast Sign In Button */}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-amber-500 text-slate-950 font-mono font-bold hover:bg-amber-400 py-3 rounded-sm transition-all shadow-md"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-2 rounded-sm border border-slate-700/80 bg-slate-900/50 p-3 font-mono text-xs">
          <p className="text-slate-400 text-center">
            {mode === 'signin'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-bold text-amber-400 hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
