const express = require('express');
const router = express.Router();
const { Word, TestResult, WordGroup, sequelize } = require('../models');
const { evaluateAnswer } = require('../utils/openaiUtils');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 테스트용 단어 가져오기 (사용자별)
router.get('/words/:groupId/:count', async (req, res) => {
  const { groupId, count } = req.params;
  
  if (!groupId || !count) {
    return res.status(400).json({ message: '그룹 ID와 문제 수가 필요합니다.' });
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
    
    // 해당 그룹의 단어 개수 확인
    const totalWords = await Word.count({
      where: { group_id: groupId }
    });
    
    const requestedCount = parseInt(count);
    
    // 요청한 문제 수가 전체 단어 수보다 많으면 전체 단어 반환
    const wordCount = Math.min(totalWords, requestedCount);
    
    if (wordCount === 0) {
      return res.status(404).json({ message: '해당 그룹에 단어가 없습니다.' });
    }
    
    // 랜덤하게 단어 선택
    const words = await Word.findAll({
      where: { group_id: groupId },
      order: sequelize.literal('RAND()'),
      limit: wordCount
    });
    
    res.json({
      groupId,
      totalWords: wordCount,
      words
    });
  } catch (error) {
    console.error('테스트 단어 가져오기 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 테스트 단어 가져오기에 실패했습니다.' });
  }
});

// 테스트 결과 저장 (사용자별)
router.post('/results', async (req, res) => {
  const { groupId, totalQuestions, correctAnswers } = req.body;
  
  if (!groupId || !totalQuestions || correctAnswers === undefined) {
    return res.status(400).json({ message: '그룹 ID, 전체 문제 수, 정답 수가 모두 필요합니다.' });
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
    
    const testResult = await TestResult.create({
      user_id: req.user.id,
      group_id: groupId,
      total_questions: totalQuestions,
      correct_answers: correctAnswers
    });
    
    res.status(201).json({
      id: testResult.id,
      groupId,
      totalQuestions,
      correctAnswers,
      score: `${correctAnswers}/${totalQuestions}`,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      message: '테스트 결과가 성공적으로 저장되었습니다.'
    });
  } catch (error) {
    console.error('테스트 결과 저장 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 테스트 결과 저장에 실패했습니다.' });
  }
});

// AI 채점을 통한 테스트 결과 평가 및 저장 (사용자별)
router.post('/ai-evaluation', async (req, res) => {
  const { groupId, answers } = req.body;
  
  if (!groupId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: '그룹 ID와 답변 배열이 필요합니다.' });
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
    
    const evaluationResults = [];
    let correctCount = 0;
    
    // 각 답변에 대해 AI 평가 진행
    for (const answer of answers) {
      const { wordId, english, expected, userAnswer } = answer;
      
      // AI 평가 수행
      const evaluation = await evaluateAnswer(english, expected, userAnswer);
      
      // 정답 개수 계산
      if (evaluation.isCorrect) {
        correctCount++;
      }
      
      evaluationResults.push({
        wordId,
        english,
        expected,
        userAnswer,
        isCorrect: evaluation.isCorrect,
        explanation: evaluation.explanation,
        example: evaluation.example,
        exampleTranslation: evaluation.exampleTranslation
      });
    }
    
    // 테스트 결과 저장
    const testResult = await TestResult.create({
      user_id: req.user.id,
      group_id: groupId,
      total_questions: answers.length,
      correct_answers: correctCount
    });
    
    res.status(201).json({
      id: testResult.id,
      groupId,
      totalQuestions: answers.length,
      correctAnswers: correctCount,
      score: `${correctCount}/${answers.length}`,
      percentage: Math.round((correctCount / answers.length) * 100),
      evaluations: evaluationResults,
      message: 'AI 채점이 성공적으로 완료되었습니다.'
    });
  } catch (error) {
    console.error('AI 채점 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 AI 채점에 실패했습니다.' });
  }
});

// 특정 그룹 테스트 기록 조회 (사용자별)
router.get('/history/:groupId', async (req, res) => {
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
    
    const testResults = await TestResult.findAll({
      where: { 
        group_id: groupId,
        user_id: req.user.id 
      },
      include: [
        {
          model: WordGroup,
          as: 'group',
          attributes: ['name']
        }
      ],
      order: [['test_date', 'DESC']]
    });
    
    // API 응답 형식 맞추기
    const formattedResults = testResults.map(result => ({
      id: result.id,
      group_id: result.group_id,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      test_date: result.test_date,
      group_name: result.group.name
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('테스트 기록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 테스트 기록 조회에 실패했습니다.' });
  }
});

// 모든 테스트 기록 조회 (사용자별)
router.get('/history', async (req, res) => {
  try {
    const testResults = await TestResult.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: WordGroup,
          as: 'group',
          where: { user_id: req.user.id },
          attributes: ['name']
        }
      ],
      order: [['test_date', 'DESC']]
    });
    
    // API 응답 형식 맞추기
    const formattedResults = testResults.map(result => ({
      id: result.id,
      group_id: result.group_id,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      test_date: result.test_date,
      group_name: result.group.name
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('테스트 기록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류로 테스트 기록 조회에 실패했습니다.' });
  }
});

module.exports = router; 