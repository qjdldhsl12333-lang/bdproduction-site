# BDPRODUCTION Site MVP

BDPRODUCTION 공식 웹사이트 + 프로덕션 플랫폼 MVP입니다.

현재 구현 범위는 **브랜드 홈페이지 / 문의 접수 / MariaDB 저장 / 관리자 문의 관리 / SMTP 이메일 알림 / 문의 스팸 방지 / 관리자 상세 모달 / YouTube 포트폴리오 연동 틀 / Notion API 연동 틀**까지입니다.

제안서 기준으로는 현재 **Phase 1 브랜드 홈페이지 구간의 중후반**입니다. 실제 YouTube API, Notion API 정보가 들어오면 Phase 1 자동화 기능을 바로 실연동할 수 있도록 구조를 먼저 만들어둔 상태입니다.

---

## 1. 기술 스택

### Frontend

- React
- Vite
- Framer Motion
- Three.js
- @react-three/fiber
- @react-three/drei
- lucide-react

### Backend

- PHP 8.x
- Composer
- PHPMailer
- MariaDB

### External API 준비

- SMTP / Google Workspace Mail
- YouTube Data API v3 준비
- Notion API 준비
- Google Drive API 예정

### 주요 기능

- BDPRODUCTION 브랜드 홈페이지
- 3D Studio Showroom 섹션
- Contact Form 문의 접수
- 문의 폼 스팸 방지 1차
  - Honeypot 필드
  - 메시지 최소/최대 길이 제한
  - IP 기반 반복 제출 제한
- MariaDB 문의 저장
- SMTP 이메일 알림
- Notion 문의 저장 연동 틀
- 관리자 로그인 / 로그아웃
- 관리자 로그인 실패 제한
- 이메일 잠금 해제 코드 구조
- 관리자 문의 목록
- 관리자 문의 상세 모달
- 검색 / 필터
- 상태 변경: 신규 / 확인 완료 / 처리 완료
- 보관 / 보관함 / 복구
- YouTube 포트폴리오 API 연동 준비
- YouTube 캐시 테이블 구조 준비
- YouTube 동기화 API 틀

---

## 2. 프로젝트 구조

```txt
bdproduction-site/
├─ backend/
│  ├─ .env.example
│  ├─ composer.json
│  ├─ composer.lock
│  ├─ config/
│  │  ├─ admin.php
│  │  ├─ admin_guard.php
│  │  ├─ admin_rate_limit.php
│  │  ├─ contact_rate_limit.php
│  │  ├─ cors.php
│  │  ├─ db.php
│  │  ├─ env.php
│  │  ├─ mailer.php
│  │  ├─ notion.php
│  │  └─ youtube.php
│  └─ public/
│     ├─ index.php
│     └─ api/
│        ├─ contact.php
│        ├─ admin/
│        │  ├─ archived-contacts.php
│        │  ├─ contacts.php
│        │  ├─ login.php
│        │  ├─ logout.php
│        │  ├─ me.php
│        │  ├─ resend-unlock-code.php
│        │  ├─ unlock-login.php
│        │  └─ update-contact-status.php
│        └─ youtube/
│           ├─ sync.php
│           └─ videos.php
├─ database/
│  └─ schema.sql
├─ frontend/
│  ├─ .env.example
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ public/
│  └─ src/
│     ├─ App.jsx
│     ├─ config/
│     │  └─ api.js
│     ├─ components/
│     │  ├─ AdminContacts.jsx
│     │  ├─ BDStudioScene.jsx
│     │  ├─ BDStudioShowroom.jsx
│     │  ├─ ContactForm.jsx
│     │  ├─ Footer.jsx
│     │  ├─ Header.jsx
│     │  ├─ Hero.jsx
│     │  └─ Portfolio.jsx
│     └─ styles/
│        └─ global.css
└─ .gitignore
```

---

## 3. GitHub에서 프로젝트 받기

```powershell
git clone https://github.com/qjdldhsl12333-lang/bdproduction-site.git
cd bdproduction-site
```

---

## 4. 필수 설치 프로그램

개발 PC에 아래 프로그램이 필요합니다.

```txt
Node.js
npm
PHP 8.x
Composer
MariaDB
Git
```

설치 확인 명령어:

```powershell
node -v
npm -v
php -v
composer -V
git --version
```

PHP 확장 확인:

```powershell
php -m | findstr /I "pdo_mysql mysqli mbstring openssl zip"
```

정상적으로 아래 항목이 보여야 합니다.

```txt
mbstring
mysqli
openssl
pdo_mysql
zip
```

---

## 5. Frontend 설치 및 실행

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

정상 실행 주소:

```txt
http://localhost:5173
```

관리자 페이지:

```txt
http://localhost:5173/admin
```

### 5-1. Frontend 환경변수 설정

프론트엔드는 API 서버 주소를 `frontend/.env`에서 읽습니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

로컬 개발에서는 위 값을 그대로 사용하면 됩니다.

운영 배포 시에는 실제 API 주소로 바꿉니다.

```env
VITE_API_BASE_URL=https://bdproduction.co.kr
```

프론트 환경변수를 수정한 뒤에는 React 개발 서버를 재시작해야 합니다.

```powershell
npm run dev
```

---

## 6. Backend 설치 및 실행

처음 받은 뒤 Composer 패키지를 설치합니다.

```powershell
cd backend
composer install
```

PHP 서버 실행은 프로젝트 루트에서 합니다.

```powershell
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public
```

정상 확인 주소:

```txt
http://localhost:8080
```

정상 응답 예시:

```json
{
  "status": "ok",
  "service": "BDPRODUCTION API",
  "message": "PHP backend is running."
}
```

---

## 7. MariaDB 설정

### 7-1. MariaDB 접속

예시:

```powershell
& "C:\Program Files\MariaDB 11.4\bin\mariadb.exe" -u root -p
```

### 7-2. DB와 계정 생성

```sql
CREATE DATABASE IF NOT EXISTS bdproduction
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'bdproduction_user'@'localhost'
  IDENTIFIED BY 'bdproduction_local_1234!';

GRANT ALL PRIVILEGES ON bdproduction.*
  TO 'bdproduction_user'@'localhost';

FLUSH PRIVILEGES;
```

### 7-3. 테이블 생성

프로젝트에 포함된 SQL 파일을 실행합니다.

```sql
SOURCE C:/dev/projects/bdproduction-site/database/schema.sql;
```

또는 DBeaver에서 `database/schema.sql` 파일을 열고 실행해도 됩니다.

### 7-4. 테이블 확인

```sql
USE bdproduction;

SHOW TABLES;

DESCRIBE contacts;
DESCRIBE youtube_videos;
```

정상 테이블:

```txt
contacts
youtube_videos
```

---

## 8. backend/.env 만들기

실제 환경변수 파일은 GitHub에 올리지 않습니다.

`backend/.env.example`을 복사해서 `backend/.env`를 만듭니다.

```powershell
copy backend\.env.example backend\.env
```

또는 직접 파일을 만들고 아래 형태로 작성합니다.

```env
APP_ENV=local

DB_HOST=localhost
DB_PORT=3306
DB_NAME=bdproduction
DB_USER=bdproduction_user
DB_PASS=your_database_password

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

ADMIN_PASSWORD_HASH=change_this_admin_password_hash
ADMIN_SESSION_LIFETIME_SECONDS=7200

ADMIN_LOGIN_MAX_ATTEMPTS=5
ADMIN_UNLOCK_CODE_EXPIRES_SECONDS=600
ADMIN_SECURITY_ALERT_TO_ADDRESS=admin-security@example.com

MAIL_ENABLED=false
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=tls
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME=BDPRODUCTION
MAIL_TO_ADDRESS=admin@example.com

YOUTUBE_ENABLED=false
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_PLAYLIST_ID=your_youtube_playlist_id
YOUTUBE_MAX_RESULTS=6
YOUTUBE_NEW_DAYS=7
YOUTUBE_SYNC_TOKEN=change_this_sync_token

NOTION_ENABLED=false
NOTION_API_TOKEN=your_notion_integration_token
NOTION_VERSION=2026-03-11
NOTION_CONTACTS_PARENT_TYPE=data_source_id
NOTION_CONTACTS_PARENT_ID=your_notion_contacts_data_source_or_database_id

CONTACT_MAX_ATTEMPTS=5
CONTACT_RATE_LIMIT_SECONDS=600
CONTACT_MESSAGE_MIN_LENGTH=5
CONTACT_MESSAGE_MAX_LENGTH=2000
```

### 8-1. Backend CORS 설정

백엔드는 허용할 프론트 주소를 `CORS_ALLOWED_ORIGINS`에서 읽습니다.

로컬 개발 기본값:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

운영 배포 시 예시:

```env
CORS_ALLOWED_ORIGINS=https://bdproduction.co.kr,https://www.bdproduction.co.kr
```

관리자 API는 로그인 세션 쿠키를 사용하므로 CORS 설정이 올바르지 않으면 관리자 로그인이나 문의 목록 조회가 막힐 수 있습니다.

CORS 값을 수정한 뒤에는 PHP 서버를 재시작해야 합니다.

```powershell
php -S localhost:8080 -t backend\public
```

---

## 9. 관리자 비밀번호 해시 만들기

관리자 비밀번호는 평문으로 저장하지 않고 해시로 저장합니다.

원하는 관리자 비밀번호로 아래 명령어를 실행합니다.

```powershell
php -r "echo password_hash('원하는관리자비밀번호', PASSWORD_DEFAULT), PHP_EOL;"
```

출력된 해시값을 `backend/.env`에 넣습니다.

```env
ADMIN_PASSWORD_HASH="$2y$10$..."
```

PHP 서버를 재시작해야 반영됩니다.

```powershell
php -S localhost:8080 -t backend\public
```

---

## 10. SMTP 이메일 알림 설정

문의가 접수되면 관리자 이메일로 알림을 보낼 수 있습니다.

Google Workspace / Gmail SMTP 예시:

```env
MAIL_ENABLED=true

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=tls

MAIL_USERNAME=your-account@example.com
MAIL_PASSWORD=your_app_password_or_smtp_password

MAIL_FROM_ADDRESS=your-account@example.com
MAIL_FROM_NAME=BDPRODUCTION

MAIL_TO_ADDRESS=admin@example.com,another-admin@example.com
```

보안 알림 전용 수신자는 별도로 설정합니다.

```env
ADMIN_SECURITY_ALERT_TO_ADDRESS=security-admin@example.com
```

메일을 여러 명에게 보내려면 쉼표로 구분합니다.

```env
MAIL_TO_ADDRESS=admin1@example.com,admin2@example.com
```

SMTP 설정을 바꾼 뒤에는 PHP 서버를 재시작해야 합니다.

---

## 11. 문의 API 테스트

PHP 서버가 실행 중인 상태에서 PowerShell로 테스트합니다.

```powershell
$body = @{
  name = "테스트 회사"
  phone = "010-1234-5678"
  email = "test@example.com"
  productionType = "기업 홍보 영상"
  budget = "1000만원"
  message = "문의 API 테스트입니다."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/contact.php" `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $body
```

정상 응답 예시:

```txt
success: True
message: 문의가 정상적으로 접수되었습니다.
contactId: 숫자
mailStatus: sent 또는 skipped
notionStatus: skipped 또는 sent
```

`MAIL_ENABLED=false`이면 `mailStatus`는 `skipped`가 정상입니다.

`NOTION_ENABLED=false`이면 `notionStatus`는 `skipped`가 정상입니다.

### 11-1. 문의 스팸 방지 테스트

짧은 메시지 차단:

```powershell
try {
  $body = @{
    name = "짧은 메시지 테스트"
    phone = "010-1111-2222"
    email = "short@example.com"
    productionType = "기업 홍보 영상"
    budget = "1000만원"
    message = "짧음"
  } | ConvertTo-Json

  Invoke-RestMethod `
    -Uri "http://localhost:8080/api/contact.php" `
    -Method POST `
    -ContentType "application/json; charset=utf-8" `
    -Body $body
} catch {
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  $reader.ReadToEnd()
}
```

예상 응답:

```json
{"success":false,"message":"문의 내용은 최소 5자 이상 입력해주세요."}
```

Honeypot 차단:

```powershell
try {
  $body = @{
    name = "봇 테스트"
    phone = "010-1111-2222"
    email = "bot@example.com"
    productionType = "기업 홍보 영상"
    budget = "1000만원"
    message = "봇 차단 테스트입니다."
    website = "https://spam.example.com"
  } | ConvertTo-Json

  Invoke-RestMethod `
    -Uri "http://localhost:8080/api/contact.php" `
    -Method POST `
    -ContentType "application/json; charset=utf-8" `
    -Body $body
} catch {
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  $reader.ReadToEnd()
}
```

예상 응답:

```json
{"success":false,"message":"문의 접수 요청이 올바르지 않습니다."}
```

반복 제출 제한 기록 초기화:

```powershell
Remove-Item backend\storage\contact_submissions.json -Force
```

---

## 12. 관리자 기능

관리자 화면:

```txt
http://localhost:5173/admin
```

관리자 기능:

```txt
문의 목록 조회
문의 상세 모달
검색
상태별 필터
신규 / 확인 / 완료 상태 변경
보관
보관함 보기
복구
로그아웃
```

관리자 상세 모달 기능:

```txt
카드 클릭 시 상세 모달 열기
접수번호 / 이름 / 연락처 / 이메일 / 제작 유형 / 예산 / 문의 내용 확인
모달 안에서 상태 변경
모달 안에서 보관 / 복구
닫기 버튼 / 바깥 클릭 / ESC 닫기
```

관리자 API는 로그인 세션이 없으면 접근이 제한됩니다.

---

## 13. 관리자 로그인 잠금 / 해제 코드

관리자 비밀번호를 여러 번 틀리면 로그인이 잠깁니다.

관련 환경변수:

```env
ADMIN_LOGIN_MAX_ATTEMPTS=5
ADMIN_UNLOCK_CODE_EXPIRES_SECONDS=600
ADMIN_SECURITY_ALERT_TO_ADDRESS=admin-security@example.com
```

흐름:

```txt
비밀번호 여러 번 실패
→ 로그인 잠금
→ 보안 이메일로 6자리 해제 코드 발송
→ 관리자 화면에서 해제 코드 입력
→ 잠금 해제
→ 다시 관리자 비밀번호로 로그인
```

테스트 중 잠금 상태를 초기화하려면 아래 파일을 삭제합니다.

```powershell
Remove-Item backend\storage\admin_login_attempts.json -Force
```

---

## 14. Notion 문의 연동 준비

현재 Notion API Token과 DB/Data Source ID가 없어도 문의 접수는 정상 작동합니다.

`NOTION_ENABLED=false` 상태에서는 문의 접수 응답에 아래처럼 표시됩니다.

```txt
notionStatus: skipped
```

Notion 연동용 환경변수:

```env
NOTION_ENABLED=false
NOTION_API_TOKEN=
NOTION_VERSION=2026-03-11
NOTION_CONTACTS_PARENT_TYPE=data_source_id
NOTION_CONTACTS_PARENT_ID=
```

나중에 대표님에게 Notion 정보를 받으면 아래처럼 설정합니다.

```env
NOTION_ENABLED=true
NOTION_API_TOKEN=secret_xxxxxxxxxxxxxxxxx
NOTION_CONTACTS_PARENT_TYPE=data_source_id
NOTION_CONTACTS_PARENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

만약 Database ID만 전달받았다면 아래처럼 바꿉니다.

```env
NOTION_CONTACTS_PARENT_TYPE=database_id
NOTION_CONTACTS_PARENT_ID=받은_DATABASE_ID
```

### 14-1. Notion 문의 DB 속성명

현재 코드 기준 Notion 문의 DB는 아래 속성명을 사용하는 것을 권장합니다.

| 속성명 | 타입 |
|---|---|
| 이름/회사명 | Title |
| 연락처 | Phone |
| 이메일 | Email |
| 제작 유형 | Select |
| 예산 범위 | Text |
| 문의 내용 | Text |
| 상태 | Select |
| 접수 경로 | Select |
| 접수번호 | Number |
| 접수일 | Date |

---

## 15. YouTube 포트폴리오 연동 준비

현재는 YouTube 채널/재생목록을 받기 전에도 임시 포트폴리오가 표시됩니다.

YouTube 연동용 환경변수:

```env
YOUTUBE_ENABLED=false
YOUTUBE_API_KEY=
YOUTUBE_PLAYLIST_ID=
YOUTUBE_MAX_RESULTS=6
YOUTUBE_NEW_DAYS=7
YOUTUBE_SYNC_TOKEN=bd_youtube_sync_local_1234!
```

나중에 YouTube API Key와 Playlist ID를 받으면:

```env
YOUTUBE_ENABLED=true
YOUTUBE_API_KEY=your_real_youtube_api_key
YOUTUBE_PLAYLIST_ID=your_real_playlist_id
```

PHP 서버 재시작 후 동기화합니다.

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/youtube/sync.php?token=bd_youtube_sync_local_1234!" `
  -Method POST
```

포트폴리오 API 확인:

```txt
http://localhost:8080/api/youtube/videos.php
```

---

## 16. 3D Studio Showroom 영상 연결

현재 3D 쇼룸은 영상 파일이 없어도 대체 화면이 표시됩니다.

실제 쇼릴 영상을 넣으려면 아래 위치에 파일을 추가합니다.

```txt
frontend/public/videos/showreel.mp4
```

폴더가 없다면 생성합니다.

```powershell
cd frontend
New-Item -ItemType Directory -Force public\videos
```

영상 파일명을 반드시 아래처럼 맞춥니다.

```txt
showreel.mp4
```

그 후 `START MOVIE` 버튼을 누르면 중앙 스크린에서 영상이 재생됩니다.

---

## 17. 자주 쓰는 실행 명령어

### 프론트 실행

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm run dev
```

### 백엔드 실행

```powershell
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public
```

### Composer 패키지 설치

```powershell
cd C:\dev\projects\bdproduction-site\backend
composer install
```

### 프론트 패키지 설치

```powershell
cd C:\dev\projects\bdproduction-site\frontend
npm install
```

### DB 접속

```powershell
& "C:\Program Files\MariaDB 11.4\bin\mariadb.exe" -u root -p
```

---

## 18. API 주소 / CORS 확인

프론트에서 백엔드 API가 호출되지 않으면 아래 값을 먼저 확인합니다.

### Frontend

```txt
frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Backend

```txt
backend/.env
```

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

두 값을 수정한 뒤에는 서버를 모두 재시작합니다.

```powershell
# Backend
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public

# Frontend
cd C:\dev\projects\bdproduction-site\frontend
npm run dev
```

확인할 API:

```txt
http://localhost:8080
http://localhost:8080/api/youtube/videos.php
```

관리자 로그인은 쿠키 세션을 사용하므로 프론트 주소가 `CORS_ALLOWED_ORIGINS`에 포함되어 있어야 합니다.

---

## 19. Git 사용법

### 최신 코드 받기

```powershell
git pull
```

### 변경사항 확인

```powershell
git status
```

### 변경사항 커밋

```powershell
git add .
git commit -m "작업 내용 메시지"
```

### GitHub에 올리기

```powershell
git push
```

### 다른 PC에서 작업 시작 전

```powershell
cd C:\dev\projects\bdproduction-site
git pull origin main
```

---

## 20. GitHub에 올리면 안 되는 파일

아래 파일은 절대 GitHub에 올리지 않습니다.

```txt
backend/.env
frontend/.env
backend/vendor/
backend/storage/*.json
frontend/node_modules/
frontend/dist/
```

현재 `.gitignore`에 의해 제외됩니다.

실제 비밀번호와 API Key는 GitHub가 아니라 별도 보안 채널로 전달해야 합니다.

커밋 전에는 항상 확인합니다.

```powershell
git status --short
```

여기에 `backend/.env`, `frontend/.env`, `backend/storage/*.json`이 보이면 커밋하지 않습니다.

---

## 21. 개발자 온보딩 요약

새 개발자는 아래 순서대로 실행하면 됩니다.

```powershell
git clone https://github.com/qjdldhsl12333-lang/bdproduction-site.git
cd bdproduction-site

copy backend\.env.example backend\.env

cd frontend
copy .env.example .env
npm install
npm run dev

cd ..\backend
composer install
```

다른 PowerShell에서:

```powershell
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public
```

DB는 MariaDB에서 `database/schema.sql`을 실행해야 합니다.

---

## 22. 제안서 기준 현재 진행 상태

제안서 전체 목표는 **포트폴리오 · 영상 의뢰 · 상담 · 결제 · 납품 원스톱 플랫폼**입니다.

현재 구현은 Phase 1 브랜드 홈페이지와 문의 자동화 기반 작업에 집중되어 있습니다.

```txt
Phase 1 브랜드 홈페이지: 약 70~80% 완료
제안서 전체 기준: 약 30~40% 완료
```

### 완료 또는 거의 완료

```txt
React SPA 기본 구조
3D Studio Showroom
Portfolio 썸네일 그리드 + 모달 구조
PHP Contact Form + MariaDB 저장 + 이메일 발송
관리자 로그인 / 문의 관리
관리자 상세 모달
문의 스팸 방지 1차
YouTube API 연동 틀
Notion API 연동 틀
GitHub 협업 구조
```

### 실제 정보 대기

```txt
YouTube API Key / Playlist ID
Notion Integration Token / Data Source ID 또는 Database ID
쇼릴 영상 파일
```

### 미시작 또는 Phase 2 이후

```txt
Naver / Google 소셜 로그인
진행 현황 마이페이지
후불 결제 시스템
영수 내역 마이페이지
비공개 시사 링크
Google Drive API 연동
포트폴리오 CMS
YouTube Cron Job
SEO / OG 태그
Cloudways 배포
```

---

## 23. 현재 개발 상태

```txt
완료:
- React/Vite 기본 홈페이지
- 3D Studio Showroom
- 문의 폼
- 문의 스팸 방지 1차
- MariaDB 저장
- SMTP 이메일 알림
- 관리자 로그인
- 관리자 문의 관리
- 관리자 상세 모달
- 보관 / 복구
- 관리자 보안 잠금 구조
- YouTube 포트폴리오 연동 틀
- Notion API 연동 틀
- GitHub 공유 / README / 노트북 개발환경 세팅

대기:
- 실제 YouTube API Key / Playlist ID 연결
- 실제 Notion Integration Token / DB ID 연결
- 쇼릴 영상 파일 연결
- Google Drive API 연동
- 포트폴리오 CMS
- 결제 시스템
- 마이페이지
- SEO / OG 태그
- 배포 환경 구성
```
