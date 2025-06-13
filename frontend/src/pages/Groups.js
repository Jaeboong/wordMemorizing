import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, preferenceApi } from '../services/api';

const SORT_PREFERENCE_KEY = 'groups_sort_option';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // 기본 정렬: 최신순
  
  // AI 검토 관련 상태
  const [showAiReviewModal, setShowAiReviewModal] = useState(false);
  const [reviewingGroupId, setReviewingGroupId] = useState(null);
  const [reviewingGroupName, setReviewingGroupName] = useState('');
  const [aiReviewResults, setAiReviewResults] = useState([]);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [selectedWords, setSelectedWords] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [aiError, setAiError] = useState(''); // AI 검토 오류 메시지

  useEffect(() => {
    // 컴포넌트 마운트 시 저장된 정렬 옵션 불러오기 및 그룹 데이터 가져오기
    const initData = async () => {
      try {
        // 저장된 정렬 기준 불러오기
        const savedSortOption = await preferenceApi.getPreference(SORT_PREFERENCE_KEY);
        
        // 저장된 정렬 기준이 있다면 적용
        if (savedSortOption) {
          setSortOption(savedSortOption);
        }
        
        // 그룹 데이터 가져오기
        await fetchGroups(savedSortOption || sortOption);
      } catch (error) {
        console.error('초기 데이터 로딩 중 오류 발생:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    initData();
  }, []);

  const fetchGroups = async (option) => {
    try {
      setLoading(true);
      const data = await groupApi.getAllGroups();
      sortGroups(data, option); // 정렬 적용
    } catch (error) {
      console.error('그룹 로딩 중 오류 발생:', error);
      alert('그룹을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 그룹 정렬 함수
  const sortGroups = (data, option) => {
    const sortedGroups = [...data];
    
    switch (option) {
      case 'name_asc': // 이름 오름차순 (가나다순)
        sortedGroups.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'name_desc': // 이름 내림차순 (가나다 역순)
        sortedGroups.sort((a, b) => b.name.localeCompare(a.name, 'ko'));
        break;
      case 'newest': // 최신순 (ID 내림차순)
        sortedGroups.sort((a, b) => b.id - a.id);
        break;
      case 'oldest': // 오래된 순 (ID 오름차순)
        sortedGroups.sort((a, b) => a.id - b.id);
        break;
      default:
        break;
    }
    
    setGroups(sortedGroups);
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = async (option) => {
    setSortOption(option);
    sortGroups(groups, option);
    
    // 서버에 정렬 기준 저장
    try {
      await preferenceApi.savePreference(SORT_PREFERENCE_KEY, option);
    } catch (error) {
      console.error('정렬 기준 저장 중 오류 발생:', error);
      // 저장 실패해도 UI는 변경된 상태 유지
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert('그룹 이름을 입력해주세요.');
      return;
    }

    try {
      await groupApi.createGroup({ name: newGroupName });
      setNewGroupName('');
      fetchGroups(sortOption);
    } catch (error) {
      console.error('그룹 생성 중 오류 발생:', error);
      alert('그룹 생성 중 오류가 발생했습니다.');
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group.id);
    setEditName(group.name);
  };

  const handleUpdateGroup = async (id) => {
    if (!editName.trim()) {
      alert('그룹 이름을 입력해주세요.');
      return;
    }

    try {
      await groupApi.updateGroup(id, { name: editName });
      setEditingGroup(null);
      fetchGroups(sortOption);
    } catch (error) {
      console.error('그룹 수정 중 오류 발생:', error);
      alert('그룹 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('정말로 이 그룹을 삭제하시겠습니까? 그룹 내의 모든 단어가 삭제됩니다.')) {
      return;
    }

    try {
      await groupApi.deleteGroup(id);
      fetchGroups(sortOption);
    } catch (error) {
      console.error('그룹 삭제 중 오류 발생:', error);
      alert('그룹 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // AI 검토 시작
  const handleStartAiReview = async (group) => {
    setReviewingGroupId(group.id);
    setReviewingGroupName(group.name);
    setAiReviewResults([]);
    setSelectedWords({});
    setUpdateSuccess(false);
    setAiError(''); // 오류 메시지 초기화
    setShowAiReviewModal(true);
    
    try {
      setAiReviewLoading(true);
      
      // API 요청에 30초 타임아웃 추가
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('요청 시간이 초과되었습니다. 서버 응답이 지연되고 있습니다.')), 60000);
      });
      
      // 실제 API 요청
      const fetchPromise = groupApi.validateGroup(group.id);
      
      // 두 Promise 중 먼저 완료되는 것 처리
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // 문제가 있는 단어가 없는 경우
      if (!result.results || result.results.length === 0) {
        alert('이 그룹의 모든 단어 매칭이 정확합니다!');
        setShowAiReviewModal(false);
        return;
      }
      
      // 문제가 있는 단어 표시
      setAiReviewResults(result.results);
      
      // 초기 체크박스 상태 설정 (기본적으로 모두 선택)
      const initialSelected = {};
      result.results.forEach(word => {
        initialSelected[word.id] = true;
      });
      setSelectedWords(initialSelected);
    } catch (error) {
      console.error('AI 검토 중 오류 발생:', error);
      setAiError(error.message || 'AI 검토 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setAiReviewLoading(false);
    }
  };
  
  // 단어 체크박스 변경 핸들러
  const handleWordSelectionChange = (wordId) => {
    setSelectedWords(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };
  
  // 모든 단어 선택/해제 핸들러
  const handleSelectAllWords = (selectAll) => {
    const newSelected = {};
    aiReviewResults.forEach(word => {
      newSelected[word.id] = selectAll;
    });
    setSelectedWords(newSelected);
  };
  
  // 선택된 단어 수정 적용
  const handleApplyChanges = async () => {
    // 선택된 단어만 필터링
    const wordsToUpdate = aiReviewResults
      .filter(word => selectedWords[word.id])
      .map(word => ({
        id: word.id,
        suggestedKorean: word.suggestedKorean,
        suggestedEnglish: word.suggestedEnglish,
        correctionType: word.correctionType || '수정'
      }));
    
    if (wordsToUpdate.length === 0) {
      alert('수정할 단어를 선택해주세요.');
      return;
    }
    
    try {
      setAiReviewLoading(true);
      await groupApi.updateGroupWords(reviewingGroupId, wordsToUpdate);
      setUpdateSuccess(true);
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        setShowAiReviewModal(false);
        fetchGroups(sortOption); // 그룹 목록 새로고침
      }, 3000);
    } catch (error) {
      console.error('단어 수정 중 오류 발생:', error);
      alert('단어 수정 중 오류가 발생했습니다.');
    } finally {
      setAiReviewLoading(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">단어 그룹 관리</h2>
      
      <div className="card mb-4">
        <div className="card-header">새 그룹 추가</div>
        <div className="card-body">
          <form onSubmit={handleCreateGroup}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="그룹 이름"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">추가</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>그룹 목록</span>
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className={`btn btn-sm ${sortOption === 'name_asc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSortChange('name_asc')}
            >
              이름순 ↑
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${sortOption === 'name_desc' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSortChange('name_desc')}
            >
              이름순 ↓
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${sortOption === 'newest' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSortChange('newest')}
            >
              최신순 ↑
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${sortOption === 'oldest' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleSortChange('oldest')}
            >
              최신순 ↓
            </button>
          </div>
        </div>
        <ul className="list-group list-group-flush">
          {groups.length > 0 ? (
            groups.map((group) => (
              <li key={group.id} className="list-group-item">
                {editingGroup === group.id ? (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleUpdateGroup(group.id)}
                    >
                      저장
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setEditingGroup(null)}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Link to={`/groups/${group.id}`} className="text-decoration-none h5 mb-0">
                        {group.name}
                      </Link>
                      <span className="ms-2 badge bg-primary rounded-pill">
                        {group.word_count || 0}개 단어
                      </span>
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-info me-1"
                        onClick={() => handleStartAiReview(group)}
                        disabled={!group.word_count}
                      >
                        AI 검토
                      </button>
                      <Link 
                        to={`/tests/start/${group.id}`} 
                        className="btn btn-sm btn-outline-success me-1"
                      >
                        테스트
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => handleEditGroup(group)}
                      >
                        수정
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="list-group-item text-center">
              그룹이 없습니다. 위에서 새 그룹을 추가해보세요!
            </li>
          )}
        </ul>
      </div>
      
      {/* AI 검토 모달 */}
      {showAiReviewModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">AI 단어 검토: {reviewingGroupName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAiReviewModal(false)}
                  disabled={aiReviewLoading}
                ></button>
              </div>
              <div className="modal-body">
                {aiReviewLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">AI가 단어를 검토하고 있습니다. 잠시만 기다려주세요...</p>
                    <p className="text-muted small">
                      (단어 수에 따라 최대 1분까지 소요될 수 있습니다)
                    </p>
                  </div>
                ) : aiError ? (
                  <div className="alert alert-danger">
                    <h5 className="alert-heading">오류 발생</h5>
                    <p>{aiError}</p>
                    <hr />
                    <p className="mb-0">
                      다음 사항을 확인해보세요:
                      <ul className="mb-0 mt-2">
                        <li>서버의 OpenAI API 키가 설정되어 있는지 확인하세요.</li>
                        <li>API 키가 GPT 모델에 접근할 권한이 있는지 확인하세요.</li>
                        <li>서버 로그를 확인하여 더 자세한 오류 정보를 확인하세요.</li>
                      </ul>
                    </p>
                  </div>
                ) : updateSuccess ? (
                  <div className="alert alert-success text-center">
                    <h4 className="alert-heading">수정 완료!</h4>
                    <p>선택한 단어들이 성공적으로 수정되었습니다.</p>
                    <p className="mb-0">3초 후 자동으로 닫힙니다...</p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <h6>AI가 발견한 문제 단어: {aiReviewResults.length}개</h6>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleSelectAllWords(true)}
                        >
                          모두 선택
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleSelectAllWords(false)}
                        >
                          모두 해제
                        </button>
                      </div>
                    </div>
                    
                    {aiReviewResults.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '5%' }}>선택</th>
                              <th style={{ width: '5%' }}>ID</th>
                              <th style={{ width: '15%' }}>현재 영어</th>
                              <th style={{ width: '15%' }}>제안 영어</th>
                              <th style={{ width: '15%' }}>현재 번역</th>
                              <th style={{ width: '15%' }}>제안 번역</th>
                              <th style={{ width: '30%' }}>설명</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiReviewResults.map((word) => (
                              <tr key={word.id} className={word.isCorrect ? "" : "table-danger"}>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedWords[word.id] || false}
                                    onChange={() => handleWordSelectionChange(word.id)}
                                  />
                                </td>
                                <td>{word.id}</td>
                                <td>{word.english}</td>
                                <td className={word.suggestedEnglish && word.suggestedEnglish !== word.english ? "text-danger fw-bold" : ""}>
                                  {word.suggestedEnglish || word.english}
                                </td>
                                <td>{word.korean}</td>
                                <td className="text-success fw-bold">{word.suggestedKorean}</td>
                                <td>
                                  <small>
                                    {word.isCorrect ? 
                                      <span className="text-success">✓</span> : 
                                      <span className="text-danger">✗</span>
                                    } {word.explanation}
                                    {word.correctionType && <span className="ms-1 badge bg-info">{word.correctionType}</span>}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-warning">
                        AI가 문제를 발견한 단어가 없습니다.
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAiReviewModal(false)}
                  disabled={aiReviewLoading}
                >
                  닫기
                </button>
                {!updateSuccess && !aiReviewLoading && !aiError && aiReviewResults.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApplyChanges}
                    disabled={Object.values(selectedWords).filter(Boolean).length === 0}
                  >
                    선택한 단어 수정하기
                  </button>
                )}
                {aiError && (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => handleStartAiReview({ id: reviewingGroupId, name: reviewingGroupName })}
                  >
                    다시 시도
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 모달 배경 */}
      {showAiReviewModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default Groups; 