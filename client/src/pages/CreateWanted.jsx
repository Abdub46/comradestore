import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWanted } from '../services/wantedService';
import { CATEGORIES } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { notBlank } from '../utils/validators';

export default function CreateWanted() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { residence: user?.residence },
  });

  const createMutation = useMutation({
    mutationFn: createWanted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wanted'] });
      queryClient.invalidateQueries({ queryKey: ['myWanted'] });
      navigate('/wanted');
    },
    onError: (err) => {
      setServerError(err.response?.data?.message || 'Failed to post your request.');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Post a Wanted Request</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Tell sellers what you're looking for and they can reach out to you directly.
      </p>

      {serverError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">What are you looking for?</label>
          <input
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 3, message: 'Must be at least 3 characters' },
              validate: notBlank,
            })}
            placeholder="e.g. 5x6 Mattress"
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Category (optional)</label>
          <select
            {...register('category')}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Not sure / any category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Any details that would help a seller know if they have what you need"
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Min Budget (KSh)</label>
            <input
              type="number"
              min="0"
              {...register('minBudget')}
              placeholder="Optional"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Budget (KSh)</label>
            <input
              type="number"
              min="0"
              {...register('maxBudget')}
              placeholder="Optional"
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Residence</label>
          <select
            {...register('residence', { required: true })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select residence</option>
            <option value="Sokomoko">Sokomoko</option>
            <option value="KU">KU</option>
            <option value="Annex">Annex</option>
          </select>
          {errors.residence && <p className="text-xs text-red-600 mt-1">Residence is required</p>}
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {createMutation.isPending ? 'Posting...' : 'Post Request'}
        </button>
      </form>
    </div>
  );
}