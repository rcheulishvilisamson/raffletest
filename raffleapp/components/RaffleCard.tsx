import Link from 'next/link';
import { Raffle } from '@/lib/supabase';

interface RaffleCardProps {
  raffle: Raffle;
  ticketsSold?: number;
}

export default function RaffleCard({ raffle, ticketsSold = 0 }: RaffleCardProps) {
  const endTime = new Date(raffle.end_at);
  const now = new Date();
  const timeLeft = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
  const hoursLeft = Math.floor(timeLeft / 3600);
  const minutesLeft = Math.floor((timeLeft % 3600) / 60);

  return (
    <Link href={`/raffles/${raffle.id}`}>
      <div className="card cursor-pointer h-full flex flex-col">
        {raffle.images && raffle.images.length > 0 && (
          <div className="w-full h-48 bg-light_bg rounded-lg mb-4 overflow-hidden">
            <img
              src={raffle.images[0]}
              alt={raffle.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
        )}
        <h3 className="heading-3 mb-2 line-clamp-2">{raffle.title}</h3>
        <p className="body-text mb-4 flex-grow line-clamp-2">{raffle.description}</p>

        <div className="space-y-3 mt-auto">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-text_secondary">Progress</span>
              <span className="text-sm font-bold text-primary">{ticketsSold} / {raffle.ticket_price * (raffle.max_participants || 10)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (ticketsSold / (raffle.ticket_price * (raffle.max_participants || 10))) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-highlight font-semibold">
              {hoursLeft}h {minutesLeft}m left
            </span>
            {raffle.ticket_price && (
              <span className="text-primary font-semibold">
                {raffle.ticket_price} tickets
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
