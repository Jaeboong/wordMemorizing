import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, wordApi } from '../services/api';
import { isAuthenticated, getUserInfo } from '../utils/auth';
import KakaoLogin from '../components/KakaoLogin';

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [recentWords, setRecentWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const authStatus = isAuthenticated();
      setLoggedIn(authStatus);

      if (authStatus) {
        const userInfo = await getUserInfo();
        setUser(userInfo);
        
        // 로그인된 경우에만 데이터 로드
        try {
          const groupsData = await groupApi.getAllGroups();
          setGroups(groupsData);
          
          const wordsData = await wordApi.getAllWords();
          setRecentWords(wordsData.slice(0, 5)); // 최근 5개 단어만 표시
        } catch (error) {
          console.error('데이터 로딩 중 오류 발생:', error);
        }
      }
      
      setLoading(false);
    };

    checkAuthAndFetchData();
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

  // 비로그인 상태일 때 표시할 화면
  if (!loggedIn) {
    return (
      <div className="container mt-4">
        <div className="jumbotron bg-light p-5 rounded text-center">
          <h1 className="display-4">단암시</h1>
          <p className="lead">단어 암기 시스템 단암시입니다! 카카오 로그인 후 이용해주세요!</p>
          <hr className="my-4" />
          <div className="alert alert-info">
            <h5>🔐 로그인이 필요한 서비스입니다</h5>
            <p className="mb-3">개인별 맞춤 단어 학습을 위해 카카오 로그인을 해주세요.</p>
            <KakaoLogin />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-collection text-primary" style={{ fontSize: '2rem' }}></i>
                <h5 className="card-title mt-3">단어 그룹 관리</h5>
                <p className="card-text">주제별로 단어를 분류하고 체계적으로 관리하세요.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-journal-text text-success" style={{ fontSize: '2rem' }}></i>
                <h5 className="card-title mt-3">단어 암기 테스트</h5>
                <p className="card-text">다양한 방식의 테스트로 효과적으로 단어를 암기하세요.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-graph-up text-warning" style={{ fontSize: '2rem' }}></i>
                <h5 className="card-title mt-3">학습 진도 관리</h5>
                <p className="card-text">테스트 결과를 분석하고 학습 진도를 확인하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인된 상태일 때 표시할 화면
  return (
    <div className="container mt-4">
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">안녕하세요, {user?.nickname}님! 👋</h1>
        <p className="lead">단어 암기 시스템 단암시입니다!</p>
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