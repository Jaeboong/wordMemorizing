const OpenAI = require('openai');

// OpenAI API 클라이언트 초기화 - 환경 변수 로깅 추가
console.log('API 키 앞 5자리:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) : 'undefined');

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
 * 단어 정답을 AI로 평가하는 함수
 * @param {string} english - 영어 단어
 * @param {string} expectedAnswer - 실제 정답
 * @param {string} userAnswer - 사용자 답변
 * @returns {Promise<Object>} - 평가 결과
 */
const evaluateAnswer = async (english, expectedAnswer, userAnswer) => {
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
          content: "당신은 영어 단어 시험을 채점하는 언어 전문가입니다. 사용자가 입력한 한국어 번역이 맞는지 평가하고, 틀리다면 왜 그런지 설명해 주세요. 띄어쓰기 오류는 무시합니다. 어느정도 판정을 너그럽게 합니다.  결과는 JSON 형식으로 응답해주세요."
        },
        {
          role: "user",
          content: `
영어 단어: ${english}
정답: ${expectedAnswer}
사용자 답변: ${userAnswer}

이 답변이 정답으로 인정될 수 있는지 평가해 주세요. 다음 JSON 형식으로 응답을 제공해 주세요:
{
  "isCorrect": true/false,
  "explanation": "평가 설명",
  "example": "단어 사용 예문",
  "exampleTranslation": "예문 한국어 번역"
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

module.exports = { evaluateAnswer };