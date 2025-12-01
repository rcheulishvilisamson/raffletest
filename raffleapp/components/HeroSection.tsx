import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-white to-light_bg">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="heading-1 mb-6">
          Join Fair, Fun Raffles Every Day
        </h1>
        <p className="text-xl md:text-2xl text-text_secondary mb-8 max-w-2xl mx-auto">
          Win real prizes from trusted hosts in our community-powered raffle platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="btn-primary">
            Sign Up Free
          </Link>
          <Link href="/raffles" className="btn-outline">
            Join a Raffle
          </Link>
        </div>
      </div>
    </section>
  );
}
