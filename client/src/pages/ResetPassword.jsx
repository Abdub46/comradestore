import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { completeAuth } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (password !== confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setServerError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const data = await authService.resetPassword(token, { password, confirmPassword });
      completeAuth(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Choose a new password</h1>

      {serverError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Confirm new password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Reset password'}
        </motion.button>
      </form>

      <p className="text-sm text-center mt-4">
        <Link to="/login" className="text-primary-600 font-medium">
          Back to log in
        </Link>
      </p>
    </div>
  );
}