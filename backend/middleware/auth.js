const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 진행)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      const user = await User.findByPk(decoded.id);
      req.user = user;
    }

    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 