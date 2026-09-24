import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_FEE_STRUCTURES } from '../mock/mockData';

export const feeService = {
  getFeeStructures: async () => {
    try {
      const response = await api.get('/fees');
      return response.data;
    } catch {
      const feeStructures = getStorageItem(KEYS.FEES, INITIAL_FEE_STRUCTURES);
      const students = getStorageItem(KEYS.STUDENTS, []);

      // Calculate enrolled student count per fee structure
      return feeStructures.map((f) => {
        const enrolled = students.filter(
          (s) => s.classId === f.classId || s.className?.toLowerCase().includes(f.className?.toLowerCase())
        );
        return {
          ...f,
          enrolledCount: enrolled.length,
        };
      });
    }
  },

  createFeeStructure: async (feeData) => {
    try {
      const response = await api.post('/fees', feeData);
      return response.data;
    } catch {
      const feeStructures = getStorageItem(KEYS.FEES, INITIAL_FEE_STRUCTURES);
      const total = Number(feeData.totalAnnualFee || 0);
      const newFee = {
        id: `fee_${Date.now()}`,
        academicYear: '2026–27',
        status: 'Active',
        ...feeData,
        totalAnnualFee: total,
        term1Fee: Math.round(total / 2),
        term2Fee: Math.round(total / 2),
        labTechFee: Number(feeData.labTechFee || 1500),
        createdAt: new Date().toISOString(),
      };
      const updated = [...feeStructures, newFee];
      setStorageItem(KEYS.FEES, updated);
      return newFee;
    }
  },

  updateFeeStructure: async (id, updateData) => {
    try {
      const response = await api.put(`/fees/${id}`, updateData);
      return response.data;
    } catch {
      const feeStructures = getStorageItem(KEYS.FEES, INITIAL_FEE_STRUCTURES);
      const index = feeStructures.findIndex((f) => f.id === id);
      if (index === -1) {
        throw new Error('Fee structure not found');
      }
      const total = Number(updateData.totalAnnualFee || feeStructures[index].totalAnnualFee);
      feeStructures[index] = {
        ...feeStructures[index],
        ...updateData,
        totalAnnualFee: total,
        term1Fee: Math.round(total / 2),
        term2Fee: Math.round(total / 2),
      };
      setStorageItem(KEYS.FEES, [...feeStructures]);
      return feeStructures[index];
    }
  },

  getPendingFees: async (params = {}) => {
    try {
      const response = await api.get('/fees/pending', { params });
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, []);
      let pendingList = students.map((student) => {
        const totalFee = Number(student.totalFee || 30000);
        const paid = Number(student.paidAmount || 0);
        // Business Rule: Pending = Total Fee - Total Paid. Never allow Pending < 0.
        const pending = Math.max(0, totalFee - paid);
        return {
          id: student.id,
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          firstName: student.firstName,
          lastName: student.lastName,
          avatar: student.avatar,
          classId: student.classId,
          className: student.className,
          parentName: student.parentName,
          phone: student.phone,
          totalFee,
          paid,
          pending,
          isDefaulter: pending > 15000,
          status: student.status,
        };
      });

      // Filter to only those with pending > 0 if specified or default
      if (params.onlyPending !== false) {
        pendingList = pendingList.filter((s) => s.pending > 0);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        pendingList = pendingList.filter(
          (s) =>
            s.studentName.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            s.className.toLowerCase().includes(q)
        );
      }

      if (params.classId && params.classId !== 'All') {
        pendingList = pendingList.filter((s) => s.classId === params.classId || s.className?.includes(params.classId));
      }

      const totalPendingAmount = pendingList.reduce((acc, curr) => acc + curr.pending, 0);
      return {
        studentsWithPending: pendingList,
        totalPendingStudents: pendingList.length,
        totalPendingAmount,
      };
    }
  },
};

export default feeService;
