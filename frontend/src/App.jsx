import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import BDStudioShowroom from './components/BDStudioShowroom.jsx';
import Portfolio from './components/Portfolio.jsx';
import ContactForm from './components/ContactForm.jsx';
import Footer from './components/Footer.jsx';
import AdminContacts from './components/AdminContacts.jsx';

function App() {
  const isAdminPage = window.location.pathname === '/admin';

  if (isAdminPage) {
    return <AdminContacts />;
  }

  return (
    <div className="app-shell">
      <Header />

      <main>
        <Hero />
        <BDStudioShowroom />
        <Portfolio />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}

export default App;