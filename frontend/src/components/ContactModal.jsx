import { X } from 'lucide-react';
import ContactForm from './ContactForm.jsx';

function ContactModal({ open, onClose, onOpenAuth }) {
  if (!open) {
    return null;
  }

  const openAuth = (mode) => {
    onClose?.();
    onOpenAuth?.(mode);
  };

  return (
    <div className="lead-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="lead-modal contact-inquiry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="lead-modal-header">
          <div>
            <p className="eyebrow">CONTACT MODAL</p>
            <h2 id="contact-modal-title">프로젝트 문의하기</h2>
            <p>
              회원가입 없이도 문의를 남길 수 있습니다. 회원가입을 하면 추후 진행 현황과
              결제/영수 내역까지 연결할 수 있습니다.
            </p>
          </div>
          <button className="lead-modal-close" type="button" onClick={onClose} aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        <ContactForm compact onOpenAuth={openAuth} />

        <div className="lead-modal-footer">
          <span>이미 계정이 있나요?</span>
          <button type="button" onClick={() => openAuth('login')}>
            로그인하기
          </button>
          <button type="button" onClick={() => openAuth('register')}>
            회원가입하기
          </button>
        </div>
      </section>
    </div>
  );
}

export default ContactModal;
