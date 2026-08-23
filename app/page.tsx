'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  PackageCheck,
  Truck,
  Recycle,
  ArrowRight,
  Activity,
  Lock,
  Boxes,
  QrCode,
  Flame,
  Clock,
} from 'lucide-react';
import MorphingRingsHero from '@/components/MorphingRingsHero';
import AuthModal from '@/components/auth-modal';

const FEATURES = [
  {
    icon: Clock,
    title: 'FEFO Expiry Engine',
    desc: 'Auto-calculated First-Expired, First-Out badges classify every batch by urgency.',
    color: '#C29B72',
  },
  {
    icon: ShieldCheck,
    title: 'Pharmacist Verification',
    desc: 'CDSCO inspectors approve and sign donations to an immutable ledger with QR proofs.',
    color: '#3A4027',
  },
  {
    icon: PackageCheck,
    title: 'NGO Redistribution',
    desc: 'Approved non-expired medicines are searchable and allocable to patients in need.',
    color: '#8D321F',
  },
  {
    icon: Flame,
    title: 'Bio-Hazard Disposal',
    desc: 'Expired batches trigger high-temperature incineration manifests with live status.',
    color: '#710014',
  },
];

const STATS = [
  { label: 'Batches Tracked', value: '12,400+' },
  { label: 'Medicines Redistributed', value: '48,900' },
  { label: 'Waste Incinerated', value: '3,200 kg' },
  { label: 'Verification Time', value: '< 2 min' },
];

export default function Home() {
  const { setAuthOpen } = useApp();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AuthModal />

      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <MorphingRingsHero />

        {/* Overlay gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />

        {/* Nav */}
        <nav className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold bg-card glow-gold">
              <Activity className="h-5 w-5 text-gold" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gold">
              MediChain
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-gold"
              onClick={() => setAuthOpen(true)}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="border border-gold bg-gold text-charcoal hover:bg-gold/90"
              asChild
            >
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
          </div>
        </nav>

        {/* Hero content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 flex items-center gap-2 rounded-full border border-gold/40 bg-card/60 px-4 py-1.5 backdrop-blur-sm"
          >
            <Lock className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-medium text-gold">
              Decentralized · Transparent · Tamper-Proof
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            MediChain: <span className="text-gold">FEFO Pharmaceutical</span> Tracking &amp; Bio-Medical Waste Lifecycle
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            A decentralized First-Expired, First-Out protocol for safe medicine
            redistribution and hazardous disposal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="border border-gold bg-gold text-charcoal hover:bg-gold/90 glow-gold"
              asChild
            >
              <Link href="/dashboard">
                Launch Dashboard Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-card/60 text-foreground hover:border-gold hover:text-gold backdrop-blur-sm"
              onClick={() => setAuthOpen(true)}
            >
              Connect Wallet / Sign In
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-gold/40 p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-1.5 w-1.5 rounded-full bg-gold"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 -mt-1 border-y border-border bg-card/80 px-6 py-8 backdrop-blur-sm md:px-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-gold md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Four Portals, One Immutable Ledger
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every participant in the medicine lifecycle has a purpose-built workspace.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-gold/50"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${feat.color}25`, border: `1px solid ${feat.color}50` }}
                >
                  <feat.icon className="h-6 w-6" style={{ color: feat.color }} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-20 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-2xl border border-gold/30 bg-card p-10 text-center glow-gold"
        >
          <QrCode className="mx-auto mb-4 h-12 w-12 text-gold" />
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Ready to explore the demo?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Jump into the interactive dashboard with a pre-configured persona —
            no wallet or signup required.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="border border-gold bg-gold text-charcoal hover:bg-gold/90"
              asChild
            >
              <Link href="/dashboard">
                Launch Dashboard Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:border-gold hover:text-gold"
              onClick={() => setAuthOpen(true)}
            >
              Choose a Persona
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gold bg-card">
              <Activity className="h-4 w-4 text-gold" />
            </div>
            <span className="text-sm font-semibold text-gold">MediChain</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Decentralized FEFO Pharmaceutical Tracking Protocol
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Recycle className="h-3.5 w-3.5" /> Eco-Safe
            </span>
            <span className="flex items-center gap-1">
              <Boxes className="h-3.5 w-3.5" /> Open Ledger
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
