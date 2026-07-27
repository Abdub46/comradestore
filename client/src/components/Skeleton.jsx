import React from 'react';

// Base "shimmer" building block - a pulsing gray bar. Compose several of
// these to build a skeleton matching the shape of the real content.
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}