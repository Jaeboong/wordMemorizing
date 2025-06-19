import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isAuthenticated, getUserInfo, logout } from '../utils/auth';
import KakaoLogin from './KakaoLogin';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      const userInfo = await getUserInfo();
      setUser(userInfo);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">단암시</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">홈</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/groups">단어 그룹</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/words">단어 관리</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tests">테스트</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/history">테스트 기록</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <Link className="nav-link text-white me-3" to="/search">
              <i className="bi bi-search"></i> 단어 검색
            </Link>
            
            {isLoggedIn && user ? (
              <div className="d-flex align-items-center">
                <span className="text-white me-3">{user.nickname}님</span>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <KakaoLogin />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 