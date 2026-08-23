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
      <DialogContent className="border-border bg-card/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gold">
            {mode === 'signin' ? 'Sign In to MediChain' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {mode === 'signin'
              ? 'Enter your credentials to access your dashboard'
              : 'Choose your role and create an account to get started'}
          </DialogDescription>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-border bg-secondary/50 p-1">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-gold text-charcoal'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-gold text-charcoal'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Persona selector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
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
                        className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors ${
                          active
                            ? 'border-gold bg-gold/15'
                            : 'border-border bg-secondary/40 hover:border-gold/50'
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                          style={{
                            backgroundColor: `${preset.avatarColor}30`,
                            border: `1px solid ${preset.avatarColor}`,
                          }}
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: preset.avatarColor }}
                          />
                        </div>
                        <span
                          className={`font-medium ${
                            active ? 'text-gold' : 'text-foreground'
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
                <p className="text-[11px] text-muted-foreground">
                  {PERSONA_DESCRIPTIONS[selectedPersona]}
                </p>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
                  Full name
                </Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-gold text-charcoal hover:bg-gold/90"
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

        <div className="mt-2 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground text-center">
            {mode === 'signin'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-medium text-gold hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
