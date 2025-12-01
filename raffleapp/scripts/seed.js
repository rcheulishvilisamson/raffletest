const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Starting seed...');

  try {
    const adminPasswordHash = await bcrypt.hash('admin123456', 10);
    const userPasswordHash = await bcrypt.hash('user123456', 10);

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        email: 'admin@raffleapp.com',
        password_hash: adminPasswordHash,
        name: 'Admin User',
        role: 'admin',
        kyc_status: 'verified',
        tickets_balance: 1000000,
      })
      .select()
      .single();

    if (adminError) throw adminError;
    console.log('✓ Created admin user:', adminUser.id);

    const { data: hostUser, error: hostError } = await supabase
      .from('users')
      .insert({
        email: 'host@raffleapp.com',
        password_hash: userPasswordHash,
        name: 'Sarah Host',
        role: 'host',
        kyc_status: 'verified',
        tickets_balance: 50000,
      })
      .select()
      .single();

    if (hostError) throw hostError;
    console.log('✓ Created host user:', hostUser.id);

    const { data: participantUser, error: participantError } = await supabase
      .from('users')
      .insert({
        email: 'participant@raffleapp.com',
        password_hash: userPasswordHash,
        name: 'John Participant',
        role: 'participant',
        kyc_status: 'none',
        tickets_balance: 100,
      })
      .select()
      .single();

    if (participantError) throw participantError;
    console.log('✓ Created participant user:', participantUser.id);

    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);

    const raffles = [
      {
        host_id: hostUser.id,
        title: 'iPhone 15 Pro Max Raffle',
        description: 'Win the latest iPhone 15 Pro Max! One lucky winner will receive a brand new iPhone 15 Pro Max 256GB in Space Black.',
        category: 'Electronics',
        ticket_price: 10,
        min_participants: 50,
        max_participants: 500,
        min_tickets_per_user: 1,
        max_tickets_per_user: 50,
        start_at: startTime.toISOString(),
        end_at: endTime.toISOString(),
        status: 'active',
        images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
      {
        host_id: hostUser.id,
        title: 'MacBook Air M3 Giveaway',
        description: 'A chance to win a stunning MacBook Air with M3 chip. Perfect for creators, developers, and professionals.',
        category: 'Electronics',
        ticket_price: 25,
        min_participants: 100,
        max_participants: 300,
        min_tickets_per_user: 2,
        max_tickets_per_user: 100,
        start_at: startTime.toISOString(),
        end_at: new Date(endTime.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'],
      },
      {
        host_id: hostUser.id,
        title: 'Gaming PC Battle Station Raffle',
        description: 'Win a high-performance gaming PC complete with RTX 4090, Intel i9, 32GB RAM, and RGB everything!',
        category: 'Gaming',
        ticket_price: 15,
        min_participants: 75,
        max_participants: 400,
        min_tickets_per_user: 1,
        max_tickets_per_user: 75,
        start_at: startTime.toISOString(),
        end_at: new Date(endTime.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        images: ['https://images.pexels.com/photos/3532555/pexels-photo-3532555.jpeg?auto=compress&cs=tinysrgb&w=400'],
      },
    ];

    for (const raffle of raffles) {
      const { data: newRaffle, error: raffleError } = await supabase
        .from('raffles')
        .insert(raffle)
        .select()
        .single();

      if (raffleError) throw raffleError;
      console.log('✓ Created raffle:', newRaffle.title);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n🔑 Test credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:       admin@raffleapp.com / admin123456');
    console.log('Host:        host@raffleapp.com / user123456');
    console.log('Participant: participant@raffleapp.com / user123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 Visit http://localhost:3000 to see your raffles!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    if (error.code === '23505') {
      console.log('\n💡 Tip: Users already exist. Clear database first or use different emails.');
    }
    process.exit(1);
  }
}

seed();
