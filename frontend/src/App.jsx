import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Portfolio from './components/Portfolio.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import MyPagePlaceholder from './components/MyPagePlaceholder.jsx';
import ContactModal from './components/ContactModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import FloatingContactBanner from './components/FloatingContactBanner.jsx';
import Footer from './components/Footer.jsx';
import AdminContacts from './components/AdminContacts.jsx';
import AdminPortfolioManager from './components/AdminPortfolioManager.jsx';

function HomePage() {
  return (
    <>
      <Hero />
      <Portfolio />
    </>
  );
}

function resolvePage(pathname) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPathname === '/portfolio') {
    return <PortfolioPage />;
  }

  if (normalizedPathname === '/mypage') {
    return <MyPagePlaceholder />;
  }

  return <HomePage />;
}

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isHomePage = pathname === '/';
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [heroRailProgress, setHeroRailProgress] = useState(isHomePage ? 0 : 1);

  useEffect(() => {
    if (!isHomePage) {
      setHeroRailProgress(1);
      return undefined;
    }

    let animationFrameId = 0;

    const updateHeroRailProgress = () => {
      const fadeDistance = Math.min(Math.max(window.innerHeight * 0.46, 320), 620);
      const nextProgress = Math.min(1, Math.max(0, window.scrollY / fadeDistance));
      setHeroRailProgress(nextProgress);
    };

    const onScroll = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateHeroRailProgress);
    };

    updateHeroRailProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHomePage]);

  if (pathname === '/admin') {
    return <AdminContacts />;
  }

  if (pathname === '/admin/portfolio') {
    return <AdminPortfolioManager />;
  }

  const openContactModal = () => {
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactModalOpen(false);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const appShellClassName = [
    'app-shell',
    isHomePage ? 'is-home-page' : '',
    heroRailProgress > 0.18 ? 'is-hero-rail-ready' : 'is-hero-rail-hidden',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={appShellClassName}
      style={{ '--hero-rail-progress': heroRailProgress }}
    >
      <Header onOpenContact={openContactModal} onOpenAuth={openAuthModal} />

      <main>
        {resolvePage(pathname)}
      </main>

      <FloatingContactBanner onOpenContact={openContactModal} />

      <ContactModal
        open={contactModalOpen}
        onClose={closeContactModal}
        onOpenAuth={openAuthModal}
      />

      <AuthModal
        open={authModalOpen}
        initialMode={authMode}
        onClose={closeAuthModal}
      />

      <Footer />
    </div>
  );
}

export default App;

