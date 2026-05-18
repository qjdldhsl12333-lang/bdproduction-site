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
          <h2>프로젝트 상담은 간단하게 시작하고, 진행 관리는 회원 전용으로 확장합니다.</h2>
          <p>
            문의는 회원가입 없이도 남길 수 있습니다. 정식 프로젝트로 전환되면 회원가입 후
            진행 현황, 시사 링크, 결제 상태, 영수 내역까지 한 곳에서 관리할 수 있도록 확장합니다.
          </p>

          <div className="contact-cta-actions">
            <button className="primary-button" type="button" onClick={onOpenContact}>
              문의 폼 열기
              <MessageCircle size={18} />
            </button>
            <button className="ghost-button" type="button" onClick={() => onOpenAuth?.('register')}>
              로그인 / 회원가입
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
            <span>비회원 문의</span>
            <strong>프로젝트 상담 요청</strong>
            <p>제작 유형, 예산, 납기, 참고 자료를 남기면 담당자가 확인합니다.</p>
            <em>
              문의하기
              <ArrowRight size={16} />
            </em>
          </button>

          <button className="contact-cta-card" type="button" onClick={() => onOpenAuth?.('register')}>
            <div>
              <ClipboardList size={24} />
            </div>
            <span>회원 전용</span>
            <strong>진행 현황 관리</strong>
            <p>향후 내 의뢰 목록, 시사 링크, 결제 상태, 영수 내역을 제공합니다.</p>
            <em>
              가입하기
              <ArrowRight size={16} />
            </em>
          </button>

          <div className="contact-cta-card">
            <div>
              <PhoneCall size={24} />
            </div>
            <span>고객센터</span>
            <strong>1577-5157</strong>
            <p>급한 상담은 전화 문의로 먼저 접수할 수 있습니다.</p>
          </div>

          <div className="contact-cta-card">
            <div>
              <ShieldCheck size={24} />
            </div>
            <span>운영 방식</span>
            <strong>비회원 문의 + 회원 전환</strong>
            <p>문의 진입 장벽은 낮추고, 프로젝트 관리는 회원 기능으로 연결합니다.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactCta;
