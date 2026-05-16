# BDPRODUCTION Site MVP

BDPRODUCTION 공식 웹사이트 + 프로덕션 플랫폼 MVP입니다.

현재 구현 범위는 **브랜드 홈페이지 / 문의 접수 / MariaDB 저장 / 관리자 문의 관리 / SMTP 이메일 알림 / YouTube 포트폴리오 연동 준비**까지입니다.

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

### 주요 기능

- BDPRODUCTION 브랜드 홈페이지
- 3D Studio Showroom 섹션
- Contact Form 문의 접수
- MariaDB 문의 저장
- SMTP 이메일 알림
- 관리자 로그인 / 로그아웃
- 관리자 문의 목록
- 검색 / 필터
- 상태 변경: 신규 / 확인 완료 / 처리 완료
- 보관 / 보관함 / 복구
- 관리자 로그인 실패 제한
- 이메일 잠금 해제 코드 구조
- YouTube 포트폴리오 API 연동 준비
- YouTube 캐시 테이블 구조 준비

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
│  │  ├─ db.php
│  │  ├─ env.php
│  │  ├─ mailer.php
│  │  └─ youtube.php
│  └─ public/
│     ├─ index.php
│     └─ api/
│        ├─ contact.php
│        ├─ admin/
│        └─ youtube/
├─ database/
│  └─ schema.sql
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ public/
│  └─ src/
│     ├─ App.jsx
│     ├─ components/
│     └─ styles/
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

---

## 5. Frontend 설치 및 실행

```powershell
cd frontend
npm install
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

MariaDB 콘솔에서:

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
```

`MAIL_ENABLED=false`이면 `mailStatus`는 `skipped`가 정상입니다.

---

## 12. 관리자 기능

관리자 화면:

```txt
http://localhost:5173/admin
```

관리자 기능:

```txt
문의 목록 조회
검색
상태별 필터
신규 / 확인 / 완료 상태 변경
보관
보관함 보기
복구
로그아웃
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

## 14. YouTube 포트폴리오 연동 준비

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

## 15. 3D Studio Showroom 영상 연결

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

## 16. 자주 쓰는 실행 명령어

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

---

## 17. Git 사용법

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

---

## 18. GitHub에 올리면 안 되는 파일

아래 파일은 절대 GitHub에 올리지 않습니다.

```txt
backend/.env
backend/vendor/
backend/storage/*.json
frontend/node_modules/
frontend/dist/
```

현재 `.gitignore`에 의해 제외됩니다.

실제 비밀번호와 API Key는 GitHub가 아니라 별도 보안 채널로 전달해야 합니다.

---

## 19. 개발자 온보딩 요약

새 개발자는 아래 순서대로 실행하면 됩니다.

```powershell
git clone https://github.com/qjdldhsl12333-lang/bdproduction-site.git
cd bdproduction-site

copy backend\.env.example backend\.env

cd backend
composer install

cd ..\frontend
npm install
npm run dev
```

다른 PowerShell에서:

```powershell
cd C:\dev\projects\bdproduction-site
php -S localhost:8080 -t backend\public
```

DB는 MariaDB에서 `database/schema.sql`을 실행해야 합니다.

---

## 20. 현재 개발 상태

```txt
완료:
- React/Vite 기본 홈페이지
- 3D Studio Showroom
- 문의 폼
- MariaDB 저장
- SMTP 이메일 알림
- 관리자 로그인
- 관리자 문의 관리
- 보관 / 복구
- 관리자 보안 잠금 구조
- YouTube 포트폴리오 연동 틀

대기:
- 실제 YouTube API Key / Playlist ID 연결
- Notion API 연동
- Google Drive API 연동
- 포트폴리오 CMS
- 결제 시스템
- 마이페이지
- 배포 환경 구성
```
