import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupApi } from '../services/api';

const TestStart = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [testCount, setTestCount] = useState(10);
  const [testMode, setTestMode] = useState('normal'); // 'normal' 또는 'ai'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getGroupById(groupId);
      setGroup(data);
      setWordCount(data.words ? data.words.length : 0);
      
      // 기본 테스트 단어 수 설정 (그룹 내 단어 수보다 작거나 같게)
      if (data.words && data.words.length > 0) {
        setTestCount(Math.min(10, data.words.length));
      }
    } catch (error) {
      console.error('그룹 정보 로딩 중 오류 발생:', error);
      alert('그룹 정보를 불러오는 중 오류가 발생했습니다.');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    // 테스트 모드를 포함하여 퀴즈 페이지로 이동
    navigate(`/tests/quiz/${groupId}/${testCount}/${testMode}`);
  };

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value);
    setTestCount(Math.min(count, wordCount));
  };

  const handleModeChange = (mode) => {
    setTestMode(mode);
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

  if (!group) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          그룹을 찾을 수 없습니다.
        </div>
        <Link to="/tests" className="btn btn-primary">
          테스트 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (wordCount === 0) {
    return (
      <div className="container mt-5">
        <div className="card">
          <div className="card-header">
            <h2>{group.name} 테스트</h2>
          </div>
          <div className="card-body text-center py-5">
            <div className="alert alert-warning">
              이 그룹에는 단어가 없습니다. 먼저 단어를 추가해주세요.
            </div>
            <Link to={`/groups/${groupId}`} className="btn btn-primary mt-3">
              단어 추가하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>{group.name} 테스트</h2>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <strong>테스트 정보:</strong> 이 그룹에는 총 {wordCount}개의 단어가 있습니다.
          </div>
          
          <form className="mt-4">
            <div className="mb-3">
              <label htmlFor="testCount" className="form-label">테스트할 단어 수:</label>
              <input
                type="number"
                className="form-control"
                id="testCount"
                min="1"
                max={wordCount}
                value={testCount}
                onChange={handleCountChange}
              />
              <div className="form-text">최대 {wordCount}개까지 선택 가능합니다.</div>
            </div>
            
            <div className="mb-4">
              <label className="form-label">테스트 모드:</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testMode"
                    id="normalMode"
                    checked={testMode === 'normal'}
                    onChange={() => handleModeChange('normal')}
                  />
                  <label className="form-check-label" htmlFor="normalMode">
                    일반 모드
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="testMode"
                    id="aiMode"
                    checked={testMode === 'ai'}
                    onChange={() => handleModeChange('ai')}
                  />
                  <label className="form-check-label" htmlFor="aiMode">
                    AI 채점 모드
                  </label>
                </div>
              </div>
              <div className="mt-2">
                {testMode === 'normal' ? (
                  <div className="alert alert-light">
                    <p><strong>일반 모드:</strong></p>
                    <ul>
                      <li>각 문제마다 즉시 정답을 확인합니다.</li>
                      <li>한 문제씩 풀고 바로 채점합니다.</li>
                      <li>빠르게 학습 상태를 확인할 수 있습니다.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="alert alert-light">
                    <p><strong>AI 채점 모드:</strong></p>
                    <ul>
                      <li>모든 문제를 한번에 풀고 제출합니다.</li>
                      <li>AI가 답변을 분석하여 맥락에 맞는 채점을 제공합니다.</li>
                      <li>틀린 답변에 대한 상세한 설명과 예문을 제공합니다.</li>
                      <li>일반 모드보다 시간이 더 소요될 수 있습니다.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <Link to="/tests" className="btn btn-outline-secondary">
                돌아가기
              </Link>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleStartTest}
              >
                테스트 시작
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestStart; 