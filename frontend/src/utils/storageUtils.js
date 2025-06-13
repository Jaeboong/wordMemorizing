// 로컬 스토리지 관련 유틸리티 함수

// 정렬 옵션 저장 
export const saveSortOption = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('정렬 옵션 저장 중 오류 발생:', error);
  }
};

// 정렬 옵션 불러오기 (기본값 제공)
export const getSortOption = (key, defaultValue) => {
  try {
    const savedOption = localStorage.getItem(key);
    return savedOption !== null ? savedOption : defaultValue;
  } catch (error) {
    console.error('정렬 옵션 불러오기 중 오류 발생:', error);
    return defaultValue;
  }
}; 