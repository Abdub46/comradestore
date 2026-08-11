import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { sendSuggestion } from '../services/suggestionService';

export default function SuggestImprovement() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Please write your suggestion before sending');
      return;
    }

    setLoading(true);
    try {
      await sendSuggestion(message.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">✅</p>
        <h1 className="text-xl font-semibold mb-2">Thank you!</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your suggestion has been sent. We appreciate your feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Suggest an Improvement</h1>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="text-sm font-medium">Your Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            readOnly
            className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you'd like to see improved..."
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send'}
        </motion.button>
      </form>
    </div>
  );
}