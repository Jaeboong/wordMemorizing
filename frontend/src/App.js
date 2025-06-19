import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
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
  }, []);

  return (
    <Router>
      <div className="App">
        <TokenHandler />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/search" element={<WordSearch />} />
          <Route path="/words" element={<Words />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/start/:groupId" element={<TestStart />} />
          <Route path="/tests/quiz/:groupId/:count" element={<TestQuiz />} />
          <Route path="/tests/quiz/:groupId/:count/:mode" element={<TestQuiz />} />
          <Route path="/tests/result" element={<TestResult />} />
          <Route path="/history" element={<TestHistory />} />
          <Route path="/words/edit/:id" element={<WordEdit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
// test