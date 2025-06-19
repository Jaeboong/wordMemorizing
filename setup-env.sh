#!/bin/bash

# 환경 변수 설정 스크립트
# 사용법: ./setup-env.sh

set -e

echo "=== 환경 변수 설정 ==="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 설정 변수
PROJECT_DIR="/home/$(whoami)/word-memorization-app"
DOMAIN="danamsi.site"
BACKEND_PORT=5000
FRONTEND_PORT=3000

# 프로젝트 디렉토리로 이동
cd $PROJECT_DIR

log_info "환경 변수를 설정합니다..."

# 사용자 입력 받기
echo ""
read -p "OpenAI API 키를 입력하세요: " OPENAI_API_KEY
read -p "카카오 클라이언트 ID를 입력하세요: " KAKAO_CLIENT_ID
read -p "카카오 클라이언트 시크릿을 입력하세요 (선택사항): " KAKAO_CLIENT_SECRET
read -p "JWT 시크릿을 입력하세요: " JWT_SECRET
read -p "세션 시크릿을 입력하세요: " SESSION_SECRET

# 환경 변수 파일 생성
log_info "환경 변수 파일 생성 중..."
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

# 프론트엔드 URL (프로덕션)
FRONTEND_URL=http://$DOMAIN:$FRONTEND_PORT

# OpenAI API 키
OPENAI_API_KEY=$OPENAI_API_KEY

# 카카오 로그인 (프로덕션)
KAKAO_CLIENT_ID=$KAKAO_CLIENT_ID
KAKAO_CLIENT_SECRET=$KAKAO_CLIENT_SECRET
KAKAO_CALLBACK_URL=http://$DOMAIN:$BACKEND_PORT/api/auth/kakao/callback

# JWT 및 세션 설정
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
EOF

# 파일 권한 설정 (보안)
chmod 600 backend/.env

log_success "환경 변수 파일이 성공적으로 생성되었습니다!"
log_warning "보안상 이 파일은 Git에 커밋하지 마세요."

echo ""
log_info "설정된 환경 변수:"
echo "- OpenAI API Key: ${OPENAI_API_KEY:0:10}..."
echo "- Kakao Client ID: ${KAKAO_CLIENT_ID:0:10}..."
echo "- JWT Secret: ${JWT_SECRET:0:10}..."
echo "- Session Secret: ${SESSION_SECRET:0:10}..."

echo ""
log_success "환경 변수 설정 완료! 이제 deploy.sh를 실행할 수 있습니다." 