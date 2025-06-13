import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupApi, wordApi } from '../services/api';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState({ english: '', koreanList: [''] });
  const englishInputRef = useRef(null);
  const koreanInputRefs = useRef([]);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  useEffect(() => {
    // koreanInputRefs 배열 크기 조정
    koreanInputRefs.current = koreanInputRefs.current.slice(0, newWord.koreanList.length);
  }, [newWord.koreanList.length]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getGroupById(id);
      setGroup(data);
      setWords(data.words || []);
    } catch (error) {
      console.error('그룹 상세 정보 로딩 중 오류 발생:', error);
      alert('그룹 정보를 불러오는 중 오류가 발생했습니다.');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleEnglishChange = (e) => {
    setNewWord({ ...newWord, english: e.target.value });
  };

  const handleKoreanChange = (index, value) => {
    const updatedKoreanList = [...newWord.koreanList];
    updatedKoreanList[index] = value;
    setNewWord({ ...newWord, koreanList: updatedKoreanList });
  };

  const handleAddKoreanField = () => {
    setNewWord({
      ...newWord,
      koreanList: [...newWord.koreanList, '']
    });
  };

  const handleKeyDown = (e, index) => {
    // 영어 입력 필드에서 엔터키 누를 때 첫 번째 한글 입력 필드로 포커스 이동
    if (e.key === 'Enter' && e.target.name === 'english') {
      e.preventDefault();
      if (koreanInputRefs.current[0]) {
        koreanInputRefs.current[0].focus();
      }
    }
    // 한글 입력 필드에서 탭 키를 누를 때 새로운 한글 입력 필드 추가
    else if (e.key === 'Tab' && e.target.name === 'korean' && !e.shiftKey) {
      if (index === newWord.koreanList.length - 1) {
        e.preventDefault();
        handleAddKoreanField();
        // 새 필드가 렌더링된 후 포커스 이동
        setTimeout(() => {
          if (koreanInputRefs.current[index + 1]) {
            koreanInputRefs.current[index + 1].focus();
          }
        }, 0);
      }
    }
    // 마지막 한글 입력 필드에서 엔터키 누를 때 폼 제출
    else if (e.key === 'Enter' && e.target.name === 'korean') {
      e.preventDefault();
      handleAddWord(e);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.english.trim() || !newWord.koreanList.some(k => k.trim() !== '')) {
      alert('영어 단어와 최소 하나의 한글 해석을 입력해주세요.');
      return;
    }

    try {
      // 한글 해석들을 쉼표로 구분하여 저장
      const koreanString = newWord.koreanList
        .filter(k => k.trim() !== '')
        .join(', ');

      await wordApi.createWord({
        groupId: id,
        english: newWord.english.trim(),
        korean: koreanString
      });
      
      setNewWord({ english: '', koreanList: [''] });
      fetchGroupDetails();
      
      // 단어 추가 후 자동으로 영어 입력 필드에 포커스
      setTimeout(() => {
        englishInputRef.current.focus();
      }, 100);
    } catch (error) {
      console.error('단어 추가 중 오류 발생:', error);
      alert('단어 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteWord = async (wordId) => {
    if (!window.confirm('정말로 이 단어를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await wordApi.deleteWord(wordId);
      fetchGroupDetails();
    } catch (error) {
      console.error('단어 삭제 중 오류 발생:', error);
      alert('단어 삭제 중 오류가 발생했습니다.');
    }
  };

  // 한글 해석 입력 필드 제거 함수
  const handleRemoveKoreanField = (index) => {
    if (newWord.koreanList.length <= 1) return; // 적어도 하나의 필드는 유지
    
    const updatedKoreanList = [...newWord.koreanList];
    updatedKoreanList.splice(index, 1);
    setNewWord({ ...newWord, koreanList: updatedKoreanList });
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

  if (!group) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          그룹을 찾을 수 없습니다.
        </div>
        <Link to="/groups" className="btn btn-primary">
          그룹 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{group.name} 그룹</h2>
        <div>
          <Link to="/groups" className="btn btn-outline-secondary me-2">
            그룹 목록으로
          </Link>
          <Link to={`/tests/start/${id}`} className="btn btn-success">
            테스트 시작
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">새 단어 추가</div>
        <div className="card-body">
          <form onSubmit={handleAddWord}>
            <div className="mb-3">
              <label htmlFor="english" className="form-label">영어 단어</label>
              <input
                type="text"
                className="form-control"
                id="english"
                placeholder="영어 단어"
                name="english"
                value={newWord.english}
                onChange={handleEnglishChange}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                ref={englishInputRef}
                autoFocus
                lang="en"
                inputMode="text"
              />
            </div>

            <label className="form-label">한글 해석 (탭 키를 눌러 추가 필드 생성)</label>
            {newWord.koreanList.map((korean, index) => (
              <div className="input-group mb-2" key={index}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`한글 해석 ${index + 1}`}
                  name="korean"
                  value={korean}
                  onChange={(e) => handleKoreanChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => koreanInputRefs.current[index] = el}
                  lang="ko"
                  inputMode="text"
                />
                {newWord.koreanList.length > 1 && (
                  <button 
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveKoreanField(index)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}

            <div className="d-flex justify-content-between mt-3">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handleAddKoreanField}
              >
                한글 해석 추가 +
              </button>
              <button className="btn btn-primary" type="submit">단어 저장</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>단어 목록 ({words.length}개)</span>
        </div>
        {words.length > 0 ? (
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col" style={{ width: '5%' }}>#</th>
                <th scope="col" style={{ width: '40%' }}>영어</th>
                <th scope="col" style={{ width: '40%' }}>한글</th>
                <th scope="col" style={{ width: '15%' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, index) => (
                <tr key={word.id}>
                  <td>{index + 1}</td>
                  <td>{word.english}</td>
                  <td>{word.korean}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => navigate(`/words/edit/${word.id}`)}
                    >
                      수정
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="card-body text-center py-5">
            <p className="mb-0">아직 단어가 없습니다. 위에서 단어를 추가해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail; 