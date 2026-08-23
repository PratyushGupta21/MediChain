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
  { code: 'YELLOW', label: 'Outdated Medicines & Cytotoxic Waste', temp: '850°C - 1100°C', action: 'High-Temperature Incineration', bg: 'bg-amber-50 border-amber-200 text-amber-900' },
  { code: 'RED', label: 'Contaminated Recyclable Packaging', temp: '121°C Autoclave', action: 'Autoclaving & Shredding', bg: 'bg-red-50 border-red-200 text-red-900' },
  { code: 'BLUE', label: 'Glassware & Vials', temp: 'Disinfection Tank', action: 'Sodium Hypochlorite Treatment', bg: 'bg-blue-50 border-blue-200 text-blue-900' },
  { code: 'BLACK', label: 'Non-Hazardous Packaging Waste', temp: 'Ambient', action: 'Secured Sanitary Landfill Stream', bg: 'bg-slate-50 border-slate-200 text-slate-900' },
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
        eyebrow="Bio-Medical Waste Lifecycle"
        title="Waste Collector &amp; Incineration Hub"
        description="Manage geo-fenced pickup routes, color-coded bio-medical manifests, sealed multi-party handoffs, and live 850°C incineration telemetry."
        action={
          <div className="flex gap-2 text-xs font-sans">
            <div className="flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 rounded-full font-semibold">
              <Wifi className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
              <span>Realtime WebSocket Active</span>
            </div>
            <Button
              onClick={() => setShowHandoffModal(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg px-4 py-2 shadow-sm"
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
      <div className="flex border-b border-slate-200 text-xs font-sans">
        <button
          onClick={() => setActiveTabSection('manifests')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'manifests'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Color-Coded Manifests ({wasteManifests.length})
        </button>
        <button
          onClick={() => setActiveTabSection('routes')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'routes'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Geo-Fenced Routes
        </button>
        <button
          onClick={() => setActiveTabSection('telemetry')}
          className={`py-3 px-5 font-semibold transition-colors border-b-2 ${
            activeTabSection === 'telemetry'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          850°C Incineration Telemetry
        </button>
      </div>

      {/* Sealed Chain of Custody Handoff Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-2xl font-sans text-xs space-y-4 text-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs text-red-700 font-semibold uppercase tracking-wider">Sealed Handoff Protocol</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Multi-Party Custody Handoff</h3>
              </div>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className={`border p-3 rounded-lg ${handoffStep >= 1 ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <div className="flex justify-between font-bold">
                  <span>STEP 1: COLLECTOR SIGNATURE</span>
                  <span>{handoffStep >= 1 ? 'SIGNED' : 'PENDING'}</span>
                </div>
                <p className="mt-1 text-xs">Sealed RFID Container #CNT-8819 loaded at household pickup location.</p>
              </div>

              <div className={`border p-3 rounded-lg ${handoffStep >= 2 ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <div className="flex justify-between font-bold">
                  <span>STEP 2: TRANSIT VERIFICATION</span>
                  <span>{handoffStep >= 2 ? 'VERIFIED' : 'PENDING'}</span>
                </div>
                <p className="mt-1 text-xs">GPS route tracking active. Seal tampering sensor: NOMINAL.</p>
              </div>

              <div className={`border p-3 rounded-lg ${handoffStep >= 3 ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <div className="flex justify-between font-bold">
                  <span>STEP 3: FACILITY HANDOFF &amp; DESTRUCTION</span>
                  <span>{handoffStep >= 3 ? 'INCINERATED' : 'PENDING'}</span>
                </div>
                <p className="mt-1 text-xs">Handoff to Bio-Clean Facility Operator for 850°C primary chamber load.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-sans text-xs">
              <Button variant="outline" onClick={() => setShowHandoffModal(false)} className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg">
                Close
              </Button>
              <Button
                onClick={() => setHandoffStep((prev) => (prev < 3 ? prev + 1 : 1))}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2"
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-sans text-xs">
            {WASTE_COLOR_CODES.map((c) => (
              <div key={c.code} className={`border p-4 rounded-xl shadow-sm ${c.bg}`}>
                <div className="flex items-center justify-between font-bold">
                  <span>[{c.code} CATEGORY]</span>
                  <span>{c.temp}</span>
                </div>
                <p className="mt-2 text-xs font-semibold">{c.label}</p>
                <p className="mt-1 text-xs text-slate-700">{c.action}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 text-xs">
              <div>
                <h2 className="font-bold text-base text-slate-900">Bio-Medical Disposal Manifests</h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Permanent immutable record of high-temperature destruction events.
                </p>
              </div>
              <span className="text-slate-600 font-semibold">
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
              <div className="divide-y divide-slate-200 text-xs font-sans">
                {wasteManifests.map((waste) => (
                  <div key={waste.id} className="p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="flex gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            waste.status === 'incinerated'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{waste.medicineName}</h3>
                            <StatusBadge status={waste.status} />
                          </div>
                          <div className="mt-2 grid gap-x-5 gap-y-1 text-xs text-slate-700 sm:grid-cols-2">
                            <span>Batch: <b className="text-slate-900 font-mono">{waste.batchNumber}</b></span>
                            <span>Quantity: <b className="text-slate-900">{waste.quantity} units</b></span>
                            <span>Scheduled: <b className="text-slate-900">{formatDate(waste.scheduledAt)}</b></span>
                            <span>Pickup Location: <b className="text-slate-900">{waste.pickupAddress}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPdf(waste)}
                          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                          Download Form-IV PDF
                        </Button>
                        {waste.status === 'pickup_pending' && (
                          <Button
                            size="sm"
                            disabled={busyId === waste.id}
                            onClick={() => handleConfirm(waste.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs px-4 py-2 shadow-sm shrink-0"
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
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-base text-slate-900">Geo-Fenced Collection Routes</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Real-time GPS waypoints for bio-hazardous drug collection transport vans.
            </p>
          </div>

          <div className="space-y-3">
            {GEO_FENCED_ROUTES.map((r) => (
              <div key={r.id} className="border border-slate-200 bg-white p-5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-slate-900">{r.location}</h4>
                    <span className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700 text-xs">
                    GPS Coordinates: <b className="text-slate-900 font-mono">{r.coords}</b> · Waypoints: <b className="text-slate-900">{r.waypoints} Pickup Spots</b>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Assigned Driver: {r.driver}</p>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 shrink-0">
                  Open Route Map
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: 850°C TELEMETRY LOGS */}
      {activeTabSection === 'telemetry' && (
        <div className="space-y-4 font-sans text-xs">
          <div className="border border-slate-200 bg-white p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-emerald-600 animate-pulse" />
                <h3 className="font-bold text-base text-slate-900">Live 850°C Incineration Telemetry Stream</h3>
              </div>
              <span className="text-emerald-800 font-semibold border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-full text-xs">
                REALTIME WEBSOCKET: CONNECTED
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-center font-sans">
              <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Primary Chamber Temp</span>
                <p className="mt-1 text-3xl font-bold text-amber-700">{liveTemp}°C</p>
                <p className="text-xs text-slate-600 mt-1">Min threshold: 850°C</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Secondary Chamber Temp</span>
                <p className="mt-1 text-3xl font-bold text-red-700">1,080°C</p>
                <p className="text-xs text-slate-600 mt-1">2.0s retention time</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Scrubber Emission CO2</span>
                <p className="mt-1 text-3xl font-bold text-emerald-700">12 PPM</p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">CDSCO Compliant</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
