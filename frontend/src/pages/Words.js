import React, { useState, useEffect } from 'react';
import { wordApi, groupApi } from '../services/api';
import './Words.css';

const Words = () => {
  const [groups, setGroups] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [justFinishedSelection, setJustFinishedSelection] = useState(false);
  
  // 그룹 관리 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ENGLISH');
  const [categories, setCategories] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, wordsData, categoriesData] = await Promise.all([
        groupApi.getAllGroups(),
        wordApi.getAllWords(),
        groupApi.getCategories()
      ]);
      
      setGroups(groupsData);
      setWords(wordsData);
      setCategories(categoriesData.categories);
      setSelectedCategory(categoriesData.defaultCategory);
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 그룹별로 단어들을 분류
  const getWordsByGroup = (groupId) => {
    return words.filter(word => word.group_id === groupId);
  };

  // 단어 선택/해제
  const toggleWordSelection = (wordId, event) => {
    event.preventDefault();
    event.stopPropagation(); // 이벤트 버블링 방지
    
    const newSelected = new Set(selectedWords);
    const isCurrentlySelected = newSelected.has(wordId);
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd 클릭: 개별 선택/해제
      if (isCurrentlySelected) {
        newSelected.delete(wordId);
      } else {
        newSelected.add(wordId);
      }
    } else {
      // 일반 클릭
      if (isCurrentlySelected && newSelected.size === 1) {
        // 이미 선택된 단어가 유일한 선택인 경우 선택 해제
        newSelected.clear();
      } else {
        // 새로운 단어 선택 또는 다른 단어들이 선택된 상태에서 단일 선택
        newSelected.clear();
        newSelected.add(wordId);
      }
    }
    
    setSelectedWords(newSelected);
  };

  // 드래그 시작
  const handleDragStart = (e, wordId) => {
    // 드래그하는 단어가 선택되지 않은 경우 해당 단어만 선택
    let wordsToMove;
    if (!selectedWords.has(wordId)) {
      wordsToMove = [wordId];
      setSelectedWords(new Set([wordId]));
    } else {
      wordsToMove = Array.from(selectedWords);
    }
    
    // 데이터 전송 설정
    try {
      const dragData = JSON.stringify(wordsToMove);
      e.dataTransfer.setData('text/plain', dragData);
      e.dataTransfer.effectAllowed = 'move';
      
      // 디버그용 로그
      console.log('드래그 시작:', { wordsToMove, dragData });
      
    } catch (error) {
      console.error('드래그 데이터 설정 오류:', error);
      e.preventDefault(); // 드래그 취소
      return;
    }
    
    setIsDragging(true);
  };

  // 드래그 종료
  const handleDragEnd = (e) => {
    setIsDragging(false);
    console.log('드래그 종료:', e.dataTransfer.dropEffect);
  };

  // 드롭 허용
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그 중인 데이터가 있는지 확인
    if (isDragging) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  // 드롭 처리
  const handleDrop = async (e, targetGroupId) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    console.log('드롭 시작:', { targetGroupId });
    
    try {
      const dragData = e.dataTransfer.getData('text/plain');
      console.log('드래그 데이터:', dragData);
      
      // 데이터가 없거나 빈 문자열인 경우 처리
      if (!dragData || dragData.trim() === '') {
        console.warn('드래그 데이터가 없습니다.');
        return;
      }
      
      let wordIds;
      try {
        wordIds = JSON.parse(dragData);
        console.log('파싱된 단어 IDs:', wordIds);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError, '원본 데이터:', dragData);
        alert('드래그 데이터 처리 중 오류가 발생했습니다.');
        return;
      }
      
      // wordIds가 배열인지 확인
      if (!Array.isArray(wordIds)) {
        console.error('잘못된 드래그 데이터 형식:', wordIds);
        return;
      }
      
      console.log('이동할 단어들:', wordIds, '대상 그룹:', targetGroupId);
      
      // 선택된 단어들을 새 그룹으로 이동
      let movedCount = 0;
      for (const wordId of wordIds) {
        const word = words.find(w => w.id === wordId);
        if (word && word.group_id !== targetGroupId) {
          console.log(`단어 ${word.english} (ID: ${wordId})을 그룹 ${targetGroupId}로 이동 중...`);
          await wordApi.updateWord(wordId, {
            english: word.english,
            korean: word.korean,
            groupId: targetGroupId
          });
          movedCount++;
        }
      }
      
      console.log(`${movedCount}개 단어 이동 완료`);
      
      // 데이터 새로고침
      await fetchData();
      setSelectedWords(new Set());
      
    } catch (error) {
      console.error('단어 이동 중 오류 발생:', error);
      alert('단어 이동 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 빈 공간 클릭 처리
  const handleEmptySpaceClick = (e) => {
    if (e.target.closest('.word-item')) return; // 단어 아이템 클릭 시 무시
    
    // 빈 공간 클릭 시 선택 해제 (Ctrl 키가 눌리지 않은 경우)
    if (!e.ctrlKey && !e.metaKey && !isSelecting) {
      setSelectedWords(new Set());
    }
  };

  // 마우스 다운 (드래그 선택 시작) - 그룹별로 처리
  const handleMouseDown = (e, groupId) => {
    if (e.target.closest('.word-item')) return; // 단어 아이템 클릭 시 무시
    
    // 스크롤 컨테이너 기준으로 좌표 계산
    const scrollContainer = document.querySelector(`[data-group-id="${groupId}"] .word-list-container`);
    if (!scrollContainer) return;
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;
    
    // 스크롤을 고려한 실제 위치 (단어 선택용)
    const actualStartX = e.clientX - containerRect.left;
    const actualStartY = e.clientY - containerRect.top + scrollTop;
    
    // 화면 표시용 위치 (선택 박스용)
    const displayStartX = e.clientX - containerRect.left;
    const displayStartY = e.clientY - containerRect.top;
    
    const startPos = {
      x: actualStartX,
      y: actualStartY,
      groupId: groupId,
      containerRect: containerRect,
      initialScrollTop: scrollTop
    };
    
    setDragStartPos(startPos);
    setIsSelecting(true);
    setSelectionBox({
      startX: displayStartX,
      startY: displayStartY,
      endX: displayStartX,
      endY: displayStartY,
      groupId: groupId
    });
    
    // 기존 선택 해제 (Ctrl 키가 눌리지 않은 경우)
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedWords(new Set());
    }
  };

  // 마우스 이동 (선택 영역 업데이트) - 스크롤 고려
  const handleMouseMove = (e, groupId) => {
    if (!isSelecting || !dragStartPos || dragStartPos.groupId !== groupId) return;
    
    // 현재 스크롤 컨테이너 상태
    const scrollContainer = document.querySelector(`[data-group-id="${groupId}"] .word-list-container`);
    if (!scrollContainer) return;
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;
    
    // 현재 마우스 위치 (스크롤 고려한 실제 위치 - 단어 선택용)
    const actualCurrentX = e.clientX - containerRect.left;
    const actualCurrentY = e.clientY - containerRect.top + scrollTop;
    
    // 화면 표시용 위치 (선택 박스용)
    const displayCurrentX = e.clientX - containerRect.left;
    const displayCurrentY = e.clientY - containerRect.top;
    
    setSelectionBox({
      ...selectionBox,
      endX: displayCurrentX,
      endY: displayCurrentY
    });
    
    // 선택 영역 계산 (실제 위치 기준)
    const selectionStartX = Math.min(dragStartPos.x, actualCurrentX);
    const selectionStartY = Math.min(dragStartPos.y, actualCurrentY);
    const selectionEndX = Math.max(dragStartPos.x, actualCurrentX);
    const selectionEndY = Math.max(dragStartPos.y, actualCurrentY);
    
    // 선택 영역과 교차하는 단어들 찾기
    const wordsInGroup = getWordsByGroup(groupId);
    const selectedInBox = new Set();
    
    wordsInGroup.forEach(word => {
      const wordElement = document.querySelector(`[data-word-id="${word.id}"]`);
      if (wordElement) {
        // 단어의 실제 위치 (스크롤 고려)
        const wordRect = wordElement.getBoundingClientRect();
        
        const wordLeft = wordRect.left - containerRect.left;
        const wordTop = wordRect.top - containerRect.top + scrollTop;
        const wordRight = wordLeft + wordRect.width;
        const wordBottom = wordTop + wordRect.height;
        
        // 선택 영역과 교차하는지 확인
        if (wordLeft < selectionEndX && 
            wordRight > selectionStartX && 
            wordTop < selectionEndY && 
            wordBottom > selectionStartY) {
          selectedInBox.add(word.id);
        }
      }
    });
    
    // 기존 선택과 병합 (Ctrl 키가 눌린 경우)
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedWords);
      selectedInBox.forEach(id => newSelected.add(id));
      setSelectedWords(newSelected);
    } else {
      setSelectedWords(selectedInBox);
    }
  };

  // 마우스 업 (선택 종료)
  const handleMouseUp = (e) => {
    const wasDragging = isSelecting && selectionBox && 
      (Math.abs(selectionBox.endX - selectionBox.startX) > 5 || 
       Math.abs(selectionBox.endY - selectionBox.startY) > 5);
    
    // 드래그가 아닌 클릭인 경우 빈 공간 클릭 처리
    if (!wasDragging && dragStartPos) {
      handleEmptySpaceClick(e);
    }
    
    setIsSelecting(false);
    setSelectionBox(null);
    setDragStartPos(null);
    setJustFinishedSelection(true);
  };

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    if (isSelecting) {
      const handleGlobalMouseMove = (e) => {
        if (dragStartPos) {
          handleMouseMove(e, dragStartPos.groupId);
        }
      };
      
      const handleGlobalMouseUp = (e) => {
        handleMouseUp(e);
      };
      
      // 스크롤 이벤트 리스너 추가
      const handleScroll = (e) => {
        if (isSelecting && dragStartPos && window.lastMouseX && window.lastMouseY) {
          // 현재 마우스 위치로 가짜 이벤트 생성
          const fakeEvent = {
            clientX: window.lastMouseX,
            clientY: window.lastMouseY,
            ctrlKey: window.lastCtrlKey || false,
            metaKey: window.lastMetaKey || false
          };
          handleMouseMove(fakeEvent, dragStartPos.groupId);
        }
      };
      
      // 마우스 위치 추적
      const trackMouse = (e) => {
        window.lastMouseX = e.clientX;
        window.lastMouseY = e.clientY;
        window.lastCtrlKey = e.ctrlKey;
        window.lastMetaKey = e.metaKey;
      };
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mousemove', trackMouse);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      // 모든 스크롤 가능한 컨테이너에 스크롤 이벤트 추가
      const scrollContainers = document.querySelectorAll('.word-list-container');
      scrollContainers.forEach(container => {
        container.addEventListener('scroll', handleScroll);
      });
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mousemove', trackMouse);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        scrollContainers.forEach(container => {
          container.removeEventListener('scroll', handleScroll);
        });
      };
    }
  }, [isSelecting, dragStartPos, selectionBox, selectedWords]);

  // 페이지 전체 클릭 이벤트 리스너 (선택 해제를 위해)
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // 드래그 선택 완료 직후인 경우 무시
      if (justFinishedSelection) {
        setJustFinishedSelection(false);
        return;
      }
      
      // 단어 아이템 클릭인지 확인
      if (e.target.closest('.word-item')) return;
      
      // 카드 헤더 클릭인지 확인 (그룹 이름 부분)
      if (e.target.closest('.card-header')) return;
      
      // 선택 영역 드래그 중인지 확인
      if (isSelecting) return;
      
      // Ctrl/Cmd 키가 눌린 경우 무시
      if (e.ctrlKey || e.metaKey) return;
      
      // 모든 선택 해제
      if (selectedWords.size > 0) {
        setSelectedWords(new Set());
      }
    };

    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [selectedWords, isSelecting, justFinishedSelection]);

  // 그룹 생성
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert('그룹 이름을 입력해주세요.');
      return;
    }

    try {
      await groupApi.createGroup({ 
        name: newGroupName,
        category: selectedCategory 
      });
      setNewGroupName('');
      setShowCreateModal(false);
      await fetchData();
    } catch (error) {
      console.error('그룹 생성 중 오류 발생:', error);
      alert('그룹 생성 중 오류가 발생했습니다.');
    }
  };

  // 그룹 수정
  const handleEditGroup = (group) => {
    setEditingGroup(group.id);
    setEditGroupName(group.name);
  };

  const handleUpdateGroup = async (groupId) => {
    if (!editGroupName.trim()) {
      alert('그룹 이름을 입력해주세요.');
      return;
    }

    try {
      await groupApi.updateGroup(groupId, { name: editGroupName });
      setEditingGroup(null);
      setEditGroupName('');
      await fetchData();
    } catch (error) {
      console.error('그룹 수정 중 오류 발생:', error);
      alert('그룹 수정 중 오류가 발생했습니다.');
    }
  };

  // 그룹 삭제
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('정말로 이 그룹을 삭제하시겠습니까? 그룹 내의 모든 단어가 삭제됩니다.')) {
      return;
    }

    try {
      await groupApi.deleteGroup(groupId);
      await fetchData();
      setSelectedWords(new Set()); // 선택된 단어 초기화
    } catch (error) {
      console.error('그룹 삭제 중 오류 발생:', error);
      alert('그룹 삭제 중 오류가 발생했습니다.');
    }
  };

  // 선택된 단어들 삭제
  const handleDeleteSelectedWords = async () => {
    if (selectedWords.size === 0) {
      alert('삭제할 단어를 선택해주세요.');
      return;
    }

    const selectedCount = selectedWords.size;
    if (!window.confirm(`선택된 ${selectedCount}개의 단어를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 선택된 모든 단어 삭제
      for (const wordId of selectedWords) {
        await wordApi.deleteWord(wordId);
      }
      
      // 데이터 새로고침 및 선택 초기화
      await fetchData();
      setSelectedWords(new Set());
      alert(`${selectedCount}개의 단어가 삭제되었습니다.`);
    } catch (error) {
      console.error('단어 삭제 중 오류 발생:', error);
      alert('단어 삭제 중 오류가 발생했습니다.');
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

  return (
    <div className="container-fluid mt-4">
      {/* 헤더 영역 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="selected-counter">
            {selectedWords.size > 0 && (
              <>
                <span className="badge bg-primary fs-6 me-2">
                  {selectedWords.size}개 선택됨
                </span>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteSelectedWords}
                >
                  선택된 단어 삭제
                </button>
              </>
            )}
          </div>
        </div>
        <button 
          className="btn btn-primary add-group-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg"></i>
          <span>그룹 추가</span>
        </button>
      </div>
      
      <div className="row">
        {groups.map((group, index) => (
          <div key={group.id} className="col-md-6 mb-4">
            <div 
              className={`word-group-container ${isDragging ? 'drag-active' : ''} ${isSelecting ? 'selecting' : ''}`}
              data-group-id={group.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, group.id)}
              onMouseDown={(e) => handleMouseDown(e, group.id)}
              style={{ position: 'relative' }}
            >
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    {editingGroup === group.id ? (
                      <div className="d-flex align-items-center gap-2 flex-grow-1">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editGroupName}
                          onChange={(e) => setEditGroupName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateGroup(group.id);
                            if (e.key === 'Escape') setEditingGroup(null);
                          }}
                          autoFocus
                        />
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleUpdateGroup(group.id)}
                        >
                          <i className="bi bi-check"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingGroup(null)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex align-items-center gap-3">
                          <h5 className="mb-0 group-title">{group.name}</h5>
                          <span className="badge bg-light text-dark">
                            {getWordsByGroup(group.id).length}개
                          </span>
                        </div>
                        <div className="group-actions">
                          <button 
                            className="btn btn-sm btn-outline-light me-1"
                            onClick={() => handleEditGroup(group)}
                            title="그룹 이름 수정"
                          >
                            수정
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-light"
                            onClick={() => handleDeleteGroup(group.id)}
                            title="그룹 삭제"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="card-body word-list-container">
                  {getWordsByGroup(group.id).length > 0 ? (
                    <div className="word-list">
                      {getWordsByGroup(group.id).map((word) => (
                        <div
                          key={word.id}
                          data-word-id={word.id}
                          className={`word-item ${selectedWords.has(word.id) ? 'selected' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, word.id)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => toggleWordSelection(word.id, e)}
                        >
                          <div className="word-content">
                            <div className="word-english">{word.english}</div>
                            <div className="word-korean">{word.korean}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-group">
                      <div className="empty-icon">📝</div>
                      <p className="empty-text">{group.questionLabel || '단어'}가 없습니다</p>
                      <p className="empty-subtext">다른 그룹에서 {group.questionLabel || '단어'}를 드래그해서 가져오세요</p>
                    </div>
                  )}
                </div>
              </div>
               
              {/* 선택 박스 렌더링 (각 그룹별) */}
              {isSelecting && selectionBox && selectionBox.groupId === group.id && (
                <div
                  className="selection-box"
                  style={{
                    position: 'absolute',
                    left: Math.min(selectionBox.startX, selectionBox.endX),
                    top: Math.min(selectionBox.startY, selectionBox.endY) + 60, // 카드 헤더 높이만큼 조정
                    width: Math.abs(selectionBox.endX - selectionBox.startX),
                    height: Math.abs(selectionBox.endY - selectionBox.startY),
                    border: '2px dashed #007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* 그룹 생성 모달 */}
      {showCreateModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">새 그룹 추가</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateGroup}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="categorySelect" className="form-label">카테고리</label>
                      <select
                        className="form-select"
                        id="categorySelect"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        {categories.map(category => (
                          <option key={category.key} value={category.key}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {selectedCategory && categories.length > 0 && (
                        <div className="form-text">
                          {categories.find(c => c.key === selectedCategory)?.questionLabel} → {categories.find(c => c.key === selectedCategory)?.answerLabel} 형태로 학습 항목을 관리합니다.
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="groupName" className="form-label">그룹 이름</label>
                      <input
                        type="text"
                        className="form-control"
                        id="groupName"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="예: TOEIC 고급 단어"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                      생성
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
      
      {/* 사용법 안내 */}
      <div className="usage-info mt-4">
        <div className="alert alert-light border">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold">💡 사용법</h6>
              <ul className="small mb-0">
                <li>단어 클릭으로 선택/해제</li>
                <li>Ctrl + 클릭으로 다중 선택</li>
                <li>빈 공간 드래그로 영역 선택</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold">🚀 기능</h6>
              <ul className="small mb-0">
                <li>선택된 단어를 드래그하여 그룹 이동</li>
                <li>그룹 헤더에서 수정/삭제 가능</li>
                <li>빈 공간 클릭으로 선택 해제</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Words; 