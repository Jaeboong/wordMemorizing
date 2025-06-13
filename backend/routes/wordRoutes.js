const express = require('express');
const router = express.Router();
const { Word, WordGroup } = require('../models');
const { Op } = require('sequelize');
const { validateWords } = require('../utils/wordValidator');
const { sequelize } = require('../models');

// 단어 등록
router.post('/', async (req, res) => {
  const { groupId, english, korean } = req.body;
  
  if (!groupId || !english || !korean) {
    return res.status(400).json({ message: '그룹 ID, 영어 단어, 한글 해석이 모두 필요합니다.' });
  }
  
  try {
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

// 모든 단어 조회
router.get('/', async (req, res) => {
  try {
    const words = await Word.findAll({
      include: [
        {
          model: WordGroup,
          as: 'group',
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

// 특정 그룹의 단어 조회
router.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  
  try {
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

// 단어 검색 (영어 또는 한글)
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

// 단어 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { english, korean, groupId } = req.body;
  
  if (!english || !korean || !groupId) {
    return res.status(400).json({ message: '영어 단어, 한글 해석, 그룹 ID가 모두 필요합니다.' });
  }
  
  try {
    const word = await Word.findByPk(id);
    
    if (!word) {
      return res.status(404).json({ message: '해당 ID의 단어를 찾을 수 없습니다.' });
    }
    
    word.english = english;
    word.korean = korean;
    word.group_id = groupId;
    
    await word.save();
    
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

// 단어 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const word = await Word.findByPk(id);
    
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

// 그룹 단어 AI 검증
router.post('/validate-group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  
  try {
    // 그룹 존재 여부 확인
    const group = await WordGroup.findByPk(groupId);
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
    
    // 단어 AI 검증
    const wordData = words.map(word => ({
      id: word.id,
      english: word.english,
      korean: word.korean
    }));
    
    const validationResults = await validateWords(wordData);
    console.log('검증 결과 전체:', JSON.stringify(validationResults, null, 2));
    
    // 문제가 있는 단어만 필터링 (isCorrect가 false인 것)
    const problemWords = validationResults.filter(result => !result.isCorrect);
    console.log('문제가 있는 단어 수:', problemWords.length);
    
    res.json({
      groupId,
      groupName: group.name,
      totalWords: words.length,
      problemCount: problemWords.length,
      results: problemWords
    });
  } catch (error) {
    console.error('단어 AI 검증 중 오류 발생:', error);
    res.status(500).json({ 
      message: '서버 오류로 단어 검증에 실패했습니다.', 
      error: error.message 
    });
  }
});

// 단어 일괄 수정 (AI 검증 결과 반영)
router.post('/update-batch', async (req, res) => {
  const { words } = req.body;
  
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ message: '수정할 단어 목록이 필요합니다.' });
  }
  
  console.log('수정할 단어 목록:', JSON.stringify(words, null, 2));
  
  try {
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
        
        if (word) {
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
      updatedCount: result.length,
      updatedWords: result,
      message: `${result.length}개 단어가 성공적으로 수정되었습니다.`
    });
  } catch (error) {
    console.error('단어 일괄 수정 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 단어 일괄 수정에 실패했습니다.' });
  }
});

module.exports = router; 