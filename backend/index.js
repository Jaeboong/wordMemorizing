require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const wordRoutes = require('./routes/wordRoutes');
const groupRoutes = require('./routes/groupRoutes');
const testRoutes = require('./routes/testRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
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