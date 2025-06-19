require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { sequelize } = require('./models');
const wordRoutes = require('./routes/wordRoutes');
const groupRoutes = require('./routes/groupRoutes');
const testRoutes = require('./routes/testRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://danamsi.site',
    'http://danamsi.site',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // HTTPS를 사용할 때는 true로 설정
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7일
  }
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/preferences', preferenceRoutes);

// 데이터베이스 연결 및 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 및 동기화 (force: false는 테이블이 없을 때만 생성)
    await sequelize.sync({ force: false });
    console.log('데이터베이스 연결 및 동기화 완료');

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작 중 오류 발생:', error);
  }
}

startServer(); 