import { useEffect, useState } from 'react';
import {
  Clapperboard,
  FolderOpen,
  Home,
  LogIn,
  Menu,
  MessageCircle,
  UserCircle,
  UserPlus,
  X,
} from 'lucide-react';
import BdButton from './ui/BdButton.jsx';

const navItems = [
  { label: '홈', href: '/#hero', icon: Home },
  { label: '대표작', href: '/#portfolio', icon: Clapperboard },
  { label: '전체 포트폴리오', href: '/portfolio', icon: FolderOpen },
];

const desktopNavItems = navItems.filter((item) => item.label !== '홈');

const brandSymbolSrc = '/favicon.png?v=20260612-brand-final';

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
          <span className="cinematic-brand-mark">
            <img src={brandSymbolSrc} alt="" aria-hidden="true" />
          </span>
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
          <BdButton variant="header-cta" size="sm" type="button" onClick={openContact}>
            제작 문의
          </BdButton>
          <BdButton
            variant="header-icon"
            size="sm"
            type="button"
            iconOnly
            iconNode={<LogIn size={18} />}
            onClick={openLogin}
            aria-label="로그인"
          >
            로그인
          </BdButton>
          <BdButton
            variant="header-icon"
            size="sm"
            type="button"
            iconOnly
            iconNode={<UserPlus size={18} />}
            onClick={openRegister}
            aria-label="회원가입"
          >
            회원가입
          </BdButton>
          <BdButton
            as="a"
            variant="header-icon"
            size="sm"
            iconOnly
            iconNode={<UserCircle size={18} />}
            href="/mypage"
            aria-label="마이페이지"
          >
            마이페이지
          </BdButton>
        </div>

        <BdButton
          variant="header-menu"
          size="sm"
          type="button"
          iconPosition="start"
          iconNode={opened ? <X size={22} /> : <Menu size={22} />}
          aria-label={opened ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={opened}
          onClick={() => setOpened((value) => !value)}
        >
          MENU
        </BdButton>
      </header>

      {opened && <button className="cinematic-drawer-scrim" type="button" aria-label="메뉴 닫기" onClick={closeMenu} />}

      <aside className={`cinematic-drawer ${opened ? 'is-open' : ''}`} aria-label="전체 메뉴">
        <div className="cinematic-drawer-head">
          <div className="cinematic-drawer-brand">
            <img src={brandSymbolSrc} alt="" aria-hidden="true" />
            <span>BDPRODUCTION</span>
          </div>
          <BdButton
            variant="modal-icon"
            type="button"
            iconOnly
            iconNode={<X size={20} />}
            onClick={closeMenu}
            aria-label="메뉴 닫기"
          >
            메뉴 닫기
          </BdButton>
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
          <BdButton
            variant="drawer-primary"
            type="button"
            iconPosition="start"
            iconNode={<MessageCircle size={19} />}
            onClick={openContact}
          >
            제작 문의
          </BdButton>
          <BdButton
            variant="drawer"
            type="button"
            iconPosition="start"
            iconNode={<LogIn size={19} />}
            onClick={openLogin}
          >
            로그인
          </BdButton>
          <BdButton
            variant="drawer"
            type="button"
            iconPosition="start"
            iconNode={<UserPlus size={19} />}
            onClick={openRegister}
          >
            회원가입
          </BdButton>
          <BdButton
            as="a"
            variant="drawer"
            iconPosition="start"
            iconNode={<UserCircle size={19} />}
            href="/mypage"
            onClick={closeMenu}
          >
            마이페이지
          </BdButton>
        </div>
      </aside>
    </>
  );
}

export default Header;
