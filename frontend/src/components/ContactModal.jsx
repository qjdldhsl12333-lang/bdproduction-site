import BdButton from './ui/BdButton.jsx';
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
          <BdButton
            variant="modal-icon"
            type="button"
            icon="close"
            iconOnly
            onClick={onClose}
            aria-label="닫기"
          >
            닫기
          </BdButton>
        </div>

        <ContactForm compact onOpenAuth={openAuth} />

        <div className="lead-modal-footer">
          <span>계정이 있으신가요?</span>
          <BdButton variant="modal-footer" size="sm" type="button" onClick={() => openAuth('login')}>
            로그인하기
          </BdButton>
          <BdButton variant="modal-footer" size="sm" type="button" onClick={() => openAuth('register')}>
            회원가입하기
          </BdButton>
        </div>
      </section>
    </div>
  );
}

export default ContactModal;
