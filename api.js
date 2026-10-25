import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('imovies_user');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
