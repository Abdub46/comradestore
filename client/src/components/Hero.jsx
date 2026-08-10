import React from 'react';
import SearchBar from './SearchBar';

export default function Hero() {
  return (
    <div className="bg-primary-600 text-white rounded-b-[2rem] pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-6">What are you looking for?</h1>
        <SearchBar />
      </div>
    </div>
  );
}

