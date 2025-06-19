import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import WordSearch from './pages/WordSearch';
import Words from './pages/Words';
import Tests from './pages/Tests';
import TestStart from './pages/TestStart';
import TestQuiz from './pages/TestQuiz';
import TestResult from './pages/TestResult';
import TestHistory from './pages/TestHistory';
import WordEdit from './pages/WordEdit';
import { setupInputLanguageSupport, addLanguageStyles } from './utils/inputUtils';
import { setToken } from './utils/auth';

// 환경변수 정보 출력 (개발 환경에서만)
const isDevelopment = process.env.NODE_ENV === 'development';
const frontendPort = process.env.PORT || '4000';
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 토큰 처리를 위한 컴포넌트
const TokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // 토큰을 저장하고 URL에서 제거
      setToken(token);
      navigate('/', { replace: true });
      // 페이지 새로고침으로 Navbar 업데이트
      window.location.reload();
    }
  }, [location, navigate]);

  return null;
};

function App() {
  useEffect(() => {
    // 언어 입력 관련 설정 적용
    setupInputLanguageSupport();
    addLanguageStyles();

    // 개발 환경에서 콘솔에 환경 정보 출력
    if (isDevelopment) {
      console.log('🚀 개발 환경 정보:');
      console.log(`📍 프론트엔드: http://localhost:${frontendPort}`);
      console.log(`🔗 API URL: ${apiUrl}`);
      console.log(`🌍 환경: ${process.env.NODE_ENV}`);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {/* 개발 환경에서만 환경 정보 표시 */}
        {isDevelopment && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            backgroundColor: '#007bff',
            color: 'white',
            padding: '5px 10px',
            fontSize: '12px',
            zIndex: 9999,
            borderRadius: '0 0 0 5px'
          }}>
            DEV: localhost:{frontendPort}
          </div>
        )}
        
        <TokenHandler />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<WordSearch />} />
          
          {/* 보호된 라우트들 */}
          <Route path="/groups" element={
            <ProtectedRoute redirectMessage="단어 그룹 관리는 로그인 후 이용해주세요.">
              <Groups />
            </ProtectedRoute>
          } />
          <Route path="/groups/:id" element={
            <ProtectedRoute redirectMessage="단어 그룹은 로그인 후 이용해주세요.">
              <GroupDetail />
            </ProtectedRoute>
          } />
          <Route path="/words" element={
            <ProtectedRoute redirectMessage="단어 관리는 로그인 후 이용해주세요.">
              <Words />
            </ProtectedRoute>
          } />
          <Route path="/words/edit/:id" element={
            <ProtectedRoute redirectMessage="단어 수정은 로그인 후 이용해주세요.">
              <WordEdit />
            </ProtectedRoute>
          } />
          <Route path="/tests" element={
            <ProtectedRoute redirectMessage="테스트는 로그인 후 이용해주세요.">
              <Tests />
            </ProtectedRoute>
          } />
          <Route path="/tests/start/:groupId" element={
            <ProtectedRoute redirectMessage="테스트는 로그인 후 이용해주세요.">
              <TestStart />
            </ProtectedRoute>
          } />
          <Route path="/tests/quiz/:groupId/:count" element={
            <ProtectedRoute redirectMessage="테스트는 로그인 후 이용해주세요.">
              <TestQuiz />
            </ProtectedRoute>
          } />
          <Route path="/tests/quiz/:groupId/:count/:mode" element={
            <ProtectedRoute redirectMessage="테스트는 로그인 후 이용해주세요.">
              <TestQuiz />
            </ProtectedRoute>
          } />
          <Route path="/tests/result" element={
            <ProtectedRoute redirectMessage="테스트 결과는 로그인 후 이용해주세요.">
              <TestResult />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute redirectMessage="테스트 기록은 로그인 후 이용해주세요.">
              <TestHistory />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
// test