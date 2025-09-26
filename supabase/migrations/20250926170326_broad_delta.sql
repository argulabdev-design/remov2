/*
  # Fix Firebase UID compatibility

  1. Changes
    - Change `users.id` column from UUID to TEXT to support Firebase UIDs
    - Change `user_miners.user_id` column from UUID to TEXT
    - Change `withdrawals.user_id` column from UUID to TEXT  
    - Change `notifications.user_id` column from UUID to TEXT
    - Update foreign key constraints to work with TEXT type
    - Update RLS policies to work with TEXT user IDs

  2. Security
    - Maintain all existing RLS policies
    - Update auth.uid() references to work with TEXT type
*/

-- First, disable RLS temporarily to make changes
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_miners DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop existing foreign key constraints
ALTER TABLE user_miners DROP CONSTRAINT IF EXISTS user_miners_user_id_fkey;
ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS withdrawals_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own miners" ON user_miners;
DROP POLICY IF EXISTS "Users can insert own miners" ON user_miners;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Change column types from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE user_miners ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE withdrawals ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key constraints with TEXT type
ALTER TABLE user_miners 
ADD CONSTRAINT user_miners_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE withdrawals 
ADD CONSTRAINT withdrawals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_miners ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for users table
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.jwt() ->> 'sub');

-- Recreate RLS policies for user_miners table
CREATE POLICY "Users can view own miners"
  ON user_miners
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own miners"
  ON user_miners
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Recreate RLS policies for withdrawals table
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own withdrawals"
  ON withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Recreate RLS policies for notifications table
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');