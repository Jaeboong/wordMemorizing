import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import WordSearch from './pages/WordSearch';
import Tests from './pages/Tests';
import TestStart from './pages/TestStart';
import TestQuiz from './pages/TestQuiz';
import TestResult from './pages/TestResult';
import TestHistory from './pages/TestHistory';
import WordEdit from './pages/WordEdit';
import { setupInputLanguageSupport, addLanguageStyles } from './utils/inputUtils';

function App() {
  useEffect(() => {
    // 언어 입력 관련 설정 적용
    setupInputLanguageSupport();
    addLanguageStyles();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/search" element={<WordSearch />} />
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