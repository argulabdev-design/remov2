/*
  # Initial Schema for REMO Mining Platform

  1. New Tables
    - users: Extended user profile with mining data
    - miners: Available mining packages
    - user_miners: User's purchased miners
    - withdrawals: Withdrawal requests
    - notifications: User notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text,
  balance decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_withdrawal timestamptz,
  total_invested decimal(10,2) DEFAULT 0,
  total_earned decimal(10,2) DEFAULT 0
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Miners table
CREATE TABLE IF NOT EXISTS miners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  duration_days integer NOT NULL,
  daily_return decimal(10,2) NOT NULL,
  total_return_percentage decimal(5,2) DEFAULT 190,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE miners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active miners"
  ON miners FOR SELECT
  TO authenticated
  USING (active = true);

-- User miners table
CREATE TABLE IF NOT EXISTS user_miners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  miner_id uuid REFERENCES miners(id) ON DELETE CASCADE,
  purchase_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  last_drop timestamptz,
  total_earned decimal(10,2) DEFAULT 0,
  drops_received integer DEFAULT 0,
  active boolean DEFAULT true
);

ALTER TABLE user_miners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own miners"
  ON user_miners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own miners"
  ON user_miners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  bank_name text,
  account_number text,
  account_name text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample miners
INSERT INTO miners (name, price, duration_days, daily_return, description) VALUES
('Smart Miner A', 5000, 20, 237.50, 'Entry-level miner perfect for beginners. Generates steady returns over 20 days.'),
('Miner VL9', 20000, 20, 950, 'Professional mining package with higher returns. Ideal for serious miners.'),
('Power Miner X', 10000, 15, 633.33, 'Mid-range miner with accelerated returns over 15 days.'),
('Elite Miner Pro', 50000, 30, 1583.33, 'Premium mining package for maximum earnings over extended periods.');

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'Welcome to REMO!',
    'Your mining account has been created successfully. Explore our miners and start earning today!',
    'success'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();