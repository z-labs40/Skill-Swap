import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Navbar } from './sections/Navbar';
import { Footer } from './sections/Footer';
import { AuthDialog } from '../login/LoginCard';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Testimonials } from './sections/Testimonials';
import { getAuthState } from '../../lib/auth';
import { AdminToolbar } from '../admin/AdminToolbar';

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { role, isAuth } = getAuthState();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true); };
  const openSignup = () => { setAuthTab("signup"); setAuthOpen(true); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a1a' }}>
      <div className="flex-1 flex flex-col">
        {isAuth && role === 'admin' && <AdminToolbar />}
        <Navbar onLoginClick={openLogin} onSignupClick={openSignup} />
        <main className={`flex-1 flex flex-col gap-24 md:gap-32 pb-24 ${isAuth && role === 'admin' ? 'mt-14' : ''}`}>
          <Hero onGetStarted={openSignup} isAdmin={isAuth && role === 'admin'} />
          <Features />
          <HowItWorks />
          <Testimonials />
        </main>
        <Footer />
      </div>
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
      
      {/* Scroll to Top Button */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 border border-white/10"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      </div>
    </div>
  );
}
