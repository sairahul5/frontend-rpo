import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend-repo-lzwq.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyMfa: (data) => api.post('/auth/mfa/verify', data),
  setupMfa: () => api.post('/auth/mfa/setup'),
  enableMfa: (code) => api.post('/auth/mfa/enable', { code }),
  disableMfa: () => api.post('/auth/mfa/disable'),
};

// Question Paper APIs
export const questionPaperAPI = {
  getAll: () => api.get('/question-papers'),
  getPending: () => api.get('/question-papers/pending'),
  upload: (formData) => api.post('/question-papers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  verify: (id, status) => api.put(`/question-papers/verify/${id}?status=${status}`),
  filter: (params) => api.get('/question-papers/filter', { params }),
  update: (id, data) => api.put(`/question-papers/${id}?examName=${data.examName}&paperNumber=${data.paperNumber}&batchYear=${data.batchYear}`),
  delete: (id) => api.delete(`/question-papers/${id}`),
};

// Portfolio APIs
export const portfolioAPI = {
  getAll: () => api.get('/portfolio'),
  filter: (status) => api.get(`/portfolio/filter?status=${status}`),
  create: (formData) => api.post('/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/portfolio/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/portfolio/${id}`),
};

// Solution APIs
export const solutionAPI = {
  getAll: () => api.get('/solutions'),
  filter: (platform) => api.get(`/solutions/filter?platform=${platform}`),
  create: (formData) => api.post('/solutions', formData, {
  update: (id, formData) => api.put(`/solutions/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/solutions/${id}`),
};

// Contact APIs
export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

// Admin APIs
export const adminAPI = {
  getMessages: () => api.get('/admin/messages'),
  getUnreadMessages: () => api.get('/admin/messages/unread'),
  markAsRead: (id) => api.put(`/admin/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),
  createEditor: (data) => api.post('/admin/create-editor', data),
  getEditors: () => api.get('/admin/editors'),
  deleteEditor: (id) => api.delete(`/admin/editors/${id}`),
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAllQuestionPapers: () => api.get('/admin/question-papers'),
  getAllPasswordResetRequests: () => api.get('/admin/password-reset/all'),
  acceptPasswordResetRequest: (requestId) => api.post('/admin/password-reset/accept', { requestId }),
};

// Password Reset APIs
export const passwordResetAPI = {
  requestReset: (data) => api.post('/password-reset/request', data),
  verifyAndReset: (data) => api.post('/password-reset/verify', data),
};

export default api;
