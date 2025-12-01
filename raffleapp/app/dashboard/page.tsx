'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

interface DashboardUser {
  id: string;
  email: string;
  name: string;
  role: string;
  kyc_status: string;
  tickets_balance: number;
}

interface JoinedRaffle {
  id: string;
  title: string;
  tickets_spent: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [joinedRaffles, setJoinedRaffles] = useState<JoinedRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsModalOpen, setTicketsModalOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(10);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/auth/login');
        return;
      }

      const parsedUser = JSON.parse(userData) as DashboardUser;
      setUser(parsedUser);

      try {
        const { data: entries, error: entriesError } = await supabase
          .from('raffle_entries')
          .select('id, created_at, tickets_spent, raffles(title)')
          .eq('user_id', parsedUser.id)
          .order('created_at', { ascending: false });

        if (!entriesError && entries) {
          setJoinedRaffles(
            entries.map((entry: any) => ({
              id: entry.id,
              title: entry.raffles?.title || 'Unknown Raffle',
              tickets_spent: entry.tickets_spent,
              created_at: entry.created_at,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching raffles:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handlePurchaseTickets = async () => {
    if (!user) return;

    try {
      const { error: txError } = await supabase
        .from('ticket_transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          qty: purchaseAmount,
          amount_fiat: purchaseAmount * 1.0,
          currency: 'USD',
          provider_ref: 'stripe_' + Date.now(),
        });

      if (txError) throw txError;

      const { error: updateError } = await supabase
        .from('users')
        .update({ tickets_balance: user.tickets_balance + purchaseAmount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({
        ...user,
        tickets_balance: user.tickets_balance + purchaseAmount,
      });

      localStorage.setItem('user', JSON.stringify({
        ...user,
        tickets_balance: user.tickets_balance + purchaseAmount,
      }));

      setTicketsModalOpen(false);
      setPurchaseAmount(10);
      alert('Tickets purchased successfully!');
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase tickets');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-text_secondary">Loading dashboard...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light_bg py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="heading-1 mb-2">Welcome, {user.name}!</h1>
              <p className="text-text_secondary">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-text_secondary hover:text-highlight transition-colors"
            >
              Log out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card bg-gradient-to-br from-primary to-blue-500 text-white">
              <p className="opacity-80 mb-2">Available Tickets</p>
              <p className="text-5xl font-bold font-title mb-4">{user.tickets_balance}</p>
              <button
                onClick={() => setTicketsModalOpen(true)}
                className="px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-light_bg transition-colors"
              >
                Buy More
              </button>
            </div>

            <div className="card">
              <p className="text-text_secondary text-sm mb-2">ROLE</p>
              <p className="heading-3 capitalize">{user.role}</p>
              {user.role === 'participant' && (
                <p className="text-text_secondary text-sm mt-4">Upgrade to host with KYC verification</p>
              )}
            </div>

            <div className="card">
              <p className="text-text_secondary text-sm mb-2">KYC STATUS</p>
              <p className={`heading-3 capitalize ${
                user.kyc_status === 'verified' ? 'text-green-600' :
                user.kyc_status === 'pending' ? 'text-yellow-600' :
                'text-text_secondary'
              }`}>
                {user.kyc_status}
              </p>
              {user.kyc_status !== 'verified' && (
                <button className="text-primary hover:underline text-sm mt-4 font-semibold">
                  Start KYC →
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="heading-2 mb-6">Raffles You've Joined</h2>
            {joinedRaffles.length === 0 ? (
              <p className="text-text_secondary">You haven't joined any raffles yet. <a href="/raffles" className="text-primary hover:underline">Browse raffles →</a></p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text_secondary">Raffle</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text_secondary">Tickets Spent</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text_secondary">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinedRaffles.map((raffle) => (
                      <tr key={raffle.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                        <td className="py-3 px-4 text-text_primary">{raffle.title}</td>
                        <td className="py-3 px-4 font-semibold text-primary">{raffle.tickets_spent}</td>
                        <td className="py-3 px-4 text-text_secondary text-sm">
                          {new Date(raffle.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {ticketsModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="heading-2 mb-4">Buy Tickets</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Number of Tickets</label>
                    <input
                      type="number"
                      min={1}
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div className="bg-light_bg p-4 rounded-lg">
                    <p className="text-text_secondary text-sm">Total Cost</p>
                    <p className="heading-2 text-primary">${(purchaseAmount * 1.0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTicketsModalOpen(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchaseTickets}
                    className="flex-1 btn-primary"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
