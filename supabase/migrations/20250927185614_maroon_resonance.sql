/*
  # Add User Tracking and Ban Functionality

  1. New Columns
    - `users.last_login_ip` (text) - Track user IP addresses
    - `users.is_banned` (boolean) - Ban/unban functionality
    - `users.banned_at` (timestamp) - When user was banned
    - `users.banned_reason` (text) - Reason for ban

  2. Security
    - Update RLS policies to prevent banned users from accessing data
    - Add admin-only policies for user management

  3. Changes
    - Add indexes for performance
    - Update existing policies
*/

-- Add new columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE users ADD COLUMN is_banned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'banned_at'
  ) THEN
    ALTER TABLE users ADD COLUMN banned_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'banned_reason'
  ) THEN
    ALTER TABLE users ADD COLUMN banned_reason text;
  END IF;
END $$;

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(is_banned) WHERE is_banned = true;

-- Update RLS policies to prevent banned users from accessing data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (jwt() ->> 'sub'::text) AND (is_banned IS NULL OR is_banned = false));

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = (jwt() ->> 'sub'::text) AND (is_banned IS NULL OR is_banned = false));

-- Add admin policy for user management
CREATE POLICY IF NOT EXISTS "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (jwt() ->> 'email'::text) = 'admin@remo.ng'
  );

-- Update other table policies to prevent banned users from accessing data
DROP POLICY IF EXISTS "Users can view own miners" ON user_miners;
CREATE POLICY "Users can view own miners"
  ON user_miners
  FOR SELECT
  TO authenticated
  USING (
    user_id = (jwt() ->> 'sub'::text) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (jwt() ->> 'sub'::text) 
      AND (is_banned IS NULL OR is_banned = false)
    )
  );

DROP POLICY IF EXISTS "Users can insert own miners" ON user_miners;
CREATE POLICY "Users can insert own miners"
  ON user_miners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (jwt() ->> 'sub'::text) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (jwt() ->> 'sub'::text) 
      AND (is_banned IS NULL OR is_banned = false)
    )
  );

-- Update notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = (jwt() ->> 'sub'::text) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (jwt() ->> 'sub'::text) 
      AND (is_banned IS NULL OR is_banned = false)
    )
  );

-- Update withdrawals policies
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals
  FOR SELECT
  TO authenticated
  USING (
    user_id = (jwt() ->> 'sub'::text) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (jwt() ->> 'sub'::text) 
      AND (is_banned IS NULL OR is_banned = false)
    )
  );

DROP POLICY IF EXISTS "Users can create own withdrawals" ON withdrawals;
CREATE POLICY "Users can create own withdrawals"
  ON withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (jwt() ->> 'sub'::text) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = (jwt() ->> 'sub'::text) 
      AND (is_banned IS NULL OR is_banned = false)
    )
  );