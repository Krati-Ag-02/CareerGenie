import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ─── INTERVIEW ─────────────────────────────────────────────────────────────────
export const interviewAPI = {
  getRoles: () => api.get('/interview/roles'),
  getQuestions: (role) => api.post('/interview/questions', { role }),
  evaluate: (data) => api.post('/interview/evaluate', data),
  getHistory: () => api.get('/interview/history'),
};

// ─── RESUME ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  analyze: (data) => api.post('/resume/analyze', data),
};

// ─── CAREER ────────────────────────────────────────────────────────────────────
export const careerAPI = {
  getGuidance: (data) => api.post('/career/guidance', data),
};

export default api;