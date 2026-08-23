'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import { formatDate } from '@/lib/fefo';
import type { MedicineBatch } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  StatCard,
  EmptyState,
} from './shared';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Package,
  QrCode,
  ShieldCheck,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

export default function PharmacistHub() {
  const { medicines, approveBatch, rejectBatch } = useApp();
  const [approved, setApproved] = useState<{ batch: MedicineBatch; txHash: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const queue = medicines.filter((m) =>
    ['logged', 'pending_verification'].includes(m.status)
  );

  async function approve(batch: MedicineBatch) {
    setBusyId(batch.id);
    const txHash = await approveBatch(batch.id);
    setBusyId(null);
    if (txHash) setApproved({ batch, txHash });
  }

  async function reject(batchId: string) {
    setBusyId(batchId);
    await rejectBatch(batchId);
    setBusyId(null);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="CDSCO oversight"
        title="Pharmacist Verification Hub"
        description="Inspect submitted batches before signing them to the MediChain ledger."
        action={
          <div className="flex items-center gap-2 rounded-full border border-safe/50 bg-safe/30 px-3 py-1.5 text-xs text-safe-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-safe-foreground" />
            Ledger online
          </div>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting inspection" value={queue.length} icon={Clock3} tone="warning" />
        <StatCard label="Verified today" value={18} icon={ShieldCheck} tone="safe" />
        <StatCard label="Ledger accuracy" value={99} icon={Zap} />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-semibold text-foreground">Inspection queue</h2>
            <p className="mt-1 text-xs text-muted-foreground">Newest submissions appear first</p>
          </div>
          <span className="rounded-full bg-warning px-2.5 py-1 text-xs font-semibold text-warning-foreground">
            {queue.length} pending
          </span>
        </div>
        <div className="divide-y divide-border">
          {queue.map((batch) => (
            <div
              key={batch.id}
              className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {batch.brandName}{' '}
                    <span className="font-normal text-muted-foreground">· {batch.genericName}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Batch <b className="font-mono font-normal text-foreground">{batch.batchNumber}</b>
                    </span>
                    <span>
                      Quantity <b className="font-normal text-foreground">{batch.quantity} units</b>
                    </span>
                    <span>
                      Expires <b className="font-normal text-foreground">{formatDate(batch.expiryDate)}</b>
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted by <span className="text-gold">{batch.ownerName}</span> ·{' '}
                    {formatDate(batch.loggedAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {busyId === batch.id ? (
                  <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Executing EIP-712 Smart Contract...</span>
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reject(batch.id)}
                      className="border-hazard text-hazard hover:bg-hazard/20"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approve(batch)}
                      className="bg-safe text-safe-foreground hover:bg-safe/80"
                    >
                      <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                      Approve &amp; sign
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {queue.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="Queue cleared"
              description="All submitted batches have been reviewed."
            />
          )}
        </div>
      </div>
      {approved && (
        <ApprovalModal
          batch={approved.batch}
          txHash={approved.txHash}
          onClose={() => setApproved(null)}
        />
      )}
    </div>
  );
}

export function ApprovalModal({
  batch,
  txHash,
  onClose,
}: {
  batch: MedicineBatch;
  txHash: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-safe/60 bg-card p-6 glow-safe shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-safe text-safe-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Batch Verified &amp; Signed</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifiable EIP-712 transaction committed to MediChain ledger.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-5 rounded-xl border border-border bg-secondary/50 p-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-white p-2">
            <div className="grid h-full w-full grid-cols-5 gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    (i * 7 + 3) % 5 < 2 || i % 7 === 0 ? 'bg-charcoal' : 'bg-white'
                  }
                />
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Verified batch</p>
            <p className="mt-1 font-semibold text-foreground">{batch.brandName}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {batch.batchNumber}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-safe-foreground">
              <QrCode className="h-3.5 w-3.5" />
              Scan QR proof
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cryptographic EIP-712 Hash Signature
          </p>
          <p className="mt-1 break-all font-mono text-[11px] text-gold">{txHash}</p>
        </div>
        <Button
          onClick={onClose}
          className="mt-5 w-full bg-safe text-safe-foreground hover:bg-safe/80"
        >
          Done
        </Button>
      </motion.div>
    </div>
  );
}
