-- MediChain Database Schema Migration
-- Includes profiles, waste_manifests, medicines, RLS policies, and handle_new_user trigger

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('HOUSEHOLD', 'PHARMACIST', 'NGO', 'WASTE_COLLECTOR')),
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Handle New User Trigger Function with ON CONFLICT resolution
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

-- 3. Waste Manifests Table
CREATE TABLE IF NOT EXISTS waste_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_name text NOT NULL,
  batch_number text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  pickup_address text NOT NULL,
  status text NOT NULL DEFAULT 'PICKUP_PENDING' CHECK (status IN ('PICKUP_PENDING', 'INCINERATED')),
  route_id text,
  operator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  temperature integer,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waste_manifests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waste_select_all" ON waste_manifests;
CREATE POLICY "waste_select_all" ON waste_manifests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "waste_insert_all" ON waste_manifests;
CREATE POLICY "waste_insert_all" ON waste_manifests FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "waste_update_all" ON waste_manifests;
CREATE POLICY "waste_update_all" ON waste_manifests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "waste_delete_own" ON waste_manifests;
CREATE POLICY "waste_delete_own" ON waste_manifests FOR DELETE TO authenticated USING (auth.uid() = operator_id);

CREATE INDEX IF NOT EXISTS waste_manifests_status_idx ON waste_manifests(status);

-- 4. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  generic_name text NOT NULL,
  batch_number text NOT NULL,
  expiry_date date NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'REQUESTED', 'PICKUP_SCHEDULED', 'DISPOSED')),
  tx_hash text,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_quantity integer,
  pickup_id uuid REFERENCES waste_manifests(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medicines_select_all" ON medicines;
CREATE POLICY "medicines_select_all" ON medicines FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "medicines_insert_own" ON medicines;
CREATE POLICY "medicines_insert_own" ON medicines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "medicines_update_all" ON medicines;
CREATE POLICY "medicines_update_all" ON medicines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "medicines_delete_own" ON medicines;
CREATE POLICY "medicines_delete_own" ON medicines FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS medicines_user_id_idx ON medicines(user_id);
CREATE INDEX IF NOT EXISTS medicines_status_idx ON medicines(status);
CREATE INDEX IF NOT EXISTS medicines_expiry_date_idx ON medicines(expiry_date);

ALTER TABLE waste_manifests ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES medicines(id) ON DELETE SET NULL;