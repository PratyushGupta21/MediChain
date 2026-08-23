'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { formatDate } from '@/lib/fefo';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  StatCard,
  EmptyState,
  StatusBadge,
} from './shared';
import {
  CheckCircle2,
  Flame,
  Loader2,
  Thermometer,
  Truck,
} from 'lucide-react';

export default function WasteCollectorModule() {
  const { wasteManifests, confirmDestruction } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const pending = wasteManifests.filter((w) => w.status === 'pickup_pending').length;
  const complete = wasteManifests.filter((w) => w.status === 'incinerated').length;

  async function handleConfirm(wasteId: string) {
    setBusyId(wasteId);
    await confirmDestruction(wasteId);
    setBusyId(null);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Hazardous lifecycle"
        title="Waste Collector Module"
        description="Track collection routes and certify high-temperature destruction."
        action={
          <div className="flex items-center gap-2 rounded-full border border-warning/50 bg-warning/20 px-3 py-1.5 text-xs text-warning-foreground">
            <Truck className="h-3.5 w-3.5" />
            Route operations live
          </div>
        }
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pickup pending" value={pending} icon={Truck} tone="warning" />
        <StatCard label="Incinerated / disposed" value={complete} icon={Flame} tone="safe" />
        <StatCard label="Min. destruction temp." value={850} icon={Thermometer} />
      </div>
      {wasteManifests.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No disposal manifests"
          description="Expired medicines scheduled for pickup will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold text-foreground">Bio-medical disposal manifests</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Every destruction event is recorded permanently.
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {wasteManifests.length} manifests
            </span>
          </div>
          <div className="divide-y divide-border">
            {wasteManifests.map((waste) => (
              <div key={waste.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        waste.status === 'incinerated'
                          ? 'bg-safe text-safe-foreground'
                          : 'bg-warning text-warning-foreground'
                      }`}
                    >
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{waste.medicineName}</h3>
                        <StatusBadge status={waste.status} />
                      </div>
                      <div className="mt-2 grid gap-x-5 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <span>
                          Batch{' '}
                          <b className="font-mono font-normal text-foreground">
                            {waste.batchNumber}
                          </b>
                        </span>
                        <span>
                          Quantity{' '}
                          <b className="font-normal text-foreground">{waste.quantity} units</b>
                        </span>
                        <span>
                          Route <b className="font-mono font-normal text-gold">{waste.routeId}</b>
                        </span>
                        <span>
                          Address{' '}
                          <b className="font-normal text-foreground">{waste.pickupAddress}</b>
                        </span>
                      </div>
                    </div>
                  </div>
                  {waste.status === 'pickup_pending' ? (
                    <Button
                      onClick={() => handleConfirm(waste.id)}
                      disabled={busyId === waste.id}
                      size="sm"
                      className="shrink-0 bg-warning text-warning-foreground hover:bg-warning/80"
                    >
                      {busyId === waste.id ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Flame className="mr-1.5 h-3.5 w-3.5" />
                          Confirm high-temp destruction
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2 rounded-lg border border-safe/40 bg-safe/20 px-3 py-2 text-xs text-safe-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <div>
                        <p className="font-semibold">Destruction certified</p>
                        <p className="text-[10px] opacity-80">
                          {waste.temperature}°C · {waste.completedAt && formatDate(waste.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
