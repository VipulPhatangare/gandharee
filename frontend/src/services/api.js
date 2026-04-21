import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('arhotel_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Menu
export const getMenuItems = (params) => API.get('/menu', { params });
export const getMenuItem = (slug) => API.get(`/menu/${slug}`);
export const getMenuItemById = (id) => API.get(`/menu/id/${id}`);
export const createMenuItem = (data) => API.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const getAllCategories = () => API.get('/categories/all');
export const createCategory = (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getOrdersByTable = (tableNumber) => API.get(`/orders/table/${encodeURIComponent(tableNumber)}`);
export const clearTableOrders = (tableNumber) => API.post(`/orders/table/${encodeURIComponent(tableNumber)}/clear`);
export const getTableHistory = () => API.get('/orders/history/tables');
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
export const getAnalytics = () => API.get('/orders/analytics');

// Payment
export const createPaymentOrder = (data) => API.post('/payment/create-order', data);
export const verifyPayment = (data) => API.post('/payment/verify', data);

export default API;
