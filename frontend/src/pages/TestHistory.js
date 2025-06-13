import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testApi } from '../services/api';

const TestHistory = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestHistory();
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      const data = await testApi.getAllTestHistory();
      setTestHistory(data);
    } catch (error) {
      console.error('테스트 기록 로딩 중 오류 발생:', error);
      alert('테스트 기록을 불러오는 중 오류가 발생했습니다.');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>테스트 기록</h2>
        <Link to="/tests" className="btn btn-outline-primary">
          테스트 목록으로
        </Link>
      </div>

      {testHistory.length > 0 ? (
        <div className="card">
          <div className="card-header">
            전체 테스트 기록 ({testHistory.length}개)
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '5%' }}>#</th>
                  <th scope="col" style={{ width: '20%' }}>그룹</th>
                  <th scope="col" style={{ width: '15%' }}>문제 수</th>
                  <th scope="col" style={{ width: '15%' }}>정답 수</th>
                  <th scope="col" style={{ width: '15%' }}>정답률</th>
                  <th scope="col" style={{ width: '20%' }}>날짜</th>
                  <th scope="col" style={{ width: '10%' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map((test, index) => {
                  const percentage = Math.round((test.correct_answers / test.total_questions) * 100);
                  let badgeClass = 'bg-danger';
                  if (percentage >= 80) badgeClass = 'bg-success';
                  else if (percentage >= 60) badgeClass = 'bg-warning';
                  
                  return (
                    <tr key={test.id}>
                      <td>{index + 1}</td>
                      <td>{test.group_name}</td>
                      <td>{test.total_questions}</td>
                      <td>{test.correct_answers}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {percentage}%
                        </span>
                      </td>
                      <td>{formatDate(test.test_date)}</td>
                      <td>
                        <Link 
                          to={`/tests/start/${test.group_id}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          다시 테스트
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <p className="mb-3">아직 테스트 기록이 없습니다.</p>
            <Link to="/tests" className="btn btn-primary">
              테스트 시작하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestHistory; 