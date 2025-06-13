import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { wordApi } from '../services/api';

const WordSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const results = await wordApi.searchWords(keyword);
      setSearchResults(results);
      setSearched(true);
    } catch (error) {
      console.error('단어 검색 중 오류 발생:', error);
      alert('단어 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">단어 검색</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="영어 단어 또는 한글 의미 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    검색 중...
                  </>
                ) : '검색'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {searched && (
        <div className="card">
          <div className="card-header">
            검색 결과: {searchResults.length}개 단어
          </div>
          {searchResults.length > 0 ? (
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '5%' }}>#</th>
                  <th scope="col" style={{ width: '30%' }}>영어</th>
                  <th scope="col" style={{ width: '30%' }}>한글</th>
                  <th scope="col" style={{ width: '20%' }}>그룹</th>
                  <th scope="col" style={{ width: '15%' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((word, index) => (
                  <tr key={word.id}>
                    <td>{index + 1}</td>
                    <td>{word.english}</td>
                    <td>{word.korean}</td>
                    <td>{word.group_name}</td>
                    <td>
                      <Link 
                        to={`/groups/${word.group_id}`} 
                        className="btn btn-sm btn-outline-primary me-1"
                      >
                        그룹 보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="card-body text-center py-5">
              <p className="mb-0">검색 결과가 없습니다. 다른 검색어로 시도해보세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordSearch; 