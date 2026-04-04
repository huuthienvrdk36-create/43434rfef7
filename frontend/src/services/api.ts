import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getCategories: () => api.get('/services/categories'),
  getById: (id: string) => api.get(`/services/${id}`),
};

// Organizations API
export const organizationsAPI = {
  getAll: (params?: any) => api.get('/organizations', { params }),
  getById: (id: string) => api.get(`/organizations/${id}`),
  search: (params: any) => api.get('/organizations/search', { params }),
};

// Vehicles API
export const vehiclesAPI = {
  getMy: () => api.get('/vehicles/my'),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.patch(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// Quotes API
export const quotesAPI = {
  getMy: () => api.get('/quotes/my'),
  getById: (id: string) => api.get(`/quotes/${id}`),
  create: (data: any) => api.post('/quotes', data),
  cancel: (id: string) => api.post(`/quotes/${id}/cancel`),
  accept: (quoteId: string, responseId: string) => api.post(`/quotes/${quoteId}/accept/${responseId}`),
};

// Bookings API
export const bookingsAPI = {
  getMy: () => api.get('/bookings/my'),
  getById: (id: string) => api.get(`/bookings/${id}`),
};

// Payments API
export const paymentsAPI = {
  create: (bookingId: string) => api.post('/payments/create', { bookingId }),
  confirm: (paymentId: string) => api.post(`/payments/${paymentId}/confirm`),
  getMy: () => api.get('/payments/my'),
};

// Reviews API
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  getByOrg: (orgId: string) => api.get(`/reviews/organization/${orgId}`),
};

// Disputes API
export const disputesAPI = {
  create: (data: any) => api.post('/disputes', data),
  getMy: () => api.get('/disputes/my'),
};

export default api;
