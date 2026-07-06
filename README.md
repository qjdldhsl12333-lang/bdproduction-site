# BDPRODUCTION Site

BD Production 공식 웹사이트입니다. 프리미엄 영상 제작사 포트폴리오, 제작 문의, 회원 로그인, 관리자 포트폴리오 운영 기능을 포함합니다.

## 운영 도메인

- Canonical URL: https://www.bdproduction.co.kr
- Non-www 도메인: https://bdproduction.co.kr
- HTTP 주소는 HTTPS로 리다이렉트됩니다.
- Non-www 주소는 www 주소로 리다이렉트됩니다.

## 기술 스택

- Frontend: React, Vite
- Backend: PHP
- Database: MySQL
- Hosting: Cloudways
- Deployment: WinSCP 기반 수동 업로드
- Social Login: Google, Kakao, Naver

## 주요 진행 사항

### 1. 도메인 / HTTPS / 캐시

- Cloudways Primary Domain을 www.bdproduction.co.kr 기준으로 정리했습니다.
- bdproduction.co.kr, www.bdproduction.co.kr 모두 SSL 인증서에 포함했습니다.
- Cloudways HTTPS Redirection을 활성화했습니다.
- Cloudways Web Rules에서 non-www → www 301 리다이렉트를 적용했습니다.
- 최종 주소는 https://www.bdproduction.co.kr 하나로 통일했습니다.

### 2. 브랜드 / 헤더

- 신규 BD Production 로고를 반영했습니다.
- 헤더 로고 사이즈와 텍스트 정렬을 조정했습니다.
- BDPRODUCTION 표기를 BD Production으로 변경했습니다.
- 브라우저 타이틀과 주요 브랜드 문구를 최신 표기로 정리했습니다.
- 헤더 우측 액션 버튼 스타일을 블랙 / 라임 톤으로 통일했습니다.
- 프로필 아이콘을 원형 중복 느낌이 없는 UserRound 아이콘으로 교체했습니다.

### 3. 포트폴리오

- 메인 대표작 카드와 전체 포트폴리오 페이지를 정리했습니다.
- 모바일 포트폴리오 카드 깨짐 문제를 수정했습니다.
- 모바일 좌우 이동 버튼을 화살표 스타일로 변경했습니다.
- 슬라이드 인디케이터가 선택 상태에서도 과하게 뚱뚱해지지 않도록 조정했습니다.
- 대표작 가이드 패널을 실제 선택 작품 정보 패널로 변경했습니다.
- 오른쪽 정보 패널의 PLAY FILM 버튼을 실제 영상 모달 실행 기능과 연결했습니다.

### 4. 버튼 시스템

- 공용 BdButton 컴포넌트 기반으로 버튼 마이그레이션을 진행했습니다.
- Raw button 사용을 제거했습니다.
- 관리자 / 포트폴리오 / 헤더 / 인증 모달 버튼 스타일을 순차적으로 정리했습니다.
- CSS 잔여 정리는 기능 안정화 이후 필요한 부분만 제한적으로 진행합니다.

### 5. 관리자 기능

- 관리자 포트폴리오 등록 / 수정 / 삭제 플로우를 정리했습니다.
- 포트폴리오 필드 확장 항목을 반영했습니다.
- 관리자 문의 목록과 상태 표시를 정리했습니다.
- 버튼 패치 이후 생긴 시각적 버그를 단계적으로 보정했습니다.

### 6. 소셜 로그인

- Google 로그인 연동 코드가 준비되어 있습니다.
- Kakao 로그인 연동 코드가 준비되어 있습니다.
- Naver 로그인 연동 코드가 준비되어 있습니다.
- Naver 시작 경로: /api/auth/naver/start.php
- Naver Callback URL: https://www.bdproduction.co.kr/api/auth/naver/callback.php
- Naver 버튼은 VITE_ENABLE_NAVER_LOGIN=true 빌드에서 노출됩니다.

## 로컬 개발

```powershell
cd C:\dev\projects\bdproduction-site
npm --prefix frontend install
npm --prefix frontend run dev
```

## 프로덕션 빌드

```powershell
cd C:\dev\projects\bdproduction-site

$env:VITE_API_BASE_URL="https://www.bdproduction.co.kr"
$env:VITE_ENABLE_GOOGLE_LOGIN="true"
$env:VITE_ENABLE_KAKAO_LOGIN="true"
$env:VITE_ENABLE_NAVER_LOGIN="true"

npm --prefix frontend run build
```

## Cloudways 배포 폴더 갱신

```powershell
cd C:\dev\projects\bdproduction-site

Remove-Item -Recurse -Force deploy_cloudways\public_html\assets -ErrorAction SilentlyContinue
Copy-Item frontend\dist\* deploy_cloudways\public_html -Recurse -Force
Copy-Item frontend\public\.htaccess deploy_cloudways\public_html\.htaccess -Force
```

업로드 대상:

- deploy_cloudways/public_html/index.html
- deploy_cloudways/public_html/assets
- deploy_cloudways/public_html/.htaccess
- 백엔드 변경 시 deploy_cloudways/public_html/api 및 deploy_cloudways/private_html 관련 파일

업로드 후 Cloudways에서 Purge Site Cache를 실행합니다.

## 환경 변수 주의

GitHub에는 실제 .env 값을 올리지 않습니다.

필요한 주요 환경 변수 이름:

- FRONTEND_APP_URL
- VITE_API_BASE_URL
- VITE_ENABLE_GOOGLE_LOGIN
- VITE_ENABLE_KAKAO_LOGIN
- VITE_ENABLE_NAVER_LOGIN
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- KAKAO_CLIENT_ID
- KAKAO_CLIENT_SECRET
- KAKAO_REDIRECT_URI
- NAVER_CLIENT_ID
- NAVER_CLIENT_SECRET
- NAVER_REDIRECT_URI

운영 기준 Naver Callback URL:

- https://www.bdproduction.co.kr/api/auth/naver/callback.php

## 보안 메모

- .env, OAuth Client Secret, 메일 비밀번호, DB 비밀번호는 GitHub에 커밋하지 않습니다.
- 개발 중 로그나 화면 공유로 노출된 OAuth Secret은 운영 전 재발급합니다.
- Cloudways 로그인 제한이 걸린 경우 반복 시도하지 않고 15~30분 대기 후 재시도합니다.

## 현재 운영 체크리스트

- https://www.bdproduction.co.kr 접속 정상
- http://bdproduction.co.kr → https://www.bdproduction.co.kr 리다이렉트 정상
- https://bdproduction.co.kr → https://www.bdproduction.co.kr 리다이렉트 정상
- 메인 포트폴리오 카드 정상
- 전체 포트폴리오 필터 버튼 정상
- 헤더 로고 / 액션 버튼 스타일 정상
- 제작 문의 플로팅 버튼 정상
- 관리자 포트폴리오 수정 후 공개 화면 반영 확인 필요

## Git 관리

작업 완료 후:

```powershell
git status --short
git diff --check
git add -A -- README.md README frontend/src/components/Header.jsx
git commit -m "Update project README and finalize header cleanup"
git push origin main
```
