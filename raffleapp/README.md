# RaffleHub

A community-powered raffle platform with provably fair draws, ticket economy, and KYC-verified hosts.

## Features

- **Ticket Economy**: Buy ticket packs and spend tickets to enter raffles
- **Provably Fair Draws**: Public RNG with published proof (seed/hash/timestamp)
- **Auto-Refunds**: Incomplete raffles automatically refund all participant tickets
- **KYC Verification**: Only verified hosts can create raffles
- **Admin Controls**: Approve raffles, manage KYC, execute draws, handle disputes
- **Notifications**: Email and in-app notifications for key events
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API routes with Node.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT with httpOnly cookies
- **Payments**: Stripe (stub integration, ready for real implementation)
- **KYC**: Provider stub (ready for SumSub/Veriff integration)
- **RNG**: Mock implementation (ready for random.org/Chainlink VRF)

## Project Structure

```
raffleapp/
├── app/
│   ├── api/
│   │   └── auth/                 # Authentication endpoints
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── admin/                    # Admin panel
│   ├── dashboard/                # User dashboard
│   ├── raffles/                  # Raffle listing & details
│   ├── winners/                  # Winner & proof display
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── HowItWorks.tsx
│   ├── WhyJoin.tsx
│   ├── CTA.tsx
│   ├── RaffleCard.tsx
│   └── ...
├── lib/
│   ├── supabase.ts               # Supabase client & types
│   └── auth.ts                   # Auth utilities
├── scripts/
│   └── seed.ts                   # Database seeding
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository and install dependencies:

```bash
cd raffleapp
npm install
```

2. Set up environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your-secret-key-change-in-production
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The database schema is automatically created via Supabase migrations. All tables include:
- Proper foreign key constraints
- Row Level Security (RLS) policies
- Relevant indexes for performance

### Seeding Sample Data

To populate the database with sample raffles and test users:

```bash
npx ts-node scripts/seed.ts
```

Test credentials:
- **Admin**: admin@raffleapp.com / admin123456
- **Host**: host@raffleapp.com / user123456
- **Participant**: participant@raffleapp.com / user123456

## Database Schema

### Core Tables

- **users**: Platform users with roles and KYC status
- **ticket_transactions**: Track all ticket movements (purchase, spend, refund, adjustment)
- **raffles**: Main raffle listings with configuration
- **raffle_entries**: User participation records
- **draws**: RNG draws with provable fairness proof
- **kyc_checks**: KYC verification records
- **payouts**: Host payout tracking
- **refunds**: Refund records with reasons
- **audit_logs**: All sensitive actions for compliance
- **notifications**: User notifications (email/in-app)

All tables have Row Level Security enabled with appropriate policies.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Raffles

- `GET /api/raffles` - List active raffles (public)
- `GET /api/raffles/:id` - Get raffle details (public)
- `POST /api/raffles/:id/join` - Join a raffle (authenticated)
- `POST /api/host/raffles` - Create raffle (host only)

### Tickets

- `POST /api/tickets/purchase` - Purchase ticket packs (authenticated)

### Admin

- `GET /api/admin/raffles?status=pending_approval` - Pending approvals
- `POST /api/admin/raffles/:id/approve` - Approve raffle
- `POST /api/admin/raffles/:id/reject` - Reject raffle
- `POST /api/admin/raffles/:id/draw` - Execute RNG draw
- `POST /api/admin/refund` - Issue refunds
- `GET /api/admin/reports/*` - Export reports
- `GET /api/admin/audit` - View audit logs

## User Roles

### Participant (Default)

- Browse raffles
- Buy tickets
- Join raffles
- View results
- Receive refunds if raffle fails

### Host

- Create raffles after KYC approval
- Set ticket pricing and participant limits
- Track raffle performance
- Receive payouts after winner confirmation

### Admin

- Approve/reject raffle submissions
- Approve/reject KYC verifications
- Execute and publish draw results
- Manage refunds and disputes
- View audit logs and compliance reports

## Security Considerations

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens include expiration (7 days)
- All database tables have Row Level Security enabled
- Sensitive actions are logged for audit trails
- Input validation with Zod schemas
- CORS protection on API endpoints
- httpOnly cookies for token storage (when using SSR)

## Configuration

### Customizing Colors

Colors are defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: '#4CA6E8',      // Sky Blue
  secondary: '#FFD447',    // Gold
  highlight: '#FF6B6B',    // Coral
}
```

### Integrating Real Payment Provider

Replace the stub in ticket purchase flow with Stripe integration:

```typescript
// In app/api/tickets/purchase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const session = await stripe.checkout.sessions.create({...});
```

### Integrating Real KYC Provider

Replace the stub in KYC flow:

```typescript
// In app/host/kyc
const sumsub = new SumSubSDK(process.env.SUMSUB_API_KEY);
const verification = await sumsub.startVerification({...});
```

### Integrating Real RNG

Replace the mock in draw logic:

```typescript
// In app/api/admin/raffles/:id/draw
const randomOrgApi = fetch('https://api.random.org/json-rpc/2/invoke', {
  method: 'POST',
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'generateIntegers',
    params: {
      apiKey: process.env.RANDOM_ORG_API_KEY,
      n: 1,
      min: 0,
      max: totalParticipants - 1,
    },
  }),
});
```

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Roadmap

- Multi-winner raffles
- Social login (Google, Discord)
- Internationalization (i18n)
- Advanced analytics dashboard
- Real payment provider integration
- Real KYC provider integration
- Blockchain-based RNG (Chainlink VRF)
- Email templates customization
- User export/deletion (GDPR)
- Referral system
- Gamification (badges, leaderboards)

## Support

For issues or questions, please open an issue in the repository or contact support@raffleapp.com

## License

MIT
