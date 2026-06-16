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
import BdButton from './ui/BdButton.jsx';
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
    label: '\uC0C1\uB2F4 \uC811\uC218',
    description: '\uBB38\uC758\uAC00 \uC815\uC0C1 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2F4\uB2F9\uC790\uAC00 \uB0B4\uC6A9\uC744 \uD655\uC778\uD55C \uB4A4 \uC0C1\uB2F4 \uB610\uB294 \uACAC\uC801 \uC548\uB0B4\uB97C \uC9C4\uD589\uD569\uB2C8\uB2E4.',
    customerGuide: '\uD604\uC7AC \uB2F4\uB2F9\uC790 \uD655\uC778 \uC804 \uB2E8\uACC4\uC785\uB2C8\uB2E4. \uC811\uC218 \uC21C\uC11C\uC5D0 \uB530\uB77C \uD655\uC778 \uD6C4 \uC5F0\uB77D\uB4DC\uB9B4 \uC608\uC815\uC785\uB2C8\uB2E4.',
    nextAction: '\uC5F0\uB77D\uCC98\uC640 \uC774\uBA54\uC77C\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694. \uB2F4\uB2F9\uC790 \uC5F0\uB77D\uC744 \uAE30\uB2E4\uB824 \uC8FC\uC2DC\uBA74 \uB429\uB2C8\uB2E4.',
    stageIndex: 0,
  },
  checked: {
    label: '\uACAC\uC801 \uD655\uC778',
    description: '\uB2F4\uB2F9\uC790\uAC00 \uBB38\uC758 \uB0B4\uC6A9\uC744 \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4. \uACAC\uC801 \uB610\uB294 \uC0C1\uB2F4 \uC548\uB0B4 \uB2E8\uACC4\uC785\uB2C8\uB2E4.',
    customerGuide: '\uC0C1\uB2F4 \uAC00\uB2A5 \uC5EC\uBD80\uC640 \uACAC\uC801 \uC548\uB0B4\uAC00 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4. \uD544\uC694 \uC2DC \uB2F4\uB2F9\uC790\uAC00 \uCD94\uAC00 \uC815\uBCF4\uB97C \uC694\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    nextAction: '\uCD94\uAC00 \uC790\uB8CC\uB098 \uCC38\uACE0 \uC601\uC0C1\uC774 \uC788\uB2E4\uBA74 \uC0C8 \uBB38\uC758\uB85C \uB0A8\uACA8\uC8FC\uC138\uC694.',
    stageIndex: 1,
  },
  done: {
    label: '\uCC98\uB9AC \uC644\uB8CC',
    description: '\uC0C1\uB2F4 \uB610\uB294 \uBB38\uC758 \uCC98\uB9AC\uAC00 \uC644\uB8CC\uB41C \uC0C1\uD0DC\uC785\uB2C8\uB2E4.',
    customerGuide: '\uD574\uB2F9 \uBB38\uC758\uC758 1\uCC28 \uC0C1\uB2F4 \uCC98\uB9AC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uCD94\uAC00 \uC0C1\uB2F4\uC774 \uD544\uC694\uD558\uBA74 \uC0C8 \uBB38\uC758\uB97C \uB0A8\uACA8\uC8FC\uC138\uC694.',
    nextAction: '\uCD94\uAC00 \uC81C\uC791 \uC694\uCCAD\uC774\uB098 \uC218\uC815 \uC0C1\uB2F4\uC774 \uD544\uC694\uD558\uBA74 \uAD00\uB828 \uBB38\uC758\uB97C \uB2E4\uC2DC \uB0A8\uAE38 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    stageIndex: 5,
  },
  archived: {
    label: '\uBCF4\uAD00\uB428',
    description: '\uC0C1\uB2F4 \uAE30\uB85D \uBCF4\uAD00\uC744 \uC704\uD574 \uC815\uB9AC\uB41C \uBB38\uC758\uC785\uB2C8\uB2E4.',
    customerGuide: '\uC774 \uBB38\uC758\uB294 \uC0C1\uB2F4 \uAE30\uB85D\uC73C\uB85C \uBCF4\uAD00 \uC911\uC785\uB2C8\uB2E4. \uC774\uC5B4\uC11C \uC9C4\uD589\uD560 \uB0B4\uC6A9\uC774 \uC788\uB2E4\uBA74 \uC0C8 \uBB38\uC758\uB97C \uB0A8\uACA8\uC8FC\uC138\uC694.',
    nextAction: '\uC774\uC804 \uBB38\uC758 \uB0B4\uC6A9\uC744 \uCC38\uACE0\uD558\uC5EC \uCD94\uAC00 \uBB38\uC758\uB97C \uC811\uC218\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
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
  const [expandedContactId, setExpandedContactId] = useState(null);

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

      setExpandedContactId(null);


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
            <BdButton variant="admin-primary" type="button" onClick={() => onOpenAuth?.('login')}>
              <LogIn size={18} />
              로그인
            </BdButton>
            <BdButton variant="admin-secondary" type="button" onClick={() => onOpenAuth?.('register')}>
              <UserPlus size={18} />
              회원가입
            </BdButton>
            <BdButton variant="admin-ghost" type="button" onClick={onOpenContact}>
              <MessageCircle size={18} />
              비회원 문의하기
            </BdButton>
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
          <BdButton variant="admin-primary" type="button" onClick={onOpenContact}>
            <MessageCircle size={18} />
            새 문의하기
          </BdButton>
          <BdButton variant="admin-ghost" type="button" onClick={loadMe} disabled={contactsLoading}>
            <RefreshCw size={18} />
            {contactsLoading ? '새로고침 중' : '새로고침'}
          </BdButton>
          <BdButton variant="admin-secondary" type="button" onClick={logout}>
            <LogOut size={18} />
            로그아웃
          </BdButton>
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

          const isExpanded = expandedContactId === contact.id;

          return (
            <article
              key={contact.id}
              className={`mypage-project-card mypage-contact-card ${isExpanded ? 'is-expanded' : ''}`}
            >
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

              <div className="mypage-contact-card-actions">
                <BdButton
                  className="mypage-contact-detail-toggle"
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedContactId(isExpanded ? null : contact.id)}
                >
                  {isExpanded ? '접기' : '상세 보기'}
                </BdButton>
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

              {isExpanded && (
                <div className="mypage-contact-detail-panel">
                  <div className="mypage-contact-detail-heading">
                    <span>문의 상세</span>
                    <strong>#{contact.id}</strong>
                  </div>

                  <div className="mypage-contact-detail-grid">
                    <div>
                      <span>이름</span>
                      <strong>{contact.name || '-'}</strong>
                    </div>
                    <div>
                      <span>연락처</span>
                      <strong>{contact.phone || '-'}</strong>
                    </div>
                    <div>
                      <span>이메일</span>
                      <strong>{contact.email || '-'}</strong>
                    </div>
                    <div>
                      <span>제작 유형</span>
                      <strong>{contact.productionType || '-'}</strong>
                    </div>
                    <div>
                      <span>예산 범위</span>
                      <strong>{contact.budgetRange || '-'}</strong>
                    </div>
                    <div>
                      <span>현재 상태</span>
                      <strong>{meta.label}</strong>
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

                  <div className="mypage-contact-detail-message">
                    <span>문의 내용</span>
                    <p>{contact.message || '입력된 내용이 없습니다.'}</p>
                  </div>

                  <div className="mypage-contact-detail-guide">
                    <div>
                      <span>{'\uD604\uC7AC \uC548\uB0B4'}</span>
                      <p>{meta.customerGuide}</p>
                    </div>
                    <div>
                      <span>{'\uB2E4\uC74C \uB2E8\uACC4'}</span>
                      <p>{meta.nextAction}</p>
                    </div>
                  </div>

                  <div className="mypage-contact-detail-actions">
                    <BdButton
                      className="mypage-contact-related-button"
                      type="button"
                      onClick={onOpenContact}
                    >
                      {'\uC774 \uBB38\uC758\uC640 \uAD00\uB828\uD574 \uCD94\uAC00 \uBB38\uC758\uD558\uAE30'}
                    </BdButton>
                  </div>
                </div>
              )}

              <div className="mypage-contact-note">
                <ShieldCheck size={18} />
                <div>
                  <p>{meta.description}</p>
                  <small className="mypage-contact-next-action">{meta.nextAction}</small>
                </div>
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
