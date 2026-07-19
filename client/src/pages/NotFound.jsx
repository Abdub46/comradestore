import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found.</p>
      <Link to="/" className="text-primary-600 font-medium">
        Back to home
      </Link>
    </div>
  );
}
