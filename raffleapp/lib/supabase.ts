import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'participant' | 'host' | 'admin';
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  tickets_balance: number;
  created_at: string;
};

export type Raffle = {
  id: string;
  host_id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  ticket_price: number;
  min_participants: number | null;
  max_participants: number | null;
  min_tickets_per_user: number;
  max_tickets_per_user: number | null;
  start_at: string;
  end_at: string;
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'refunded' | 'cancelled';
  created_at: string;
};

export type RaffleEntry = {
  id: string;
  raffle_id: string;
  user_id: string;
  tickets_spent: number;
  created_at: string;
};

export type Draw = {
  id: string;
  raffle_id: string;
  method: 'rng_api' | 'onchain' | 'mock';
  proof_seed: string | null;
  proof_hash: string | null;
  result_index: number | null;
  winner_user_id: string | null;
  drawn_at: string;
};
