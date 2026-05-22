# BDPRODUCTION Site MVP

BDPRODUCTION 웹사이트 MVP 개발 저장소입니다.  
현재 버전은 **브랜드 홈페이지 MVP + 비회원 문의 접수 + 관리자 문의/상담 운영 관리 + 포트폴리오 확장 구조 + 고객 마이페이지 준비 화면**을 포함합니다.

> 현재 화면 디자인과 문구는 최종 확정본이 아니라 개발용 MVP 기준입니다.  
> 최종 디자인, 브랜드 카피, OG 이미지, 대표 포트폴리오 선정, 3D/Spline 모델, OG 이미지는 대표님/디자인팀 협의 후 변경될 수 있습니다.

---

## 1. 현재 메인 방향

### 현재 유지 중인 메인 구조

- Hero 쇼릴 영역
- 대표 포트폴리오 섹션
- Footer
- 상단 시네마틱 헤더
- 우측 하단 제작 문의 플로팅 버튼
- 제작 문의 모달
- 로그인 / 회원가입 모달
- 전체 포트폴리오 페이지
- 고객 마이페이지 준비 화면
- 관리자 문의/상담 운영 페이지
- 관리자 포트폴리오 관리 페이지 구조

### 제거 / 보류된 항목

- 임시 3D Studio Showroom 제거
  - 코드로 조립한 임시 Three.js 오브젝트는 품질 기준에 맞지 않아 제거
  - 추후 **Spline 또는 GLB 모델 삽입 방식**으로 재구현 예정
- 메인 하단 CONTACT CTA 카드 섹션 제거
  - 제작 문의 기능은 상단 버튼, 우측 하단 버튼, 문의 모달로 유지
- 정적인 밝은 하늘색 계열 MVP 디자인 제거
  - 블랙 / 딥 틸 / 네온 라임 중심의 시네마틱 다크 톤으로 1차 전환

---

## 2. 완료 내용

### 2-1. 브랜드 홈페이지 MVP

- React/Vite 기반 SPA 기본 구조 구현
- 시네마틱 상단 헤더 구현
- 모바일/PC 대응 메뉴 드로어 구현
- Hero 쇼릴 영역 구성
- 메인 대표 포트폴리오 섹션 구성
- 전체 포트폴리오 페이지 추가
- Footer 사업자 정보 영역 구성
- 전반적인 다크/네온 컬러 테마 1차 적용
- 우측 플로팅 제작 문의 버튼 정리

### 2-2. 비회원 문의/상담 접수 기능

- 회원가입 없이 문의 접수 가능
- 이름/회사명, 연락처, 이메일, 제작 유형, 예산, 문의 내용 입력
- 문의 접수 시 MariaDB 저장
- 관리자 이메일 알림 발송 구조
- 스팸 방지 1차 적용
  - Honeypot
  - 메시지 길이 제한
  - IP 기반 반복 제출 제한

### 2-3. 관리자 문의/상담 운영 관리

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

> 현재 관리자 기능은 계약 확정/결제/납품 관리가 아니라 **계약 전 단계 문의/상담 운영 관리**입니다.

### 2-4. 포트폴리오 구조

- 메인 포트폴리오는 대표작 중심으로 유지
- 전체 포트폴리오 페이지(`/portfolio`) 추가
- 전체 포트폴리오는 폴더형/컴팩트 리스트 방식으로 구성
- 영상 목록은 썸네일과 요약 정보 위주로 표시
- 클릭 시 모달에서 YouTube iframe 로드
- 무빙워크형 포트폴리오 시안은 폐기하고 카드/리스트형으로 복귀

### 2-5. 고객 마이페이지 준비 화면

- `/mypage` 경로 추가
- 고객 전용 플랫폼 Phase 2 진입 구조 제시
- 현재는 실제 고객 기능이 아닌 준비 화면
- 추후 소셜 로그인, 진행 현황, 결제, 시사 링크, 납품 파일 기능과 연결 예정

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

---

## 3. 현재 주요 라우트

| 경로 | 설명 |
|---|---|
| `/` | 메인 홈페이지 |
| `/#hero` | Hero 쇼릴 영역 |
| `/#portfolio` | 메인 대표 포트폴리오 영역 |
| `/portfolio` | 전체 포트폴리오 페이지 |
| `/mypage` | 고객 마이페이지 준비 화면 |
| `/admin` | 관리자 문의/상담 운영 관리 |
| `/admin/portfolio` | 관리자 포트폴리오 관리 구조 |

---

## 4. 개발 환경

### Frontend

- React
- Vite
- JavaScript / JSX
- CSS
- Framer Motion
- Three.js / React Three Fiber / Drei
  - 현재 임시 3D 섹션은 제거됨
  - 추후 Spline 또는 GLB 삽입 방식 검토
- Lucide React

### Backend

- PHP
- MariaDB
- Composer
- PHPMailer

### Database

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

---

## 6. 환경변수

### Backend `.env` 예시

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
```

### Frontend `.env` 예시

`frontend/.env.example`을 참고하여 `frontend/.env`를 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 7. 로컬 실행

### Backend PHP 서버

```powershell
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public
```

### Frontend 개발 서버

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm run dev
```

브라우저 확인:

```txt
http://localhost:5173
http://localhost:5173/portfolio
http://localhost:5173/mypage
http://localhost:5173/admin
http://localhost:5173/admin/portfolio
```

---

## 8. 주요 API

### 문의 접수

```txt
POST /api/contact.php
```

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

### 관리자 API

```txt
POST /api/admin/login.php
POST /api/admin/logout.php
GET  /api/admin/me.php
GET  /api/admin/contacts.php
GET  /api/admin/archived-contacts.php
POST /api/admin/update-contact-status.php
GET  /api/admin/contact-activity-logs.php?contactId={id}
```

### YouTube API scaffold

```txt
GET /api/youtube/videos.php
POST 또는 GET /api/youtube/sync.php
```

---

## 9. 제안서 체크리스트 기준 현재 상태

| No | 항목 | 현재 상태 |
|---:|---|---|
| 1 | React SPA 기본 구조 | 완료급 |
| 2 | Three.js 3D 파티클 구체 Insight | 임시 구현 제거 / Spline·GLB 방식으로 재검토 |
| 3-1 | 메인 대표 포트폴리오 섹션 | 1차 구현 / 대표작 선정 대기 |
| 3-2 | 전체 포트폴리오 페이지 | 1차 구현 |
| 3-3 | 포트폴리오 영상 모달 | 완료급 |
| 4 | YouTube Data API 연동 | 부분 완료 / API 정보 대기 |
| 5 | Kakao · Naver · Google 소셜 로그인 | 미시작 |
| 6-1 | 비회원 문의/상담 접수 폼 | 완료급 |
| 6-2 | 회원 전용 의뢰 접수 + 진행 현황 마이페이지 | 준비 화면만 구현 / 실제 기능 미시작 |
| 7 | 후불 결제 시스템 | 미시작 |
| 8 | 영수 내역 마이페이지 | 미시작 |
| 9-1 | Notion 문의 자동 저장 | 부분 완료 / API 정보 대기 |
| 9-2 | Notion 상담 신청 저장 | 미시작 |
| 9-3 | Notion 결제 자동 저장 | 미시작 |
| 10 | 비공개 시사 링크 | 미시작 |
| 11 | PHP Contact Form + MariaDB + 이메일 | 완료급 |
| 12 | Google Drive API 연동 | 미시작 |
| 13-1 | 관리자 문의/상담 운영 관리 | 완료급 |
| 13-2 | 관리자 포트폴리오 CMS | 구조 필요 / 다음 우선순위 후보 |
| 14 | YouTube 캐싱 Cron Job | 부분 완료 / 서버 Cron 등록 대기 |
| 15-1 | MVP 기준 모바일 반응형 1차 QA | 진행 중 |
| 15-2 | 최종 디자인 반영 후 모바일 재QA | 대기 |
| 16-1 | SEO 기술 세팅 | 완료급 |
| 16-2 | OG 이미지/공유 문구 | 디자인 협의 대기 |

---

## 10. 제안서 기준 다음 패치 우선순위

### 1순위. Hero 쇼릴 실제 영상 연결

- 제안서 기준 Hero는 쇼릴 풀스크린 영상 영역입니다.
- 현재는 구조와 프레임 중심으로 구현되어 있으므로 실제 쇼릴 파일 연결이 필요합니다.
- 권장 작업:
  - `frontend/public/videos/showreel.mp4` 또는 WebM 파일 확정
  - 모바일/PC 비율 분리
  - 자동재생, muted, playsInline 적용
  - 첫 화면에서 헤더/플로팅 버튼 노출 강도 재조정

### 2순위. 대표 포트폴리오 6개 확정

- 메인에는 대표작만 노출합니다.
- 전체 작품은 `/portfolio`에서 폴더형으로 관리합니다.
- 권장 작업:
  - 대표작 6개 선정
  - 카테고리 확정
  - 썸네일 이미지 확보
  - 실제 YouTube video_id 또는 URL 매핑

### 3순위. 관리자 포트폴리오 CMS 1차

- 대표작 여부
- 카테고리
- 노출 순서
- 숨김 처리
- YouTube URL 또는 video_id 관리
- 썸네일 URL 관리
- 전체 포트폴리오 노출 여부 관리

### 4순위. YouTube 실제 연동

- YouTube API Key
- Playlist ID 또는 채널 업로드 리스트 기준 확정
- 캐시 테이블 저장
- Cron Job 등록
- NEW 배지 기준 확정

### 5순위. Notion 실제 연동

- Notion Integration Token
- 문의 DB 또는 Data Source ID
- 필드 매핑
- 문의 접수 시 Notion 자동 저장 테스트

### 6순위. Phase 2 고객 플랫폼 설계

- Kakao / Naver / Google 소셜 로그인
- 고객 마이페이지 실제 로그인 연결
- 의뢰 목록
- 진행 현황
- 비공개 시사 링크
- 후불 결제
- 영수 내역
- Google Drive 납품 파일 연동

---

## 11. 대표님 / 디자인팀 확인 필요 사항

### 대표님 확인 필요

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

### API / 계정 정보 필요

- YouTube API Key
- YouTube Playlist ID
- Notion Integration Token
- Notion 문의 DB 또는 Data Source ID
- Kakao / Naver / Google OAuth 앱 정보
- Google Drive API 사용 여부
- 결제 PG 및 결제 수단 정책

### 디자인팀 협의 필요

- 최종 홈페이지 디자인 방향
- Hero 쇼릴 영역 디자인
- Spline 또는 GLB 3D 모델 사용 여부
- 브랜드 문구 / SEO 문구 / 공유 문구
- OG 이미지
- 포트폴리오 썸네일 기준
- 최종 디자인 반영 후 모바일 재QA

---

## 12. 운영/기획상 주의사항

- 현재 홈페이지 디자인은 개발용 MVP 기준입니다.
- 최종 디자인, 문구, 브랜드 카피, OG 이미지는 디자인팀/대표님 협의 후 변경될 수 있습니다.
- 코드로 직접 조립한 임시 3D는 품질 기준 미달로 제거했습니다.
- 3D/인터랙티브 비주얼은 추후 Spline 또는 GLB 모델 삽입 방식으로 재구현합니다.
- 메인 포트폴리오는 대표작 중심으로 유지하고, 전체 포트폴리오는 `/portfolio`에서 관리합니다.
- 비회원 문의는 영업 유입용으로 유지합니다.
- 회원 전용 마이페이지, 결제, 영수 내역, 시사 링크, 납품 파일 관리는 Phase 2로 별도 설계가 필요합니다.
- 현재 관리자 기능은 계약 확정/결제/납품 관리가 아니라 **계약 전 단계 문의/상담 운영 관리**입니다.
