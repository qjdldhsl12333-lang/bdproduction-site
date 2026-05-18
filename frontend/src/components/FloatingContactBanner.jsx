import { Headphones, LogIn, MessageCircle, UserCircle } from 'lucide-react';

function FloatingContactBanner({ onOpenContact, onOpenAuth }) {
  return (
    <aside className="floating-contact-banner" aria-label="빠른 상담 메뉴">
      <button className="floating-contact-button is-primary" type="button" onClick={onOpenContact}>
        <MessageCircle size={23} />
        <span>문의상담</span>
      </button>

      <button className="floating-contact-button" type="button" onClick={() => onOpenAuth?.('login')}>
        <LogIn size={23} />
        <span>로그인</span>
      </button>

      <button className="floating-contact-button" type="button" onClick={() => onOpenAuth?.('register')}>
        <UserCircle size={23} />
        <span>회원가입</span>
      </button>

      <a className="floating-contact-button" href="/mypage">
        <Headphones size={23} />
        <span>마이페이지</span>
      </a>
    </aside>
  );
}

export default FloatingContactBanner;
