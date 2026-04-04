// API Client - единая точка доступа к backend
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Quotes API
export const quotesAPI = {
  create: (data) => api.post('/quotes', data),
  getMy: () => api.get('/quotes/my'),
  getById: (id) => api.get(`/quotes/${id}`),
  getIncoming: () => api.get('/quotes/incoming'),
  respond: (id, data) => api.post(`/quotes/${id}/respond`, data),
  accept: (quoteId, responseId) => api.post(`/quotes/${quoteId}/accept/${responseId}`),
  cancel: (id) => api.post(`/quotes/${id}/cancel`),
};

// Bookings API
export const bookingsAPI = {
  getMy: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getIncoming: () => api.get('/bookings/incoming'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// Vehicles API
export const vehiclesAPI = {
  getMy: () => api.get('/vehicles/my'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.patch(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Reviews API
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getMy: () => api.get('/reviews/my'),
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  getByOrganization: (orgId, params) => api.get(`/reviews/organization/${orgId}`, { params }),
  getOrganizationStats: (orgId) => api.get(`/reviews/organization/${orgId}/stats`),
};

// Favorites API
export const favoritesAPI = {
  add: (organizationId) => api.post('/favorites', { organizationId }),
  getMy: () => api.get('/favorites'),
  check: (organizationId) => api.get(`/favorites/check/${organizationId}`),
  remove: (organizationId) => api.delete(`/favorites/${organizationId}`),
};

// Discovery API (branches with geo-search)
export const discoveryAPI = {
  nearby: (params) => api.get('/branches/nearby', { params }),
  search: (params) => api.get('/branches/search', { params }),
};

// Notifications API
export const notificationsAPI = {
  getMy: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Geo API
export const geoAPI = {
  getCountries: () => api.get('/geo/countries'),
  getRegions: (countryId) => api.get(`/geo/regions/${countryId}`),
  getCities: (params) => api.get('/geo/cities', { params }),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getCategories: () => api.get('/services/categories'),
};

// Organizations API
export const organizationsAPI = {
  getMy: () => api.get('/organizations/my'),
  getById: (id) => api.get(`/organizations/${id}`),
  getAll: (params) => api.get('/organizations', { params }),
  getStats: (id) => api.get(`/organizations/${id}/stats`),
  create: (data) => api.post('/organizations', data),
};

// Branches API
export const branchesAPI = {
  getByOrg: (orgId) => api.get(`/branches/organization/${orgId}`),
  getById: (id) => api.get(`/branches/${id}`),
};

export default api;
