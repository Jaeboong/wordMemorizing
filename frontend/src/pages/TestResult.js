import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const TestResult = () => {
  const location = useLocation();
  const { results, evaluations, groupName, groupId, savedResult, isAiResult } = location.state || {};
  
  // AI 모드와 일반 모드의 결과 데이터를 확인
  const hasData = isAiResult ? !!evaluations : !!results;
  
  if (!hasData || !groupName) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          테스트 결과 정보가 없습니다.
        </div>
        <Link to="/tests" className="btn btn-primary">
          테스트 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  const totalQuestions = isAiResult ? savedResult.totalQuestions : results.length;
  const correctAnswers = isAiResult ? savedResult.correctAnswers : results.filter(result => result.isCorrect).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  let grade = '';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 55) grade = 'C';
  else if (percentage >= 40) grade = 'D';
  else grade = 'F';
  
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>{groupName} 테스트 결과 {isAiResult ? '(AI 채점)' : ''}</h2>
        </div>
        
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6 offset-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="display-4 mb-3">{percentage}%</h3>
                  <h4>
                    {correctAnswers} / {totalQuestions} 정답
                  </h4>
                  <div className="mt-3">
                    <span 
                      className={`badge ${
                        percentage >= 80 
                          ? 'bg-success' 
                          : percentage >= 60 
                            ? 'bg-warning' 
                            : 'bg-danger'
                      } fs-5`}
                    >
                      등급: {grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="mb-3">문제별 결과</h3>
          
          {isAiResult ? (
            // AI 채점 결과 표시
            <div>
              {evaluations.map((evaluation, index) => (
                <div 
                  key={index}
                  className={`card mb-3 ${evaluation.isCorrect ? 'border-success' : 'border-danger'}`}
                >
                  <div className={`card-header ${evaluation.isCorrect ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>문제 {index + 1}: <strong>{evaluation.english}</strong></span>
                      <span className="badge bg-light text-dark">
                        {evaluation.isCorrect ? '정답' : '오답'}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>예상 정답:</strong> {evaluation.expected}</p>
                        <p><strong>입력한 답:</strong> {evaluation.userAnswer}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>AI 평가:</strong></p>
                        <p>{evaluation.explanation}</p>
                      </div>
                    </div>
                    {!evaluation.isCorrect && evaluation.example && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <p><strong>단어 사용 예문:</strong></p>
                        <p>{evaluation.example}</p>
                        <p><em>{evaluation.exampleTranslation}</em></p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 일반 채점 결과 표시
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>영어 단어</th>
                    <th>정답</th>
                    <th>입력한 답</th>
                    <th>결과</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={result.isCorrect ? 'table-success' : 'table-danger'}>
                      <td>{index + 1}</td>
                      <td>{result.word.english}</td>
                      <td>{result.word.korean}</td>
                      <td>{result.userAnswer}</td>
                      <td>
                        {result.isCorrect ? (
                          <span className="badge bg-success">정답</span>
                        ) : (
                          <span className="badge bg-danger">오답</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <Link to={`/groups/${groupId}`} className="btn btn-outline-primary">
              그룹으로 돌아가기
            </Link>
            <div>
              {isAiResult && (
                <Link to={`/tests/start/${groupId}`} className="btn btn-outline-secondary me-2">
                  일반 모드로 테스트
                </Link>
              )}
              <Link 
                to={`/tests/start/${groupId}`} 
                className="btn btn-success"
              >
                다시 테스트하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResult; 