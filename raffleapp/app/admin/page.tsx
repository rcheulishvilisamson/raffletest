'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalRaffles: number;
  pendingRaffles: number;
  pendingKyc: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'raffles' | 'kyc'>('overview');

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/auth/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(parsedUser);

      try {
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        const { count: rafflesCount } = await supabase
          .from('raffles')
          .select('*', { count: 'exact', head: true });

        const { count: pendingRafflesCount } = await supabase
          .from('raffles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending_approval');

        const { count: pendingKycCount } = await supabase
          .from('kyc_checks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalUsers: usersCount || 0,
          totalRaffles: rafflesCount || 0,
          pendingRaffles: pendingRafflesCount || 0,
          pendingKyc: pendingKycCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-text_secondary">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light_bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="heading-1 mb-8">Admin Panel</h1>

          {loading ? (
            <p className="text-text_secondary">Loading statistics...</p>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="card">
                <p className="text-text_secondary text-sm mb-2">Total Users</p>
                <p className="heading-2 text-primary">{stats.totalUsers}</p>
              </div>
              <div className="card">
                <p className="text-text_secondary text-sm mb-2">Total Raffles</p>
                <p className="heading-2 text-primary">{stats.totalRaffles}</p>
              </div>
              <div className="card">
                <p className="text-text_secondary text-sm mb-2">Pending Raffles</p>
                <p className="heading-2 text-highlight">{stats.pendingRaffles}</p>
              </div>
              <div className="card">
                <p className="text-text_secondary text-sm mb-2">Pending KYC</p>
                <p className="heading-2 text-highlight">{stats.pendingKyc}</p>
              </div>
            </div>
          ) : null}

          <div className="card">
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setTab('overview')}
                className={`pb-3 px-2 font-semibold transition-colors ${
                  tab === 'overview'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text_secondary hover:text-text_primary'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setTab('raffles')}
                className={`pb-3 px-2 font-semibold transition-colors ${
                  tab === 'raffles'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text_secondary hover:text-text_primary'
                }`}
              >
                Raffles
              </button>
              <button
                onClick={() => setTab('kyc')}
                className={`pb-3 px-2 font-semibold transition-colors ${
                  tab === 'kyc'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text_secondary hover:text-text_primary'
                }`}
              >
                KYC
              </button>
            </div>

            {tab === 'overview' && (
              <div>
                <p className="body-text">Welcome to the RaffleHub Admin Panel. Use the tabs to manage raffles, KYC approvals, and user data.</p>
                <ul className="mt-4 space-y-2 text-text_secondary">
                  <li>• Approve or reject raffle listings</li>
                  <li>• Manage KYC verification for hosts</li>
                  <li>• Execute and publish draw results</li>
                  <li>• Handle refunds and disputes</li>
                  <li>• View audit logs for compliance</li>
                </ul>
              </div>
            )}

            {tab === 'raffles' && (
              <div>
                <p className="text-text_secondary">Raffle management features coming soon...</p>
              </div>
            )}

            {tab === 'kyc' && (
              <div>
                <p className="text-text_secondary">KYC management features coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
