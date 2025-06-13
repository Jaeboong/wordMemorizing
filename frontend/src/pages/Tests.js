import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, testApi } from '../services/api';

const Tests = () => {
  const [groups, setGroups] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, testHistoryData] = await Promise.all([
        groupApi.getAllGroups(),
        testApi.getAllTestHistory()
      ]);
      
      setGroups(groupsData);
      setRecentTests(testHistoryData.slice(0, 5)); // 최근 5개 테스트 결과만 표시
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">단어 테스트</h2>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">테스트 가능한 그룹</div>
            {groups.length > 0 ? (
              <div className="list-group list-group-flush">
                {groups.map(group => (
                  <div key={group.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">{group.name}</h5>
                        <p className="mb-1 text-muted">
                          단어 수: {group.word_count || 0}개
                        </p>
                      </div>
                      <Link 
                        to={`/tests/start/${group.id}`} 
                        className={`btn btn-primary ${group.word_count <= 0 ? 'disabled' : ''}`}
                        aria-disabled={group.word_count <= 0}
                      >
                        테스트 시작
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-body text-center py-5">
                <p className="mb-0">그룹이 없습니다. 먼저 그룹을 추가해주세요.</p>
                <Link to="/groups" className="btn btn-primary mt-3">
                  그룹 추가하기
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">최근 테스트 결과</div>
            {recentTests.length > 0 ? (
              <div className="list-group list-group-flush">
                {recentTests.map(test => (
                  <div key={test.id} className="list-group-item">
                    <h6>{test.group_name}</h6>
                    <div className="d-flex justify-content-between">
                      <span>
                        점수: {test.correct_answers}/{test.total_questions} (
                        {Math.round((test.correct_answers / test.total_questions) * 100)}%)
                      </span>
                    </div>
                    <small className="text-muted">
                      {formatDate(test.test_date)}
                    </small>
                  </div>
                ))}
                <div className="list-group-item text-center">
                  <Link to="/history" className="btn btn-sm btn-outline-primary">
                    모든 테스트 기록 보기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-body text-center py-5">
                <p className="mb-0">아직 테스트 기록이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tests; 