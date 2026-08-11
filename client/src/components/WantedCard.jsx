import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationIcon, ClockIcon } from './icons';
import { formatKsh, timeAgo } from '../utils/format';
import { buildWantedWhatsAppLink } from '../utils/whatsapp';
import { useAuth } from '../contexts/AuthContext';
import { updateWantedStatus, markWantedAsContacted, deleteWanted } from '../services/wantedService';

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-700',
  Reserved: 'bg-orange-100 text-orange-700',
  Fulfilled: 'bg-red-100 text-red-700',
};

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
  const isFulfilled = wanted.status === 'Fulfilled';

  // Single mutation the owner's status <select> drives - mirrors
  // Dashboard.jsx's statusMutation for Product exactly: the owner can pick
  // any of the 3 statuses at any time, not just move forward.
  const statusMutation = useMutation({
    mutationFn: (status) => updateWantedStatus(wanted._id, status),
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

  // Clicking "Contact the Buyer" opens WhatsApp in a new tab (target="_blank"),
  // so this tab stays open and this request still completes in the
  // background. Same pattern as ProductDetail's handleContactSeller.
  const handleContactBuyer = () => {
    markWantedAsContacted(wanted._id, wanted.contactToken)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['wanted'] });
      })
      .catch((err) => console.error('Failed to update wanted request status:', err));
  };

  if (removed) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">Looking for</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[wanted.status]}`}>
          {wanted.status}
        </span>
      </div>
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
          <div className="flex items-center gap-2">
            <select
              value={wanted.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              disabled={statusMutation.isPending}
              className="text-xs font-semibold border rounded-md px-2 py-1.5 bg-white dark:bg-gray-900 dark:border-gray-600"
            >
              <option value="Active">Active</option>
              <option value="Reserved">Reserved</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ) : (
          wanted.user?.phone && (
            isFulfilled ? (
              <span className="inline-block text-xs font-semibold bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-3 py-1.5 rounded-md cursor-not-allowed">
                Already Fulfilled
              </span>
            ) : (
              <a
                href={buildWantedWhatsAppLink(wanted.user.phone, wanted.title)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleContactBuyer}
                className="inline-block text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700"
              >
                Contact the Buyer
              </a>
            )
          )
        )}
      </div>
    </div>
  );
}