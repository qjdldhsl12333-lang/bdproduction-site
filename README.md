# BDPRODUCTION Site MVP

BDPRODUCTION 웹사이트 MVP 개발 저장소입니다.  
현재 버전은 **브랜드 홈페이지 MVP + 제작 문의 접수 + 고객 로그인/마이페이지 문의 내역 MVP + 관리자 문의/상담 운영 관리 + 관리자 포트폴리오 CMS + Cloudways 운영 배포 + Google/Kakao 소셜 로그인 + 가비아 도메인/SSL 실배포 구성 + CSS 구조 정리**를 포함합니다.

> 현재 화면 디자인과 문구는 최종 확정본이 아니라 개발용 MVP 기준입니다.  
> 최종 디자인, 브랜드 카피, OG 이미지, 대표 포트폴리오 선정, 3D/Spline 모델, 포트폴리오 썸네일은 대표님/디자인팀 협의 후 변경될 수 있습니다.

---

## 1. 현재 메인 방향

### 1-1. 현재 유지 중인 메인 구조

- Hero 쇼릴 영역
- 대표 포트폴리오 섹션
- Footer 사업자 정보 영역
- 상단 시네마틱 헤더
- PC / 모바일 메뉴 드로어
- 우측 하단 제작 문의 플로팅 버튼
- 제작 문의 모달
- 로그인 / 회원가입 모달
- 전체 포트폴리오 페이지
- 고객 마이페이지
- 관리자 문의/상담 운영 페이지
- 관리자 포트폴리오 관리 페이지 구조

### 1-2. 제거 / 보류된 항목

- 임시 3D Studio Showroom 제거
  - 코드로 조립한 임시 Three.js 오브젝트는 품질 기준에 맞지 않아 제거
  - 추후 **Spline 또는 GLB 모델 삽입 방식**으로 재구현 예정
- 메인 하단 CONTACT CTA 카드 섹션 제거
  - 제작 문의 기능은 상단 버튼, 우측 하단 버튼, 문의 모달로 유지
- 정적인 밝은 하늘색 계열 MVP 디자인 제거
  - 블랙 / 딥 틸 / 네온 라임 중심의 시네마틱 다크 톤으로 1차 전환
- 무빙워크형 포트폴리오 시안 폐기
  - 현재는 카드/리스트형 포트폴리오 구조로 복귀

---

## 2. 완료 내용

### 2-1. 브랜드 홈페이지 MVP

- React / Vite 기반 SPA 기본 구조 구현
- 시네마틱 상단 헤더 구현
- 모바일 / PC 대응 메뉴 드로어 구현
- Hero 쇼릴 영역 구성
- 메인 대표 포트폴리오 섹션 구성
- 전체 포트폴리오 페이지(`/portfolio`) 추가
- Footer 사업자 정보 영역 구성
- 전반적인 다크 / 네온 컬러 테마 1차 적용
- 우측 플로팅 제작 문의 버튼 정리
- BDPRODUCTION 시그니처 포인트 컬러 `#95FF00` 기준 반영

### 2-2. 제작 문의 / 상담 접수 기능

- 비회원 문의 접수 가능
- 로그인 고객 문의 접수 가능
- 문의 접수 시 MariaDB `contacts` 테이블 저장
- 로그인 상태에서 문의 접수 시 `contacts.user_id`로 고객 계정 연결
- 이름/회사명, 연락처, 이메일, 제작 유형, 예산, 문의 내용 입력
- 문의 접수 성공 시 접수번호 표시
- 관리자 이메일 알림 발송 구조
- Notion 전송 구조 준비
- 스팸 방지 1차 적용
  - Honeypot
  - 메시지 길이 제한
  - IP 기반 반복 제출 제한

### 2-3. 고객 로그인 / 마이페이지 MVP

- 로그인 / 회원가입 모달 구현
- 고객 세션 확인 API 구조 구현
- `/mypage` 경로 추가
- 비로그인 상태에서 로그인 / 회원가입 / 비회원 문의 유도
- 로그인 고객 정보 표시
- 로그인 고객의 문의 내역 조회
- 고객 문의 상태 표시
  - 상담 접수
  - 견적 확인
  - 처리 완료
  - 보관됨
- 접수번호, 제작 유형, 예산 범위, 접수일, 최종 업데이트 표시
- 문의 접수 후 마이페이지 목록 갱신 이벤트 구조 추가

> 현재 마이페이지는 **문의 내역 확인 MVP**입니다.  
> 결제, 영수 내역, 비공개 시사 링크, 납품 파일, Google Drive 연동은 Phase 2 확장 항목입니다.

### 2-4. 관리자 문의 / 상담 운영 관리

- 관리자 로그인 / 로그아웃
- 로그인 실패 제한
- 이메일 잠금 해제 코드 구조
- 문의 목록 조회
- 검색 / 상태 필터
- 상세 모달
- 상태 변경
  - 신규
  - 확인 완료
  - 처리 완료
- 보관 / 복구
- 처리 이력 로그 저장
- 상세 모달에서 처리 이력 확인
- CSV 다운로드 기능
- 관리자 목록에서 회원 문의 / 비회원 문의 구분 표시
- 관리자 상세 모달에서 고객 계정 정보 표시
- CSV 다운로드에 회원 계정 정보 포함
- 보관함에서도 회원 연결 정보 조회 가능

> 현재 관리자 기능은 계약 확정/결제/납품 관리가 아니라 **계약 전 단계 문의/상담 운영 관리**입니다.

### 2-5. 포트폴리오 구조

- 메인 포트폴리오는 대표작 중심으로 유지
- 전체 포트폴리오 페이지(`/portfolio`) 추가
- 전체 포트폴리오는 폴더형 / 컴팩트 리스트 방식으로 구성
- 영상 목록은 썸네일과 요약 정보 위주로 표시
- 클릭 시 모달에서 YouTube iframe 로드
- 관리자 포트폴리오 CMS MVP 구현
  - 포트폴리오 추가
  - 포트폴리오 수정
  - 숨김 / 노출
  - 삭제
  - YouTube ID 또는 URL 감지
  - YouTube 썸네일 자동 입력
  - 대표작 여부 / 노출 순서 / 카테고리 관리 구조

### 2-6. YouTube / Notion / SEO / 모바일 QA

- YouTube API 연동을 위한 환경변수 및 API 구조 준비
- YouTube 캐시 테이블 / 동기화 API 구조 준비
- Notion API 연동 구조 준비
- SEO 기술 세팅 1차 완료
  - title
  - description
  - canonical
  - robots.txt
  - sitemap.xml
  - structured data
- MVP 기준 모바일 반응형 1차 QA 진행

### 2-7. CSS 구조 정리

초기에는 `global.css` 중심으로 CSS가 1만 줄 이상 누적되었으나, 유지보수성과 안정성을 위해 영역별 파일로 분리했습니다.

- `global.css` 공통화
- `footer.css` 분리
- `header.css` 분리
- `hero.css` 분리
- `studio.css` 분리
- `contact.css` 분리
- `auth.css` 분리
- `portfolio.css` 분리
- `mypage.css` 분리
- `motion.css` 분리
- `admin-core.css` / `admin.css` 분리
- 미사용 legacy CSS rule block 순차 제거
- 관리자 `scrim` hover 오염 문제 해결
- 관리자 전체 button motion selector 축소
- CSS audit 스크립트 추가

### 2-8. 운영 배포 / 도메인 / 소셜 로그인

- Cloudways 운영 서버 배포 완료
- 가비아 도메인 DNS 연결 완료
- 운영 도메인 SSL 발급 완료
- 운영 도메인 접속 확인 완료
  - `https://bdproduction.co.kr`
  - `https://www.bdproduction.co.kr`
- Cloudways 서버 배치 구조 정리
  - `/public_html`: 프론트 빌드 파일, 정적 파일, API 엔드포인트
  - `/private_html`: 운영 `.env`, 설정 파일, Composer vendor, DB 관련 private 파일
- Google 로그인 운영 연동 완료
- Kakao 로그인 운영 연동 완료
  - 현재 Kakao 이메일 동의항목 심사 전 테스트 운영 가능
  - 이메일 권한이 없는 경우 `kakao_{provider_id}@social.bdproduction.local` 형식의 내부 식별 이메일 생성
- Naver 로그인은 네이버 계정 변경 이슈로 작업 보류
- Kakao 공식 로그인 버튼 이미지는 추후 디자인 패치에서 교체 예정

---

## 3. 현재 주요 라우트

| 경로 | 설명 |
|---|---|
| `/` | 메인 홈페이지 |
| `/#hero` | Hero 쇼릴 영역 |
| `/#portfolio` | 메인 대표 포트폴리오 영역 |
| `/portfolio` | 전체 포트폴리오 페이지 |
| `/mypage` | 고객 마이페이지 / 문의 내역 확인 |
| `/admin` | 관리자 문의/상담 운영 관리 |
| `/admin/portfolio` | 관리자 포트폴리오 관리 |

---

## 4. 개발 환경

### 4-1. Frontend

- React
- Vite
- JavaScript / JSX
- CSS
- Framer Motion
- Three.js / React Three Fiber / Drei
  - 현재 임시 3D 섹션은 제거됨
  - 추후 Spline 또는 GLB 삽입 방식 검토
- Lucide React

### 4-2. Backend

- PHP
- MariaDB
- Composer
- PHPMailer

### 4-3. Database

- MariaDB
- 기본 DB명 예시: `bdproduction`

---

## 5. 설치 및 실행

### 5-1. 저장소 클론

```powershell
cd C:\dev\projects
git clone https://github.com/qjdldhsl12333-lang/bdproduction-site.git
cd bdproduction-site
```

### 5-2. Frontend 설치

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm install
```

### 5-3. Backend 설치

```powershell
cd C:\dev\projects\bdproduction-site\backend
composer install
```

### 5-4. MariaDB DB 생성 예시

```sql
CREATE DATABASE IF NOT EXISTS bdproduction
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'bdproduction_user'@'localhost'
  IDENTIFIED BY 'bdproduction_local_1234!';

GRANT ALL PRIVILEGES ON bdproduction.*
  TO 'bdproduction_user'@'localhost';

FLUSH PRIVILEGES;

SOURCE C:/dev/projects/bdproduction-site/database/schema.sql;
```

### 5-5. 기존 DB 사용 시 마이그레이션

기존 로컬 DB에 이미 `contacts` 테이블이 있는 경우, 고객 문의 연결을 위해 아래 마이그레이션을 실행합니다.

```powershell
cd C:\dev\projects\bdproduction-site

& "C:\Program Files\MariaDB 11.4\bin\mariadb.exe" -u root -p bdproduction -e "SOURCE C:/dev/projects/bdproduction-site/database/migrations/2026-06-02-add-contact-user-id.sql"
```

---

## 6. 환경변수

### 6-1. Backend `.env` 예시

`backend/.env.example`을 참고하여 `backend/.env`를 생성합니다.

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bdproduction
DB_USERNAME=bdproduction_user
DB_PASSWORD=bdproduction_local_1234!

MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=BDPRODUCTION
MAIL_TO_ADDRESS=

ADMIN_PASSWORD=
ADMIN_UNLOCK_EMAIL=

YOUTUBE_ENABLED=false
YOUTUBE_API_KEY=
YOUTUBE_PLAYLIST_ID=

NOTION_ENABLED=false
NOTION_API_TOKEN=
NOTION_CONTACTS_PARENT_TYPE=data_source_id
NOTION_CONTACTS_PARENT_ID=

FRONTEND_APP_URL=http://localhost:5173

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback.php

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=http://localhost:8080/api/auth/kakao/callback.php

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=http://localhost:8080/api/auth/naver/callback.php
```

### 6-2. Frontend `.env` 예시

`frontend/.env.example`을 참고하여 `frontend/.env`를 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_GOOGLE_LOGIN=true
VITE_ENABLE_KAKAO_LOGIN=false
VITE_ENABLE_NAVER_LOGIN=false
```

---

## 7. 로컬 실행

### 7-1. Backend PHP 서버

```powershell
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public
```

### 7-2. Frontend 개발 서버

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm run dev
```

### 7-3. 브라우저 확인

```txt
http://localhost:5173
http://localhost:5173/portfolio
http://localhost:5173/mypage
http://localhost:5173/admin
http://localhost:5173/admin/portfolio
```

### 7-4. 빌드 확인

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm run build
```

---

## 8. 주요 API

### 8-1. 문의 접수

```txt
POST /api/contact.php
```

로그인 상태에서 문의를 접수하면 고객 계정 ID가 `contacts.user_id`에 저장됩니다.

응답 예시:

```json
{
  "success": true,
  "message": "문의가 정상적으로 접수되었습니다.",
  "contactId": 1,
  "mailStatus": "sent",
  "notionStatus": "skipped"
}
```

### 8-2. 고객 인증 / 마이페이지 API

```txt
POST /api/auth/register.php
POST /api/auth/login.php
POST /api/auth/logout.php
GET  /api/auth/me.php
GET  /api/customer/contacts.php

GET  /api/auth/google/start.php
GET  /api/auth/google/callback.php
GET  /api/auth/kakao/start.php
GET  /api/auth/kakao/callback.php
```

### 8-3. 관리자 API

```txt
POST /api/admin/login.php
POST /api/admin/logout.php
GET  /api/admin/me.php
GET  /api/admin/contacts.php
GET  /api/admin/archived-contacts.php
POST /api/admin/update-contact-status.php
GET  /api/admin/contact-activity-logs.php?contactId={id}
```

### 8-4. YouTube API scaffold

```txt
GET /api/youtube/videos.php
POST 또는 GET /api/youtube/sync.php
```

### 8-5. 관리자 포트폴리오 API

```txt
GET    /api/admin/portfolio-items.php
POST   /api/admin/portfolio-items.php
PUT    /api/admin/portfolio-items.php
DELETE /api/admin/portfolio-items.php
```

---

## 9. CSS 구조와 유지보수 기준

### 9-1. CSS 파일 역할

| 파일 | 역할 |
|---|---|
| `frontend/src/styles/global.css` | 전역 변수, reset, 공통 레이아웃, 공통 버튼, 기본 section |
| `frontend/src/styles/footer.css` | Footer 전용 스타일 |
| `frontend/src/styles/header.css` | 상단 헤더, 메뉴, drawer |
| `frontend/src/styles/hero.css` | Hero 쇼릴, Hero 로고, Hero 영상 비율 |
| `frontend/src/styles/studio.css` | Studio / Showroom |
| `frontend/src/styles/contact.css` | 문의 섹션, 문의 모달, 플로팅 문의 버튼, 문의 폼 |
| `frontend/src/styles/auth.css` | 로그인 / 회원가입 모달 |
| `frontend/src/styles/portfolio.css` | 포트폴리오 섹션, 전체 포트폴리오, YouTube 모달 |
| `frontend/src/styles/mypage.css` | 고객 마이페이지 |
| `frontend/src/styles/motion.css` | 공통 버튼/링크 모션 |
| `frontend/src/styles/admin-core.css` | 관리자 페이지 본체 |
| `frontend/src/styles/admin.css` | 관리자 최종 보정, scrim reset, 회원 문의 배지 |

### 9-2. CSS 작업 규칙

- 새 화면 전용 CSS는 `global.css`에 추가하지 않고 영역별 CSS 파일에 작성합니다.
- `.admin-page button`처럼 넓은 전역 button selector는 사용하지 않습니다.
- 관리자 화면에는 scrim, backdrop, close button 등이 있으므로 실제 버튼 클래스나 영역을 명확히 지정합니다.
- CSS 삭제는 selector 한 줄 삭제가 아니라 `{ ... }` rule block 단위로만 진행합니다.
- `!important`는 최종 override 성격의 `admin.css` 같은 파일에서 제한적으로만 사용합니다.
- CSS 수정 후에는 반드시 `npm run build`를 실행합니다.
- 모바일 레이아웃 문제는 별도 모바일 QA 패치로 분리합니다.

### 9-3. CSS audit

미사용 CSS 후보 확인:

```powershell
cd C:\dev\projects\bdproduction-site
node tools/css-audit.cjs
```

결과 파일:

```txt
tools/reports/css-audit-report.json
tools/reports/frontend__src__styles__*.likely-unused.txt
```

주의:

- audit 결과는 삭제 확정이 아니라 후보입니다.
- 동적 className, 상태 class, provider class는 실제 코드 문자열 검색에 걸리지 않을 수 있습니다.
- 삭제 전에는 반드시 빌드와 화면 확인을 진행합니다.

---

## 10. 제안서 체크리스트 기준 현재 상태

| No | 항목 | 현재 상태 |
|---:|---|---|
| 1 | React SPA 기본 구조 | 완료급 |
| 2 | Three.js 3D 파티클 구체 Insight | 임시 구현 제거 / Spline·GLB 방식으로 재검토 |
| 3-1 | 메인 대표 포트폴리오 섹션 | 1차 구현 / 대표작 선정 대기 |
| 3-2 | 전체 포트폴리오 페이지 | 1차 구현 |
| 3-3 | 포트폴리오 영상 모달 | 완료급 |
| 4 | YouTube Data API 연동 | 부분 완료 / API 정보 대기 |
| 5 | Kakao · Naver · Google 소셜 로그인 | Google / Kakao 운영 연동 완료, Naver 작업 보류 |
| 6-1 | 비회원 문의/상담 접수 폼 | 완료급 |
| 6-2 | 회원 문의 접수 + 마이페이지 문의 내역 | MVP 완료 |
| 6-3 | 고객 프로젝트 진행 현황 관리 | 미시작 / Phase 2 |
| 7 | 후불 결제 시스템 | 미시작 / Phase 2 |
| 8 | 영수 내역 마이페이지 | 미시작 / Phase 2 |
| 9-1 | Notion 문의 자동 저장 | 부분 완료 / API 정보 대기 |
| 9-2 | Notion 상담 신청 저장 | 미시작 |
| 9-3 | Notion 결제 자동 저장 | 미시작 |
| 10 | 비공개 시사 링크 | 미시작 / Phase 2 |
| 11 | PHP Contact Form + MariaDB + 이메일 | 완료급 |
| 12 | Google Drive API 연동 | 미시작 / Phase 2 |
| 13-1 | 관리자 문의/상담 운영 관리 | 완료급 |
| 13-2 | 관리자 포트폴리오 CMS | MVP 완료 / 실제 영상 자료 수급 후 검증 필요 |
| 13-3 | 관리자 회원 문의 / 비회원 문의 탭 | 다음 작업 대상 |
| 14 | YouTube 캐싱 Cron Job | 부분 완료 / 서버 Cron 등록 대기 |
| 15-1 | MVP 기준 모바일 반응형 1차 QA | 진행 중 |
| 15-2 | 최종 디자인 반영 후 모바일 재QA | 대기 |
| 16-1 | SEO 기술 세팅 | 완료급 |
| 16-2 | OG 이미지/공유 문구 | 디자인 협의 대기 |

---

## 11. 다음 패치 우선순위

### 1순위. 관리자 회원 문의 / 비회원 문의 탭 추가

- 관리자 문의 목록에서 회원 문의와 비회원 문의를 빠르게 분리
- 기존 전체 / 신규 / 확인 완료 / 처리 완료 / 보관 흐름과 충돌 없게 설계
- 검색 / CSV 다운로드 / 상세 모달과 동일 데이터 기준 유지

### 2순위. 모바일 QA 패치

- PC 기준에서는 큰 문제 없이 동작 확인 완료
- 모바일에서 일부 hover / 메뉴 / 여백 / 버튼 반응이 완벽하지 않을 수 있음
- 별도 모바일 QA 패치에서 화면별로 정리 예정

확인 대상:

- 상단 헤더 / 메뉴 drawer
- Hero 영역
- 포트폴리오 카드
- 문의 모달
- 로그인 / 회원가입 모달
- 마이페이지
- 관리자 메뉴 / 스크림

### 3순위. Hero 쇼릴 실제 영상 연결

- `frontend/public/videos/showreel.mp4` 또는 WebM 파일 확정
- 모바일 / PC 비율 분리
- 자동재생, muted, playsInline 적용
- 첫 화면에서 헤더 / 플로팅 버튼 노출 강도 재조정

### 4순위. 대표 포트폴리오 6개 확정

- 대표작 6개 선정
- 카테고리 확정
- 썸네일 이미지 확보
- 실제 YouTube video_id 또는 URL 매핑
- 관리자 포트폴리오 CMS에서 실제 자료 입력 후 검증

### 5순위. YouTube 실제 연동

- YouTube API Key
- Playlist ID 또는 채널 업로드 리스트 기준 확정
- 캐시 테이블 저장
- Cron Job 등록
- NEW 배지 기준 확정

### 6순위. Notion 실제 연동

- Notion Integration Token
- 문의 DB 또는 Data Source ID
- 필드 매핑
- 문의 접수 시 Notion 자동 저장 테스트

### 7순위. Phase 2 고객 플랫폼 설계

- Kakao / Naver / Google 소셜 로그인
- 고객별 프로젝트 목록
- 진행 현황
- 비공개 시사 링크
- 후불 결제
- 영수 내역
- Google Drive 납품 파일 연동

---

## 12. 대표님 / 디자인팀 확인 필요 사항

### 12-1. 대표님 확인 필요

- 메인 대표 포트폴리오 6개 선정
- 전체 포트폴리오 작품 목록
- YouTube 채널 또는 Playlist 정보
- 실제 쇼릴 영상 파일 제공 여부
- Footer 사업자 정보 최종 확인
- 문의 접수 후 운영 프로세스
  - 신규
  - 확인 완료
  - 처리 완료
  - 보관
- 회원 문의와 비회원 문의를 운영상 어떻게 구분할지 확인

### 12-2. API / 계정 정보 필요

- YouTube API Key
- YouTube Playlist ID
- Notion Integration Token
- Notion 문의 DB 또는 Data Source ID
- Naver OAuth 앱 정보
- Kakao 비즈 앱 전환 / 이메일 동의항목 심사
- Google / Kakao 운영 OAuth Redirect URI 유지 관리
- Google Drive API 사용 여부
- 결제 PG 및 결제 수단 정책

### 12-3. 디자인팀 협의 필요

- 최종 홈페이지 디자인 방향
- Hero 쇼릴 영역 디자인
- Spline 또는 GLB 3D 모델 사용 여부
- 브랜드 문구 / SEO 문구 / 공유 문구
- OG 이미지
- 포트폴리오 썸네일 기준
- 최종 디자인 반영 후 모바일 재QA

---

## 13. 운영 / 기획상 주의사항

- 현재 홈페이지 디자인은 개발용 MVP 기준입니다.
- 최종 디자인, 문구, 브랜드 카피, OG 이미지는 디자인팀/대표님 협의 후 변경될 수 있습니다.
- 코드로 직접 조립한 임시 3D는 품질 기준 미달로 제거했습니다.
- 3D/인터랙티브 비주얼은 추후 Spline 또는 GLB 모델 삽입 방식으로 재구현합니다.
- 메인 포트폴리오는 대표작 중심으로 유지하고, 전체 포트폴리오는 `/portfolio`에서 관리합니다.
- 비회원 문의는 영업 유입용으로 유지합니다.
- 로그인 고객 문의는 고객 마이페이지에서 조회할 수 있습니다.
- 회원 전용 결제, 영수 내역, 시사 링크, 납품 파일 관리는 Phase 2로 별도 설계가 필요합니다.
- 현재 관리자 기능은 계약 확정/결제/납품 관리가 아니라 **계약 전 단계 문의/상담 운영 관리**입니다.
- CSS 정리는 큰 구조 분리와 미사용 rule block 제거까지 진행되었으며, 세부 모바일 QA는 별도 패치로 진행합니다.

---

## 14. 최신 작업 상태 요약

### 2026-06 기준 완료

- 메인 페이지는 Hero, 대표 포트폴리오, Footer 중심의 다크 시네마틱 MVP 구조로 정리했습니다.
- 임시 Three.js 3D 쇼룸은 제거했으며, 추후 Spline 또는 GLB 모델 삽입 방식으로 재구현합니다.
- BDPRODUCTION 시그니처 컬러는 `#95FF00` 기준으로 통일했습니다.
- 비회원 제작 문의 접수 기능과 MariaDB 저장 구조를 구현했습니다.
- 로그인 고객 문의 접수 시 고객 계정과 문의가 연결되도록 수정했습니다.
- 고객 마이페이지에서 내 문의 내역을 확인하는 MVP를 구현했습니다.
- 관리자 문의 CMS를 구현했습니다.
  - 문의 목록 조회
  - 검색
  - 상태 필터
  - 상세 보기
  - 신규 / 확인 완료 / 처리 완료 상태 변경
  - 보관 / 복구
  - 처리 이력 저장 및 조회
  - CSV 다운로드
  - 회원 문의 / 비회원 문의 정보 표시
- `contact_activity_logs` 테이블 누락으로 발생하던 상태 변경 500 에러를 해결했습니다.
- 관리자 포트폴리오 CMS MVP를 구현했습니다.
- CSS를 영역별 파일로 분리하고 legacy CSS rule block을 정리했습니다.
- 실제 YouTube 영상 자료는 아직 제공되지 않았으므로 영상 재생 검증은 추후 진행합니다.
- Cloudways 운영 서버 배포를 완료했습니다.
- 가비아 도메인 `bdproduction.co.kr` DNS 연결과 SSL 발급을 완료했습니다.
- Google 로그인 운영 연동을 완료했습니다.
- Kakao 로그인 운영 연동을 완료했습니다.
- Kakao 이메일 권한 심사 전까지는 테스트용 내부 이메일 방식으로 로그인 계정을 생성합니다.
- Naver 로그인 API 작업은 네이버 계정 변경 이슈로 보류합니다.

### 다음 작업

다음 우선순위는 **운영 안정화와 남은 소셜 로그인 정리**입니다.

그다음은 아래 순서로 진행합니다.

1. Naver 로그인 API 연동
   - 네이버 계정 정리 후 재진행
   - 서비스 URL / Callback URL 운영 도메인 기준 등록
2. Kakao 공식 로그인 버튼 이미지 교체
   - 현재는 기능 우선 연동
   - 추후 Kakao 제공 공식 버튼 이미지로 교체
3. 관리자 회원 문의 / 비회원 문의 탭 추가
4. 모바일 QA 패치
5. Hero 실제 쇼릴 영상 연결
6. 대표 포트폴리오 6개 확정 및 실제 자료 입력
7. YouTube 실제 연동
8. Notion 실제 연동
9. Phase 2 고객 플랫폼 설계
