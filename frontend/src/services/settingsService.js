import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_SCHOOL_SETTINGS } from '../mock/mockData';

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch {
      return getStorageItem(KEYS.SETTINGS, INITIAL_SCHOOL_SETTINGS);
    }
  },

  updateSettings: async (updateData) => {
    try {
      const response = await api.put('/settings', updateData);
      return response.data;
    } catch {
      const current = getStorageItem(KEYS.SETTINGS, INITIAL_SCHOOL_SETTINGS);
      const updated = { ...current, ...updateData, updatedAt: new Date().toISOString() };
      setStorageItem(KEYS.SETTINGS, updated);
      return updated;
    }
  },
};

export default settingsService;
