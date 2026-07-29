import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createProduct, CATEGORIES } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { notBlank } from '../utils/validators';

export default function SellItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { residence: user?.residence },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // Invalidating both caches means Home's "Latest Listings", Search
  // results, and the seller's own Dashboard all pick up the new product
  // automatically - no manual refetch calls needed anywhere else.
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      navigate(`/product/${product._id}`);
    },
    onError: (err) => {
      setServerError(err.response?.data?.message || 'Failed to create listing.');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    images.forEach((img) => formData.append('images', img));
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Sell an Item</h1>

      {serverError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Product Name</label>
          <input
            {...register('title', {
              required: 'Product name is required',
              minLength: { value: 3, message: 'Must be at least 3 characters' },
              validate: notBlank,
            })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            {...register('category', { required: true })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-600 mt-1">Category is required</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={4}
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Please write at least 20 characters describing the item' },
              validate: notBlank,
            })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Price (KSh)</label>
            <input
              type="number"
              {...register('price', {
                required: 'Price is required',
                min: { value: 1, message: 'Price must be greater than 0' },
              })}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Condition</label>
            <select
              {...register('condition', { required: true })}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Select</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
            {errors.condition && <p className="text-xs text-red-600 mt-1">Condition is required</p>}
          </div>
        </div>



        <div>
  <label className="text-sm font-medium">Discount % (optional)</label>
  <input
    type="number"
    placeholder="e.g. 10"
    {...register('discount', {
      min: {
        value: 0,
        message: 'Discount cannot be negative',
      },
      max: {
        value: 100,
        message: 'Discount cannot exceed 100%',
      },
    })}
    className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
  />
  <p className="text-xs text-gray-500 mt-1">
    Leave blank if this item isn't discounted.
  </p>
  {errors.discount && (
    <p className="text-xs text-red-600 mt-1">
      {errors.discount.message}
    </p>
  )}
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



        <div>
          <label className="text-sm font-medium">Images (up to 5)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="mt-1 w-full text-sm" />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="h-16 w-16 flex-shrink-0 object-cover rounded-md" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Seller Phone (WhatsApp)</label>
          <input
            disabled
            value={user?.phone || ''}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">Pulled from your account &mdash; update it in your profile.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {createMutation.isPending ? 'Publishing...' : 'Publish Listing'}
        </motion.button>
      </form>
    </div>
  );
}
