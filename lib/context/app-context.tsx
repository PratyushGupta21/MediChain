'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type {
  User,
  MedicineBatch,
  WasteManifest,
  Persona,
  MedicineRow,
  WasteRow,
  ProfileRow,
} from '@/lib/types';
import { PERSONA_PRESETS } from '@/lib/personas';
import {
  personaToRole,
  roleToPersona,
  dbToAppStatus,
  appToDbStatus,
} from '@/lib/mappers';
import { generateTxHash } from '@/lib/fefo';

interface AppContextValue {
  user: User | null;
  isAuthOpen: boolean;
  loading: boolean;
  medicines: MedicineBatch[];
  wasteManifests: WasteManifest[];
  setAuthOpen: (open: boolean) => void;
  signUp: (email: string, password: string, persona: Persona, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  addMedicine: (med: {
    brandName: string;
    genericName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
  }) => Promise<void>;
  submitForVerification: (batchId: string) => Promise<void>;
  approveBatch: (batchId: string) => Promise<string>;
  rejectBatch: (batchId: string) => Promise<void>;
  donateToNgo: (batchId: string) => Promise<void>;
  requestAllocation: (batchId: string, quantity: number) => Promise<void>;
  schedulePickup: (batchId: string) => Promise<void>;
  confirmDestruction: (wasteId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function mapMedicineRow(row: MedicineRow, ownerName: string): MedicineBatch {
  return {
    id: row.id,
    brandName: row.brand_name,
    genericName: row.generic_name,
    batchNumber: row.batch_number,
    expiryDate: row.expiry_date,
    quantity: row.quantity,
    ownerId: row.user_id,
    ownerName,
    status: dbToAppStatus(row.status),
    loggedAt: row.created_at,
    verifiedAt: row.verified_at ?? undefined,
    txHash: row.tx_hash ?? undefined,
    requestedBy: row.requested_by ?? undefined,
    requestedQuantity: row.requested_quantity ?? undefined,
    pickupId: row.pickup_id ?? undefined,
  };
}

function mapWasteRow(row: WasteRow): WasteManifest {
  return {
    id: row.id,
    batchId: row.batch_id ?? '',
    medicineName: row.medicine_name,
    batchNumber: row.batch_number,
    quantity: row.quantity,
    pickupAddress: row.pickup_address,
    status: row.status === 'INCINERATED' ? 'incinerated' : 'pickup_pending',
    scheduledAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    operatorId: row.operator_id ?? undefined,
    routeId: row.route_id ?? '',
    temperature: row.temperature ?? undefined,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<MedicineBatch[]>([]);
  const [wasteManifests, setWasteManifests] = useState<WasteManifest[]>([]);
  const profileCache = useRef<Map<string, string>>(new Map());

  // Restore session on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        await loadUserFromSession(session);
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session) {
          await loadUserFromSession(session);
        } else {
          setUser(null);
          setMedicines([]);
          setWasteManifests([]);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUserFromSession(session: Session) {
    const authUser = session.user;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      toast({
        title: 'Profile load failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    if (!profile) return;

    const profileRow = profile as ProfileRow;
    const persona = roleToPersona(profileRow.role);
    const preset = PERSONA_PRESETS.find((p) => p.persona === persona);
    const appUser: User = {
      id: authUser.id,
      persona,
      name: profileRow.full_name || authUser.email || 'User',
      email: authUser.email || '',
      walletAddress:
        `0x${authUser.id.slice(0, 4)}...${authUser.id.slice(-4)}`,
      organization: preset?.organization,
      avatarColor: preset?.avatarColor || '#C29B72',
    };
    setUser(appUser);
    profileCache.current.set(authUser.id, appUser.name);
    await fetchMedicines();
    await fetchWasteManifests();
  }

  async function fetchMedicines() {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Failed to load medicines',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    if (!data || data.length === 0) {
      setMedicines([]);
      return;
    }

    // Fetch owner names
    const userIds = Array.from(new Set((data as MedicineRow[]).map((r) => r.user_id)));
    await Promise.all(userIds.map((uid) => ensureProfileCached(uid)));

    const mapped = (data as MedicineRow[]).map((row) =>
      mapMedicineRow(row, profileCache.current.get(row.user_id) || 'Unknown')
    );
    setMedicines(mapped);
  }

  async function ensureProfileCached(userId: string) {
    if (profileCache.current.has(userId)) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle();
    if (!error && data) {
      const name = (data as { full_name: string | null; email: string }).full_name
        || (data as { email: string }).email
        || 'Unknown';
      profileCache.current.set(userId, name);
    } else {
      profileCache.current.set(userId, 'Unknown');
    }
  }

  async function fetchWasteManifests() {
    const { data, error } = await supabase
      .from('waste_manifests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Failed to load waste manifests',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    if (!data) {
      setWasteManifests([]);
      return;
    }

    setWasteManifests((data as WasteRow[]).map(mapWasteRow));
  }

  // --- Auth ---

  const signUp = useCallback<AppContextValue['signUp']>(
    async (email, password, persona, fullName) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (!data.user) {
        toast({
          title: 'Sign up failed',
          description: 'No user returned. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          role: personaToRole(persona),
          full_name: fullName,
        });

      if (profileError) {
        toast({
          title: 'Profile creation failed',
          description: profileError.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Account created',
        description: `Welcome to MediChain, ${fullName}!`,
      });
      setAuthOpen(false);
    },
    []
  );

  const signIn = useCallback<AppContextValue['signIn']>(
    async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Welcome back!',
        description: 'Signed in successfully.',
      });
      setAuthOpen(false);
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMedicines([]);
    setWasteManifests([]);
    toast({ title: 'Signed out', description: 'See you next time.' });
  }, []);

  // --- Medicines CRUD ---

  const addMedicine = useCallback<AppContextValue['addMedicine']>(
    async (med) => {
      if (!user) {
        toast({
          title: 'Not signed in',
          description: 'Please sign in to log medicines.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('medicines')
        .insert({
          brand_name: med.brandName,
          generic_name: med.genericName,
          batch_number: med.batchNumber,
          expiry_date: med.expiryDate,
          quantity: med.quantity,
          status: 'PENDING',
        })
        .select('*')
        .single();

      if (error) {
        toast({
          title: 'Failed to log medicine',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const newMed = mapMedicineRow(
        data as MedicineRow,
        user.name
      );
      setMedicines((prev) => [newMed, ...prev]);
      toast({
        title: 'Medicine logged',
        description: `${med.brandName} added to your inventory.`,
      });
    },
    [user]
  );

  const submitForVerification = useCallback(
    async (batchId: string) => {
      const { error } = await supabase
        .from('medicines')
        .update({ status: 'PENDING' })
        .eq('id', batchId);

      if (error) {
        toast({
          title: 'Submission failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setMedicines((prev) =>
        prev.map((m) =>
          m.id === batchId
            ? { ...m, status: 'pending_verification' }
            : m
        )
      );
      toast({ title: 'Submitted for verification' });
    },
    []
  );

  const approveBatch = useCallback(
    async (batchId: string): Promise<string> => {
      const txHash = generateTxHash();
      const { error } = await supabase
        .from('medicines')
        .update({
          status: 'APPROVED',
          tx_hash: txHash,
          verified_at: new Date().toISOString(),
        })
        .eq('id', batchId);

      if (error) {
        toast({
          title: 'Approval failed',
          description: error.message,
          variant: 'destructive',
        });
        return '';
      }

      setMedicines((prev) =>
        prev.map((m) =>
          m.id === batchId
            ? {
                ...m,
                status: 'approved',
                txHash,
                verifiedAt: new Date().toISOString(),
              }
            : m
        )
      );
      toast({
        title: 'Batch approved',
        description: 'Signed to the MediChain ledger.',
      });
      return txHash;
    },
    []
  );

  const rejectBatch = useCallback(async (batchId: string) => {
    const { error } = await supabase
      .from('medicines')
      .update({ status: 'REJECTED' })
      .eq('id', batchId);

    if (error) {
      toast({
        title: 'Rejection failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setMedicines((prev) =>
      prev.map((m) =>
        m.id === batchId ? { ...m, status: 'rejected' } : m
      )
    );
    toast({ title: 'Batch rejected', variant: 'destructive' });
  }, []);

  const donateToNgo = useCallback(async (batchId: string) => {
    const { error } = await supabase
      .from('medicines')
      .update({ status: 'PENDING' })
      .eq('id', batchId);

    if (error) {
      toast({
        title: 'Donation failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setMedicines((prev) =>
      prev.map((m) =>
        m.id === batchId
          ? { ...m, status: 'pending_verification' }
          : m
      )
    );
    toast({
      title: 'Submitted for donation',
      description: 'Awaiting pharmacist verification.',
    });
  }, []);

  const requestAllocation = useCallback(
    async (batchId: string, quantity: number) => {
      if (!user) return;

      const { error } = await supabase
        .from('medicines')
        .update({
          status: 'REQUESTED',
          requested_by: user.id,
          requested_quantity: quantity,
        })
        .eq('id', batchId);

      if (error) {
        toast({
          title: 'Request failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setMedicines((prev) =>
        prev.map((m) =>
          m.id === batchId
            ? {
                ...m,
                status: 'requested',
                requestedBy: user.id,
                requestedQuantity: quantity,
              }
            : m
        )
      );
      toast({
        title: 'Allocation requested',
        description: `Requested ${quantity} units.`,
      });
    },
    [user]
  );

  const schedulePickup = useCallback(
    async (batchId: string) => {
      const med = medicines.find((m) => m.id === batchId);
      if (!med) return;

      const routeId = `RTE-${Math.floor(Math.random() * 900 + 100)}`;

      const { data: wasteData, error: wasteError } = await supabase
        .from('waste_manifests')
        .insert({
          medicine_name: `${med.brandName} (${med.genericName})`,
          batch_number: med.batchNumber,
          quantity: med.quantity,
          pickup_address: 'Pending confirmation from user',
          status: 'PICKUP_PENDING',
          route_id: routeId,
        })
        .select('*')
        .single();

      if (wasteError || !wasteData) {
        toast({
          title: 'Pickup scheduling failed',
          description: wasteError?.message || 'Unknown error',
          variant: 'destructive',
        });
        return;
      }

      const wasteRow = wasteData as WasteRow;
      const wasteId = wasteRow.id;

      const { error: medError } = await supabase
        .from('medicines')
        .update({
          status: 'PICKUP_SCHEDULED',
          pickup_id: wasteId,
        })
        .eq('id', batchId);

      if (medError) {
        toast({
          title: 'Update failed',
          description: medError.message,
          variant: 'destructive',
        });
        return;
      }

      setMedicines((prev) =>
        prev.map((m) =>
          m.id === batchId
            ? { ...m, status: 'pickup_scheduled', pickupId: wasteId }
            : m
        )
      );
      setWasteManifests((prev) => [mapWasteRow(wasteRow), ...prev]);
      toast({
        title: 'Pickup scheduled',
        description: `Route ${routeId} assigned.`,
      });
    },
    [medicines]
  );

  const confirmDestruction = useCallback(
    async (wasteId: string) => {
      const temp = 850 + Math.floor(Math.random() * 150);

      const { error } = await supabase
        .from('waste_manifests')
        .update({
          status: 'INCINERATED',
          completed_at: new Date().toISOString(),
          temperature: temp,
        })
        .eq('id', wasteId);

      if (error) {
        toast({
          title: 'Destruction confirmation failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setWasteManifests((prev) =>
        prev.map((w) =>
          w.id === wasteId
            ? {
                ...w,
                status: 'incinerated',
                completedAt: new Date().toISOString(),
                temperature: temp,
              }
            : w
        )
      );

      // Update linked medicine if any
      const linked = wasteManifests.find((w) => w.id === wasteId);
      if (linked?.batchId) {
        await supabase
          .from('medicines')
          .update({ status: 'DISPOSED' })
          .eq('id', linked.batchId);
        setMedicines((prev) =>
          prev.map((m) =>
            m.pickupId === wasteId ? { ...m, status: 'disposed' } : m
          )
        );
      }

      toast({
        title: 'Destruction certified',
        description: `Incinerated at ${temp}°C.`,
      });
    },
    [wasteManifests]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthOpen,
        loading,
        medicines,
        wasteManifests,
        setAuthOpen,
        signUp,
        signIn,
        signOut,
        addMedicine,
        submitForVerification,
        approveBatch,
        rejectBatch,
        donateToNgo,
        requestAllocation,
        schedulePickup,
        confirmDestruction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
