import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'BD기획', href: '#hero' },
  { label: 'BDPRODUCTION', href: '#insight' },
  { label: 'PORTFOLIO', href: '#portfolio' },
  { label: 'CONTACT', href: '#contact' },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const closeMenu = () => {
    setOpened(false);
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand" href="#hero" onClick={closeMenu}>
        <span className="brand-mark">BD</span>
        <span className="brand-text">BDPRODUCTION</span>
      </a>

      <nav className="desktop-nav" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="header-cta" href="#contact">
        제작 문의
      </a>

      <button
        className="mobile-menu-button"
        type="button"
        aria-label="메뉴 열기"
        onClick={() => setOpened((value) => !value)}
      >
        {opened ? <X size={22} /> : <Menu size={22} />}
      </button>

      {opened && (
        <nav className="mobile-nav" aria-label="모바일 메뉴">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a className="mobile-nav-cta" href="#contact" onClick={closeMenu}>
            제작 문의하기
          </a>
        </nav>
      )}
    </header>
  );
}

export default Header;