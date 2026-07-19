import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto -mt-6 px-4">
      <div className="flex bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-5 py-3 bg-transparent outline-none text-sm"
        />
        <button
          type="submit"
          className="px-6 bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
