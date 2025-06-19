const express = require('express');
const router = express.Router();
const { UserPreference } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 설정 값 조회 (사용자별)
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  
  try {
    const preference = await UserPreference.findOne({
      where: { 
        preference_key: key,
        user_id: req.user.id 
      }
    });
    
    if (!preference) {
      return res.status(404).json({ message: '설정을 찾을 수 없습니다.' });
    }
    
    res.json({ key: preference.preference_key, value: preference.preference_value });
  } catch (error) {
    console.error('설정 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 설정 조회에 실패했습니다.' });
  }
});

// 설정 값 저장/수정 (사용자별)
router.post('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  if (!value) {
    return res.status(400).json({ message: '설정 값이 필요합니다.' });
  }
  
  try {
    // 이미 존재하는 설정인지 확인
    const [preference, created] = await UserPreference.findOrCreate({
      where: { 
        preference_key: key,
        user_id: req.user.id 
      },
      defaults: { 
        preference_key: key,
        preference_value: value,
        user_id: req.user.id
      }
    });
    
    // 기존 설정이 있으면 업데이트
    if (!created) {
      preference.preference_value = value;
      await preference.save();
    }
    
    res.json({ 
      key: preference.preference_key, 
      value: preference.preference_value, 
      created
    });
  } catch (error) {
    console.error('설정 저장 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 설정 저장에 실패했습니다.' });
  }
});

// 모든 설정 조회 (사용자별)
router.get('/', async (req, res) => {
  try {
    const preferences = await UserPreference.findAll({
      where: { user_id: req.user.id }
    });
    
    const result = preferences.map(pref => ({
      key: pref.preference_key,
      value: pref.preference_value
    }));
    
    res.json(result);
  } catch (error) {
    console.error('설정 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 설정 목록 조회에 실패했습니다.' });
  }
});

module.exports = router; 