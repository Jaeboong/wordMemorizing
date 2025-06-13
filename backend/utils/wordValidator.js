const OpenAI = require('openai');

// OpenAI API 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * 단어 그룹 내 단어들의 영어-한글 매칭을 AI로 검증하는 함수
 * @param {Array} words - 검증할 단어 배열 [{id, english, korean}]
 * @returns {Promise<Array>} - 검증 결과 배열
 */
const validateWords = async (words) => {
  // API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API 키가 설정되지 않았습니다.');
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    // 검증할 단어가 너무 많으면 일부만 처리
    const MAX_WORDS = 30; 
    const wordsToValidate = words.length > MAX_WORDS ? words.slice(0, MAX_WORDS) : words;
    
    // 단어 목록 텍스트 생성
    const wordsText = wordsToValidate.map(word => 
      `ID: ${word.id}, 영어: ${word.english}, 한글: ${word.korean}`
    ).join('\n');
    
    // 예시 추가
    const exampleValidations = `
ID: 9999, 영어: quite, 한글: 조용히하다 -> isCorrect: false, 수정유형: 수정, 제안영어: quite, 제안한글: 꽤, 상당히, 이유: 'quite'는 부사로 '꽤, 상당히'를 의미함. 'quiet'과 혼동됨.
ID: 9998, 영어: happyness, 한글: 행복 -> isCorrect: false, 수정유형: 수정, 제안영어: happiness, 제안한글: 행복, 이유: 영어 단어 철자 오류. 'happiness'가 올바른 철자임.
ID: 9997, 영어: bank, 한글: 은행 -> isCorrect: false, 수정유형: 추가, 제안영어: bank, 제안한글: 은행, 강둑, 이유: 'bank'는 금융기관인 '은행' 외에도 강이나 호수의 '강둑'이라는 의미도 있음.`;

    // API 요청에 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    console.log(`단어 검증 시작: ${wordsToValidate.length}개 단어`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `영어-한글 단어 번역 검증자. 다음 유형의 오류 검증: 1) 영어 단어 철자 오류, 2) 한글 번역 오류, 3) 한글 번역 불완전(의미 추가 필요, 단 충분하다면 굳이 추가하지 않음) 4) 영어 외에는 고려하지 않는다. ex) 일본어 등. 결과는 JSON 형식으로 응답해야 합니다.`
        },
        {
          role: "user",
          content: `
단어 목록:
${wordsText}

예시:
${exampleValidations}

JSON 형식으로 응답해주세요:
[
  {
    "id": 단어ID,
    "english": "현재영어",
    "korean": "현재번역",
    "isCorrect": true/false,
    "correctionType": "수정" 또는 "추가" 또는 null,
    "suggestedEnglish": "제안영어단어",
    "suggestedKorean": "제안한글번역",
    "explanation": "설명"
  }
]

철자 오류가 있는 영어 단어를 찾아 수정하고, 한글 뜻이 불완전하거나 잘못된 경우도 찾아주세요. '수정'은 기존 번역이 잘못된 경우, '추가'는 기존 번역에 추가 의미가 필요한 경우입니다.`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 2000
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
    
    console.log('OpenAI API 응답 수신 완료');

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
        return wordsToValidate.map(word => ({
          id: word.id,
          english: word.english,
          korean: word.korean,
          isCorrect: true,
          correctionType: null,
          suggestedEnglish: word.english,
          suggestedKorean: word.korean,
          explanation: "API 응답 형식 오류로 검증을 건너뜁니다."
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
          english: item.english || '',
          korean: item.korean || '',
          isCorrect: item.isCorrect !== undefined ? item.isCorrect : true,
          correctionType: item.correctionType || null,
          suggestedEnglish: item.suggestedEnglish || item.english || '',
          suggestedKorean: item.suggestedKorean || item.korean || '',
          explanation: item.explanation || '설명 없음'
        };
      }).filter(item => item !== null); // null 항목 제거

      console.log(`검증 결과: ${result.length}개 항목`);
      return result;
    } catch (error) {
      console.error('JSON 파싱 오류:', error, response.choices[0].message.content);
      throw new Error('API 응답 파싱 오류: ' + error.message);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('API 요청 시간 초과 (60초)');
    }
    console.error('단어 검증 오류:', error);
    throw error;
  }
};

module.exports = { validateWords }; 