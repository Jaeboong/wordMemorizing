#!/bin/bash

# 단어 암기 앱 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 에러 발생 시 스크립트 중단

echo "=== 단어 암기 앱 배포 시작 ==="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 변수
PROJECT_DIR="/home/$(whoami)/Project/wordMemorizing"
FRONTEND_PORT=3000
BACKEND_PORT=5000
DOMAIN="danamsi.site"
PUBLIC_IP="1.247.204.214:22222"

# 함수 정의
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 프로젝트 디렉토리로 이동
log_info "프로젝트 디렉토리로 이동: $PROJECT_DIR"
cd $PROJECT_DIR || { log_error "프로젝트 디렉토리를 찾을 수 없습니다: $PROJECT_DIR"; exit 1; }

# 2. Git에서 최신 코드 가져오기
log_info "Git에서 최신 코드 가져오기..."
git fetch origin
git reset --hard origin/main
log_success "최신 코드 업데이트 완료"

# 3. 기존 프로세스 종료
log_info "기존 프로세스 종료..."
pkill -f "node.*index.js" || log_warning "실행 중인 백엔드 프로세스가 없습니다"
pkill -f "react-scripts" || log_warning "실행 중인 프론트엔드 프로세스가 없습니다"
pkill -f "npm.*start" || log_warning "실행 중인 npm 프로세스가 없습니다"
sleep 2

# 4. Node.js 버전 확인
log_info "Node.js 버전 확인..."
node --version
npm --version

# 5. 환경 변수 파일 생성 (프로덕션용)
log_info "환경 변수 파일 설정..."
cat > backend/.env << EOF
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3309
DB_USER=word1234
DB_PASSWORD=word1234
DB_DATABASE=word

# 서버 설정
PORT=5000
NODE_ENV=production

EOF

log_success "환경 변수 파일 생성 완료"

# 6. 의존성 설치
log_info "의존성 설치 중..."

# 루트 의존성 설치
log_info "루트 의존성 설치..."
npm install

# 백엔드 의존성 설치
log_info "백엔드 의존성 설치..."
cd backend
npm install
cd ..

# 프론트엔드 의존성 설치
log_info "프론트엔드 의존성 설치..."
cd frontend
npm install
cd ..

log_success "모든 의존성 설치 완료"

# 7. 프론트엔드 빌드
log_info "프론트엔드 빌드 중..."
cd frontend

# React 앱의 API URL을 프로덕션 환경으로 설정
# Nginx 사용 시: http://$DOMAIN/api
# 직접 접근 시: http://$DOMAIN:$BACKEND_PORT/api
cat > .env << EOF
REACT_APP_API_URL=http://$DOMAIN/api
GENERATE_SOURCEMAP=false
EOF

npm run build
log_success "프론트엔드 빌드 완료"
cd ..

# 8. 데이터베이스 연결 확인
log_info "데이터베이스 연결 확인..."
cd backend
timeout 10s node -e "
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => {
    console.log('데이터베이스 연결 성공');
    process.exit(0);
  })
  .catch((error) => {
    console.error('데이터베이스 연결 실패:', error);
    process.exit(1);
  });
" || log_warning "데이터베이스 연결 확인 시간 초과"
cd ..

# 9. PM2 설치 확인 및 설치
if ! command -v pm2 &> /dev/null; then
    log_info "PM2 설치 중..."
    npm install -g pm2
fi

# 10. PM2 ecosystem 파일 생성
log_info "PM2 설정 파일 생성..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'word-backend',
      script: './backend/index.js',
      cwd: '$PROJECT_DIR',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'word-frontend',
      script: 'serve',
      args: '-s build -l $FRONTEND_PORT',
      cwd: '$PROJECT_DIR/frontend',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# 11. serve 패키지 설치 (프론트엔드 정적 파일 서빙용)
log_info "serve 패키지 설치..."
npm install -g serve

# 12. 로그 디렉토리 생성
mkdir -p logs

# 13. PM2로 애플리케이션 시작
log_info "PM2로 애플리케이션 시작..."

# 기존 PM2 프로세스 중지 및 삭제
pm2 delete word-backend word-frontend 2>/dev/null || log_warning "기존 PM2 프로세스가 없습니다"

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js

# PM2 프로세스 저장
pm2 save

# PM2 시스템 부팅 시 자동 시작 설정
pm2 startup

log_success "애플리케이션이 성공적으로 배포되었습니다!"

# 14. 배포 결과 확인
log_info "배포 상태 확인..."
pm2 status

echo ""
log_success "=== 배포 완료 ==="
echo -e "${GREEN}프론트엔드:${NC} http://$DOMAIN:$FRONTEND_PORT"
echo -e "${GREEN}백엔드 API:${NC} http://$DOMAIN:$BACKEND_PORT"
echo -e "${GREEN}공인 IP:${NC} http://$PUBLIC_IP"
echo ""
echo -e "${YELLOW}유용한 명령어:${NC}"
echo "- PM2 상태 확인: pm2 status"
echo "- PM2 로그 확인: pm2 logs"
echo "- PM2 재시작: pm2 restart all"
echo "- PM2 중지: pm2 stop all"
echo "- PM2 삭제: pm2 delete all"
echo ""
log_info "배포 스크립트 실행 완료!" 
