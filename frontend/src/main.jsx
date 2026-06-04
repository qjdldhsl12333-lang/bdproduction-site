import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/footer.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/studio.css';
import './styles/contact.css';
import './styles/auth.css';
import './styles/portfolio.css';
import './styles/motion.css';
import './styles/admin-core.css';
import './styles/admin.css';
import './styles/mobile-qa.css';
import './styles/final-overrides.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
