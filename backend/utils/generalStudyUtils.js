const OpenAI = require('openai');

// OpenAI API 클라이언트 초기화
console.log('일반 공부 GPT 유틸리티 로드됨');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// API 키 유효성 확인
const isApiKeyValid = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return false;
  }
  return true;
};

/**
 * 일반 학습 내용의 답변을 AI로 평가하는 함수
 * @param {string} question - 문제/질문
 * @param {string} expectedAnswer - 실제 정답
 * @param {string} userAnswer - 사용자 답변
 * @returns {Promise<Object>} - 평가 결과
 */
const evaluateAnswer = async (question, expectedAnswer, userAnswer) => {
  if (!isApiKeyValid()) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    // API 요청에 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 다양한 분야의 학습 내용을 평가하는 교육 전문가입니다. 사용자가 입력한 답변이 정답과 일치하는지 평가하고, 틀리다면 왜 그런지 설명해 주세요. 띄어쓰기나 표현의 미세한 차이는 너그럽게 판정하되, 핵심 내용이 맞는지를 중점적으로 평가합니다. 결과는 JSON 형식으로 응답해주세요."
        },
        {
          role: "user",
          content: `
문제/질문: ${question}
정답: ${expectedAnswer}
사용자 답변: ${userAnswer}

이 답변이 정답으로 인정될 수 있는지 평가해 주세요. 다음 JSON 형식으로 응답을 제공해 주세요:
{
  "isCorrect": true/false,
  "explanation": "평가 설명 및 피드백",
  "keyPoints": "핵심 포인트나 추가 설명",
  "suggestion": "더 나은 답변을 위한 제안"
}
          `
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }, { signal: controller.signal });

    clearTimeout(timeoutId); // 타임아웃 제거

    // JSON 파싱
    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('OpenAI API 요청 타임아웃');
      throw new Error('AI 채점 요청이 시간 초과되었습니다.');
    }
    console.error('OpenAI API 오류:', error);
    throw new Error(`AI 채점 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * 일반 학습 콘텐츠의 질문-답변 매칭을 AI로 검증하는 함수
 * @param {Array} items - 검증할 항목 배열 [{id, question, answer}]
 * @returns {Promise<Array>} - 검증 결과 배열
 */
const validateStudyItems = async (items) => {
  // API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API 키가 설정되지 않았습니다.');
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    // 검증할 항목이 너무 많으면 일부만 처리
    const MAX_ITEMS = 30; 
    const itemsToValidate = items.length > MAX_ITEMS ? items.slice(0, MAX_ITEMS) : items;
    
    // 항목 목록 텍스트 생성
    const itemsText = itemsToValidate.map(item => 
      `ID: ${item.id}, 문제: ${item.question}, 답변: ${item.answer}`
    ).join('\n');
    
    // 예시 추가
    const exampleValidations = `
ID: 9999, 문제: 광합성의 화학식은?, 답변: 6CO2 + 6H2O → C6H12O6 + 6O2 + 빛에너지 -> isCorrect: false, 수정유형: 수정, 제안문제: 광합성의 화학식은?, 제안답변: 6CO2 + 6H2O + 빛에너지 → C6H12O6 + 6O2, 이유: 빛에너지는 반응물이지 생성물이 아님.
ID: 9998, 문제: 한국의 수도, 답변: 서울 -> isCorrect: true, 수정유형: null, 제안문제: 한국의 수도, 제안답변: 서울, 이유: 정확한 답변임.
ID: 9997, 문제: 피타고라스 정리, 답변: a² + b² = c² -> isCorrect: false, 수정유형: 추가, 제안문제: 피타고라스 정리, 제안답변: 직각삼각형에서 a² + b² = c² (c는 빗변, a,b는 다른 두 변), 이유: 정리의 조건과 변수 설명이 필요함.`;

    // API 요청에 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    console.log(`일반 학습 내용 검증 시작: ${itemsToValidate.length}개 항목`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `다양한 학습 분야의 질문-답변 검증 전문가입니다. 다음 유형의 오류를 검증합니다: 1) 질문이 명확하지 않거나 부정확한 경우, 2) 답변이 틀렸거나 불완전한 경우, 3) 답변에 추가 설명이 필요한 경우. 수학, 과학, 역사, 지리, 상식 등 모든 분야를 다룹니다. 결과는 JSON 형식으로 응답해야 합니다.`
        },
        {
          role: "user",
          content: `
학습 항목 목록:
${itemsText}

예시:
${exampleValidations}

JSON 형식으로 응답해주세요:
[
  {
    "id": 항목ID,
    "question": "현재문제",
    "answer": "현재답변",
    "isCorrect": true/false,
    "correctionType": "수정" 또는 "추가" 또는 null,
    "suggestedQuestion": "제안문제",
    "suggestedAnswer": "제안답변",
    "explanation": "설명",
    "subject": "추정되는 과목/분야"
  }
]

문제나 답변이 부정확하거나 불완전한 경우를 찾아주세요. '수정'은 기존 내용이 잘못된 경우, '추가'는 기존 내용에 추가 설명이 필요한 경우입니다.`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 2000
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
    
    console.log('일반 학습 검증 API 응답 수신 완료');

    // JSON 파싱
    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
      console.log(`응답 데이터 구조:`, Object.keys(result));
      
      // 결과가 result 배열로 감싸져 있는 경우 처리
      if (result.result && Array.isArray(result.result)) {
        console.log('result 배열 감지, 이를 사용합니다');
        result = result.result;
      }
      // 결과가 results 배열로 감싸져 있는 경우 처리
      else if (result.results && Array.isArray(result.results)) {
        console.log('results 배열 감지, 이를 사용합니다');
        result = result.results;
      }
      // 결과가 배열이 아니거나 비어 있는 경우 처리
      else if (!Array.isArray(result) || result.length === 0) {
        console.error('유효하지 않은 API 응답 형식', result);
        // 기본 결과 반환
        return itemsToValidate.map(item => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          isCorrect: true,
          correctionType: null,
          suggestedQuestion: item.question,
          suggestedAnswer: item.answer,
          explanation: "API 응답 형식 오류로 검증을 건너뜁니다.",
          subject: "미분류"
        }));
      }
      
      // 응답 결과에 필수 필드가 없는 경우 기본값 추가
      result = result.map(item => {
        // 필수 필드가 있는지 확인
        if (item.id === undefined) {
          console.error('ID가 없는 항목 감지', item);
          return null; // 이 항목은 무시
        }

        // 필수 필드가 없으면 기본값 설정
        return {
          id: item.id,
          question: item.question || '',
          answer: item.answer || '',
          isCorrect: item.isCorrect !== undefined ? item.isCorrect : true,
          correctionType: item.correctionType || null,
          suggestedQuestion: item.suggestedQuestion || item.question || '',
          suggestedAnswer: item.suggestedAnswer || item.answer || '',
          explanation: item.explanation || '설명 없음',
          subject: item.subject || '미분류'
        };
      }).filter(item => item !== null); // null 항목 제거

      console.log(`일반 학습 검증 결과: ${result.length}개 항목`);
      return result;
    } catch (error) {
      console.error('JSON 파싱 오류:', error, response.choices[0].message.content);
      throw new Error('API 응답 파싱 오류: ' + error.message);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('API 요청 시간 초과 (60초)');
    }
    console.error('일반 학습 내용 검증 오류:', error);
    throw error;
  }
};

module.exports = { evaluateAnswer, validateStudyItems }; 