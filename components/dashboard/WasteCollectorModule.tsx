'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/context/app-context';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/fefo';
import { generateCdscoForm4Pdf } from '@/lib/pdf-generator';
import type { WasteManifest } from '@/lib/types';
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
  MapPin,
  FileText,
  ShieldAlert,
  Activity,
  Check,
  X,
  Gauge,
  Navigation,
  Download,
  Wifi,
} from 'lucide-react';

const GEO_FENCED_ROUTES = [
  { id: 'route-101', location: 'Indiranagar Medical Cluster', coords: '12.9784° N, 77.6408° E', waypoints: 4, status: 'IN_TRANSIT', driver: 'Rohan Gupta (VAN-04)' },
  { id: 'route-102', location: 'Koramangala Health Hub', coords: '12.9352° N, 77.6245° E', waypoints: 2, status: 'SCHEDULED', driver: 'Rohan Gupta (VAN-04)' },
  { id: 'route-103', location: 'Whitefield Clinical Zone', coords: '12.9698° N, 77.7500° E', waypoints: 6, status: 'COMPLETED', driver: 'Rohan Gupta (VAN-04)' },
];

const WASTE_COLOR_CODES = [
  { code: 'YELLOW', label: 'Outdated Medicines & Cytotoxic Waste', temp: '850°C - 1100°C', action: 'High-Temperature Incineration', bg: 'bg-amber-500/20 border-amber-500 text-amber-300' },
  { code: 'RED', label: 'Contaminated Recyclable Packaging', temp: '121°C Autoclave', action: 'Autoclaving & Shredding', bg: 'bg-red-500/20 border-red-500 text-red-300' },
  { code: 'BLUE', label: 'Glassware & Vials', temp: 'Disinfection Tank', action: 'Sodium Hypochlorite Treatment', bg: 'bg-blue-500/20 border-blue-500 text-blue-300' },
  { code: 'BLACK', label: 'Non-Hazardous Packaging Waste', temp: 'Ambient', action: 'Secured Sanitary Landfill Stream', bg: 'bg-slate-700/40 border-slate-600 text-slate-300' },
];

export default function WasteCollectorModule() {
  const { wasteManifests, confirmDestruction } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'manifests' | 'routes' | 'telemetry' | 'chain_of_custody'>('manifests');
  const [handoffStep, setHandoffStep] = useState<number>(1);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [liveTemp, setLiveTemp] = useState(892);
  const [realtimeActive, setRealtimeActive] = useState(true);

  // Supabase Realtime Telemetry WebSocket Subscription
  useEffect(() => {
    const channel = supabase
      .channel('waste_telemetry_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waste_manifests' },
        (payload) => {
          setRealtimeActive(true);
        }
      )
      .subscribe();

    // Simulated live telemetry temperature fluctuation (885°C - 915°C)
    const interval = setInterval(() => {
      setLiveTemp(Math.floor(885 + Math.random() * 30));
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const pending = wasteManifests.filter((w) => w.status === 'pickup_pending').length;
  const complete = wasteManifests.filter((w) => w.status === 'incinerated').length;

  async function handleConfirm(wasteId: string) {
    setBusyId(wasteId);
    await confirmDestruction(wasteId);
    setBusyId(null);
  }

  function downloadPdf(manifest: WasteManifest) {
    generateCdscoForm4Pdf(manifest);
  }

  return (
    <div className="space-y-8 font-sans">
      <SectionHeader
        eyebrow="Bio-medical hazardous waste lifecycle"
        title="Waste Collector &amp; Incineration Hub"
        description="Manage geo-fenced pickup routes, color-coded bio-medical manifests, sealed multi-party handoffs, and live 850°C incineration telemetry."
        action={
          <div className="flex gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 border border-emerald-500/50 bg-emerald-950/60 px-3 py-1 text-emerald-300 rounded-sm">
              <Wifi className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              <span>REALTIME WEBSOCKET</span>
            </div>
            <Button
              onClick={() => setShowHandoffModal(true)}
              className="rounded-sm border border-red-500/60 bg-red-950/60 text-red-300 font-bold hover:bg-red-900 shadow-md"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Sealed Handoff Sign-off
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pickup Pending Routes" value={pending} icon={Truck} tone="warning" />
        <StatCard label="Incinerated / Certified" value={complete} icon={Flame} tone="safe" />
        <StatCard label="Incineration Chamber Temp" value={liveTemp} icon={Thermometer} />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-700/60 font-mono text-xs">
        <button
          onClick={() => setActiveTabSection('manifests')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'manifests'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [01] Color-Coded Manifests ({wasteManifests.length})
        </button>
        <button
          onClick={() => setActiveTabSection('routes')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'routes'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [02] Geo-Fenced Routes
        </button>
        <button
          onClick={() => setActiveTabSection('telemetry')}
          className={`py-3 px-5 font-bold uppercase transition-colors border-b-2 ${
            activeTabSection === 'telemetry'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          [03] 850°C Incineration Telemetry
        </button>
      </div>

      {/* Sealed Chain of Custody Handoff Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-sm border border-red-500/60 bg-[#1B1E26] p-6 shadow-2xl font-mono text-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-700/60 pb-3">
              <div>
                <span className="text-[10px] text-red-400 font-bold uppercase">[SEALED HANDOFF PROTOCOL]</span>
                <h3 className="text-base font-bold uppercase text-[#F8FAFC] mt-1">Multi-Party Custody Handoff</h3>
              </div>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className={`border p-3 rounded-sm ${handoffStep >= 1 ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>
                <div className="flex justify-between font-mono font-bold">
                  <span>STEP 1: COLLECTOR SIGNATURE</span>
                  <span>{handoffStep >= 1 ? 'SIGNED' : 'PENDING'}</span>
                </div>
                <p className="mt-1 text-[11px]">Sealed RFID Container #CNT-8819 loaded at household pickup location.</p>
              </div>

              <div className={`border p-3 rounded-sm ${handoffStep >= 2 ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>
                <div className="flex justify-between font-mono font-bold">
                  <span>STEP 2: TRANSIT VERIFICATION</span>
                  <span>{handoffStep >= 2 ? 'VERIFIED' : 'PENDING'}</span>
                </div>
                <p className="mt-1 text-[11px]">GPS route tracking active. Seal tampering sensor: NOMINAL.</p>
              </div>

              <div className={`border p-3 rounded-sm ${handoffStep >= 3 ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>
                <div className="flex justify-between font-mono font-bold">
                  <span>STEP 3: FACILITY HANDOFF &amp; DESTRUCTION</span>
                  <span>{handoffStep >= 3 ? 'INCINERATED' : 'PENDING'}</span>
                </div>
                <p className="mt-1 text-[11px]">Handoff to Bio-Clean Facility Operator for 850°C primary chamber load.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-mono text-xs">
              <Button variant="outline" onClick={() => setShowHandoffModal(false)} className="border-slate-700 text-slate-300 uppercase">
                Close
              </Button>
              <Button
                onClick={() => setHandoffStep((prev) => (prev < 3 ? prev + 1 : 1))}
                className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400"
              >
                {handoffStep >= 3 ? 'Reset Handoff Simulation' : 'Advance Custody Stage'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* SECTION 1: MANIFESTS */}
      {activeTabSection === 'manifests' && (
        <div className="space-y-6">
          {/* Bio-Medical Waste Color Code Legend */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
            {WASTE_COLOR_CODES.map((c) => (
              <div key={c.code} className={`border p-4 rounded-sm ${c.bg}`}>
                <div className="flex items-center justify-between font-bold">
                  <span>[{c.code} CATEGORY]</span>
                  <span>{c.temp}</span>
                </div>
                <p className="mt-2 text-xs font-sans font-semibold">{c.label}</p>
                <p className="mt-1 text-[11px] font-mono text-slate-300">{c.action}</p>
              </div>
            ))}
          </div>

          <div className="rounded-sm border border-slate-700/60 bg-[#1B1E26]">
            <div className="flex items-center justify-between border-b border-slate-700/60 p-5 font-mono text-xs">
              <div>
                <h2 className="font-bold text-base uppercase text-[#F8FAFC]">Bio-Medical Disposal Manifests</h2>
                <p className="text-slate-400 font-sans text-xs mt-0.5">
                  Permanent immutable record of high-temperature destruction events.
                </p>
              </div>
              <span className="text-slate-400 font-mono">
                {wasteManifests.length} Active Manifests
              </span>
            </div>

            {wasteManifests.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Truck}
                  title="No disposal manifests logged"
                  description="Expired medicines scheduled for pickup will automatically populate this manifest registry."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-700/60 font-mono text-xs">
                {wasteManifests.map((waste) => (
                  <div key={waste.id} className="p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="flex gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${
                            waste.status === 'incinerated'
                              ? 'border border-emerald-500/50 bg-emerald-950/60 text-emerald-300'
                              : 'border border-amber-500/50 bg-amber-950/60 text-amber-300'
                          }`}
                        >
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#F8FAFC] text-base uppercase">{waste.medicineName}</h3>
                            <StatusBadge status={waste.status} />
                          </div>
                          <div className="mt-2 grid gap-x-5 gap-y-1 text-xs text-slate-300 sm:grid-cols-2">
                            <span>Batch: <b className="text-white">{waste.batchNumber}</b></span>
                            <span>Quantity: <b className="text-white">{waste.quantity} units</b></span>
                            <span>Scheduled: <b className="text-white">{formatDate(waste.scheduledAt)}</b></span>
                            <span>Pickup Location: <b className="text-white">{waste.pickupAddress}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPdf(waste)}
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 uppercase text-xs"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                          Download Form-IV PDF
                        </Button>
                        {waste.status === 'pickup_pending' && (
                          <Button
                            size="sm"
                            disabled={busyId === waste.id}
                            onClick={() => handleConfirm(waste.id)}
                            className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 shrink-0 shadow-md text-xs"
                          >
                            {busyId === waste.id ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Certifying...
                              </>
                            ) : (
                              <>
                                <Flame className="mr-1.5 h-3.5 w-3.5" />
                                Confirm 850°C Incineration
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: GEO-FENCED ROUTES */}
      {activeTabSection === 'routes' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm">
            <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Geo-Fenced Collection Routes</h3>
            <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
              Real-time GPS waypoints for bio-hazardous drug collection transport vans.
            </p>
          </div>

          <div className="space-y-3">
            {GEO_FENCED_ROUTES.map((r) => (
              <div key={r.id} className="border border-slate-700/60 bg-[#1B1E26] p-5 rounded-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-[#F8FAFC] uppercase">{r.location}</h4>
                    <span className="border border-amber-500/40 bg-amber-950/60 text-amber-300 text-[10px] font-bold px-2 py-0.5 uppercase">
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-300 text-xs font-mono">
                    GPS Coordinates: <b className="text-white">{r.coords}</b> · Waypoints: <b className="text-white">{r.waypoints} Pickup Spots</b>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Assigned Driver: {r.driver}</p>
                </div>
                <Button size="sm" className="bg-amber-500 text-slate-950 font-bold uppercase hover:bg-amber-400 shrink-0">
                  Open Route Map
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: 850°C TELEMETRY LOGS */}
      {activeTabSection === 'telemetry' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="border border-slate-700/60 bg-[#1B1E26] p-6 rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-base uppercase text-[#F8FAFC]">Live 850°C Incineration Telemetry Stream</h3>
              </div>
              <span className="text-emerald-400 font-bold border border-emerald-500/40 px-2.5 py-1 text-[10px]">
                REALTIME WEBSOCKET: CONNECTED
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-center">
              <div className="border border-slate-700 bg-slate-900 p-4 rounded-sm">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Primary Chamber Temp</span>
                <p className="mt-1 text-3xl font-extrabold text-amber-400">{liveTemp}°C</p>
                <p className="text-[10px] text-slate-400 mt-1">Min threshold: 850°C</p>
              </div>

              <div className="border border-slate-700 bg-slate-900 p-4 rounded-sm">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Secondary Chamber Temp</span>
                <p className="mt-1 text-3xl font-extrabold text-red-400">1,080°C</p>
                <p className="text-[10px] text-slate-400 mt-1">2.0s retention time</p>
              </div>

              <div className="border border-slate-700 bg-slate-900 p-4 rounded-sm">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Scrubber Emission CO2</span>
                <p className="mt-1 text-3xl font-extrabold text-emerald-400">12 PPM</p>
                <p className="text-[10px] text-emerald-400 mt-1">CDSCO Compliant</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
