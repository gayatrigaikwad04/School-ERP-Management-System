import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_STUDENTS } from '../mock/mockData';

export const studentService = {
  getStudents: async (params = {}) => {
    try {
      const response = await api.get('/students', { params });
      return response.data;
    } catch {
      // Mock fallback
      let students = getStorageItem(KEYS.STUDENTS, INITIAL_STUDENTS);

      if (params.search) {
        const q = params.search.toLowerCase();
        students = students.filter(
          (s) =>
            s.firstName?.toLowerCase().includes(q) ||
            s.lastName?.toLowerCase().includes(q) ||
            s.studentId?.toLowerCase().includes(q) ||
            s.parentName?.toLowerCase().includes(q) ||
            s.phone?.includes(q)
        );
      }

      if (params.classId && params.classId !== 'All') {
        students = students.filter((s) => s.classId === params.classId || s.className?.includes(params.classId));
      }

      if (params.status && params.status !== 'All') {
        students = students.filter((s) => s.status === params.status);
      }

      if (params.gender && params.gender !== 'All') {
        students = students.filter((s) => s.gender?.toLowerCase() === params.gender?.toLowerCase());
      }

      return { students, total: students.length };
    }
  },

  getStudentById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, INITIAL_STUDENTS);
      const student = students.find((s) => s.id === id || s.studentId === id);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, INITIAL_STUDENTS);

      // Business Rule: Student ID must be unique
      const existing = students.find(
        (s) => s.studentId?.toLowerCase() === studentData.studentId?.trim().toLowerCase()
      );
      if (existing) {
        throw new Error(`Student ID "${studentData.studentId}" is already assigned to ${existing.firstName} ${existing.lastName}.`);
      }

      // Check inactive class rule
      const classes = getStorageItem(KEYS.CLASSES, []);
      const assignedClass = classes.find((c) => c.id === studentData.classId);
      if (assignedClass && assignedClass.status === 'Inactive') {
        throw new Error('Cannot enroll student into an inactive class section.');
      }

      const newStudent = {
        id: `stu_${Date.now()}`,
        ...studentData,
        status: 'Active',
        paidAmount: Number(studentData.paidAmount || 0),
        totalFee: Number(studentData.totalFee || 30000),
        avatar: studentData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentData.studentId}`,
        createdAt: new Date().toISOString(),
      };

      const updated = [newStudent, ...students];
      setStorageItem(KEYS.STUDENTS, updated);
      return newStudent;
    }
  },

  updateStudent: async (id, updateData) => {
    try {
      const response = await api.put(`/students/${id}`, updateData);
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, INITIAL_STUDENTS);
      const index = students.findIndex((s) => s.id === id || s.studentId === id);
      if (index === -1) {
        throw new Error('Student not found');
      }

      // Check duplicate ID if changed
      if (updateData.studentId && updateData.studentId !== students[index].studentId) {
        const duplicate = students.find(
          (s) => s.id !== id && s.studentId?.toLowerCase() === updateData.studentId?.trim().toLowerCase()
        );
        if (duplicate) {
          throw new Error(`Student ID "${updateData.studentId}" already in use.`);
        }
      }

      const updatedStudent = {
        ...students[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      students[index] = updatedStudent;
      setStorageItem(KEYS.STUDENTS, [...students]);
      return updatedStudent;
    }
  },

  deactivateStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, INITIAL_STUDENTS);
      const index = students.findIndex((s) => s.id === id || s.studentId === id);
      if (index === -1) {
        throw new Error('Student not found');
      }
      students[index].status = students[index].status === 'Active' ? 'Inactive' : 'Active';
      setStorageItem(KEYS.STUDENTS, [...students]);
      return students[index];
    }
  },
};

export default studentService;
