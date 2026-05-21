import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  ClipboardCheck,
  MessageCircle,
  Send,
  Sparkles,
  UserPlus,
} from 'lucide-react';

const flowItems = [
  {
    label: 'BRIEF',
    title: '문의',
    text: '목표와 일정 확인',
    icon: MessageCircle,
    action: 'contact',
    primary: true,
  },
  {
    label: 'PLAN',
    title: '기획',
    text: '톤앤매너 설계',
    icon: ClipboardCheck,
  },
  {
    label: 'SHOOT',
    title: '제작',
    text: '촬영과 편집 진행',
    icon: Camera,
  },
  {
    label: 'DELIVER',
    title: '납품',
    text: '최종 결과물 전달',
    icon: Send,
  },
];

function ContactCta({ onOpenContact, onOpenAuth }) {
  return (
    <section id="contact" className="section contact-section contact-cta-section">
      <div className="contact-cta-panel contact-cta-panel-dynamic">
        <motion.div
          className="contact-cta-copy contact-cta-copy-dynamic"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">CONTACT</p>
          <h2>다음 장면을 시작합니다.</h2>
          <p>
            제작 목표만 남겨주세요. 기획부터 납품까지 필요한 흐름으로 정리해드립니다.
          </p>

          <div className="contact-cta-actions">
            <button className="primary-button" type="button" onClick={onOpenContact}>
              프로젝트 문의
              <MessageCircle size={18} />
            </button>
            <button className="ghost-button" type="button" onClick={() => onOpenAuth?.('register')}>
              회원가입
              <UserPlus size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="contact-cta-flow"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {flowItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <>
                <div className="contact-cta-flow-icon">
                  <Icon size={22} />
                </div>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                {item.action === 'contact' && (
                  <em>
                    열기
                    <ArrowRight size={16} />
                  </em>
                )}
              </>
            );

            if (item.action === 'contact') {
              return (
                <motion.button
                  key={item.label}
                  type="button"
                  className={'contact-cta-flow-card ' + (item.primary ? 'is-main' : '')}
                  onClick={onOpenContact}
                  whileHover={{ y: -12, scale: 1.035 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                >
                  {content}
                </motion.button>
              );
            }

            return (
              <motion.article
                key={item.label}
                className="contact-cta-flow-card"
                whileHover={{ y: -12, scale: 1.035 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              >
                {content}
              </motion.article>
            );
          })}
        </motion.div>

        <div className="contact-cta-orbit" aria-hidden="true">
          <Sparkles size={18} />
        </div>
      </div>
    </section>
  );
}

export default ContactCta;
