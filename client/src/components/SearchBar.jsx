import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './icons';

export default function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4">
      <div className="flex items-center bg-white rounded-full shadow-md pl-5 pr-1.5 py-1.5">
        <SearchIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items, categories..."
          className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-gray-900"
        />
        <button
          type="submit"
          aria-label="Search"
          className="h-11 w-11 flex-shrink-0 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
