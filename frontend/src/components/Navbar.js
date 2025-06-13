import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">단어 암기 시스템</Link>
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
          <div className="d-flex">
            <Link className="nav-link text-white" to="/search">
              <i className="bi bi-search"></i> 단어 검색
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 