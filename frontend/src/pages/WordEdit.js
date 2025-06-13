import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { wordApi, groupApi } from '../services/api';

const WordEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [word, setWord] = useState(null);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    english: '',
    korean: '',
    groupId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 모든 그룹 가져오기
      const groupsData = await groupApi.getAllGroups();
      setGroups(groupsData);
      
      // 단어 정보 가져오기
      // 현재 API에 단일 단어 조회 기능이 없으므로 모든 단어를 가져와서 필터링
      const allWords = await wordApi.getAllWords();
      const currentWord = allWords.find(w => w.id === parseInt(id));
      
      if (!currentWord) {
        alert('단어를 찾을 수 없습니다.');
        navigate('/groups');
        return;
      }
      
      setWord(currentWord);
      setFormData({
        english: currentWord.english,
        korean: currentWord.korean,
        groupId: currentWord.group_id
      });
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.english.trim() || !formData.korean.trim()) {
      alert('영어 단어와 한글 해석을 모두 입력해주세요.');
      return;
    }
    
    try {
      setSaving(true);
      await wordApi.updateWord(id, {
        english: formData.english.trim(),
        korean: formData.korean.trim(),
        groupId: formData.groupId
      });
      
      alert('단어가 성공적으로 수정되었습니다.');
      navigate(`/groups/${formData.groupId}`);
    } catch (error) {
      console.error('단어 수정 중 오류 발생:', error);
      alert('단어 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          단어를 찾을 수 없습니다.
        </div>
        <Link to="/groups" className="btn btn-primary">
          그룹 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2>단어 수정</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="english" className="form-label">영어 단어</label>
              <input
                type="text"
                className="form-control"
                id="english"
                name="english"
                value={formData.english}
                onChange={handleChange}
                required
                lang="en"
                inputMode="text"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="korean" className="form-label">한글 해석</label>
              <input
                type="text"
                className="form-control"
                id="korean"
                name="korean"
                value={formData.korean}
                onChange={handleChange}
                required
                lang="ko"
                inputMode="text"
              />
              <div className="form-text">
                여러 의미가 있는 경우 쉼표(,)로 구분하여 입력하세요.
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="groupId" className="form-label">그룹</label>
              <select
                className="form-select"
                id="groupId"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                required
              >
                <option value="">그룹 선택</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="d-flex justify-content-between">
              <Link 
                to={`/groups/${word.group_id}`} 
                className="btn btn-outline-secondary"
              >
                취소
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    저장 중...
                  </>
                ) : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WordEdit; 