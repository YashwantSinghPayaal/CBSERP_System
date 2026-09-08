import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://27afece22e621e.lhr.life/api'
});

// Interceptor to inject JWT token in request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cbserp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
