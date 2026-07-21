import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notBlank, isValidEmail } from '../utils/validators';
import { isValidKenyanPhone } from '../utils/phone';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      await doRegister(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>

      {serverError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <input
              {...register('firstName', {
              required: 'First name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
              validate: notBlank,
})}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <input
              {...register('lastName', {
              required: 'Last name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
              validate: notBlank,
            })}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

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
          <label className="text-sm font-medium">WhatsApp Phone Number</label>
          <input
            placeholder="0712345678 or +254712345678"
            {...register('phone', {
            required: 'Phone number is required',
            validate: (value) => isValidKenyanPhone(value) || 'Please enter a valid Kenyan phone number',
          })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Residence</label>
          <select
            {...register('residence', { required: 'Residence is required' })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select your residence</option>
            <option value="Sokomoko">Sokomoko</option>
            <option value="KU">KU</option>
            <option value="Annex">Annex</option>
          </select>
          {errors.residence && <p className="text-xs text-red-600 mt-1">{errors.residence.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>

         <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    {...register("password", {
      required: "Password is required",
      minLength: 6,
    })}
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


          {errors.password && <p className="text-xs text-red-600 mt-1">Minimum 6 characters</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Confirm Password</label>


        <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    {...register("confirmPassword", {
      validate: (val) =>
        val === watch("password") || "Passwords do not match",
    })}
    className="w-full pr-10"
  />

  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
  >
    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>


          {errors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
