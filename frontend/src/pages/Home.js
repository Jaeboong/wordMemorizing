import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, wordApi } from '../services/api';

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [recentWords, setRecentWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsData = await groupApi.getAllGroups();
        setGroups(groupsData);
        
        const wordsData = await wordApi.getAllWords();
        setRecentWords(wordsData.slice(0, 5)); // 최근 5개 단어만 표시
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">단어 암기 시스템</h1>
        <p className="lead">단어를 등록하고 그룹별로 관리하며 테스트를 통해 효과적으로 암기하세요.</p>
        <hr className="my-4" />
        <p>단어 그룹을 만들고 단어를 등록한 후 테스트를 시작해보세요.</p>
        <Link to="/groups" className="btn btn-primary btn-lg me-2">
          단어 그룹 관리
        </Link>
        <Link to="/tests" className="btn btn-success btn-lg">
          테스트 시작
        </Link>
      </div>

      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">단어 그룹</h5>
              <Link to="/groups" className="btn btn-sm btn-outline-primary">모두 보기</Link>
            </div>
            <ul className="list-group list-group-flush">
              {groups.length > 0 ? (
                groups.slice(0, 5).map((group) => (
                  <li key={group.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <Link to={`/groups/${group.id}`} className="text-decoration-none">
                      {group.name}
                    </Link>
                    <span className="badge bg-primary rounded-pill">{group.word_count || 0}개 단어</span>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-center">그룹이 없습니다. 그룹을 추가해보세요!</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">최근 추가된 단어</h5>
              <Link to="/words" className="btn btn-sm btn-outline-primary">모두 보기</Link>
            </div>
            <ul className="list-group list-group-flush">
              {recentWords.length > 0 ? (
                recentWords.map((word) => (
                  <li key={word.id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <strong>{word.english}</strong>
                      <span>{word.korean}</span>
                    </div>
                    <small className="text-muted">그룹: {word.group_name}</small>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-center">단어가 없습니다. 단어를 추가해보세요!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 