const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// 카카오 로그인 시작
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', { session: false }),
  (req, res) => {
    try {
      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          id: req.user.id, 
          kakaoId: req.user.kakaoId,
          nickname: req.user.nickname 
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      // 프론트엔드로 토큰과 함께 리다이렉트
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}`);
    } catch (error) {
      console.error('카카오 로그인 콜백 오류:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

// 로그아웃
router.post('/logout', (req, res) => {
  res.json({ message: '로그아웃되었습니다.' });
});

// 사용자 정보 조회 (JWT 토큰 필요)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      id: user.id,
      kakaoId: user.kakaoId,
      nickname: user.nickname
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
});

module.exports = router; 