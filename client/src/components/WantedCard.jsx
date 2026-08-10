import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationIcon, ClockIcon } from './icons';
import { formatKsh, timeAgo } from '../utils/format';
import { buildWantedWhatsAppLink } from '../utils/whatsapp';
import { useAuth } from '../contexts/AuthContext';
import { updateWantedStatus, deleteWanted } from '../services/wantedService';

function formatBudget(min, max) {
  if (min != null && max != null) return `${formatKsh(min)} – ${formatKsh(max)}`;
  if (min != null) return `${formatKsh(min)}+`;
  if (max != null) return `Up to ${formatKsh(max)}`;
  return 'Any budget';
}

export default function WantedCard({ wanted }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [removed, setRemoved] = useState(false);

  const isOwner = user && wanted.user && user._id === wanted.user._id;

  const fulfillMutation = useMutation({
    mutationFn: () => updateWantedStatus(wanted._id, 'Fulfilled'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wanted'] });
      queryClient.invalidateQueries({ queryKey: ['myWanted'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWanted(wanted._id),
    onSuccess: () => {
      setRemoved(true);
      queryClient.invalidateQueries({ queryKey: ['wanted'] });
      queryClient.invalidateQueries({ queryKey: ['myWanted'] });
    },
  });

  if (removed) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md p-4">
      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">🔎 Looking for</p>
      <h3 className="font-semibold line-clamp-1">{wanted.title}</h3>
      {wanted.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{wanted.description}</p>
      )}

      <p className="text-primary-700 dark:text-primary-300 font-bold mt-2">
        {formatBudget(wanted.minBudget, wanted.maxBudget)}
      </p>

      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <LocationIcon className="h-3 w-3" />
          {wanted.residence}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          {timeAgo(wanted.createdAt)}
        </span>
      </div>

      <div className="mt-3">
        {isOwner ? (
          <div className="flex items-center gap-3 text-xs font-semibold">
            {wanted.status === 'Active' && (
              <button
                onClick={() => fulfillMutation.mutate()}
                disabled={fulfillMutation.isPending}
                className="text-green-600 hover:text-green-700"
              >
                Mark Fulfilled
              </button>
            )}
            {wanted.status === 'Fulfilled' && <span className="text-gray-400">Fulfilled</span>}
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ) : (
          wanted.user?.phone && (
            <a
              href={buildWantedWhatsAppLink(wanted.user.phone, wanted.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700"
            >
              I have this - Contact
            </a>
          )
        )}
      </div>
    </div>
  );
}