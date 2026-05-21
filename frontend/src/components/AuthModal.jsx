import { apiUrl } from '../config/api.js';
import { CheckCircle2, LogIn, ShieldCheck, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const initialRegisterForm = {
  name: '',
  company: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreed: false,
};

const initialLoginForm = {
  email: '',
  password: '',
};

const socialProviders = [
  { key: 'kakao', label: '카카오', className: 'kakao' },
  { key: 'naver', label: '네이버', className: 'naver' },
  { key: 'google', label: '구글', className: 'google' },
];

function AuthModal({ open, initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setMessage({ type: '', text: '' });
    }
  }, [open, initialMode]);

  const title = useMemo(() => (mode === 'register' ? '회원가입' : '로그인'), [mode]);

  if (!open) {
    return null;
  }

  const updateRegisterField = (event) => {
    const { name, value, checked, type } = event.target;
    setRegisterForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const updateLoginField = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(apiUrl('/api/auth/register.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerForm),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage({ type: 'error', text: result.message || '회원가입 중 오류가 발생했습니다.' });
        return;
      }

      if (result.user) {
        localStorage.setItem('bd_customer_user', JSON.stringify(result.user));
      }

      setRegisterForm(initialRegisterForm);
      setMode('login');
      setMessage({
        type: 'success',
        text: '회원가입이 완료되었습니다. 입력한 이메일로 로그인해주세요.',
      });
    } catch (error) {
      console.error('Register API error:', error);
      setMessage({ type: 'error', text: '회원가입 API와 연결할 수 없습니다. PHP 백엔드 서버를 확인해주세요.' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitLogin = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(apiUrl('/api/auth/login.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage({ type: 'error', text: result.message || '로그인 중 오류가 발생했습니다.' });
        return;
      }

      if (result.user) {
        localStorage.setItem('bd_customer_user', JSON.stringify(result.user));
      }

      setLoginForm(initialLoginForm);
      setMessage({ type: 'success', text: '로그인되었습니다.' });
    } catch (error) {
      console.error('Login API error:', error);
      setMessage({ type: 'error', text: '로그인 API와 연결할 수 없습니다. PHP 백엔드 서버를 확인해주세요.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialClick = (provider) => {
    setMessage({
      type: 'info',
      text: `${provider.label} 로그인은 준비 중입니다. 현재는 BD 계정으로 이용해주세요.`,
    });
  };

  return (
    <div className="lead-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="lead-modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="lead-modal-header">
          <div>
            <p className="eyebrow">CUSTOMER ACCOUNT</p>
            <h2 id="auth-modal-title">{title}</h2>
            <p>
              프로젝트 진행 현황과 시사 링크, 결제 내역을 한 곳에서 확인할 수 있습니다.
            </p>
          </div>
          <button className="lead-modal-close" type="button" onClick={onClose} aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => {
              setMode('login');
              setMessage({ type: '', text: '' });
            }}
          >
            <LogIn size={17} />
            로그인
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => {
              setMode('register');
              setMessage({ type: '', text: '' });
            }}
          >
            <UserPlus size={17} />
            회원가입
          </button>
        </div>

        {message.text && (
          <div className={`auth-message ${message.type ? `is-${message.type}` : ''}`}>
            {message.type === 'success' && <CheckCircle2 size={18} />}
            {message.type !== 'success' && <ShieldCheck size={18} />}
            {message.text}
          </div>
        )}

        <div className="social-auth-grid">
          {socialProviders.map((provider) => (
            <button
              key={provider.key}
              className={`social-auth-button provider-${provider.className}`}
              type="button"
              onClick={() => handleSocialClick(provider)}
            >
              {provider.label}로 계속하기
            </button>
          ))}
        </div>

        <div className="auth-divider">
          <span>BD 계정으로 계속하기</span>
        </div>

        {mode === 'register' ? (
          <form className="auth-form" onSubmit={submitRegister}>
            <label>
              이름
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={updateRegisterField}
                placeholder="예: 홍길동"
                required
              />
            </label>

            <label>
              회사명
              <input
                type="text"
                name="company"
                value={registerForm.company}
                onChange={updateRegisterField}
                placeholder="선택 입력"
              />
            </label>

            <label>
              연락처
              <input
                type="tel"
                name="phone"
                value={registerForm.phone}
                onChange={updateRegisterField}
                placeholder="예: 010-0000-0000"
              />
            </label>

            <label>
              이메일
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={updateRegisterField}
                placeholder="예: contact@example.com"
                required
              />
            </label>

            <label>
              비밀번호
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={updateRegisterField}
                placeholder="8자 이상 입력"
                required
              />
            </label>

            <label>
              비밀번호 확인
              <input
                type="password"
                name="passwordConfirm"
                value={registerForm.passwordConfirm}
                onChange={updateRegisterField}
                placeholder="비밀번호 재입력"
                required
              />
            </label>

            <label className="auth-check">
              <input
                type="checkbox"
                name="agreed"
                checked={registerForm.agreed}
                onChange={updateRegisterField}
                required
              />
              <span>상담 진행을 위한 개인정보 수집에 동의합니다.</span>
            </label>

            <button className="primary-button form-submit" type="submit" disabled={submitting}>
              {submitting ? '가입 처리 중...' : '회원가입'}
              <UserPlus size={18} />
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitLogin}>
            <label>
              이메일
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={updateLoginField}
                placeholder="예: contact@example.com"
                required
              />
            </label>

            <label>
              비밀번호
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={updateLoginField}
                placeholder="비밀번호 입력"
                required
              />
            </label>

            <button className="primary-button form-submit" type="submit" disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인'}
              <LogIn size={18} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default AuthModal;
