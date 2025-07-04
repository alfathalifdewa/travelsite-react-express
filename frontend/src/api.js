// src/api.js
import axios from 'axios';

// Base URL untuk API
const BASE_URL = 'https://travelsite-react-express-three.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important untuk CORS dengan credentials
});

// Request interceptor untuk menambahkan token secara dinamis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Hanya gunakan Bearer token, bukan kombinasi Bearer + Basic
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request untuk debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error dan token management
api.interceptors.response.use(
  (response) => {
    // Log response untuk debugging (hapus di production)
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('authToken');
      
      // Redirect ke login jika bukan sudah di halaman login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle CORS errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - possibly CORS issue');
    }

    return Promise.reject(error);
  }
);

// Helper functions untuk API calls
export const apiHelpers = {
  // User authentication
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User registration
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User logout
  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get products
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get product by ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/category');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cart operations
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addToCart: async (productData) => {
    try {
      const response = await api.post('/cart', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Order operations
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/order', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await api.get('/order');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Get current user token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export default api;