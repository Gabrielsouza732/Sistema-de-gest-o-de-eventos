import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({
  onSearch,
  placeholder = 'Pesquisar...'
}) => {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (searchText === '') {
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  const handleChangeText = (e) => {
    const text = e.target.value;
    setSearchText(text);
    onSearch(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchText);
    }
  };

  return (
    <div className="search-filter-container">
      <div 
        className={`search-container ${isFocused ? 'search-container-focused' : ''}`}
      >
        {/* Removido: <div className="search-icon">🔍</div> */}
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchText}
          onChange={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
        />
        {searchText !== '' && (
          <button 
            onClick={handleClear} 
            className="clear-button"
            type="button"
            aria-label="Limpar pesquisa"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
