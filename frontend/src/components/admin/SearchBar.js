import React, { useState, useEffect } from 'react';

const SearchBar = ({ placeholder = 'Search...', onSearch, value: externalValue, delay = 300 }) => {
  const [searchTerm, setSearchTerm] = useState(externalValue || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, onSearch]);

  useEffect(() => {
    if (externalValue !== undefined) {
      setSearchTerm(externalValue);
    }
  }, [externalValue]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-search text-gray-400"></i>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <i className="fas fa-times-circle text-gray-400 hover:text-gray-600"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;