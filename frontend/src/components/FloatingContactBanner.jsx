import { MessageCircle } from 'lucide-react';

function FloatingContactBanner({ onOpenContact }) {
  return (
    <aside className="floating-contact-banner floating-contact-banner-single" aria-label="빠른 제작 문의">
      <button className="floating-contact-button is-primary" type="button" onClick={onOpenContact}>
        <MessageCircle size={23} />
        <span>제작 문의</span>
      </button>
    </aside>
  );
}

export default FloatingContactBanner;
