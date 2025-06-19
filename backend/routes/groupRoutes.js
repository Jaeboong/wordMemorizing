const express = require('express');
const router = express.Router();
const { WordGroup, Word, sequelize } = require('../models');
const { Op } = require('sequelize');
const { validateWords } = require('../utils/wordValidator');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 그룹 생성
router.post('/', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: '그룹 이름이 필요합니다.' });
  }
  
  try {
    const group = await WordGroup.create({ 
      name, 
      user_id: req.user.id 
    });
    
    res.status(201).json({
      id: group.id,
      name,
      message: '그룹이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('그룹 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 그룹 생성에 실패했습니다.' });
  }
});

// AI로 그룹 내 단어 검증
router.get('/:id/validate', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 사용자의 그룹인지 확인
    const group = await WordGroup.findOne({
      where: { 
        id: id,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 ID의 그룹을 찾을 수 없습니다.' });
    }
    
    // 그룹 내 모든 단어 가져오기
    const words = await Word.findAll({
      where: { group_id: id },
      attributes: ['id', 'english', 'korean']
    });
    
    if (words.length === 0) {
      return res.status(404).json({ message: '해당 그룹에 단어가 없습니다.' });
    }
    
    // AI로 단어 검증
    const validationResults = await validateWords(words);
    console.log('검증 결과 전체:', JSON.stringify(validationResults, null, 2));
    
    // 잘못된 매칭이 있는 단어 또는 개선이 필요한 단어 필터링
    // isCorrect가 false인 경우 포함
    const problemWords = validationResults.filter(result => 
      !result.isCorrect
    );
    
    console.log('문제가 있는 단어 수:', problemWords.length);
    
    res.json({
      groupId: id,
      groupName: group.name,
      totalWords: words.length,
      problemCount: problemWords.length,
      results: problemWords
    });
  } catch (error) {
    console.error('AI 단어 검증 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 AI 단어 검증에 실패했습니다.' });
  }
});

// AI 검증 결과에 따라 단어 일괄 수정
router.post('/:id/update-words', async (req, res) => {
  const { id } = req.params;
  const { words } = req.body;
  
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ message: '수정할 단어 목록이 필요합니다.' });
  }
  
  try {
    // 사용자의 그룹인지 확인
    const group = await WordGroup.findOne({
      where: { 
        id: id,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 ID의 그룹을 찾을 수 없습니다.' });
    }
    
    console.log('수정할 단어 목록:', JSON.stringify(words, null, 2));
    
    // 트랜잭션 내에서 단어 수정
    const result = await sequelize.transaction(async (t) => {
      const updateResults = [];
      
      for (const wordData of words) {
        // 널 체크 및 기본값 설정
        const wordId = wordData.id;
        const suggestedEnglish = wordData.suggestedEnglish || null;
        const suggestedKorean = wordData.suggestedKorean || null;
        // correctionType이 없으면 기본적으로 '수정'으로 처리
        const correctionType = wordData.correctionType || '수정';
        
        if (!wordId || (!suggestedEnglish && !suggestedKorean)) continue;
        
        const word = await Word.findByPk(wordId, { transaction: t });
        
        if (word && word.group_id.toString() === id) {
          const oldEnglish = word.english;
          const oldKorean = word.korean;
          
          console.log(`처리 중인 단어 ID ${wordId}: `, {
            oldEnglish,
            suggestedEnglish,
            oldKorean,
            suggestedKorean,
            correctionType
          });
          
          let englishChanged = false;
          let koreanChanged = false;
          
          // 영어 단어 수정 (제안된 영어가 있고 현재 영어와 다른 경우)
          if (suggestedEnglish && suggestedEnglish !== oldEnglish) {
            console.log(`영어 단어 수정: ${oldEnglish} -> ${suggestedEnglish}`);
            word.english = suggestedEnglish;
            englishChanged = true;
          }
          
          // 한글 의미 처리
          if (suggestedKorean) {
            // 의미 추가인 경우 기존 의미에 추가
            if (correctionType === '추가') {
              // 이미 같은 내용이 있는지 확인하고, 없으면 추가
              if (!oldKorean.includes(suggestedKorean)) {
                word.korean = oldKorean.trim() + ', ' + suggestedKorean.trim();
                console.log('추가 후 결과:', word.korean);
                koreanChanged = true;
              } else {
                console.log('이미 포함된 내용, 추가하지 않음');
              }
            } 
            // 수정인 경우 또는 기타 경우 대체
            else {
              // 한글 뜻이 다른 경우에만 수정
              if (oldKorean !== suggestedKorean) {
                word.korean = suggestedKorean;
                console.log('수정 후 결과:', word.korean);
                koreanChanged = true;
              } else {
                console.log('한글 뜻이 동일하여 수정하지 않음');
              }
            }
          }
          
          if (englishChanged || koreanChanged) {
            await word.save({ transaction: t });
            console.log(`단어 ID ${wordId} 저장 완료: 영어 변경=${englishChanged}, 한글 변경=${koreanChanged}`);
            
            updateResults.push({
              id: wordId,
              oldEnglish,
              newEnglish: word.english,
              englishChanged,
              oldKorean,
              newKorean: word.korean,
              koreanChanged,
              correctionType
            });
          } else {
            console.log(`단어 ID ${wordId}: 변경사항 없음`);
          }
        }
      }
      
      return updateResults;
    });
    
    console.log('업데이트 결과:', JSON.stringify(result, null, 2));
    
    res.json({
      groupId: id,
      updatedCount: result.length,
      updatedWords: result,
      message: `${result.length}개 단어가 성공적으로 수정되었습니다.`
    });
  } catch (error) {
    console.error('단어 일괄 수정 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 일괄 수정에 실패했습니다.' });
  }
});

// 모든 그룹 조회 (사용자별)
router.get('/', async (req, res) => {
  try {
    const groups = await WordGroup.findAll({
      where: { user_id: req.user.id },
      attributes: {
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM words WHERE words.group_id = WordGroup.id)'),
            'word_count'
          ]
        ]
      },
      order: [['created_at', 'DESC']]
    });
    
    res.json(groups);
  } catch (error) {
    console.error('그룹 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 그룹 조회에 실패했습니다.' });
  }
});

// 특정 그룹 조회 (사용자별)
router.get('/:id', async (req, res) => {
  try {
    const group = await WordGroup.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      },
      include: [{
        model: Word,
        as: 'words',
        order: [['created_at', 'DESC']]
      }]
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 ID의 그룹을 찾을 수 없습니다.' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('그룹 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 그룹 조회에 실패했습니다.' });
  }
});

// 그룹 수정 (사용자별)
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: '그룹 이름이 필요합니다.' });
  }
  
  try {
    const group = await WordGroup.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 ID의 그룹을 찾을 수 없습니다.' });
    }
    
    await group.update({ name });
    
    res.json({
      id: group.id,
      name: group.name,
      message: '그룹이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('그룹 수정 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 그룹 수정에 실패했습니다.' });
  }
});

// 그룹 삭제 (사용자별)
router.delete('/:id', async (req, res) => {
  try {
    const group = await WordGroup.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });
    
    if (!group) {
      return res.status(404).json({ message: '해당 ID의 그룹을 찾을 수 없습니다.' });
    }
    
    // 그룹과 관련된 단어들도 함께 삭제
    await sequelize.transaction(async (t) => {
      await Word.destroy({
        where: { group_id: req.params.id },
        transaction: t
      });
      
      await group.destroy({ transaction: t });
    });
    
    res.json({ message: '그룹과 관련 단어들이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('그룹 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 그룹 삭제에 실패했습니다.' });
  }
});

module.exports = router; 