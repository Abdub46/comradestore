import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as authService from '../services/authService';
import { isValidEmailFormat } from '../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Reset your password</h1>

      {sent ? (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
          If an account with that email exists, we've sent a password reset link. Check your inbox (and spam
          folder).
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter the email address on your account and we'll send you a link to reset your password.
          </p>

          {serverError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting || !isValidEmailFormat(email)}
              className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send reset link'}
            </motion.button>
          </form>
        </>
      )}

      <p className="text-sm text-center mt-4">
        Remembered your password?{' '}
        <Link to="/login" className="text-primary-600 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}