import Cookies from 'js-cookie';

// API URL 환경변수에서 가져오기 (로컬 개발용 기본값 6000 포트)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 토큰 저장
export const setToken = (token) => {
  Cookies.set('auth_token', token, { expires: 7 }); // 7일간 유지
};

// 토큰 가져오기 
export const getToken = () => {
  return Cookies.get('auth_token');
};

// 토큰 제거
export const removeToken = () => {
  Cookies.remove('auth_token');
};

// 로그인 상태 확인
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // JWT 토큰의 만료 시간 확인
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// 사용자 정보 가져오기
export const getUserInfo = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    } else {
      removeToken(); // 유효하지 않은 토큰 제거
      return null;
    }
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
};

// 로그아웃
export const logout = () => {
  removeToken();
  window.location.href = '/';
}; 