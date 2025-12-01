import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-light_bg border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-title font-bold text-text_primary mb-4">RaffleHub</h4>
            <p className="body-text">Fair raffles powered by the community.</p>
          </div>
          <div>
            <h5 className="font-semibold text-text_primary mb-4">Company</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-text_secondary hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="text-text_secondary hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-text_primary mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-text_secondary hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-text_secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-text_primary mb-4">Social</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-text_secondary hover:text-primary transition-colors">Twitter</Link></li>
              <li><Link href="#" className="text-text_secondary hover:text-primary transition-colors">Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-8 text-center">
          <p className="text-text_secondary text-sm">&copy; 2024 RaffleHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
