import { apiUrl } from '../config/api.js';
import { CheckCircle2, Send, UserPlus } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  productionType: '광고 / CF',
  budget: '',
  message: '',
  website: '',
};

function ContactForm({ compact = false, onOpenAuth }) {
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
    } catch (error) {
      console.error('Contact API error:', error);
      setErrorMessage('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={`contact-form ${compact ? 'contact-form-compact' : ''}`} onSubmit={submitForm}>
      {submitted && (
        <div className="form-success">
          <CheckCircle2 size={20} />
          문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.
        </div>
      )}

      {submitted && receiptId && (
        <div className="form-receipt-card">
          <span>접수번호</span>
          <strong>#{receiptId}</strong>
          <p>
            상담 진행 시 이 번호로 접수 내용을 확인할 수 있습니다.
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
        />
      </label>

      <label>
        제작 유형
        <select name="productionType" value={form.productionType} onChange={updateField}>
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
        />
      </label>

      <button className="primary-button form-submit" type="submit" disabled={submitting}>
        {submitting ? '접수 중...' : '문의하기'}
        <Send size={18} />
      </button>

      {onOpenAuth && (
        <button
          className="contact-auth-inline"
          type="button"
          onClick={() => onOpenAuth('register')}
        >
          <UserPlus size={17} />
          회원가입하고 진행 현황 확인하기
        </button>
      )}
    </form>
  );
}

export default ContactForm;
