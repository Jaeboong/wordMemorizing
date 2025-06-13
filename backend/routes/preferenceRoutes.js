const express = require('express');
const router = express.Router();
const { UserPreference } = require('../models');

// 설정 값 조회
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  
  try {
    const preference = await UserPreference.findOne({
      where: { preference_key: key }
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

// 설정 값 저장/수정
router.post('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  if (!value) {
    return res.status(400).json({ message: '설정 값이 필요합니다.' });
  }
  
  try {
    // 이미 존재하는 설정인지 확인
    const [preference, created] = await UserPreference.findOrCreate({
      where: { preference_key: key },
      defaults: { 
        preference_key: key,
        preference_value: value
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

// 모든 설정 조회
router.get('/', async (req, res) => {
  try {
    const preferences = await UserPreference.findAll();
    
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