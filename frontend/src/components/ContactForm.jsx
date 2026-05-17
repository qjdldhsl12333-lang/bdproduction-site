import { apiUrl } from '../config/api.js';
import { motion } from 'framer-motion';
import { CheckCircle2, PhoneCall, Send } from 'lucide-react';
import { useRef, useState } from 'react';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  productionType: '광고 / CF',
  budget: '',
  message: '',
  website: '',
};

function ContactForm() {
  const contactSectionRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptId, setReceiptId] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (submitted) {
      setSubmitted(false);
      setReceiptId(null);
    }

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const submitForm = async (event) => {
    event.preventDefault();

    setSubmitted(false);
    setSubmitting(true);
    setErrorMessage('');
    setReceiptId(null);

    try {
      const response = await fetch(apiUrl('/api/contact.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || '문의 접수 중 오류가 발생했습니다.');
        return;
      }

      setSubmitted(true);
      setReceiptId(result.contactId || null);
      setForm(initialForm);

      setTimeout(() => {
        contactSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    } catch (error) {
      console.error('Contact API error:', error);
      setErrorMessage('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section contact-section" ref={contactSectionRef}>
      <div className="contact-panel">
        <motion.div
          className="contact-copy"
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
        >
          <p className="eyebrow">CONTACT</p>
          <h2>영상 제작 상담을 시작하세요</h2>
          <p>
            제작 유형, 예산 범위, 납기, 참고 자료를 남겨주시면 담당자가 확인 후
            상담을 진행합니다.
          </p>

          <div className="contact-phone-card">
            <PhoneCall size={24} />
            <div>
              <span>상담 전화</span>
              <strong>1577-5157</strong>
            </div>
          </div>

          <div className="contact-note">
            현재 문의 폼은 PHP API와 MariaDB 저장까지 연결되어 있습니다.
            SMTP 정보가 준비되면 문의 접수 시 관리자 이메일 알림도 활성화할 수 있습니다.
          </div>
        </motion.div>

        <motion.form
          className="contact-form"
          onSubmit={submitForm}
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
        >
          {submitted && (
            <div className="form-success">
              <CheckCircle2 size={20} />
              문의가 정상적으로 접수되었습니다. 담당자가 확인 후 연락드릴 예정입니다.
            </div>
          )}

          {submitted && receiptId && (
            <div className="form-receipt-card">
              <span>접수번호</span>
              <strong>#{receiptId}</strong>
              <p>
                문의가 정상적으로 저장되었습니다. 상담 진행 시 이 번호를 기준으로 확인할 수 있습니다.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="form-error">
              {errorMessage}
            </div>
          )}

          <input
            className="contact-hp-field"
            type="text"
            name="website"
            value={form.website}
            onChange={updateField}
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />

          <label>
            이름 / 회사명
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="예: 홍길동 / ABC COMPANY"
              required
              disabled={submitting}
            />
          </label>

          <label>
            연락처
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="예: 010-0000-0000"
              required
              disabled={submitting}
            />
          </label>

          <label>
            이메일
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="예: contact@example.com"
              disabled={submitting}
            />
          </label>

          <label>
            제작 유형
            <select
              name="productionType"
              value={form.productionType}
              onChange={updateField}
              disabled={submitting}
            >
              <option>광고 / CF</option>
              <option>뮤직비디오</option>
              <option>기업 홍보 영상</option>
              <option>이벤트 / 행사 영상</option>
              <option>방송 / 버추얼 스튜디오</option>
              <option>게임 / 브랜드 영상</option>
            </select>
          </label>

          <label>
            예산 범위
            <input
              type="text"
              name="budget"
              value={form.budget}
              onChange={updateField}
              placeholder="예: 500만 원 ~ 1,000만 원"
              disabled={submitting}
            />
          </label>

          <label>
            문의 내용
            <textarea
              name="message"
              value={form.message}
              onChange={updateField}
              placeholder="제작 목적, 납기, 참고 영상, 필요한 결과물을 적어주세요."
              rows="5"
              required
              disabled={submitting}
            />
          </label>

          <button className="primary-button form-submit" type="submit" disabled={submitting}>
            {submitting ? '접수 중...' : '문의 접수하기'}
            <Send size={18} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}

export default ContactForm;