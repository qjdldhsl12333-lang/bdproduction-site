import { useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import BDStudioShowroom from './components/BDStudioShowroom.jsx';
import Portfolio from './components/Portfolio.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import MyPagePlaceholder from './components/MyPagePlaceholder.jsx';
import ContactCta from './components/ContactCta.jsx';
import ContactModal from './components/ContactModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import FloatingContactBanner from './components/FloatingContactBanner.jsx';
import Footer from './components/Footer.jsx';
import AdminContacts from './components/AdminContacts.jsx';
import AdminPortfolioManager from './components/AdminPortfolioManager.jsx';

function HomePage({ onOpenContact, onOpenAuth }) {
  return (
    <>
      <Hero />
      <BDStudioShowroom />
      <Portfolio />
      <ContactCta onOpenContact={onOpenContact} onOpenAuth={onOpenAuth} />
    </>
  );
}

function resolvePage(pathname, modalActions) {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPathname === '/portfolio') {
    return <PortfolioPage />;
  }

  if (normalizedPathname === '/mypage') {
    return <MyPagePlaceholder />;
  }

  return <HomePage {...modalActions} />;
}

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

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

  const modalActions = {
    onOpenContact: openContactModal,
    onOpenAuth: openAuthModal,
  };

  return (
    <div className="app-shell">
      <Header onOpenContact={openContactModal} onOpenAuth={openAuthModal} />

      <main>
        {resolvePage(pathname, modalActions)}
      </main>

      <FloatingContactBanner
        onOpenContact={openContactModal}
        onOpenAuth={openAuthModal}
      />

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
