import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { notBlank } from '../utils/validators';
import { isValidKenyanPhone } from '../utils/phone';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      residence: user.residence,
    },
  });

  const onSubmit = async (data) => {
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const updated = await authService.updateProfile(data);
      updateUser(updated);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <img src={user.avatar} alt={user.firstName} className="h-16 w-16 rounded-full object-cover" />
        <div>
          <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
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
          <label className="text-sm font-medium">WhatsApp Phone Number</label>
          <input
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
  {...register('residence', { required: true })}
  className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
>
  <option value="Sokomoko">Sokomoko</option>
  <option value="KU">KU</option>
  <option value="Annex">Annex</option>
</select>
{errors.residence && <p className="text-xs text-red-600 mt-1">Residence is required</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
