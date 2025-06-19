const express = require('express');
const router = express.Router();
const { Word, WordGroup } = require('../models');
const { Op } = require('sequelize');
const { validateWords } = require('../utils/wordValidator');
const { sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 단어 등록
router.post('/', async (req, res) => {
  const { groupId, english, korean } = req.body;
  
  if (!groupId || !english || !korean) {
    return res.status(400).json({ message: '그룹 ID, 영어 단어, 한글 해석이 모두 필요합니다.' });
  }
  
  try {
    // 사용자의 그룹인지 확인
    const group = await WordGroup.findOne({
      where: { 
        id: groupId,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 그룹을 찾을 수 없습니다.' });
    }
    
    const word = await Word.create({
      group_id: groupId,
      english,
      korean
    });
    
    res.status(201).json({
      id: word.id,
      groupId,
      english,
      korean,
      message: '단어가 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('단어 등록 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 등록에 실패했습니다.' });
  }
});

// 모든 단어 조회 (사용자별)
router.get('/', async (req, res) => {
  try {
    const words = await Word.findAll({
      include: [
        {
          model: WordGroup,
          as: 'group',
          where: { user_id: req.user.id },
          attributes: ['name']
        }
      ],
      order: [['id', 'DESC']]
    });
    
    // API 응답 형식 맞추기
    const formattedWords = words.map(word => ({
      id: word.id,
      group_id: word.group_id,
      english: word.english,
      korean: word.korean,
      created_at: word.created_at,
      group_name: word.group.name
    }));
    
    res.json(formattedWords);
  } catch (error) {
    console.error('단어 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 조회에 실패했습니다.' });
  }
});

// 특정 그룹의 단어 조회 (사용자별)
router.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  
  try {
    // 사용자의 그룹인지 확인
    const group = await WordGroup.findOne({
      where: { 
        id: groupId,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 그룹을 찾을 수 없습니다.' });
    }
    
    const words = await Word.findAll({
      where: { group_id: groupId },
      order: [['id', 'DESC']]
    });
    
    res.json(words);
  } catch (error) {
    console.error('그룹 단어 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 그룹 단어 조회에 실패했습니다.' });
  }
});

// 단어 검색 (영어 또는 한글) - 사용자별
router.get('/search', async (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.status(400).json({ message: '검색어가 필요합니다.' });
  }
  
  try {
    const words = await Word.findAll({
      where: {
        [Op.or]: [
          { english: { [Op.like]: `%${keyword}%` } },
          { korean: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [
        {
          model: WordGroup,
          as: 'group',
          where: { user_id: req.user.id },
          attributes: ['name']
        }
      ],
      order: [['id', 'DESC']]
    });
    
    // API 응답 형식 맞추기
    const formattedWords = words.map(word => ({
      id: word.id,
      group_id: word.group_id,
      english: word.english,
      korean: word.korean,
      created_at: word.created_at,
      group_name: word.group.name
    }));
    
    res.json(formattedWords);
  } catch (error) {
    console.error('단어 검색 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 검색에 실패했습니다.' });
  }
});

// 단어 수정 (사용자별)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { english, korean, groupId } = req.body;
  
  if (!english || !korean || !groupId) {
    return res.status(400).json({ message: '영어 단어, 한글 해석, 그룹 ID가 모두 필요합니다.' });
  }
  
  try {
    // 사용자의 그룹인지 확인
    const group = await WordGroup.findOne({
      where: { 
        id: groupId,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 그룹을 찾을 수 없습니다.' });
    }
    
    const word = await Word.findOne({
      where: { id: id },
      include: [{
        model: WordGroup,
        as: 'group',
        where: { user_id: req.user.id }
      }]
    });
    
    if (!word) {
      return res.status(404).json({ message: '해당 ID의 단어를 찾을 수 없습니다.' });
    }
    
    await word.update({
      english,
      korean,
      group_id: groupId
    });
    
    res.json({ 
      id, 
      english, 
      korean, 
      groupId, 
      message: '단어가 성공적으로 수정되었습니다.' 
    });
  } catch (error) {
    console.error('단어 수정 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 수정에 실패했습니다.' });
  }
});

// 단어 삭제 (사용자별)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const word = await Word.findOne({
      where: { id: id },
      include: [{
        model: WordGroup,
        as: 'group',
        where: { user_id: req.user.id }
      }]
    });
    
    if (!word) {
      return res.status(404).json({ message: '해당 ID의 단어를 찾을 수 없습니다.' });
    }
    
    await word.destroy();
    
    res.json({ message: '단어가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('단어 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 삭제에 실패했습니다.' });
  }
});

// 그룹 단어 AI 검증 (사용자별)
router.post('/validate-group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  
  try {
    // 사용자의 그룹인지 확인
    const group = await WordGroup.findOne({
      where: { 
        id: groupId,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 그룹을 찾을 수 없습니다.' });
    }
    
    // 그룹 내 단어 조회
    const words = await Word.findAll({
      where: { group_id: groupId },
      order: [['id', 'ASC']]
    });
    
    if (words.length === 0) {
      return res.status(400).json({ message: '그룹에 단어가 없습니다.' });
    }
    
    // AI 검증 수행
    const results = await validateWords(words);
    
    res.json({
      groupId,
      groupName: group.name,
      totalWords: words.length,
      results
    });
  } catch (error) {
    console.error('AI 검증 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 AI 검증에 실패했습니다.' });
  }
});

// 단어 일괄 수정 (사용자별)
router.post('/batch-update', async (req, res) => {
  const { words } = req.body;
  
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ message: '수정할 단어 목록이 필요합니다.' });
  }
  
  try {
    const results = await sequelize.transaction(async (t) => {
      const updateResults = [];
      
      for (const wordData of words) {
        const { id, english, korean } = wordData;
        
        if (!id || !english || !korean) continue;
        
        // 사용자의 단어인지 확인
        const word = await Word.findOne({
          where: { id: id },
          include: [{
            model: WordGroup,
            as: 'group',
            where: { user_id: req.user.id }
          }],
          transaction: t
        });
        
        if (word) {
          await word.update({ english, korean }, { transaction: t });
          updateResults.push({
            id,
            english,
            korean,
            updated: true
          });
        }
      }
      
      return updateResults;
    });
    
    res.json({
      updatedCount: results.length,
      results,
      message: `${results.length}개 단어가 성공적으로 수정되었습니다.`
    });
  } catch (error) {
    console.error('단어 일괄 수정 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 일괄 수정에 실패했습니다.' });
  }
});

module.exports = router; 