import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import WhyJoin from '@/components/WhyJoin';
import CTA from '@/components/CTA';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <WhyJoin />
      <CTA />
      <Footer />
    </>
  );
}
