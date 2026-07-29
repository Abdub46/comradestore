import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../utils/validators';
import { isValidKenyanPhone } from '../utils/phone';
import * as authService from '../services/authService';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Login() {
  const { login, completeAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleProfile, setGoogleProfile] = useState(null);
  const [googleExtra, setGoogleExtra] = useState({ phone: '', residence: '' });
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleGoogleCredential = async (credential) => {
    setServerError('');
    try {
      const data = await authService.googleAuth({ credential });
      if (data.needsProfile) {
        setGoogleCredential(credential);
        setGoogleProfile(data.profile);
      } else {
        completeAuth(data);
        navigate('/');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleFinishGoogleSignup = async (e) => {
    e.preventDefault();
    setServerError('');
    setGoogleSubmitting(true);
    try {
      const data = await authService.googleAuth({
        credential: googleCredential,
        phone: googleExtra.phone,
        residence: googleExtra.residence,
      });
      completeAuth(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not finish signing up. Please try again.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Log in to your account</h1>

      {serverError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required', validate: isValidEmail })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>


      <div>
  <label className="text-sm font-medium">Password</label>

  <div className="relative mt-1">
    <input
      type={showPassword ? 'text' : 'password'}
      {...register('password', {
        required: 'Password is required',
        minLength: 6,
      })}
      className="w-full border rounded-md px-3 py-2 pr-16 bg-white dark:bg-gray-800 dark:border-gray-600"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
    >
      {showPassword ? 'Hide' : 'Show'}
    </button>
  </div>

  {errors.password && (
    <p className="text-xs text-red-600 mt-1">
      Minimum 6 characters
    </p>
  )}
</div>


        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-500">OR</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <GoogleLoginButton onCredential={handleGoogleCredential} />

      {googleProfile && (
        <form onSubmit={handleFinishGoogleSignup} className="space-y-4 mt-4 border-t pt-4 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Almost done, {googleProfile.firstName}! We just need your WhatsApp number and residence to finish
            setting up your account.
          </p>

          <div>
            <label className="text-sm font-medium">WhatsApp phone number</label>
            <input
              type="tel"
              required
              value={googleExtra.phone}
              onChange={(e) => setGoogleExtra((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
            {googleExtra.phone && !isValidKenyanPhone(googleExtra.phone) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid Kenyan phone number</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Residence</label>
            <select
              required
              value={googleExtra.residence}
              onChange={(e) => setGoogleExtra((prev) => ({ ...prev, residence: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Select your residence</option>
              <option value="Sokomoko">Sokomoko</option>
              <option value="KU">KU</option>
              <option value="Annex">Annex</option>
            </select>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={googleSubmitting || !isValidKenyanPhone(googleExtra.phone) || !googleExtra.residence}
            className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
          >
            {googleSubmitting ? 'Finishing up...' : 'Finish signing up'}
          </motion.button>
        </form>
      )}

      <p className="text-sm text-center mt-4">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
