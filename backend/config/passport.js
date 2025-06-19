const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const { User } = require('../models');

// 사용자 정보를 세션에 저장
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 세션에서 사용자 정보를 복원
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// 카카오 로그인 전략
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 카카오 ID로 기존 사용자 확인
    let user = await User.findOne({ where: { kakaoId: profile.id } });

    if (user) {
      // 기존 사용자인 경우 로그인 시간 및 닉네임 업데이트
      await user.update({
        nickname: profile.displayName,
        lastLoginAt: new Date()
      });
    } else {
      // 새로운 사용자 생성
      user = await User.create({
        kakaoId: profile.id,
        nickname: profile.displayName,
        lastLoginAt: new Date()
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

module.exports = passport; 