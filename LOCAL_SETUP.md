# 로컬 개발 환경 설정

## 포트 구성
- **프론트엔드**: 4000 (서버의 3000과 구분)
- **백엔드**: 6000 (서버의 5000과 구분)  
- **데이터베이스**: 3311 (Docker Compose, 서버의 3309와 구분)
- **phpMyAdmin**: 9011 (DB 관리용)

## 자동 실행 (추천)
```bash
# 프로젝트 루트에서
start-local.bat
```

## 수동 실행

### 1. Docker Compose로 DB 시작
```bash
docker-compose up -d
```

### 2. 백엔드 서버 (새 터미널)
```bash
cd backend
set PORT=6000
set FRONTEND_URL=http://localhost:4000
set KAKAO_CALLBACK_URL=http://localhost:6000/api/auth/kakao/callback
set DB_PORT=3311
npm run dev
```

### 3. 프론트엔드 서버 (새 터미널)
```bash
cd frontend
set PORT=4000
set REACT_APP_API_URL=http://localhost:6000/api
npm start
```

## PowerShell 사용시

### 1. Docker Compose
```powershell
docker-compose up -d
```

### 2. 백엔드 서버
```powershell
cd backend
$env:PORT=6000
$env:FRONTEND_URL="http://localhost:4000"
$env:KAKAO_CALLBACK_URL="http://localhost:6000/api/auth/kakao/callback"
$env:DB_PORT=3311
npm run dev
```

### 3. 프론트엔드 서버
```powershell
cd frontend
$env:PORT=4000
$env:REACT_APP_API_URL="http://localhost:6000/api"
npm start
```

## 로컬 데이터베이스 정보

Docker Compose를 사용한 MariaDB:

### 연결 정보
- **Host**: localhost
- **Port**: 3311
- **Database**: word
- **User**: word1234
- **Password**: word1234
- **Root Password**: 1234

### phpMyAdmin 접속
- **URL**: http://localhost:9011
- **사용자명**: word1234
- **비밀번호**: word1234

## 접속 주소
- **프론트엔드**: http://localhost:4000
- **백엔드**: http://localhost:6000
- **API**: http://localhost:6000/api
- **phpMyAdmin**: http://localhost:9011

## Docker 관리 명령어
```bash
# DB 시작
docker-compose up -d

# DB 중지
docker-compose down

# DB 완전 삭제 (데이터 포함)
docker-compose down -v

# 로그 확인
docker-compose logs
```

## 카카오 개발자 콘솔 설정
로컬 테스트용 리다이렉트 URI 추가:
```
http://localhost:6000/api/auth/kakao/callback
``` 