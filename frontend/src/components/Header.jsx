import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'BD기획', href: '/#hero' },
  { label: 'BDPRODUCTION', href: '/#insight' },
  { label: '대표작', href: '/#portfolio' },
  { label: '전체 포트폴리오', href: '/portfolio' },
  { label: '마이페이지', href: '/mypage' },
  { label: 'CONTACT', href: '/#contact' },
];

function Header({ onOpenContact, onOpenAuth }) {
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

  const openContact = () => {
    closeMenu();
    onOpenContact?.();
  };

  const openRegister = () => {
    closeMenu();
    onOpenAuth?.('register');
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand" href="/#hero" onClick={closeMenu}>
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

      <div className="header-action-group">
        <button className="header-cta header-cta-secondary" type="button" onClick={openRegister}>
          회원가입
        </button>
        <button className="header-cta" type="button" onClick={openContact}>
          제작 문의
        </button>
      </div>

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
          <button className="mobile-nav-button" type="button" onClick={openRegister}>
            로그인 / 회원가입
          </button>
          <button className="mobile-nav-cta mobile-nav-button" type="button" onClick={openContact}>
            제작 문의하기
          </button>
        </nav>
      )}
    </header>
  );
}

export default Header;
