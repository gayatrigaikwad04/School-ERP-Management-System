import api from './api';
import { KEYS, getStorageItem } from './mockStorage';
import { INITIAL_USER } from '../mock/mockData';

export const authService = {
  login: async (email, password) => {
    try {
      // First attempt real backend call
      const response = await api.post('/auth/login', { email, password });
      if (response?.data?.token) {
        localStorage.setItem(KEYS.TOKEN, response.data.token);
        localStorage.setItem(KEYS.USER, JSON.stringify(response.data.user));
        return response.data;
      }
    } catch (err) {
      // If network fails (e.g. backend not deployed yet), use mock auth
      if (!err.response || err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        console.warn('Backend unavailable, falling back to mock authentication.');
        // Allow demo login
        if (email && password) {
          const mockToken = 'mock_jwt_token_schoolerp_admin_2026';
          const user = getStorageItem(KEYS.USER, INITIAL_USER);
          localStorage.setItem(KEYS.TOKEN, mockToken);
          localStorage.setItem(KEYS.USER, JSON.stringify(user));
          return { token: mockToken, user };
        }
        throw new Error('Please enter valid email and password.');
      }
      throw err.response?.data?.message ? new Error(err.response.data.message) : err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored for client cleanup
    } finally {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.USER);
    }
  },

  getCurrentUser: () => {
    return getStorageItem(KEYS.USER, INITIAL_USER);
  },

  getToken: () => {
    return localStorage.getItem(KEYS.TOKEN);
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem(KEYS.TOKEN));
  }
};

export default authService;
