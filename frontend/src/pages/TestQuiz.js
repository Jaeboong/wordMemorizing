import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi, groupApi } from '../services/api';

const TestQuiz = () => {
  const { groupId, count, mode = 'normal' } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [categoryConfig, setCategoryConfig] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [aiMode, setAiMode] = useState(mode === 'ai');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchTestWords();
  }, [groupId, count]);
  
  const fetchTestWords = async () => {
    try {
      setLoading(true);
      
      // 그룹 이름 가져오기
      const groupData = await groupApi.getGroupById(groupId);
      setGroupName(groupData.name);
      
      // 테스트 단어 가져오기
      const testData = await testApi.getTestWords(groupId, count);
      setWords(testData.words);
      
      // 카테고리 정보 설정
      if (testData.categoryName) {
        setCategoryConfig({
          questionLabel: testData.questionLabel,
          answerLabel: testData.answerLabel,
          categoryName: testData.categoryName
        });
      }
      
      // 결과 배열 초기화
      setResults(new Array(testData.words.length).fill(null).map(() => ({
        word: null,
        userAnswer: '',
        isCorrect: false
      })));
      
    } catch (error) {
      console.error('테스트 단어 로딩 중 오류 발생:', error);
      alert('테스트 단어를 불러오는 중 오류가 발생했습니다.');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  // 정답 확인을 위한 전처리 함수
  const normalizeAnswer = (text) => {
    if (!text) return '';
    // ~와 공백 제거, 모든 텍스트를 소문자로 변환
    return text.replace(/[~\s]/g, '').toLowerCase();
  };

  // 패턴 기반 동의어 처리
  const checkPatternMatch = (userInput, correctAnswer) => {
    // 1. 정확히 일치하는 경우
    if (userInput === correctAnswer) return true;
    
    // 2. "~적" 패턴 (예: "고의적으로" vs "고의로")
    const withoutJeok = correctAnswer.replace(/적(으로|인|이|게)?/, '');
    if (userInput === withoutJeok) return true;
    
    // 3. 접미사 제거/추가 패턴 - "하다"류
    const withoutHada = correctAnswer.replace(/(하다|한다|함)$/, '');
    if (userInput === withoutHada || userInput === withoutHada + '하다' || 
        userInput === withoutHada + '한다' || userInput === withoutHada + '함') return true;
    
    // 4. "~게" vs "~하게" 패턴 변형
    const withoutGe = correctAnswer.replace(/하?게$/, '');
    if (userInput === withoutGe + '게' || userInput === withoutGe + '하게') return true;
    
    // 5. 복수형 vs 단수형 처리 (영어 단어 테스트 대비)
    if (correctAnswer.endsWith('들') && userInput === correctAnswer.slice(0, -1)) return true;
    if (userInput.endsWith('들') && correctAnswer === userInput.slice(0, -1)) return true;
    
    return false;
  };

  // 정답 확인 함수
  const isCorrectAnswer = (userInput, correctAnswers) => {
    const normalizedUserInput = normalizeAnswer(userInput);
    
    // 여러 해석이 쉼표로 구분된 경우, 각 해석을 개별적으로 확인
    // 쉼표로 분리해서 여러 단어가 있는 경우 -> 개별 단어로 분리
    const splitCorrectAnswers = [];
    correctAnswers.forEach(answer => {
      // 쉼표로 구분된 개별 해석들을 분리하여 배열에 추가
      const individualAnswers = answer.split(',').map(a => a.trim());
      splitCorrectAnswers.push(...individualAnswers);
    });
    
    // 중복 제거
    const uniqueAnswers = [...new Set(splitCorrectAnswers)];
    
    // 각 정답에 대해 확인
    for (const answer of uniqueAnswers) {
      const normalizedAnswer = normalizeAnswer(answer);
      
      // 직접 일치 확인
      if (normalizedUserInput === normalizedAnswer) return true;
      
      // 패턴 매칭 확인
      if (checkPatternMatch(normalizedUserInput, normalizedAnswer)) return true;
    }
    
    return false;
  };
  
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    
    if (aiMode) {
      // AI 모드: 사용자 답변 저장하고 다음 문제로 이동
      const newResults = [...results];
      newResults[currentIndex] = {
        word: words[currentIndex],
        userAnswer: userAnswer.trim(),
        isCorrect: false // AI 모드에서는 나중에 평가
      };
      setResults(newResults);
      
      if (currentIndex < words.length - 1) {
        // 다음 문제로 이동
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
      } else {
        // 모든 문제 완료 - AI 채점 실행
        submitAiTest(newResults);
      }
    } else {
      // 일반 모드: 즉시 정답 평가
      // 정답 검사
      const currentWord = words[currentIndex];
      const correctAnswers = [currentWord.korean]; // 배열 형태로 전달
      
      // 패턴 기반 정답 체크
      const correct = isCorrectAnswer(userAnswer, correctAnswers);
      
      // 결과 저장
      const newResults = [...results];
      newResults[currentIndex] = {
        word: currentWord,
        userAnswer: userAnswer.trim(),
        isCorrect: correct
      };
      setResults(newResults);
      
      // 피드백 표시
      setIsCorrect(correct);
      setShowFeedback(true);
      
      // 3초 후 다음 문제로 이동
      setTimeout(() => {
        setShowFeedback(false);
        
        if (currentIndex < words.length - 1) {
          // 다음 문제로 이동
          setCurrentIndex(currentIndex + 1);
          setUserAnswer('');
        } else {
          // 테스트 완료, 결과 저장 및 결과 페이지로 이동
          saveNormalTestResult(newResults);
        }
      }, 2000);
    }
  };
  
  const saveNormalTestResult = async (finalResults) => {
    try {
      // 정답 개수 계산
      const correctCount = finalResults.filter(result => result.isCorrect).length;
      
      // 결과 저장
      const savedResult = await testApi.saveTestResult({
        groupId,
        totalQuestions: words.length,
        correctAnswers: correctCount
      });
      
      // 결과 페이지로 이동
      navigate('/tests/result', { 
        state: { 
          results: finalResults,
          groupName,
          groupId,
          savedResult,
          isAiResult: false
        } 
      });
    } catch (error) {
      console.error('테스트 결과 저장 중 오류 발생:', error);
      alert('테스트 결과를 저장하는 중 오류가 발생했습니다.');
      
      // 결과 저장에 실패해도 결과 페이지로 이동
      navigate('/tests/result', { 
        state: { 
          results: finalResults,
          groupName,
          groupId,
          savedResult: null,
          isAiResult: false
        } 
      });
    }
  };
  
  const submitAiTest = async (finalResults) => {
    try {
      setSubmitting(true);
      
      // AI 평가를 위한 데이터 준비
      const answers = finalResults.map(result => ({
        wordId: result.word.id,
        english: result.word.english,
        expected: result.word.korean,
        userAnswer: result.userAnswer
      }));
      
      // AI 평가 요청
      const aiResult = await testApi.saveAiTestResult({
        groupId,
        answers
      });
      
      // AI 평가 결과 페이지로 이동
      navigate('/tests/result', { 
        state: { 
          evaluations: aiResult.evaluations,
          groupName,
          groupId,
          savedResult: aiResult,
          isAiResult: true
        } 
      });
    } catch (error) {
      console.error('AI 테스트 결과 저장 중 오류 발생:', error);
      alert('AI 테스트 결과를 저장하는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 일반 결과 페이지로 이동
      const correctCount = 0; // AI 평가 실패로 0점 처리
      navigate('/tests/result', { 
        state: { 
          results: finalResults,
          groupName,
          groupId,
          savedResult: {
            correctAnswers: correctCount,
            totalQuestions: words.length
          },
          isAiResult: false
        } 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (submitting) {
    return (
      <div className="container mt-5 text-center">
        <div className="card">
          <div className="card-body py-5">
            <h3 className="mb-4">AI가 답변을 평가하고 있습니다...</h3>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 text-muted">AI가 모든 답변을 분석하는 데 시간이 조금 걸립니다. 잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (words.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          테스트할 단어가 없습니다.
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate(`/tests/start/${groupId}`)}
        >
          돌아가기
        </button>
      </div>
    );
  }
  
  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>{groupName} 테스트 {aiMode ? '(AI 모드)' : ''}</h2>
          <div className="progress mt-2">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${progress}%` }} 
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {currentIndex + 1} / {words.length}
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="mb-4 text-center">
            <div className="badge bg-secondary mb-2">문제 {currentIndex + 1}</div>
            <h3 className="display-4 mb-3">{currentWord.english}</h3>
            <p className="text-muted">
              이 {categoryConfig?.questionLabel || '단어'}의 {categoryConfig?.answerLabel || '뜻'}을 입력하세요.
            </p>
          </div>
          
          {!aiMode && showFeedback ? (
            <div className={`alert ${isCorrect ? 'alert-success' : 'alert-danger'} text-center`}>
              <h4>{isCorrect ? '정답입니다! 👍' : '틀렸습니다 😢'}</h4>
              <p className="mt-2">
                정답: <strong>{currentWord.korean}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleAnswerSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder={`${categoryConfig?.questionLabel || '단어'}의 ${categoryConfig?.answerLabel || '뜻'}을 입력하세요`}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                  required
                  lang="ko"
                  inputMode="text"
                />
              </div>
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={!userAnswer.trim()}
                >
                  {aiMode ? 
                    (currentIndex < words.length - 1 ? '다음 문제' : '답변 제출 및 AI 채점') : 
                    '정답 제출'}
                </button>
              </div>
            </form>
          )}
          
          {aiMode && (
            <div className="alert alert-info mt-3">
              <small>
                <strong>AI 모드:</strong> 모든 문제를 풀고 나면 AI가 답변을 분석하여 상세한 피드백을 제공합니다. 
                최종 제출 전까지 정답 여부는 알 수 없습니다.
              </small>
            </div>
          )}
        </div>
        
        <div className="card-footer text-muted">
          <div className="d-flex justify-content-between align-items-center">
            <span>진행: {currentIndex + 1} / {words.length}</span>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                if (window.confirm('정말로 테스트를 종료하시겠습니까? 모든 진행 상황이 사라집니다.')) {
                  navigate(`/tests/start/${groupId}`);
                }
              }}
            >
              테스트 종료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuiz; 