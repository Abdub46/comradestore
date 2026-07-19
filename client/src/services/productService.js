import api from './api';

export const CATEGORIES = [
  'Beds',
  'Sofas',
  'Dining Tables',
  'Office Chairs',
  'Plastic Chairs',
  'TV Stands',
  'Wardrobes',
  'Cupboards',
  'Mattresses',
  'Curtains',
  'Kitchen Items',
  'Gas Cookers',
  'Fridges',
  'Microwaves',
  'Phones',
  'Electronics',
  'Other',
];

export const getProducts = (params) => api.get('/products', { params }).then((res) => res.data);

export const getProductById = (id) => api.get(`/products/${id}`).then((res) => res.data);

export const getMyListings = () => api.get('/products/my-listings').then((res) => res.data);

export const createProduct = (formData) =>
  api
    .post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);

export const updateProduct = (id, formData) =>
  api
    .put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`).then((res) => res.data);

export const updateProductStatus = (id, status) =>
  api.patch(`/products/${id}/status`, { status }).then((res) => res.data);

// Called when a buyer clicks "Contact Seller" - no login required
export const toggleFavorite = (id) => api.patch(`/products/${id}/favorite`).then((res) => res.data);

export const markAsContacted = (id) => api.patch(`/products/${id}/contact`).then((res) => res.data);
