import { useEffect, useState } from 'react';
import {
  Clapperboard,
  FolderOpen,
  Home,
  Layers3,
  LogIn,
  Menu,
  MessageCircle,
  Sparkles,
  UserCircle,
  UserPlus,
  X,
} from 'lucide-react';

const navItems = [
  { label: '홈', href: '/#hero', icon: Home },
  { label: 'BD기획', href: '/#hero', icon: Sparkles },
  { label: 'BDPRODUCTION', href: '/#insight', icon: Layers3 },
  { label: '대표작', href: '/#portfolio', icon: Clapperboard },
  { label: '전체 포트폴리오', href: '/portfolio', icon: FolderOpen },
];

const desktopNavItems = navItems.filter(
  (item) => !['홈', 'BD기획', 'BDPRODUCTION'].includes(item.label)
);

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
      <header className="cinematic-header" aria-label="BDPRODUCTION 상단 메뉴">
        <a className="cinematic-brand" href="/#hero" onClick={closeMenu} aria-label="홈으로 이동">
          <span>BD</span>
          <strong>BDPRODUCTION</strong>
        </a>

        <nav className="cinematic-desktop-nav" aria-label="주요 메뉴">
          {desktopNavItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="cinematic-header-actions">
          <button className="cinematic-contact-button" type="button" onClick={openContact}>
            제작 문의
          </button>
          <button className="cinematic-icon-button" type="button" onClick={openLogin} aria-label="로그인">
            <LogIn size={18} />
          </button>
          <button className="cinematic-icon-button" type="button" onClick={openRegister} aria-label="회원가입">
            <UserPlus size={18} />
          </button>
          <a className="cinematic-icon-button" href="/mypage" aria-label="마이페이지">
            <UserCircle size={18} />
          </a>
        </div>

        <button
          className="cinematic-menu-button"
          type="button"
          aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={opened}
          onClick={() => setOpened((value) => !value)}
        >
          {opened ? <X size={22} /> : <Menu size={22} />}
          <span>MENU</span>
        </button>
      </header>

      {opened && <button className="cinematic-drawer-scrim" type="button" aria-label="메뉴 닫기" onClick={closeMenu} />}

      <aside className={`cinematic-drawer ${opened ? 'is-open' : ''}`} aria-label="전체 메뉴">
        <div className="cinematic-drawer-head">
          <span>BDPRODUCTION</span>
          <button type="button" onClick={closeMenu} aria-label="메뉴 닫기">
            <X size={20} />
          </button>
        </div>

        <nav className="cinematic-drawer-nav" aria-label="전체 메뉴 목록">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                <Icon size={19} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="cinematic-drawer-actions">
          <button className="is-primary" type="button" onClick={openContact}>
            <MessageCircle size={19} />
            제작 문의
          </button>
          <button type="button" onClick={openLogin}>
            <LogIn size={19} />
            로그인
          </button>
          <button type="button" onClick={openRegister}>
            <UserPlus size={19} />
            회원가입
          </button>
          <a href="/mypage" onClick={closeMenu}>
            <UserCircle size={19} />
            마이페이지
          </a>
        </div>
      </aside>
    </>
  );
}

export default Header;
