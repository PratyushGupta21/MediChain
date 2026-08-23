'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import {
  getDaysUntilExpiry,
  getFefoColorClasses,
  getFefoLabel,
  getFefoStatus,
  formatDate,
} from '@/lib/fefo';
import type { MedicineBatch, Persona } from '@/lib/types';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Flame,
  HeartHandshake,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Thermometer,
  Truck,
  UserRound,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth-modal';

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

const statusLabels: Record<string, string> = {
  logged: 'Logged',
  pending_verification: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Rejected',
  donated: 'Donated',
  requested: 'Allocation requested',
  pickup_scheduled: 'Pickup scheduled',
  disposed: 'Disposed',
};

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-gold"
      />
    </label>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config =
    status === 'approved' || status === 'incinerated'
      ? ['bg-safe', 'text-safe-foreground', 'Approved']
      : status === 'rejected'
        ? ['bg-hazard', 'text-hazard-foreground', 'Rejected']
        : [
            'bg-warning',
            'text-warning-foreground',
            statusLabels[status] ?? status,
          ];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${config[0]} ${config[1]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config[2]}
    </span>
  );
}

function MedicineCard({
  medicine,
  onDonate,
  onPickup,
  onSubmit,
  busy,
}: {
  medicine: MedicineBatch;
  onDonate: () => void;
  onPickup: () => void;
  onSubmit: () => void;
  busy?: boolean;
}) {
  const fefo = getFefoStatus(medicine.expiryDate);
  const colors = getFefoColorClasses(fefo);
  const days = getDaysUntilExpiry(medicine.expiryDate);
  const isExpired = days < 0;
  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      className={`group rounded-xl border bg-card p-5 transition-all hover:border-gold/50 ${colors.border}/40`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{medicine.brandName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {medicine.genericName}
          </p>
        </div>
        <StatusBadge status={medicine.status} />
      </div>
      <div className="mb-4 rounded-lg border border-border bg-secondary/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">FEFO classification</span>
          <span className={`h-2 w-2 rounded-full ${colors.bg}`} />
        </div>
        <p className={`mt-1 text-xs font-semibold ${colors.text}`}>
          {isExpired ? 'Expired' : `${days} days remaining`}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {getFefoLabel(fefo)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Batch number</p>
          <p className="mt-1 font-mono text-foreground">{medicine.batchNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Quantity</p>
          <p className="mt-1 text-foreground">{medicine.quantity} units</p>
        </div>
        <div>
          <p className="text-muted-foreground">Expires</p>
          <p className="mt-1 text-foreground">{formatDate(medicine.expiryDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Logged</p>
          <p className="mt-1 text-foreground">{formatDate(medicine.loggedAt)}</p>
        </div>
      </div>
      {(medicine.status === 'logged' ||
        medicine.status === 'approved' ||
        medicine.status === 'pending_verification') && (
        <div className="mt-5 flex gap-2 border-t border-border pt-4">
          {busy ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
            </div>
          ) : isExpired ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onPickup}
              className="flex-1 border-hazard text-hazard hover:bg-hazard/20"
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" />
              Schedule Pickup
            </Button>
          ) : medicine.status === 'approved' ? (
            <Button
              size="sm"
              onClick={onDonate}
              className="flex-1 bg-safe text-safe-foreground hover:bg-safe/80"
            >
              <HeartHandshake className="mr-1.5 h-3.5 w-3.5" />
              Donate to NGO
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSubmit}
              className="flex-1 bg-gold text-charcoal hover:bg-gold/90"
            >
              <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
              Submit for review
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'gold',
}: {
  label: string;
  value: number;
  icon: typeof Package;
  tone?: 'gold' | 'safe' | 'warning';
}) {
  const color =
    tone === 'safe'
      ? 'text-safe-foreground bg-safe'
      : tone === 'warning'
        ? 'text-warning-foreground bg-warning'
        : 'text-gold bg-gold/15';
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function HouseholdPortal() {
  const { user, medicines, addMedicine, donateToNgo, schedulePickup, submitForVerification } =
    useApp();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    brandName: '',
    genericName: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
  });

  const owned = medicines.filter((m) => m.ownerId === user?.id);
  const active = owned.filter((m) => m.status !== 'disposed').length;
  const donated = owned.filter((m) =>
    ['approved', 'donated', 'requested', 'allocated'].includes(m.status)
  ).length;
  const scheduled = owned.filter((m) => m.status === 'pickup_scheduled').length;

  const update =
    (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brandName || !form.genericName || !form.batchNumber || !form.expiryDate || !form.quantity)
      return;
    await addMedicine({
      brandName: form.brandName,
      genericName: form.genericName,
      batchNumber: form.batchNumber,
      expiryDate: form.expiryDate,
      quantity: Number(form.quantity),
    });
    setForm({ brandName: '', genericName: '', batchNumber: '', expiryDate: '', quantity: '' });
    setShowForm(false);
  }

  async function handleAction(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    await fn();
    setBusyId(null);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Personal inventory"
        title="Household Portal"
        description="Log, donate, and safely dispose of medicines from your home."
        action={
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gold text-charcoal hover:bg-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Log unused medicine
          </Button>
        }
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total active medicines" value={active} icon={Package} />
        <StatCard label="Donation-ready batches" value={donated} icon={HeartHandshake} tone="safe" />
        <StatCard label="Scheduled disposal" value={scheduled} icon={Truck} tone="warning" />
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-gold/50 bg-card p-5 glow-gold">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Log unused medicine</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Add batch details to begin the FEFO lifecycle.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name" value={form.brandName} onChange={update('brandName')} placeholder="e.g. Dolo 650" />
            <Field label="Generic name" value={form.genericName} onChange={update('genericName')} placeholder="e.g. Paracetamol 650mg" />
            <Field label="Batch number" value={form.batchNumber} onChange={update('batchNumber')} placeholder="e.g. DOL-2024-0567" />
            <Field label="Expiry date" type="date" value={form.expiryDate} onChange={update('expiryDate')} />
            <Field label="Quantity (units)" type="number" value={form.quantity} onChange={update('quantity')} placeholder="e.g. 20" />
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-gold text-charcoal hover:bg-gold/90">
                <Check className="mr-2 h-4 w-4" />
                Save to inventory
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Medicine inventory</h2>
        <span className="text-xs text-muted-foreground">
          {owned.length} batches · FEFO prioritized
        </span>
      </div>
      {owned.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No medicines logged yet"
          description="Click 'Log unused medicine' to add your first batch."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {owned.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              busy={busyId === medicine.id}
              onDonate={() => handleAction(medicine.id, () => donateToNgo(medicine.id))}
              onPickup={() => handleAction(medicine.id, () => schedulePickup(medicine.id))}
              onSubmit={() => handleAction(medicine.id, () => submitForVerification(medicine.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PharmacistPortal() {
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
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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

function ApprovalModal({
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
        className="w-full max-w-md rounded-2xl border border-safe/60 bg-card p-6 glow-safe"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-safe text-safe-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Batch verified</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed to the MediChain ledger successfully.
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
              Scan to verify
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Transaction signature
          </p>
          <p className="mt-1 break-all font-mono text-xs text-gold">{txHash}</p>
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

function NgoPortal() {
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
            m.status === 'approved' &&
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
          title="No approved batches found"
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
                    <span className="font-medium text-foreground">{medicine.quantity} units</span>
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

function AllocationModal({
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
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6"
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
            <span className="text-muted-foreground">Available</span>
            <span className="text-foreground">{medicine.quantity} units</span>
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
        <Button
          onClick={onRequest}
          disabled={busy}
          className="mt-6 w-full bg-gold text-charcoal hover:bg-gold/90"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Submit request
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

function WastePortal() {
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
          {activeTab === 'pharmacist' && <PharmacistPortal />}
          {activeTab === 'ngo' && <NgoPortal />}
          {activeTab === 'waste' && <WastePortal />}
        </main>
      </div>
      <footer className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        MediChain · FEFO Pharmaceutical Tracking &amp; Bio-Medical Waste Lifecycle · Demo environment
      </footer>
    </div>
  );
}
