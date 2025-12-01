/*
  # RaffleHub Core Schema

  1. New Tables
    - `users` - Platform users with roles and KYC status
    - `ticket_transactions` - Track all ticket movements (purchase, spend, refund)
    - `raffles` - Main raffle listings
    - `raffle_entries` - User participation in raffles
    - `draws` - RNG draws with provable fairness proof
    - `kyc_checks` - KYC verification records
    - `payouts` - Host payout tracking
    - `refunds` - Refund records
    - `audit_logs` - Security and compliance logging
    - `notifications` - User notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admins
    - Implement role-based access control

  3. Indexes
    - Foreign key indexes for performance
    - Status and date-based partial indexes
*/

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'host', 'admin')),
  kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'verified', 'rejected')),
  tickets_balance BIGINT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'adjustment')),
  qty BIGINT NOT NULL,
  amount_fiat DECIMAL(10, 2),
  currency TEXT,
  provider_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  ticket_price BIGINT NOT NULL,
  min_participants INTEGER,
  max_participants INTEGER,
  min_tickets_per_user BIGINT DEFAULT 1,
  max_tickets_per_user BIGINT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'completed', 'refunded', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raffle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tickets_spent BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  method TEXT DEFAULT 'mock' CHECK (method IN ('rng_api', 'onchain', 'mock')),
  proof_seed TEXT,
  proof_hash TEXT,
  result_index INTEGER,
  winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  drawn_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kyc_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  provider_ref TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_tickets BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tickets_refunded BIGINT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_ticket_transactions_user_id ON ticket_transactions(user_id);
CREATE INDEX idx_ticket_transactions_created_at ON ticket_transactions(created_at DESC);
CREATE INDEX idx_raffles_host_id ON raffles(host_id);
CREATE INDEX idx_raffles_status ON raffles(status);
CREATE INDEX idx_raffles_end_at ON raffles(end_at DESC);
CREATE INDEX idx_raffle_entries_raffle_id ON raffle_entries(raffle_id);
CREATE INDEX idx_raffle_entries_user_id ON raffle_entries(user_id);
CREATE INDEX idx_draws_raffle_id ON draws(raffle_id);
CREATE INDEX idx_kyc_checks_user_id ON kyc_checks(user_id);
CREATE INDEX idx_payouts_raffle_id ON payouts(raffle_id);
CREATE INDEX idx_payouts_host_id ON payouts(host_id);
CREATE INDEX idx_refunds_raffle_id ON refunds(raffle_id);
CREATE INDEX idx_refunds_user_id ON refunds(user_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own transactions"
  ON ticket_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON ticket_transactions FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "System can insert transactions"
  ON ticket_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view public raffles"
  ON raffles FOR SELECT
  TO anon
  USING (status IN ('active', 'completed'));

CREATE POLICY "Authenticated can view all raffles"
  ON raffles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hosts can create raffles"
  ON raffles FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('host', 'admin')
  );

CREATE POLICY "Admins can update raffles"
  ON raffles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Hosts can update own raffles"
  ON raffles FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Authenticated users can view entries"
  ON raffle_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create entries"
  ON raffle_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view draws"
  ON draws FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can create draws"
  ON draws FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can view own KYC"
  ON kyc_checks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all KYC"
  ON kyc_checks FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can create KYC"
  ON kyc_checks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update KYC"
  ON kyc_checks FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Hosts can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (host_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can manage payouts"
  ON payouts FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update payouts"
  ON payouts FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "System can insert refunds"
  ON refunds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
