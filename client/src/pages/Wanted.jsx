import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWantedList, getMyWanted } from '../services/wantedService';
import { CATEGORIES } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import WantedCard from '../components/WantedCard';
import Skeleton from '../components/Skeleton';

export default function Wanted() {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse'); // 'browse' | 'mine'
  const [residence, setResidence] = useState('');
  const [category, setCategory] = useState('');

  const browseQuery = useQuery({
    queryKey: ['wanted', { residence, category }],
    queryFn: () => getWantedList({ residence: residence || undefined, category: category || undefined }),
    enabled: tab === 'browse',
  });

  const mineQuery = useQuery({
    queryKey: ['myWanted'],
    queryFn: getMyWanted,
    enabled: tab === 'mine' && Boolean(user),
  });

  const isLoading = tab === 'browse' ? browseQuery.isLoading : mineQuery.isLoading;
  const items = tab === 'browse' ? browseQuery.data || [] : mineQuery.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold">Wanted Board</h1>
        <Link
          to="/wanted/new"
          className="bg-primary-600 text-white font-medium px-4 py-2 rounded-md hover:bg-primary-700 text-sm"
        >
          + Post a Request
        </Link>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Can't find what you need? Post what you're looking for and let sellers find you.
      </p>

      {user && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('browse')}
            className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
              tab === 'browse' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
              tab === 'mine' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            My Requests
          </button>
        </div>
      )}

      {tab === 'browse' && (
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">All Residences</option>
            <option value="Sokomoko">Sokomoko</option>
            <option value="KU">KU</option>
            <option value="Annex">Annex</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-6 py-10 text-center">
          <p className="text-4xl mb-3">🔎</p>
          <p className="font-semibold mb-1">
            {tab === 'mine' ? "You haven't posted any requests yet." : 'No active requests right now.'}
          </p>
          <Link
            to="/wanted/new"
            className="inline-block mt-3 bg-primary-600 text-white font-medium px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Post a Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((wanted) => (
            <WantedCard key={wanted._id} wanted={wanted} />
          ))}
        </div>
      )}
    </div>
  );
}