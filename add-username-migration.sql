-- Migration: Add username column to user_profiles
-- Run this on existing databases to add username support

-- Step 1: Add username column if not exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Step 2: Add constraint for valid username format
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS valid_username;
ALTER TABLE user_profiles ADD CONSTRAINT valid_username CHECK (
  username IS NULL OR (
    username ~ '^[a-z0-9_]{3,30}$'
    AND username NOT IN (
      'admin', 'api', 'app', 'auth', 'blog', 'dashboard', 'help',
      'login', 'logout', 'profile', 'register', 'settings', 'support',
      'www', 'chatrist', 'about', 'contact', 'terms', 'privacy',
      'pricing', 'features', 'docs', 'status', 'null', 'undefined'
    )
  )
);

-- Step 3: Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Step 4: Create or replace username generator function
CREATE OR REPLACE FUNCTION generate_username(base_name text)
RETURNS text AS $$
DECLARE
  generated_username text;
  suffix text;
  counter int := 0;
BEGIN
  -- Clean name: lowercase, replace spaces with underscores, remove special chars
  generated_username := lower(regexp_replace(COALESCE(base_name, 'user'), '[^a-z0-9]', '_', 'g'));
  -- Remove consecutive underscores and trim
  generated_username := regexp_replace(generated_username, '_+', '_', 'g');
  generated_username := trim(both '_' from generated_username);
  -- Ensure minimum length
  IF length(generated_username) < 3 THEN
    generated_username := 'user_' || generated_username;
  END IF;
  -- Truncate to leave room for suffix
  generated_username := left(generated_username, 24);

  -- Check if username exists, if so add random suffix
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = generated_username) LOOP
    suffix := substr(md5(random()::text), 1, 5);
    generated_username := left(generated_username, 24) || '_' || suffix;
    counter := counter + 1;
    IF counter > 10 THEN
      -- Fallback to full random
      generated_username := 'user_' || substr(md5(random()::text), 1, 20);
      EXIT;
    END IF;
  END LOOP;

  RETURN generated_username;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username text;
BEGIN
  -- Generate username from name or email
  new_username := generate_username(
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );

  INSERT INTO user_profiles (id, name, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', new_username)
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(user_profiles.username, EXCLUDED.username);

  -- Update user metadata with username for middleware access
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('username', new_username)
  WHERE id = NEW.id AND (raw_user_meta_data->>'username') IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Generate usernames for existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  new_username text;
BEGIN
  FOR user_record IN
    SELECT up.id, up.name, au.email
    FROM user_profiles up
    JOIN auth.users au ON au.id = up.id
    WHERE up.username IS NULL
  LOOP
    new_username := generate_username(
      COALESCE(user_record.name, split_part(user_record.email, '@', 1))
    );

    UPDATE user_profiles SET username = new_username WHERE id = user_record.id;

    -- Also update user_metadata
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('username', new_username)
    WHERE id = user_record.id;
  END LOOP;
END;
$$;
