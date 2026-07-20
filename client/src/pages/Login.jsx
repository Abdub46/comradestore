import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../utils/validators';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

         <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    {...register("password", { required: true })}
    className="w-full pr-10"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>
          {errors.password && <p className="text-xs text-red-600 mt-1">Password is required</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
