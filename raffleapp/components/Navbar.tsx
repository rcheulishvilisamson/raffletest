'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-title text-2xl font-bold text-primary">
            RaffleHub
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-light_bg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className={`${isOpen ? 'flex' : 'hidden'} md:flex gap-4 md:gap-6 absolute md:relative top-16 left-0 right-0 md:top-0 flex-col md:flex-row bg-white md:bg-transparent p-4 md:p-0 border-b md:border-0`}>
            <Link href="/raffles" className="text-text_secondary hover:text-primary font-medium transition-colors">
              Raffles
            </Link>
            <Link href="/auth/login" className="text-text_secondary hover:text-primary font-medium transition-colors">
              Login
            </Link>
            <Link href="/auth/register" className="btn-primary text-center">
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
