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
            <p className="eyebrow">CONTACT</p>
            <h2 id="contact-modal-title">프로젝트 문의하기</h2>
            <p>
              제작 목적과 일정, 참고 자료를 남겨주시면 담당자가 확인 후 연락드립니다.
            </p>
          </div>
          <button className="lead-modal-close" type="button" onClick={onClose} aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        <ContactForm compact onOpenAuth={openAuth} />

        <div className="lead-modal-footer">
          <span>계정이 있으신가요?</span>
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
