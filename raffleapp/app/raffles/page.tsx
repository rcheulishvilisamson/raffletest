'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RaffleCard from '@/components/RaffleCard';
import { supabase, Raffle } from '@/lib/supabase';

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        let query = supabase
          .from('raffles')
          .select('*')
          .in('status', ['active', 'completed'])
          .order('end_at', { ascending: true });

        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRaffles(data || []);
      } catch (error) {
        console.error('Failed to fetch raffles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, [selectedCategory]);

  const categories = ['All', 'Electronics', 'Gaming', 'Travel', 'Lifestyle'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light_bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="heading-1 mb-8">Active Raffles</h1>

          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  (category === 'All' && selectedCategory === null) || selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-text_primary border border-gray-200 hover:border-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-text_secondary">Loading raffles...</p>
            </div>
          ) : raffles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text_secondary text-lg">No raffles available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
