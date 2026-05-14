import axios from 'axios';

// Get API URL from environment variables with fallback for local testing
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a secure axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure we don't follow excessive redirects (SSRF protection)
  maxRedirects: 5,
  // Reasonable timeout
  timeout: 10000,
});

// Request interceptor for adding auth token
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

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          
          if (response.data.success) {
            const newToken = response.data.token;
            const newRefreshToken = response.data.refreshToken;
            
            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Silent refresh failed:', refreshError);
        }
      }

      // If refresh fails or no refresh token, log out
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAuth');
      localStorage.removeItem('role');
      window.dispatchEvent(new Event('auth-error'));
      return Promise.reject(error.response?.data);
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
