import React from 'react';

const KakaoLogin = () => {
  const handleKakaoLogin = () => {
    // 백엔드의 카카오 로그인 엔드포인트로 이동
    window.location.href = 'http://localhost:5000/api/auth/kakao';
  };

  return (
    <div className="kakao-login-container d-flex justify-content-center">
      <button 
        className="btn kakao-login-btn"
        onClick={handleKakaoLogin}
        style={{
          backgroundColor: '#FEE500',
          color: '#191919',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '200px',
          justifyContent: 'center'
        }}
      >
        <img 
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath fill='%23191919' d='M9 0C4.03 0 0 3.14 0 7c0 2.42 1.6 4.54 4 5.86l-1 3.64c-.04.16.09.29.25.24L8.09 14c.3.04.6.06.91.06 4.97 0 9-3.14 9-7S13.97 0 9 0z'/%3E%3C/svg%3E"
          alt="kakao"
          width="18"
          height="18"
        />
        카카오로 로그인
      </button>
    </div>
  );
};

export default KakaoLogin; 