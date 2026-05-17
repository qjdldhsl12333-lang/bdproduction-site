# BDPRODUCTION Site MVP

BDPRODUCTION 웹사이트 MVP 개발 저장소입니다.  
현재 버전은 **브랜드 홈페이지 + 비회원 문의 접수 + 관리자 문의/상담 운영 관리 + 포트폴리오 확장 구조 + 고객 마이페이지 준비 화면**을 포함합니다.

> 현재 화면 디자인과 문구는 최종 확정본이 아니라 개발용 MVP 기준입니다.  
> 최종 디자인, 브랜드 카피, OG 이미지, 대표 포트폴리오 선정은 디자인팀/대표님 협의 후 변경될 수 있습니다.

---

## 1. 현재 구현 상태 요약

### 완료급

- React/Vite 기반 SPA 기본 구조
- 메인 홈페이지 섹션 구성
  - Hero
  - 3D Studio Showroom
  - 대표 포트폴리오
  - 문의/상담 접수
  - Footer
- 비회원 문의/상담 접수 폼
- PHP Contact API + MariaDB 저장 + SMTP 이메일 발송
- 문의 스팸 방지 1차
  - Honeypot
  - 메시지 길이 제한
  - IP 기반 제출 제한
- 관리자 문의/상담 운영 관리
  - 로그인 / 로그아웃
  - 로그인 실패 제한
  - 잠금 해제 코드 구조
  - 문의 목록 조회
  - 검색 / 상태 필터
  - 문의 상세 모달
  - 상태 변경
  - 보관 / 복구
  - 처리 이력 저장 및 상세 모달 표시
  - CSV 다운로드
- 포트폴리오 구조 분리
  - 메인: 대표 포트폴리오 중심
  - `/portfolio`: 전체 포트폴리오 페이지
  - 전체 포트폴리오: 폴더형/컴팩트 리스트 구조
  - 클릭 시 영상 모달 재생
- 고객 마이페이지 준비 화면
  - `/mypage`
  - Phase 2 고객 플랫폼 진입 구조 표시
- SEO 기술 세팅 1차
  - title
  - description
  - canonical
  - robots.txt
  - sitemap.xml
  - structured data
- MVP 기준 모바일 반응형 1차 QA

### 부분 완료 / 대기

- YouTube Data API 연동 구조
  - 환경변수 구조
  - 캐시 테이블 구조
  - 동기화 API 틀
  - 실제 API Key / Playlist ID 수령 후 실연동 필요
- Notion API 연동 구조
  - 문의 자동 저장 scaffold
  - 실제 Token / DB 또는 Data Source ID 수령 후 실연동 필요
- YouTube 캐싱 Cron Job
  - 동기화 API는 있으나 서버 Cron 등록 필요
- OG 이미지 / 공유 문구
  - 구조는 준비 가능
  - 실제 이미지는 디자인팀/대표님 협의 후 제작 필요
- 최종 디자인 반영 후 모바일 반응형 재QA

---

## 2. 주요 라우트

| 경로 | 설명 |
|---|---|
| `/` | 메인 홈페이지 |
| `/portfolio` | 전체 포트폴리오 페이지 |
| `/mypage` | 고객 마이페이지 준비 화면 |
| `/admin` | 관리자 문의/상담 운영 관리 |

---

## 3. 개발 환경

### Frontend

- React
- Vite
- JavaScript / JSX
- CSS
- Three.js / React Three Fiber
- Framer Motion
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

## 4. 설치 및 실행

### 4-1. 저장소 클론

```powershell
cd C:\dev\projects
git clone https://github.com/qjdldhsl12333-lang/bdproduction-site.git
cd bdproduction-site
```

### 4-2. Frontend 설치

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm install
```

### 4-3. Backend 설치

```powershell
cd C:\dev\projects\bdproduction-site\backend
composer install
```

### 4-4. MariaDB DB 생성 예시

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

## 5. 환경변수

### Backend `.env` 예시

`backend/.env.example`을 참고하여 `backend/.env`를 생성합니다.

주요 항목:

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

## 6. 로컬 실행

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
```

---

## 7. 주요 API

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

## 8. 제안서 체크리스트 기준 현재 상태

| No | 항목 | 현재 상태 |
|---:|---|---|
| 1 | React SPA 기본 구조 | 완료급 |
| 2 | Three.js 3D 파티클 구체 Insight | 부분 완료 / 대체 구현 |
| 3-1 | 메인 대표 포트폴리오 섹션 | 부분 완료 / 대표작 선정 대기 |
| 3-2 | 전체 포트폴리오 페이지 | 1차 구현 |
| 3-3 | 포트폴리오 영상 모달 | 완료급 |
| 4 | YouTube Data API 연동 | 부분 완료 / API 정보 대기 |
| 5 | Kakao · Naver · Google 소셜 로그인 | 미시작 |
| 6-1 | 비회원 문의/상담 접수 폼 | 완료급 |
| 6-2 | 회원 전용 의뢰 접수 + 진행 현황 마이페이지 | 미시작 |
| 7 | 후불 결제 시스템 | 미시작 |
| 8 | 영수 내역 마이페이지 | 미시작 |
| 9-1 | Notion 문의 자동 저장 | 부분 완료 / API 정보 대기 |
| 9-2 | Notion 상담 신청 저장 | 미시작 |
| 9-3 | Notion 결제 자동 저장 | 미시작 |
| 10 | 비공개 시사 링크 | 미시작 |
| 11 | PHP Contact Form + MariaDB + 이메일 | 완료급 |
| 12 | Google Drive API 연동 | 미시작 |
| 13-1 | 관리자 문의/상담 운영 관리 | 완료급 |
| 13-2 | 관리자 포트폴리오 CMS | 미시작 |
| 14 | YouTube 캐싱 Cron Job | 부분 완료 |
| 15-1 | MVP 기준 모바일 반응형 1차 QA | 완료급 |
| 15-2 | 최종 디자인 반영 후 모바일 재QA | 대기 |
| 16-1 | SEO 기술 세팅 | 완료급 |
| 16-2 | OG 이미지/공유 문구 | 디자인 협의 대기 |

---

## 9. 운영/기획상 주의사항

- 현재 홈페이지 디자인은 개발용 MVP 기준입니다.
- 최종 디자인, 문구, 브랜드 카피, OG 이미지는 디자인팀/대표님 협의 후 변경될 수 있습니다.
- 메인 포트폴리오는 대표작 중심으로 유지하고, 전체 포트폴리오는 `/portfolio`에서 관리하는 방향입니다.
- 비회원 문의는 영업 유입용으로 유지합니다.
- 회원 전용 마이페이지, 결제, 영수 내역, 시사 링크, 납품 파일 관리는 Phase 2로 별도 설계가 필요합니다.
- 현재 관리자 기능은 계약 확정/결제/납품 관리가 아니라 **계약 전 단계 문의/상담 운영 관리**입니다.

---

## 10. 다음 개발 후보

1. 관리자 포트폴리오 CMS 1차
   - 포트폴리오 추가 / 수정 / 삭제
   - 대표작 여부 설정
   - 노출 순서 설정
   - 카테고리 관리
2. YouTube 실제 연동
   - API Key / Playlist ID 수령 후 연결
   - Cron Job 등록
3. Notion 실제 연동
   - Token / DB ID 수령 후 문의 자동 저장 테스트
4. Phase 2 고객 플랫폼 설계
   - Kakao / Naver / Google 소셜 로그인
   - 고객 마이페이지
   - 진행 현황
   - 결제 / 영수 내역
   - 비공개 시사 링크
   - Google Drive 납품 파일 연동
