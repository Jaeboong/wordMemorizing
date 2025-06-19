import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:5000/api';

// axios 인터셉터 설정 - 모든 요청에 자동으로 인증 토큰 포함
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 단어 관련 API
export const wordApi = {
  // 단어 등록
  createWord: async (data) => {
    const response = await axios.post(`${API_URL}/words`, data);
    return response.data;
  },
  // 모든 단어 조회
  getAllWords: async () => {
    const response = await axios.get(`${API_URL}/words`);
    return response.data;
  },
  // 특정 그룹의 단어 조회
  getWordsByGroup: async (groupId) => {
    const response = await axios.get(`${API_URL}/words/group/${groupId}`);
    return response.data;
  },
  // 단어 검색
  searchWords: async (keyword) => {
    const response = await axios.get(`${API_URL}/words/search?keyword=${keyword}`);
    return response.data;
  },
  // 단어 수정
  updateWord: async (id, data) => {
    const response = await axios.put(`${API_URL}/words/${id}`, data);
    return response.data;
  },
  // 단어 삭제
  deleteWord: async (id) => {
    const response = await axios.delete(`${API_URL}/words/${id}`);
    return response.data;
  }
};

// 그룹 관련 API
export const groupApi = {
  // 그룹 생성
  createGroup: async (data) => {
    const response = await axios.post(`${API_URL}/groups`, data);
    return response.data;
  },
  // 모든 그룹 조회
  getAllGroups: async () => {
    const response = await axios.get(`${API_URL}/groups`);
    return response.data;
  },
  // 특정 그룹 조회
  getGroupById: async (id) => {
    const response = await axios.get(`${API_URL}/groups/${id}`);
    return response.data;
  },
  // 그룹 수정
  updateGroup: async (id, data) => {
    const response = await axios.put(`${API_URL}/groups/${id}`, data);
    return response.data;
  },
  // 그룹 삭제
  deleteGroup: async (id) => {
    const response = await axios.delete(`${API_URL}/groups/${id}`);
    return response.data;
  },
  // AI로 단어 그룹 검증
  validateGroup: async (id) => {
    const response = await axios.get(`${API_URL}/groups/${id}/validate`);
    return response.data;
  },
  // AI 검증 결과에 따라 단어 일괄 수정
  updateGroupWords: async (id, words) => {
    const response = await axios.post(`${API_URL}/groups/${id}/update-words`, { words });
    return response.data;
  }
};

// 테스트 관련 API
export const testApi = {
  // 테스트용 단어 가져오기
  getTestWords: async (groupId, count) => {
    const response = await axios.get(`${API_URL}/tests/words/${groupId}/${count}`);
    return response.data;
  },
  // 일반 테스트 결과 저장
  saveTestResult: async (data) => {
    const response = await axios.post(`${API_URL}/tests/results`, data);
    return response.data;
  },
  // AI 채점 테스트 결과 저장
  saveAiTestResult: async (data) => {
    const response = await axios.post(`${API_URL}/tests/ai-evaluation`, data);
    return response.data;
  },
  // 특정 그룹의 테스트 기록 조회
  getTestHistory: async (groupId) => {
    const response = await axios.get(`${API_URL}/tests/history/${groupId}`);
    return response.data;
  },
  // 모든 테스트 기록 조회
  getAllTestHistory: async () => {
    const response = await axios.get(`${API_URL}/tests/history`);
    return response.data;
  }
};

// 사용자 설정 관련 API
export const preferenceApi = {
  // 설정 가져오기
  getPreference: async (key) => {
    try {
      const response = await axios.get(`${API_URL}/preferences/${key}`);
      return response.data.value;
    } catch (error) {
      // 설정이 없는 경우 null 반환
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  // 설정 저장하기
  savePreference: async (key, value) => {
    const response = await axios.post(`${API_URL}/preferences/${key}`, { value });
    return response.data;
  },
  
  // 모든 설정 가져오기
  getAllPreferences: async () => {
    const response = await axios.get(`${API_URL}/preferences`);
    return response.data;
  }
}; 