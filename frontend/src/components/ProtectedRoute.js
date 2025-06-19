import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, redirectMessage = '로그인 후 이용해주세요.' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      alert(redirectMessage);
      navigate('/', { replace: true });
    }
  }, [navigate, redirectMessage]);

  // 로그인되지 않은 경우 null 반환 (빈 화면)
  if (!isAuthenticated()) {
    return null;
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute; 