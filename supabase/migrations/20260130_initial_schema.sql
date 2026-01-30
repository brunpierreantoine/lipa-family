-- Create a table for pre-authorized emails
CREATE TABLE IF NOT EXISTS pre_authorized_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table for families
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    ai_profile TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure created_by exists (if table was already created without it)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='families' AND COLUMN_NAME='created_by') THEN
        ALTER TABLE families ADD COLUMN created_by UUID DEFAULT auth.uid();
    END IF;
END $$;

-- Enum for membership roles (Wrapped in DO block for idempotency)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role') THEN
        CREATE TYPE membership_role AS ENUM ('Admin', 'Member');
    END IF;
END $$;

-- Create a table for family memberships (Many-to-Many)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'Member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, family_id)
);

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_authorized_emails ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies and functions to avoid "already exists" errors
DROP POLICY IF EXISTS "Public read for auth check" ON pre_authorized_emails;
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Authenticated users can create families" ON families;
DROP POLICY IF EXISTS "Admins can update their family" ON families;
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Members can view family roster" ON memberships;
DROP POLICY IF EXISTS "Users can join a family (onboarding)" ON memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can view all family memberships" ON memberships;

DROP FUNCTION IF EXISTS is_family_admin(UUID);
DROP FUNCTION IF EXISTS is_family_member(UUID);

-- Helper function to check if user is an admin of a family (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION is_family_admin(f_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE family_id = f_id
        AND user_id = auth.uid()
        AND role = 'Admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user belongs to a family
CREATE OR REPLACE FUNCTION is_family_member(f_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE family_id = f_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for pre_authorized_emails
CREATE POLICY "Public read for auth check" ON pre_authorized_emails
    FOR SELECT USING (true);

-- Policies for families
CREATE POLICY "Users can view families they belong to" ON families
    FOR SELECT USING (is_family_member(id) OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create families" ON families
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update their family" ON families
    FOR UPDATE USING (is_family_admin(id) OR auth.uid() = created_by);

-- Policies for memberships
CREATE POLICY "Users can view their own memberships" ON memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Members can view family roster" ON memberships
    FOR SELECT USING (is_family_member(family_id));

CREATE POLICY "Users can join a family (onboarding)" ON memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage memberships" ON memberships
    FOR ALL USING (is_family_admin(family_id));

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create trigger (Drop first to be safe)
DROP TRIGGER IF EXISTS set_families_updated_at ON families;
CREATE TRIGGER set_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

