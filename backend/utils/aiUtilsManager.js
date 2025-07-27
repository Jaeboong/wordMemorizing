const englishUtils = require('./openaiUtils');
const englishValidator = require('./wordValidator');
const generalUtils = require('./generalStudyUtils');
const languageUtils = require('./languageUtils');

// 카테고리 상수 정의
const CATEGORIES = {
  ENGLISH: 'ENGLISH',
  GENERAL: 'GENERAL',
  LANGUAGE_JP: 'LANGUAGE_JP',
  LANGUAGE_CN: 'LANGUAGE_CN',
  SCIENCE: 'SCIENCE',
  HISTORY: 'HISTORY'
};

// 카테고리별 설정
const CATEGORY_CONFIG = {
  [CATEGORIES.ENGLISH]: {
    name: '영어 학습',
    questionLabel: '영어 단어',
    answerLabel: '한글 뜻',
    evaluator: englishUtils,
    validator: englishValidator,
    validatorMethod: 'validateWords'
  },
  [CATEGORIES.GENERAL]: {
    name: '일반 학습',
    questionLabel: '문제',
    answerLabel: '답변',
    evaluator: generalUtils,
    validator: generalUtils,
    validatorMethod: 'validateStudyItems'
  },
  [CATEGORIES.LANGUAGE_JP]: {
    name: '일본어 학습',
    questionLabel: '일본어',
    answerLabel: '한글 뜻',
    evaluator: languageUtils,
    validator: languageUtils,
    validatorMethod: 'validateLanguageItems',
    evaluatorMethod: 'evaluateJapaneseAnswer'
  },
  [CATEGORIES.LANGUAGE_CN]: {
    name: '중국어 학습',
    questionLabel: '중국어',
    answerLabel: '한글 뜻',
    evaluator: languageUtils,
    validator: languageUtils,
    validatorMethod: 'validateLanguageItems',
    evaluatorMethod: 'evaluateChineseAnswer'
  },
  [CATEGORIES.SCIENCE]: {
    name: '과학 학습',
    questionLabel: '문제',
    answerLabel: '답변',
    evaluator: generalUtils,
    validator: generalUtils,
    validatorMethod: 'validateStudyItems'
  },
  [CATEGORIES.HISTORY]: {
    name: '역사 학습',
    questionLabel: '문제',
    answerLabel: '답변',
    evaluator: generalUtils,
    validator: generalUtils,
    validatorMethod: 'validateStudyItems'
  }
};

/**
 * 카테고리가 유효한지 확인
 * @param {string} category - 확인할 카테고리
 * @returns {boolean} - 유효성 여부
 */
const isValidCategory = (category) => {
  return Object.values(CATEGORIES).includes(category);
};

/**
 * 카테고리별 설정 가져오기
 * @param {string} category - 카테고리
 * @returns {Object} - 카테고리 설정
 */
const getCategoryConfig = (category) => {
  if (!isValidCategory(category)) {
    throw new Error(`지원되지 않는 카테고리입니다: ${category}`);
  }
  return CATEGORY_CONFIG[category];
};

/**
 * 카테고리에 맞는 답변 평가 함수
 * @param {string} category - 카테고리
 * @param {string} question - 문제/질문
 * @param {string} expectedAnswer - 정답
 * @param {string} userAnswer - 사용자 답변
 * @returns {Promise<Object>} - 평가 결과
 */
const evaluateAnswer = async (category, question, expectedAnswer, userAnswer) => {
  const config = getCategoryConfig(category);
  
  if (category === CATEGORIES.ENGLISH) {
    // 영어 카테고리는 기존 파라미터 순서 유지 (english, expectedAnswer, userAnswer)
    return await config.evaluator.evaluateAnswer(question, expectedAnswer, userAnswer);
  } else if (config.evaluatorMethod) {
    // 특정 평가 메서드가 있는 경우 (일본어, 중국어 등)
    return await config.evaluator[config.evaluatorMethod](question, expectedAnswer, userAnswer);
  } else {
    // 일반 카테고리는 기본 평가 메서드 사용
    return await config.evaluator.evaluateAnswer(question, expectedAnswer, userAnswer);
  }
};

/**
 * 카테고리에 맞는 학습 항목 검증 함수
 * @param {string} category - 카테고리
 * @param {Array} items - 검증할 항목들
 * @returns {Promise<Array>} - 검증 결과
 */
const validateItems = async (category, items) => {
  const config = getCategoryConfig(category);
  
  if (category === CATEGORIES.ENGLISH) {
    // 영어 카테고리는 기존 구조 유지 (words with english/korean fields)
    return await config.validator[config.validatorMethod](items);
  } else if (category === CATEGORIES.LANGUAGE_JP || category === CATEGORIES.LANGUAGE_CN) {
    // 외국어 카테고리는 특별한 처리
    const convertedItems = items.map(item => ({
      id: item.id,
      question: item.english || item.question,
      answer: item.korean || item.answer
    }));
    
    const language = category === CATEGORIES.LANGUAGE_JP ? 'japanese' : 'chinese';
    return await config.validator[config.validatorMethod](convertedItems, language);
  } else {
    // 일반 카테고리는 question/answer 구조로 변환
    const convertedItems = items.map(item => ({
      id: item.id,
      question: item.english || item.question,
      answer: item.korean || item.answer
    }));
    
    return await config.validator[config.validatorMethod](convertedItems);
  }
};

/**
 * 사용 가능한 모든 카테고리 목록 반환
 * @returns {Array} - 카테고리 목록
 */
const getAllCategories = () => {
  return Object.values(CATEGORIES).map(category => ({
    key: category,
    name: CATEGORY_CONFIG[category].name,
    questionLabel: CATEGORY_CONFIG[category].questionLabel,
    answerLabel: CATEGORY_CONFIG[category].answerLabel
  }));
};

/**
 * 기본 카테고리 반환
 * @returns {string} - 기본 카테고리
 */
const getDefaultCategory = () => {
  return CATEGORIES.ENGLISH;
};

module.exports = {
  CATEGORIES,
  isValidCategory,
  getCategoryConfig,
  evaluateAnswer,
  validateItems,
  getAllCategories,
  getDefaultCategory
}; 