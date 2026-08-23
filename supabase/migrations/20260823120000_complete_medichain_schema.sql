-- MediChain Complete Database Schema, Triggers, RLS Policies, and Seed Data Migration

-- ==========================================
-- 1. TABLE DEFINITIONS
-- ==========================================

-- 1.1 PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('HOUSEHOLD', 'PHARMACIST', 'NGO', 'WASTE_COLLECTOR')),
  created_at timestamptz DEFAULT now()
);

-- 1.2 WASTE MANIFESTS TABLE
CREATE TABLE IF NOT EXISTS public.waste_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_name text NOT NULL,
  batch_number text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  pickup_address text NOT NULL,
  status text NOT NULL DEFAULT 'PICKUP_PENDING' CHECK (status IN ('PICKUP_PENDING', 'INCINERATED')),
  route_id text,
  operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  collector_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  color_code text DEFAULT 'YELLOW' CHECK (color_code IN ('YELLOW', 'RED', 'BLUE', 'BLACK')),
  weight_kg numeric DEFAULT 5.0,
  waste_type text DEFAULT 'Outdated Pharmaceuticals & Cytotoxic Waste',
  origin_facility text DEFAULT 'Household Vault',
  disposal_facility text DEFAULT 'Bio-Clean Incineration Plant 04',
  primary_temp_c numeric DEFAULT 850,
  secondary_temp_c numeric DEFAULT 1100,
  temperature integer DEFAULT 850,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 1.3 MEDICINES TABLE
CREATE TABLE IF NOT EXISTS public.medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  name text,
  generic_name text NOT NULL,
  batch_number text NOT NULL,
  expiry_date date NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit text DEFAULT 'tablets',
  fefo_status text DEFAULT 'SAFE' CHECK (fefo_status IN ('SAFE', 'WARNING', 'EXPIRED')),
  cdsco_verified boolean DEFAULT false,
  qr_code_hash text,
  current_location text DEFAULT 'Household Vault',
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'REQUESTED', 'PICKUP_SCHEDULED', 'DISPOSED')),
  tx_hash text,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_quantity integer,
  pickup_id uuid REFERENCES public.waste_manifests(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.waste_manifests ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES public.medicines(id) ON DELETE SET NULL;

-- 1.4 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- 1.5 REQUISITIONS TABLE
CREATE TABLE IF NOT EXISTS public.requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  requested_quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISPATCHED', 'REJECTED')),
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. AUTOMATED TRIGGERS & FUNCTIONS
-- ==========================================

-- 2.1 HANDLE NEW USER TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, created_at)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(NULLIF(new.raw_user_meta_data->>'role', ''), 'HOUSEHOLD'),
    COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), new.email),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2.2 CALCULATE FEFO STATUS TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.calculate_fefo_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  days_rem integer;
BEGIN
  days_rem := NEW.expiry_date - CURRENT_DATE;
  IF days_rem > 60 THEN
    NEW.fefo_status := 'SAFE';
  ELSIF days_rem >= 30 THEN
    NEW.fefo_status := 'WARNING';
  ELSE
    NEW.fefo_status := 'EXPIRED';
  END IF;
  
  -- Keep name synced with brand_name
  IF NEW.name IS NULL OR NEW.name = '' THEN
    NEW.name := NEW.brand_name;
  END IF;
  
  -- Keep donor_id synced with user_id
  IF NEW.donor_id IS NULL THEN
    NEW.donor_id := NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calculate_fefo_status ON public.medicines;
CREATE TRIGGER trg_calculate_fefo_status
  BEFORE INSERT OR UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.calculate_fefo_status();

-- 2.3 LOG AUDIT EVENT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details, timestamp)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME || '_' || TG_OP,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'new_state', to_jsonb(NEW),
      'old_state', to_jsonb(OLD)
    ),
    now()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_medicines ON public.medicines;
CREATE TRIGGER trg_audit_medicines
  AFTER INSERT OR UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS trg_audit_waste_manifests ON public.waste_manifests;
CREATE TRIGGER trg_audit_waste_manifests
  AFTER INSERT OR UPDATE ON public.waste_manifests
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;

-- 3.1 PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3.2 MEDICINES POLICIES
DROP POLICY IF EXISTS "medicines_select_all" ON public.medicines;
CREATE POLICY "medicines_select_all" ON public.medicines FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "medicines_insert_policy" ON public.medicines;
CREATE POLICY "medicines_insert_policy" ON public.medicines FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id OR auth.uid() = donor_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('HOUSEHOLD', 'PHARMACIST'))
);

DROP POLICY IF EXISTS "medicines_update_policy" ON public.medicines;
CREATE POLICY "medicines_update_policy" ON public.medicines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "medicines_delete_own" ON public.medicines;
CREATE POLICY "medicines_delete_own" ON public.medicines FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() = donor_id);

-- 3.3 WASTE MANIFESTS POLICIES
DROP POLICY IF EXISTS "waste_select_all" ON public.waste_manifests;
CREATE POLICY "waste_select_all" ON public.waste_manifests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "waste_insert_policy" ON public.waste_manifests;
CREATE POLICY "waste_insert_policy" ON public.waste_manifests FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "waste_update_policy" ON public.waste_manifests;
CREATE POLICY "waste_update_policy" ON public.waste_manifests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 3.4 AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "audit_select_all" ON public.audit_logs;
CREATE POLICY "audit_select_all" ON public.audit_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "audit_insert_all" ON public.audit_logs;
CREATE POLICY "audit_insert_all" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 3.5 REQUISITIONS POLICIES
DROP POLICY IF EXISTS "requisitions_select_all" ON public.requisitions;
CREATE POLICY "requisitions_select_all" ON public.requisitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "requisitions_insert_policy" ON public.requisitions;
CREATE POLICY "requisitions_insert_policy" ON public.requisitions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "requisitions_update_policy" ON public.requisitions;
CREATE POLICY "requisitions_update_policy" ON public.requisitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 4. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS medicines_user_id_idx ON public.medicines(user_id);
CREATE INDEX IF NOT EXISTS medicines_donor_id_idx ON public.medicines(donor_id);
CREATE INDEX IF NOT EXISTS medicines_status_idx ON public.medicines(status);
CREATE INDEX IF NOT EXISTS medicines_expiry_date_idx ON public.medicines(expiry_date);
CREATE INDEX IF NOT EXISTS waste_manifests_status_idx ON public.waste_manifests(status);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS requisitions_ngo_id_idx ON public.requisitions(ngo_id);

-- ==========================================
-- 5. MOCK SEED DATA FOR TESTING
-- ==========================================
INSERT INTO public.waste_manifests (id, medicine_name, batch_number, quantity, pickup_address, status, route_id, color_code, weight_kg, waste_type, primary_temp_c, secondary_temp_c)
VALUES 
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Amoxicillin 500mg', 'AMX-9921', 15, 'Flat 402, Green Valley Apartments, Bengaluru', 'PICKUP_PENDING', 'ROUTE-INDIRANAGAR-01', 'YELLOW', 3.5, 'Expired Antibiotics & Cytotoxic Waste', 850, 1100),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Metformin 850mg', 'MET-4412', 30, 'Plot 18, Phase 2, Electronic City, Bengaluru', 'INCINERATED', 'ROUTE-WHITEFIELD-04', 'RED', 12.0, 'Contaminated Packaging & Vials', 850, 1100)
ON CONFLICT (id) DO NOTHING;
