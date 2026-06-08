import axios from 'axios';

// 1. Create a reusable axios instance
const API = axios.create({
  // Looks for your local or production backend URL from your .env file
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
 headers: {
    'Content-Type': 'application/json',
  }
});

// 2. Add a request interceptor (runs automatically before every request goes out)
API.interceptors.request.use(
  (config) => {
    // Look for the saved login token in the browser's storage
    const token = localStorage.getItem('token');
    
    // If the token exists, inject it into the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
