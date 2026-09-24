import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_PARENTS } from '../mock/mockData';

export const parentService = {
  getParents: async (params = {}) => {
    try {
      const response = await api.get('/parents', { params });
      return response.data;
    } catch {
      let parents = getStorageItem(KEYS.PARENTS, INITIAL_PARENTS);
      const students = getStorageItem(KEYS.STUDENTS, []);

      // Map linked students for each parent
      parents = parents.map((p) => {
        const linked = students.filter((s) => s.parentId === p.id || s.phone === p.phone);
        return {
          ...p,
          students: linked,
        };
      });

      if (params.search) {
        const q = params.search.toLowerCase();
        parents = parents.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.phone?.includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.parentId?.toLowerCase().includes(q)
        );
      }

      return { parents, total: parents.length };
    }
  },

  getParentById: async (id) => {
    try {
      const response = await api.get(`/parents/${id}`);
      return response.data;
    } catch {
      const parents = getStorageItem(KEYS.PARENTS, INITIAL_PARENTS);
      const parent = parents.find((p) => p.id === id || p.parentId === id);
      if (!parent) {
        throw new Error('Parent not found');
      }
      const students = getStorageItem(KEYS.STUDENTS, []);
      const linked = students.filter((s) => s.parentId === parent.id || s.phone === parent.phone);
      return { ...parent, students: linked };
    }
  },

  createParent: async (parentData) => {
    try {
      const response = await api.post('/parents', parentData);
      return response.data;
    } catch {
      const parents = getStorageItem(KEYS.PARENTS, INITIAL_PARENTS);
      const newParent = {
        id: `par_${Date.now()}`,
        parentId: `PAR-2026-${String(parents.length + 1).padStart(3, '0')}`,
        ...parentData,
        createdAt: new Date().toISOString(),
      };
      const updated = [newParent, ...parents];
      setStorageItem(KEYS.PARENTS, updated);
      return newParent;
    }
  },

  updateParent: async (id, updateData) => {
    try {
      const response = await api.put(`/parents/${id}`, updateData);
      return response.data;
    } catch {
      const parents = getStorageItem(KEYS.PARENTS, INITIAL_PARENTS);
      const index = parents.findIndex((p) => p.id === id || p.parentId === id);
      if (index === -1) {
        throw new Error('Parent not found');
      }
      parents[index] = { ...parents[index], ...updateData, updatedAt: new Date().toISOString() };
      setStorageItem(KEYS.PARENTS, [...parents]);
      return parents[index];
    }
  },
};

export default parentService;
