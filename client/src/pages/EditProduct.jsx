import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct, CATEGORIES } from '../services/productService';
import Loader from '../components/Loader';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getProductById(id)
      .then((product) => {
        reset({
          title: product.title,
          category: product.category,
          description: product.description,
          price: product.price,
          condition: product.condition,
          residence: product.residence,
        });
        setExistingImages(product.images);
      })
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      newImages.forEach((img) => formData.append('images', img));

      await updateProduct(id, formData);
      navigate(`/product/${id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>

      {serverError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Product Name</label>
          <input
            {...register('title', { required: true })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            {...register('category', { required: true })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={4}
            {...register('description', { required: true })}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Price (KSh)</label>
            <input
              type="number"
              {...register('price', { required: true, min: 0 })}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Condition</label>
            <select
              {...register('condition', { required: true })}
              className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>
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
        </div>

        {existingImages.length > 0 && (
          <div>
            <label className="text-sm font-medium">Current Images</label>
            <div className="flex gap-2 mt-1 overflow-x-auto pb-1">
              {existingImages.map((img) => (
                <img key={img} src={img} alt="" className="h-16 w-16 flex-shrink-0 object-cover rounded-md" />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Add More Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewImages(Array.from(e.target.files))}
            className="mt-1 w-full text-sm"
          />
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
