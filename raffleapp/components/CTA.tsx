import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-500">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="heading-2 mb-6">Start Your Raffle Adventure Today</h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Join thousands of winners in our community. It takes just 2 minutes to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-light_bg transition-colors font-title">
            Sign Up Free
          </Link>
          <Link href="/raffles" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors font-title">
            Browse Raffles
          </Link>
        </div>
      </div>
    </section>
  );
}
