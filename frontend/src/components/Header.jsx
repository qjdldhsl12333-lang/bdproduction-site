import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Clapperboard,
  FolderOpen,
  Home,
  Layers3,
  LogIn,
  Mail,
  Menu,
  MessageCircle,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';

const navItems = [
  { label: '홈', href: '/#hero', icon: Home },
  { label: 'BD기획', href: '/#hero', icon: Sparkles },
  { label: 'BDPRODUCTION', href: '/#insight', icon: Layers3 },
  { label: '대표작', href: '/#portfolio', icon: Clapperboard },
  { label: '전체 포트폴리오', href: '/portfolio', icon: FolderOpen },
  { label: '마이페이지', href: '/mypage', icon: LogIn },
  { label: 'CONTACT', href: '/#contact', icon: Mail },
];

function Header({ onOpenContact, onOpenAuth }) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpened(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const closeMenu = () => {
    setOpened(false);
  };

  const openContact = () => {
    closeMenu();
    onOpenContact?.();
  };

  const openLogin = () => {
    closeMenu();
    onOpenAuth?.('login');
  };

  const openRegister = () => {
    closeMenu();
    onOpenAuth?.('register');
  };

  return (
    <>
      <button
        className="side-nav-mobile-toggle"
        type="button"
        aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
        onClick={() => setOpened((value) => !value)}
      >
        {opened ? <X size={22} /> : <Menu size={22} />}
      </button>

      {opened && <button className="side-nav-scrim" type="button" aria-label="메뉴 닫기" onClick={closeMenu} />}

      <aside className={`side-nav-shell ${opened ? 'is-open' : ''}`} aria-label="사이트 메뉴">
        <nav className="side-nav-panel">
          <a className="side-nav-brand" href="/#hero" onClick={closeMenu} aria-label="홈으로 이동">
            <span className="side-nav-brand-mark">BD</span>
            <span className="side-nav-brand-text">
              <strong>BDPRODUCTION</strong>
              <em>Creative Platform</em>
            </span>
            <ChevronLeft className="side-nav-expand-icon" size={18} />
          </a>

          <div className="side-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a key={item.href} className="side-nav-link" href={item.href} onClick={closeMenu}>
                  <span className="side-nav-icon">
                    <Icon size={19} />
                  </span>
                  <span className="side-nav-label">{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="side-nav-actions">
            <button className="side-nav-action" type="button" onClick={openLogin}>
              <span className="side-nav-icon">
                <LogIn size={19} />
              </span>
              <span className="side-nav-label">로그인</span>
            </button>

            <button className="side-nav-action" type="button" onClick={openRegister}>
              <span className="side-nav-icon">
                <UserPlus size={19} />
              </span>
              <span className="side-nav-label">회원가입</span>
            </button>

            <button className="side-nav-action is-primary" type="button" onClick={openContact}>
              <span className="side-nav-icon">
                <MessageCircle size={19} />
              </span>
              <span className="side-nav-label">제작 문의</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Header;
