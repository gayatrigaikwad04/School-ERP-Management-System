import {
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_USER,
  INITIAL_CLASSES,
  INITIAL_PARENTS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE
} from '../mock/mockData';

// Local storage key constants
const KEYS = {
  SETTINGS: 'schoolerp_settings',
  CLASSES: 'schoolerp_classes',
  PARENTS: 'schoolerp_parents',
  FEES: 'schoolerp_fees',
  STUDENTS: 'schoolerp_students',
  PAYMENTS: 'schoolerp_payments',
  ATTENDANCE: 'schoolerp_attendance',
  USER: 'schoolerp_user',
  TOKEN: 'schoolerp_token',
};

// Initialize default mock data if not already present
export const initMockStorage = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SCHOOL_SETTINGS));
  }
  if (!localStorage.getItem(KEYS.CLASSES)) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(KEYS.PARENTS)) {
    localStorage.setItem(KEYS.PARENTS, JSON.stringify(INITIAL_PARENTS));
  }
  if (!localStorage.getItem(KEYS.FEES)) {
    localStorage.setItem(KEYS.FEES, JSON.stringify(INITIAL_FEE_STRUCTURES));
  }
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(KEYS.PAYMENTS)) {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.USER)) {
    localStorage.setItem(KEYS.USER, JSON.stringify(INITIAL_USER));
  }
};

// Helper getters and setters
export const getStorageItem = (key, defaultVal = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error('Failed to parse localStorage key:', key, e);
    return defaultVal;
  }
};

export const setStorageItem = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to set localStorage key:', key, e);
  }
};

export { KEYS };
