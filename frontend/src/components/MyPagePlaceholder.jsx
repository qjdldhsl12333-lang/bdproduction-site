import { CreditCard, FileVideo, Lock, ReceiptText, ShieldCheck, Truck } from 'lucide-react';

const plannedFeatures = [
  {
    title: '내 의뢰 목록',
    description: '고객이 본인이 의뢰한 프로젝트 목록과 기본 정보를 확인합니다.',
    icon: FileVideo,
  },
  {
    title: '진행 현황 확인',
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
    description: '촬영·편집 완료 후 카드, 카카오페이, 네이버페이 등으로 결제합니다.',
    icon: CreditCard,
  },
  {
    title: '영수 내역',
    description: '프로젝트별 결제 내역과 영수 정보를 마이페이지에서 확인합니다.',
    icon: ReceiptText,
  },
  {
    title: '납품 파일 확인',
    description: '최종 납품 파일 또는 Google Drive 연동 파일을 확인합니다.',
    icon: Truck,
  },
];

const progressSteps = [
  '상담 접수',
  '견적 확인',
  '촬영 진행',
  '편집/시사',
  '후불 결제',
  '최종 납품',
];

function MyPagePlaceholder() {
  return (
    <section className="mypage-placeholder-section">
      <div className="mypage-placeholder-hero">
        <p className="eyebrow">CUSTOMER PAGE</p>
        <h1>고객 마이페이지 준비 화면</h1>
        <p>
          이 화면은 Phase 2 고객 플랫폼 확장을 위한 준비 화면입니다.
          실제 이용을 위해서는 카카오·네이버·구글 소셜 로그인, 프로젝트 DB, 결제 정책, 납품 정책 확정이 필요합니다.
        </p>

        <div className="mypage-placeholder-actions">
          <a className="secondary-button" href="/#contact">
            비회원 문의로 이동
          </a>
          <a className="ghost-button" href="/portfolio">
            포트폴리오 보기
          </a>
        </div>
      </div>

      <div className="mypage-status-card">
        <span>현재 상태</span>
        <strong>Phase 2 설계 대기</strong>
        <p>
          지금은 실제 로그인 기능을 연결하지 않고, 향후 고객 전용 기능이 들어갈 화면 구조만 먼저 잡아둔 상태입니다.
        </p>
      </div>

      <div className="project-progress-preview" aria-label="고객 프로젝트 진행 단계 예시">
        {progressSteps.map((step, index) => (
          <div key={step} className={index === 0 ? 'is-current' : ''}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
          </div>
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

      <div className="mypage-requirements-note">
        <p className="eyebrow">REQUIRED BEFORE BUILD</p>
        <h2>실제 기능 구현 전 필요한 결정 사항</h2>
        <ul>
          <li>카카오·네이버·구글 소셜 로그인 개발자 앱 정보</li>
          <li>고객 프로젝트 진행 단계와 운영 정책</li>
          <li>후불 결제 시점과 결제 수단 범위</li>
          <li>비공개 시사 링크 접근 권한 정책</li>
          <li>Google Drive 또는 별도 저장소 사용 여부</li>
        </ul>
      </div>
    </section>
  );
}

export default MyPagePlaceholder;
