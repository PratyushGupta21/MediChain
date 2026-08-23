'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import {
  getDaysUntilExpiry,
  getFefoColorClasses,
  getFefoStatus,
  formatDate,
} from '@/lib/fefo';
import type { MedicineBatch } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  EmptyState,
} from './shared';
import {
  Check,
  HeartHandshake,
  Loader2,
  Search,
  X,
  Zap,
} from 'lucide-react';

export default function NgoHub() {
  const { medicines, requestAllocation } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MedicineBatch | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  const catalog = useMemo(
    () =>
      medicines
        .filter(
          (m) =>
            (m.status === 'approved' || m.quantity > 0) &&
            m.quantity > 0 &&
            getDaysUntilExpiry(m.expiryDate) >= 0 &&
            `${m.brandName} ${m.genericName} ${m.batchNumber}`
              .toLowerCase()
              .includes(search.toLowerCase())
        )
        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate)),
    [medicines, search]
  );

  async function handleRequest() {
    if (!selected) return;
    setBusy(true);
    await requestAllocation(selected.id, quantity);
    setBusy(false);
    setSelected(null);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Patient access"
        title="NGO / Patient Hub"
        description="Find approved medicines ranked by expiry urgency, then request an allocation."
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, generic name, or batch number"
            className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-gold" />
          Sorted by FEFO urgency
        </div>
      </div>
      {catalog.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No available batches found"
          description="Try a different search or check back as pharmacists verify new donations."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalog.map((medicine, index) => {
            const days = getDaysUntilExpiry(medicine.expiryDate);
            const colors = getFefoColorClasses(getFefoStatus(medicine.expiryDate));
            return (
              <motion.div
                layout
                key={medicine.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-gold/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-charcoal">
                        {index + 1}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-gold">
                        FEFO rank
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{medicine.brandName}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{medicine.genericName}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${colors.bg} ${colors.text}`}
                  >
                    {days}d left
                  </span>
                </div>
                <div className="space-y-2 border-t border-border pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available quantity</span>
                    <span className="font-semibold text-gold">{medicine.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch</span>
                    <span className="font-mono text-foreground">{medicine.batchNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified</span>
                    <span className="text-safe-foreground">
                      {formatDate(medicine.verifiedAt ?? medicine.loggedAt)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelected(medicine);
                    setQuantity(1);
                  }}
                  className="mt-5 w-full bg-gold text-charcoal hover:bg-gold/90"
                >
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  Request allocation
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
      {selected && (
        <AllocationModal
          medicine={selected}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={() => setSelected(null)}
          busy={busy}
          onRequest={handleRequest}
        />
      )}
    </div>
  );
}

export function AllocationModal({
  medicine,
  quantity,
  setQuantity,
  onClose,
  onRequest,
  busy,
}: {
  medicine: MedicineBatch;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onClose: () => void;
  onRequest: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gold">Batch allocation</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{medicine.brandName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{medicine.genericName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Batch</span>
            <span className="font-mono text-foreground">{medicine.batchNumber}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Available inventory</span>
            <span className="font-semibold text-gold">{medicine.quantity} units</span>
          </div>
        </div>
        <label className="mt-5 block">
          <span className="text-xs font-medium text-muted-foreground">Quantity requested</span>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 w-9 rounded-lg border border-border text-lg text-foreground hover:border-gold"
            >
              −
            </button>
            <span className="flex-1 text-center text-lg font-semibold text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
              className="h-9 w-9 rounded-lg border border-border text-lg text-foreground hover:border-gold"
            >
              +
            </button>
          </div>
        </label>
        <div className="mt-3 rounded border border-safe/30 bg-safe/10 p-2.5 text-[11px] text-safe-foreground">
          Inventory will deduct <b className="font-bold">{quantity} units</b> immediately upon allocation request.
        </div>
        <Button
          onClick={onRequest}
          disabled={busy}
          className="mt-5 w-full bg-gold text-charcoal hover:bg-gold/90"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Allocating inventory...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Confirm Allocation Request
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
