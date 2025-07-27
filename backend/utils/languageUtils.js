const OpenAI = require('openai');

// OpenAI API 클라이언트 초기화
console.log('외국어 학습 GPT 유틸리티 로드됨');

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
 * 일본어 학습 답변을 AI로 평가하는 함수
 * @param {string} japanese - 일본어 단어/문장
 * @param {string} expectedAnswer - 실제 정답
 * @param {string} userAnswer - 사용자 답변
 * @returns {Promise<Object>} - 평가 결과
 */
const evaluateJapaneseAnswer = async (japanese, expectedAnswer, userAnswer) => {
  if (!isApiKeyValid()) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 일본어 학습을 도와주는 언어 전문가입니다. 사용자가 입력한 한국어 번역이 일본어와 일치하는지 평가하고, 틀리다면 왜 그런지 설명해 주세요. 히라가나, 가타카나, 한자의 차이와 문맥에 따른 의미 변화를 고려하여 평가합니다. 결과는 JSON 형식으로 응답해주세요."
        },
        {
          role: "user",
          content: `
일본어: ${japanese}
정답: ${expectedAnswer}
사용자 답변: ${userAnswer}

이 답변이 정답으로 인정될 수 있는지 평가해 주세요. 다음 JSON 형식으로 응답을 제공해 주세요:
{
  "isCorrect": true/false,
  "explanation": "평가 설명",
  "reading": "일본어 읽기 (후리가나)",
  "example": "일본어 사용 예문",
  "exampleTranslation": "예문 한국어 번역"
}
          `
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
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
 * 중국어 학습 답변을 AI로 평가하는 함수
 * @param {string} chinese - 중국어 단어/문장
 * @param {string} expectedAnswer - 실제 정답
 * @param {string} userAnswer - 사용자 답변
 * @returns {Promise<Object>} - 평가 결과
 */
const evaluateChineseAnswer = async (chinese, expectedAnswer, userAnswer) => {
  if (!isApiKeyValid()) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 중국어 학습을 도와주는 언어 전문가입니다. 사용자가 입력한 한국어 번역이 중국어와 일치하는지 평가하고, 틀리다면 왜 그런지 설명해 주세요. 간체자, 번체자의 차이와 성조, 문맥에 따른 의미 변화를 고려하여 평가합니다. 결과는 JSON 형식으로 응답해주세요."
        },
        {
          role: "user",
          content: `
중국어: ${chinese}
정답: ${expectedAnswer}
사용자 답변: ${userAnswer}

이 답변이 정답으로 인정될 수 있는지 평가해 주세요. 다음 JSON 형식으로 응답을 제공해 주세요:
{
  "isCorrect": true/false,
  "explanation": "평가 설명",
  "pinyin": "중국어 병음",
  "example": "중국어 사용 예문",
  "exampleTranslation": "예문 한국어 번역"
}
          `
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
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
 * 외국어 학습 콘텐츠의 단어-번역 매칭을 AI로 검증하는 함수
 * @param {Array} items - 검증할 항목 배열 [{id, word, translation, language}]
 * @param {string} language - 언어 (japanese, chinese 등)
 * @returns {Promise<Array>} - 검증 결과 배열
 */
const validateLanguageItems = async (items, language = 'japanese') => {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API 키가 설정되지 않았습니다.');
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    const MAX_ITEMS = 20; // 외국어는 더 복잡하므로 적게 처리
    const itemsToValidate = items.length > MAX_ITEMS ? items.slice(0, MAX_ITEMS) : items;
    
    const languageLabels = {
      japanese: { name: '일본어', label: '일본어' },
      chinese: { name: '중국어', label: '중국어' }
    };
    
    const langConfig = languageLabels[language] || { name: '외국어', label: '외국어' };
    
    const itemsText = itemsToValidate.map(item => 
      `ID: ${item.id}, ${langConfig.label}: ${item.question || item.word}, 한글: ${item.answer || item.translation}`
    ).join('\n');
    
    const exampleValidations = language === 'japanese' ? 
    `ID: 9999, 일본어: 元気, 한글: 좋다 -> isCorrect: false, 수정유형: 수정, 제안일본어: 元気, 제안한글: 건강하다, 건강한, 이유: '元気(げんき)'는 '건강하다, 원기 있다'는 의미이며 단순히 '좋다'는 의미가 아님.
ID: 9998, 일본어: ありがとう, 한글: 고맙습니다 -> isCorrect: true, 수정유형: null, 제안일본어: ありがとう, 제안한글: 고맙습니다, 이유: 정확한 번역임.` :
    `ID: 9999, 중국어: 你好, 한글: 안녕 -> isCorrect: false, 수정유형: 추가, 제안중국어: 你好, 제안한글: 안녕하세요, 안녕, 이유: '你好'는 정중한 인사말로 '안녕하세요'가 더 적절하지만 '안녕'도 인정 가능.
ID: 9998, 중국어: 谢谢, 한글: 감사합니다 -> isCorrect: true, 수정유형: null, 제안중국어: 谢谢, 제안한글: 감사합니다, 이유: 정확한 번역임.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    console.log(`${langConfig.name} 학습 내용 검증 시작: ${itemsToValidate.length}개 항목`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${langConfig.name} 학습 콘텐츠 검증 전문가입니다. ${langConfig.name}-한글 번역의 정확성을 검증하고, 문화적 맥락과 언어적 뉘앙스를 고려하여 평가합니다. 결과는 JSON 형식으로 응답해야 합니다.`
        },
        {
          role: "user",
          content: `
${langConfig.name} 학습 항목 목록:
${itemsText}

예시:
${exampleValidations}

JSON 형식으로 응답해주세요:
[
  {
    "id": 항목ID,
    "word": "현재${langConfig.label}",
    "translation": "현재번역",
    "isCorrect": true/false,
    "correctionType": "수정" 또는 "추가" 또는 null,
    "suggestedWord": "제안${langConfig.label}",
    "suggestedTranslation": "제안번역",
    "explanation": "설명",
    "additionalInfo": "발음이나 추가 정보"
  }
]

${langConfig.name} 단어나 번역이 부정확하거나 불완전한 경우를 찾아주세요.`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 2000
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
    
    console.log(`${langConfig.name} 검증 API 응답 수신 완료`);

    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
      
      if (result.result && Array.isArray(result.result)) {
        result = result.result;
      } else if (result.results && Array.isArray(result.results)) {
        result = result.results;
      } else if (!Array.isArray(result) || result.length === 0) {
        console.error('유효하지 않은 API 응답 형식', result);
        return itemsToValidate.map(item => ({
          id: item.id,
          word: item.question || item.word,
          translation: item.answer || item.translation,
          isCorrect: true,
          correctionType: null,
          suggestedWord: item.question || item.word,
          suggestedTranslation: item.answer || item.translation,
          explanation: "API 응답 형식 오류로 검증을 건너뜁니다.",
          additionalInfo: ""
        }));
      }
      
      result = result.map(item => {
        if (item.id === undefined) {
          console.error('ID가 없는 항목 감지', item);
          return null;
        }

        return {
          id: item.id,
          word: item.word || '',
          translation: item.translation || '',
          isCorrect: item.isCorrect !== undefined ? item.isCorrect : true,
          correctionType: item.correctionType || null,
          suggestedWord: item.suggestedWord || item.word || '',
          suggestedTranslation: item.suggestedTranslation || item.translation || '',
          explanation: item.explanation || '설명 없음',
          additionalInfo: item.additionalInfo || ''
        };
      }).filter(item => item !== null);

      console.log(`${langConfig.name} 검증 결과: ${result.length}개 항목`);
      return result;
    } catch (error) {
      console.error('JSON 파싱 오류:', error, response.choices[0].message.content);
      throw new Error('API 응답 파싱 오류: ' + error.message);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('API 요청 시간 초과 (60초)');
    }
    console.error(`${language} 학습 내용 검증 오류:`, error);
    throw error;
  }
};

module.exports = { 
  evaluateJapaneseAnswer, 
  evaluateChineseAnswer, 
  validateLanguageItems 
}; 