import { apiUrl } from '../config/api.js';
import '../styles/mypage.css';
import {
  CreditCard,
  FileVideo,
  Lock,
  LogIn,
  LogOut,
  MessageCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const progressSteps = [
  '상담 접수',
  '견적 확인',
  '촬영 진행',
  '편집/시사',
  '후불 결제',
  '최종 납품',
];

const plannedFeatures = [
  {
    title: '비공개 시사 링크',
    description: '납품 전 결과물을 고객 전용 링크로 확인하는 영역입니다.',
    icon: Lock,
  },
  {
    title: '후불 결제',
    description: '촬영·편집 완료 후 결제 링크와 결제 상태를 확인합니다.',
    icon: CreditCard,
  },
  {
    title: '영수 내역',
    description: '프로젝트별 결제 내역과 영수 정보를 확인합니다.',
    icon: ReceiptText,
  },
  {
    title: '납품 파일',
    description: '최종 납품 파일 또는 Google Drive 연동 파일을 확인합니다.',
    icon: Truck,
  },
];

const statusMeta = {
  new: {
    label: '상담 접수',
    description: '문의가 접수되었습니다. 담당자 확인을 기다리는 단계입니다.',
    stageIndex: 0,
  },
  checked: {
    label: '견적 확인',
    description: '담당자가 문의 내용을 확인했습니다. 견적 또는 상담 안내 단계입니다.',
    stageIndex: 1,
  },
  done: {
    label: '처리 완료',
    description: '상담 또는 문의 처리가 완료된 상태입니다.',
    stageIndex: 5,
  },
  archived: {
    label: '보관됨',
    description: '관리자에 의해 보관 처리된 문의입니다.',
    stageIndex: 0,
  },
};

function formatCustomerName(user) {
  if (!user) {
    return '고객';
  }

  return user.name || user.company || user.email || '고객';
}

function resolveStatusMeta(status) {
  return statusMeta[status] || statusMeta.new;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const normalizedValue = String(value).replace(' ', 'T');
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function previewMessage(message) {
  if (!message) {
    return '문의 내용이 비어 있습니다.';
  }

  const trimmed = String(message).trim();

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 120)}...`;
}

function MyPagePlaceholder({ onOpenAuth, onOpenContact }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('bd_customer_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsErrorMessage, setContactsErrorMessage] = useState('');
  const [message, setMessage] = useState('');

  const customerName = useMemo(() => formatCustomerName(user), [user]);
  const latestContact = contacts[0] || null;

  const loadCustomerContacts = useCallback(async () => {
    setContactsLoading(true);
    setContactsErrorMessage('');

    try {
      const response = await fetch(apiUrl('/api/customer/contacts.php'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        setUser(null);
        setContacts([]);
        localStorage.removeItem('bd_customer_user');
        setMessage(result.message || '로그인이 필요합니다.');
        return;
      }

      if (!response.ok || !result.success) {
        setContactsErrorMessage(result.message || '문의 내역을 불러오지 못했습니다.');
        return;
      }

      setContacts(Array.isArray(result.contacts) ? result.contacts : []);
    } catch (error) {
      console.error('Customer contacts error:', error);
      setContactsErrorMessage('문의 내역 API와 연결할 수 없습니다. PHP 백엔드 서버를 확인해주세요.');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/auth/me.php'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || '회원 정보를 확인하지 못했습니다.');
        setAuthenticated(false);
        setContacts([]);
        return;
      }

      const isAuthenticated = Boolean(result.authenticated);
      setAuthenticated(isAuthenticated);

      if (result.user) {
        setUser(result.user);
        localStorage.setItem('bd_customer_user', JSON.stringify(result.user));
        await loadCustomerContacts();
      } else {
        setUser(null);
        setContacts([]);
        localStorage.removeItem('bd_customer_user');
      }
    } catch (error) {
      console.error('Customer mypage me error:', error);
      setMessage('회원 정보 API와 연결할 수 없습니다. PHP 백엔드 서버를 확인해주세요.');
      setAuthenticated(false);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [loadCustomerContacts]);

  useEffect(() => {
    loadMe();

    const handleAuthChanged = () => {
      loadMe();
    };

    const handleContactCreated = () => {
      if (authenticated) {
        loadCustomerContacts();
      }
    };

    window.addEventListener('bd:customer-auth-changed', handleAuthChanged);
    window.addEventListener('bd:customer-contact-created', handleContactCreated);

    return () => {
      window.removeEventListener('bd:customer-auth-changed', handleAuthChanged);
      window.removeEventListener('bd:customer-contact-created', handleContactCreated);
    };
  }, [authenticated, loadCustomerContacts, loadMe]);

  const logout = async () => {
    setLoading(true);
    setMessage('');

    try {
      await fetch(apiUrl('/api/auth/logout.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      console.error('Customer logout error:', error);
    } finally {
      localStorage.removeItem('bd_customer_user');
      setUser(null);
      setContacts([]);
      setAuthenticated(false);
      setLoading(false);
      setMessage('로그아웃되었습니다.');
      window.dispatchEvent(new Event('bd:customer-auth-changed'));
    }
  };

  if (loading) {
    return (
      <section className="mypage-placeholder-section mypage-dashboard-section">
        <div className="mypage-placeholder-hero">
          <p className="eyebrow">CUSTOMER PAGE</p>
          <h1>마이페이지 확인 중</h1>
          <p>회원 정보를 불러오는 중입니다.</p>
        </div>

        <div className="mypage-status-card">
          <RefreshCw size={22} />
          <strong>로딩 중</strong>
          <p>잠시만 기다려주세요.</p>
        </div>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="mypage-placeholder-section mypage-dashboard-section">
        <div className="mypage-placeholder-hero">
          <p className="eyebrow">CUSTOMER PAGE</p>
          <h1>로그인이 필요합니다</h1>
          <p>
            프로젝트 진행 현황, 시사 링크, 결제·영수 내역은 회원 로그인 후 확인할 수 있습니다.
          </p>

          <div className="mypage-placeholder-actions">
            <button className="primary-button" type="button" onClick={() => onOpenAuth?.('login')}>
              <LogIn size={18} />
              로그인
            </button>
            <button className="secondary-button" type="button" onClick={() => onOpenAuth?.('register')}>
              <UserPlus size={18} />
              회원가입
            </button>
            <button className="ghost-button" type="button" onClick={onOpenContact}>
              <MessageCircle size={18} />
              비회원 문의하기
            </button>
          </div>
        </div>

        {message && (
          <div className="mypage-status-card">
            <span>NOTICE</span>
            <strong>안내</strong>
            <p>{message}</p>
          </div>
        )}

        <div className="project-progress-preview" aria-label="고객 프로젝트 진행 단계 예시">
          {progressSteps.map((step, index) => (
            <div key={step} className={index === 0 ? 'is-current' : ''}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mypage-placeholder-section mypage-dashboard-section">
      <div className="mypage-placeholder-hero">
        <p className="eyebrow">CUSTOMER PAGE</p>
        <h1>{customerName}님의 마이페이지</h1>
        <p>
          접수한 문의 내역과 현재 처리 상태를 확인하는 고객 전용 공간입니다.
        </p>

        <div className="mypage-placeholder-actions">
          <button className="primary-button" type="button" onClick={onOpenContact}>
            <MessageCircle size={18} />
            새 문의하기
          </button>
          <button className="ghost-button" type="button" onClick={loadMe} disabled={contactsLoading}>
            <RefreshCw size={18} />
            {contactsLoading ? '새로고침 중' : '새로고침'}
          </button>
          <button className="secondary-button" type="button" onClick={logout}>
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </div>

      <div className="mypage-account-card">
        <div>
          <span>이름</span>
          <strong>{user?.name || '-'}</strong>
        </div>
        <div>
          <span>회사명</span>
          <strong>{user?.company || '-'}</strong>
        </div>
        <div>
          <span>연락처</span>
          <strong>{user?.phone || '-'}</strong>
        </div>
        <div>
          <span>이메일</span>
          <strong>{user?.email || '-'}</strong>
        </div>
      </div>

      <div className="mypage-status-card">
        <span>PROJECT STATUS</span>
        <strong>{contacts.length > 0 ? `등록된 문의 ${contacts.length}건` : '등록된 문의가 없습니다'}</strong>
        <p>
          {latestContact
            ? `최근 문의 #${latestContact.id} 상태는 ${resolveStatusMeta(latestContact.status).label}입니다.`
            : '새 문의를 접수하면 이곳에서 진행 상태를 확인할 수 있습니다.'}
        </p>
      </div>

      {contactsErrorMessage && (
        <div className="mypage-error-card">
          <strong>문의 내역을 불러오지 못했습니다.</strong>
          <p>{contactsErrorMessage}</p>
        </div>
      )}

      <div className="mypage-project-list">
        {contactsLoading && contacts.length === 0 && (
          <div className="mypage-empty-card">
            <RefreshCw size={20} />
            <strong>문의 내역을 불러오는 중입니다.</strong>
          </div>
        )}

        {!contactsLoading && contacts.length === 0 && (
          <div className="mypage-empty-card">
            <FileVideo size={22} />
            <strong>아직 접수된 문의가 없습니다.</strong>
            <p>새 문의를 남기면 접수번호와 처리 상태가 이곳에 표시됩니다.</p>
          </div>
        )}

        {contacts.map((contact) => {
          const meta = resolveStatusMeta(contact.status);

          return (
            <article key={contact.id} className="mypage-project-card mypage-contact-card">
              <div className="mypage-contact-card-header">
                <div>
                  <span>접수번호 #{contact.id}</span>
                  <h2>{contact.productionType || '영상 제작 문의'}</h2>
                  <p>{previewMessage(contact.message)}</p>
                </div>
                <strong className={`mypage-contact-status status-${contact.status || 'new'}`}>
                  {meta.label}
                </strong>
              </div>

              <div className="mypage-contact-meta-grid">
                <div>
                  <span>예산 범위</span>
                  <strong>{contact.budgetRange || '-'}</strong>
                </div>
                <div>
                  <span>접수일</span>
                  <strong>{formatDate(contact.createdAt)}</strong>
                </div>
                <div>
                  <span>최종 업데이트</span>
                  <strong>{formatDate(contact.updatedAt)}</strong>
                </div>
              </div>

              <div className="mypage-contact-note">
                <ShieldCheck size={18} />
                <p>{meta.description}</p>
              </div>

              <div className="project-progress-preview" aria-label={`${contact.productionType || '문의'} 진행 단계`}>
                {progressSteps.map((step, index) => (
                  <div key={step} className={index <= meta.stageIndex ? 'is-current' : ''}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mypage-feature-grid">
        {plannedFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <article key={feature.title} className="mypage-feature-card">
              <div>
                <Icon size={22} />
              </div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MyPagePlaceholder;
