import { apiUrl } from '../config/api.js';
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
    title: '내 의뢰 목록',
    description: '회원 계정과 연결된 프로젝트 목록을 확인하는 영역입니다.',
    icon: FileVideo,
  },
  {
    title: '진행 현황',
    description: '상담, 견적, 촬영, 편집, 시사, 결제, 납품 단계를 확인합니다.',
    icon: ShieldCheck,
  },
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

const demoProjects = [
  {
    id: 'demo-001',
    title: '프로젝트 상담 요청',
    type: '기업 홍보 영상',
    status: '상담 접수',
    stageIndex: 0,
    updatedAt: '상담 접수 후 담당자 확인 대기',
  },
];

function formatCustomerName(user) {
  if (!user) {
    return '고객';
  }

  return user.name || user.company || user.email || '고객';
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
  const [message, setMessage] = useState('');

  const customerName = useMemo(() => formatCustomerName(user), [user]);

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
        return;
      }

      setAuthenticated(Boolean(result.authenticated));

      if (result.user) {
        setUser(result.user);
        localStorage.setItem('bd_customer_user', JSON.stringify(result.user));
      } else {
        setUser(null);
        localStorage.removeItem('bd_customer_user');
      }
    } catch (error) {
      console.error('Customer mypage me error:', error);
      setMessage('회원 정보 API와 연결할 수 없습니다. PHP 백엔드 서버를 확인해주세요.');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();

    const handleAuthChanged = () => {
      loadMe();
    };

    window.addEventListener('bd:customer-auth-changed', handleAuthChanged);

    return () => {
      window.removeEventListener('bd:customer-auth-changed', handleAuthChanged);
    };
  }, [loadMe]);

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
          프로젝트 진행 현황, 시사 링크, 결제·영수 내역을 확인하는 고객 전용 공간입니다.
        </p>

        <div className="mypage-placeholder-actions">
          <button className="primary-button" type="button" onClick={onOpenContact}>
            <MessageCircle size={18} />
            새 문의하기
          </button>
          <button className="ghost-button" type="button" onClick={loadMe}>
            <RefreshCw size={18} />
            새로고침
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
        <strong>프로젝트 기능 준비 중</strong>
        <p>
          현재는 로그인 계정 확인과 고객 대시보드 UI만 연결되어 있습니다.
          다음 단계에서 문의 내역과 프로젝트 진행 상태를 실제 DB와 연결합니다.
        </p>
      </div>

      <div className="mypage-project-list">
        {demoProjects.map((project) => (
          <article key={project.id} className="mypage-project-card">
            <div>
              <span>{project.type}</span>
              <h2>{project.title}</h2>
              <p>{project.updatedAt}</p>
            </div>
            <strong>{project.status}</strong>

            <div className="project-progress-preview" aria-label={`${project.title} 진행 단계`}>
              {progressSteps.map((step, index) => (
                <div key={step} className={index <= project.stageIndex ? 'is-current' : ''}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
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