'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase, Raffle, RaffleEntry, Draw } from '@/lib/supabase';

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const raffleId = params.id as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [ticketsToSpend, setTicketsToSpend] = useState<number>(1);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchRaffleData = async () => {
      try {
        const { data: raffleData, error: raffleError } = await supabase
          .from('raffles')
          .select('*')
          .eq('id', raffleId)
          .single();

        if (raffleError) throw raffleError;
        setRaffle(raffleData);

        const { data: entriesData, error: entriesError } = await supabase
          .from('raffle_entries')
          .select('*')
          .eq('raffle_id', raffleId);

        if (entriesError) throw entriesError;
        setEntries(entriesData || []);

        const { data: drawData } = await supabase
          .from('draws')
          .select('*')
          .eq('raffle_id', raffleId)
          .order('drawn_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (drawData) {
          setDraw(drawData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (raffleId) {
      fetchRaffleData();
    }
  }, [raffleId]);

  const handleJoinRaffle = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsJoining(true);
    try {
      const ticketCost = (raffle?.ticket_price || 0) * ticketsToSpend;

      if (user.tickets_balance < ticketCost) {
        setError('Insufficient ticket balance. Please buy more tickets.');
        setIsJoining(false);
        return;
      }

      const { error: entryError } = await supabase
        .from('raffle_entries')
        .insert({
          raffle_id: raffleId,
          user_id: user.id,
          tickets_spent: ticketCost,
        });

      if (entryError) throw entryError;

      const { error: txError } = await supabase
        .from('ticket_transactions')
        .insert({
          user_id: user.id,
          type: 'spend',
          qty: ticketCost,
        });

      if (txError) throw txError;

      setError('');
      alert('Successfully joined the raffle!');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-text_secondary">Loading raffle details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!raffle || error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-highlight">{error || 'Raffle not found'}</p>
        </div>
        <Footer />
      </>
    );
  }

  const endTime = new Date(raffle.end_at);
  const now = new Date();
  const timeLeft = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
  const hoursLeft = Math.floor(timeLeft / 3600);
  const minutesLeft = Math.floor((timeLeft % 3600) / 60);
  const isActive = raffle.status === 'active' && timeLeft > 0;
  const totalTicketsSpent = entries.reduce((sum, e) => sum + e.tickets_spent, 0);
  const ticketCost = (raffle.ticket_price || 0) * ticketsToSpend;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light_bg py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-primary hover:underline mb-6">
            ← Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {raffle.images && raffle.images.length > 0 && (
                <img
                  src={raffle.images[0]}
                  alt={raffle.title}
                  className="w-full h-96 object-cover rounded-lg mb-6"
                />
              )}
            </div>

            <div className="card h-fit">
              <h1 className="heading-2 mb-4">{raffle.title}</h1>
              <p className="body-text mb-6">{raffle.description}</p>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-text_secondary">Ticket Price</span>
                  <span className="font-semibold text-text_primary">{raffle.ticket_price} tickets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text_secondary">Entries</span>
                  <span className="font-semibold text-text_primary">{entries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text_secondary">Time Left</span>
                  <span className={`font-semibold ${timeLeft <= 0 ? 'text-highlight' : 'text-primary'}`}>
                    {hoursLeft}h {minutesLeft}m
                  </span>
                </div>
              </div>

              {isActive ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tickets to Spend</label>
                    <input
                      type="number"
                      min={raffle.min_tickets_per_user || 1}
                      max={raffle.max_tickets_per_user || 100}
                      value={ticketsToSpend}
                      onChange={(e) => setTicketsToSpend(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <p className="text-sm text-text_secondary mt-1">
                      Cost: {ticketCost} tickets
                      {user && ` (You have: ${user.tickets_balance})`}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-highlight text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleJoinRaffle}
                    disabled={isJoining || !user}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {!user ? 'Log in to Join' : isJoining ? 'Joining...' : 'Join Raffle'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-text_secondary">This raffle is no longer active</p>
                </div>
              )}
            </div>
          </div>

          {draw && draw.winner_user_id && (
            <div className="mt-12 card bg-yellow-50 border-secondary">
              <h2 className="heading-2 mb-4">Winner Announced</h2>
              <p className="body-text mb-4">This raffle has been completed with a provably fair draw.</p>
              <a href={`/winners/${raffleId}`} className="text-primary hover:underline font-semibold">
                View winner and proof →
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
