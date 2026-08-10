import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../services/productService';

// product.favoritedBy is an array of user id strings (Mongo ObjectIds
// serialize to strings over JSON), never populated - so a simple
// string-equality check against the logged-in user's id is enough.
function isFavoritedBy(product, userId) {
  if (!userId || !product?.favoritedBy) return false;
  return product.favoritedBy.some((id) => id?.toString() === userId);
}

export default function FavoriteButton({ product, className = '', size = 'md' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initiallyFavorited = isFavoritedBy(product, user?._id);
  // Optimistic local override - null means "trust the server-derived value
  // above", set to true/false the instant the user taps so the heart
  // updates immediately rather than waiting on the network.
  const [optimistic, setOptimistic] = useState(null);
  const favorited = optimistic === null ? initiallyFavorited : optimistic;

  const mutation = useMutation({
    mutationFn: () => toggleFavorite(product._id),
    onMutate: () => {
      setOptimistic(!favorited);
    },
    onError: () => {
      // Revert on failure
      setOptimistic(initiallyFavorited);
    },
    onSuccess: (data) => {
      setOptimistic(data.favorited);
      // Saved Items page and any other product list showing favorite
      // state should reflect this change next time they're viewed/refetched.
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['product', product._id] });
    },
  });

  const handleClick = (e) => {
    // Cards wrap this in a <Link> - stop the click from also navigating.
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }
    mutation.mutate();
  };

  const sizeClasses = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const iconSizeClasses = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutation.isPending}
      aria-label={favorited ? 'Remove from saved items' : 'Save item'}
      aria-pressed={favorited}
      title={favorited ? 'Saved' : 'Save'}
      className={`flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/80 shadow-sm hover:bg-white dark:hover:bg-gray-900 disabled:opacity-70 ${sizeClasses} ${className}`}
    >
      <HeartIcon
        filled={favorited}
        className={`${iconSizeClasses} ${favorited ? 'text-red-500' : 'text-gray-500 dark:text-gray-300'}`}
      />
    </button>
  );
}