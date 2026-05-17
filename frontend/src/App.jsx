import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import BDStudioShowroom from './components/BDStudioShowroom.jsx';
import Portfolio from './components/Portfolio.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import MyPagePlaceholder from './components/MyPagePlaceholder.jsx';
import ContactForm from './components/ContactForm.jsx';
import Footer from './components/Footer.jsx';
import AdminContacts from './components/AdminContacts.jsx';

function HomePage() {
  return (
    <>
      <Hero />
      <BDStudioShowroom />
      <Portfolio />
      <ContactForm />
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
  const pathname = window.location.pathname;

  if (pathname === '/admin') {
    return <AdminContacts />;
  }

  return (
    <div className="app-shell">
      <Header />

      <main>
        {resolvePage(pathname)}
      </main>

      <Footer />
    </div>
  );
}

export default App;
