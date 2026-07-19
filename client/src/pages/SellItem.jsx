import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createProduct, CATEGORIES } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';

export default function SellItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      images.forEach((img) => formData.append('images', img));

      const product = await createProduct(formData);
      navigate(`/product/${product._id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
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
            {...register('title', { required: 'Product name is required' })}
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
            {...register('description', { required: 'Description is required' })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Price (KSh)</label>
            <input
              type="number"
              {...register('price', { required: true, min: 0 })}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">Valid price is required</p>}
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
