'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

interface WinnerData {
  raffleTitle: string;
  winnerName: string;
  winnerEmail: string;
  method: string;
  proofSeed: string | null;
  proofHash: string | null;
  drawnAt: string;
}

export default function WinnersPage() {
  const params = useParams();
  const raffleId = params.raffleId as string;
  const [winner, setWinner] = useState<WinnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWinnerData = async () => {
      try {
        const { data: drawData, error: drawError } = await supabase
          .from('draws')
          .select('*')
          .eq('raffle_id', raffleId)
          .order('drawn_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (drawError) throw drawError;
        if (!drawData || !drawData.winner_user_id) {
          setError('No winner found for this raffle');
          setLoading(false);
          return;
        }

        const { data: raffleData } = await supabase
          .from('raffles')
          .select('title')
          .eq('id', raffleId)
          .single();

        const { data: userData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', drawData.winner_user_id)
          .single();

        setWinner({
          raffleTitle: raffleData?.title || 'Unknown',
          winnerName: userData?.name || 'Anonymous',
          winnerEmail: userData?.email || '',
          method: drawData.method,
          proofSeed: drawData.proof_seed,
          proofHash: drawData.proof_hash,
          drawnAt: drawData.drawn_at,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (raffleId) {
      fetchWinnerData();
    }
  }, [raffleId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-text_secondary">Loading winner information...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !winner) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-highlight">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light_bg py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-gradient-to-br from-secondary to-yellow-300 text-text_primary mb-8">
            <h1 className="heading-1 mb-2">🎉 We Have a Winner!</h1>
            <p className="text-lg">{winner.raffleTitle}</p>
          </div>

          <div className="card mb-8">
            <h2 className="heading-2 mb-4">Winner Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text_secondary mb-1">Winner</p>
                <p className="heading-3">{winner.winnerName}</p>
              </div>
              <div>
                <p className="text-sm text-text_secondary mb-1">Email</p>
                <p className="font-semibold text-text_primary">{winner.winnerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-text_secondary mb-1">Drawn At</p>
                <p className="font-semibold text-text_primary">{new Date(winner.drawnAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card border-2 border-primary">
            <h2 className="heading-2 mb-4">Provably Fair Proof</h2>
            <p className="body-text mb-4">This draw was completed using a provably fair method, ensuring transparency and fairness.</p>

            <div className="space-y-4 bg-light_bg p-6 rounded-lg font-mono text-sm">
              <div>
                <p className="text-text_secondary text-xs mb-1">Method</p>
                <p className="text-text_primary break-all">{winner.method}</p>
              </div>
              {winner.proofSeed && (
                <div>
                  <p className="text-text_secondary text-xs mb-1">Seed</p>
                  <p className="text-text_primary break-all">{winner.proofSeed}</p>
                </div>
              )}
              {winner.proofHash && (
                <div>
                  <p className="text-text_secondary text-xs mb-1">Hash</p>
                  <p className="text-text_primary break-all">{winner.proofHash}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
