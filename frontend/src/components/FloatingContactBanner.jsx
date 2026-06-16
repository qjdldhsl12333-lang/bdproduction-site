import { MessageCircle } from 'lucide-react';
import BdButton from './ui/BdButton.jsx';

function FloatingContactBanner({ onOpenContact }) {
  return (
    <aside className="floating-contact-banner floating-contact-banner-single" aria-label="빠른 제작 문의">
      <BdButton
        variant="floating-contact"
        type="button"
        iconPosition="start"
        iconNode={<MessageCircle size={23} />}
        onClick={onOpenContact}
      >
        제작 문의
      </BdButton>
    </aside>
  );
}

export default FloatingContactBanner;
