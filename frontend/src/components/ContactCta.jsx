import { motion } from 'framer-motion';
import { ArrowRight, ClipboardList, MessageCircle, PhoneCall, ShieldCheck, UserPlus } from 'lucide-react';

function ContactCta({ onOpenContact, onOpenAuth }) {
  return (
    <section id="contact" className="section contact-section contact-cta-section">
      <div className="contact-cta-panel">
        <motion.div
          className="contact-cta-copy"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.62 }}
        >
          <p className="eyebrow">CONTACT</p>
          <h2>브랜드의 다음 장면을 함께 설계합니다.</h2>
          <p>
            제작 유형과 목표를 남겨주시면 프로젝트 범위와 일정에 맞춰 상담을 이어갑니다.
          </p>

          <div className="contact-cta-actions">
            <button className="primary-button" type="button" onClick={onOpenContact}>
              문의하기
              <MessageCircle size={18} />
            </button>
            <button className="ghost-button" type="button" onClick={() => onOpenAuth?.('register')}>
              회원가입
              <UserPlus size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="contact-cta-cards"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.62, delay: 0.08 }}
        >
          <button className="contact-cta-card is-main" type="button" onClick={onOpenContact}>
            <div>
              <MessageCircle size={24} />
            </div>
            <span>CONTACT</span>
            <strong>프로젝트 문의</strong>
            <p>제작 목적과 일정, 참고 자료를 남겨주세요.</p>
            <em>
              문의하기
              <ArrowRight size={16} />
            </em>
          </button>

          <button className="contact-cta-card" type="button" onClick={() => onOpenAuth?.('register')}>
            <div>
              <ClipboardList size={24} />
            </div>
            <span>ACCOUNT</span>
            <strong>프로젝트 관리</strong>
            <p>진행 현황과 시사 링크, 결제 내역을 확인할 수 있습니다.</p>
            <em>
              가입하기
              <ArrowRight size={16} />
            </em>
          </button>

          <div className="contact-cta-card">
            <div>
              <PhoneCall size={24} />
            </div>
            <span>PHONE</span>
            <strong>1577-5157</strong>
            <p>빠른 상담은 전화로 문의해주세요.</p>
          </div>

          <div className="contact-cta-card">
            <div>
              <ShieldCheck size={24} />
            </div>
            <span>FLOW</span>
            <strong>CONTACT + 회원 전환</strong>
            <p>프로젝트 흐름을 단계별로 안내합니다.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactCta;
