import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_CLASSES } from '../mock/mockData';

export const classService = {
  getClasses: async (params = {}) => {
    try {
      const response = await api.get('/classes', { params });
      return response.data;
    } catch {
      let classes = getStorageItem(KEYS.CLASSES, INITIAL_CLASSES);
      const students = getStorageItem(KEYS.STUDENTS, []);

      // Calculate student enrollment counts for each class
      classes = classes.map((c) => {
        const classStudents = students.filter(
          (s) => s.classId === c.id || s.className?.toLowerCase().includes(`${c.className.toLowerCase()} ${c.section.toLowerCase()}`)
        );
        return {
          ...c,
          studentCount: classStudents.length,
          students: classStudents,
        };
      });

      if (params.status && params.status !== 'All') {
        classes = classes.filter((c) => c.status === params.status);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        classes = classes.filter(
          (c) =>
            c.className.toLowerCase().includes(q) ||
            c.section.toLowerCase().includes(q) ||
            c.classTeacherName?.toLowerCase().includes(q)
        );
      }

      return { classes, total: classes.length };
    }
  },

  createClass: async (classData) => {
    try {
      const response = await api.post('/classes', classData);
      return response.data;
    } catch {
      const classes = getStorageItem(KEYS.CLASSES, INITIAL_CLASSES);
      const newClass = {
        id: `cls_${Date.now()}`,
        status: 'Active',
        academicYear: '2026–27',
        ...classData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...classes, newClass];
      setStorageItem(KEYS.CLASSES, updated);
      return newClass;
    }
  },

  updateClass: async (id, updateData) => {
    try {
      const response = await api.put(`/classes/${id}`, updateData);
      return response.data;
    } catch {
      const classes = getStorageItem(KEYS.CLASSES, INITIAL_CLASSES);
      const index = classes.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Class not found');
      }
      classes[index] = { ...classes[index], ...updateData, updatedAt: new Date().toISOString() };
      setStorageItem(KEYS.CLASSES, [...classes]);
      return classes[index];
    }
  },

  deactivateClass: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    } catch {
      const classes = getStorageItem(KEYS.CLASSES, INITIAL_CLASSES);
      const index = classes.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Class not found');
      }
      classes[index].status = classes[index].status === 'Active' ? 'Inactive' : 'Active';
      setStorageItem(KEYS.CLASSES, [...classes]);
      return classes[index];
    }
  },
};

export default classService;
