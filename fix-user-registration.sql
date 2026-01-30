-- Fix User Registration - Run this in Supabase SQL Editor
-- This fixes the "Database error saving new user" issue

-- ============================================
-- STEP 1: Fix RLS Policies on user_profiles
-- ============================================

-- Drop the existing policy (if it exists)
DROP POLICY IF EXISTS "users_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_own_profile_select" ON user_profiles;
DROP POLICY IF EXISTS "users_own_profile_update" ON user_profiles;
DROP POLICY IF EXISTS "users_own_profile_delete" ON user_profiles;
DROP POLICY IF EXISTS "service_insert_profile" ON user_profiles;

-- Create separate policies for each operation
-- SELECT: users can only read their own profile
CREATE POLICY "users_own_profile_select" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);

-- UPDATE: users can only update their own profile
CREATE POLICY "users_own_profile_update" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- DELETE: users can only delete their own profile
CREATE POLICY "users_own_profile_delete" ON user_profiles 
  FOR DELETE USING (auth.uid() = id);

-- INSERT: Allow inserts (the trigger runs as SECURITY DEFINER which bypasses RLS,
-- but we also need to allow authenticated users to insert their own profile)
CREATE POLICY "allow_insert_profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- ============================================
-- STEP 2: Update the trigger function to be more robust
-- ============================================

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the user profile, ignore if already exists
  INSERT INTO public.user_profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, user_profiles.name),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- STEP 3: Ensure the trigger exists
-- ============================================

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 4: Grant necessary permissions
-- ============================================

-- Ensure the function can access the user_profiles table
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated, anon;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that the trigger exists
SELECT tgname, tgrelid::regclass, tgtype, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_user_created';

-- Check the policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check if user_profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
