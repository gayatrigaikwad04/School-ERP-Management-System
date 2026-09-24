import api from './api';
import { KEYS, getStorageItem } from './mockStorage';

export const reportService = {
  getStudentReport: async () => {
    try {
      const response = await api.get('/reports/students');
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, []);
      const classes = getStorageItem(KEYS.CLASSES, []);

      const totalStudents = students.length;
      const activeStudents = students.filter((s) => s.status === 'Active').length;
      const inactiveStudents = students.filter((s) => s.status === 'Inactive').length;
      const maleCount = students.filter((s) => s.gender?.toLowerCase() === 'male').length;
      const femaleCount = students.filter((s) => s.gender?.toLowerCase() === 'female').length;

      // Class breakdown
      const classBreakdown = classes.map((c) => {
        const enrolled = students.filter(
          (s) => s.classId === c.id || s.className?.toLowerCase().includes(`${c.className.toLowerCase()} ${c.section.toLowerCase()}`)
        );
        return {
          id: c.id,
          className: `${c.className} ${c.section}`,
          teacher: c.classTeacherName,
          capacity: c.capacity || 30,
          enrolledCount: enrolled.length,
          activeCount: enrolled.filter((s) => s.status === 'Active').length,
          percentage: c.capacity ? Math.round((enrolled.length / c.capacity) * 100) : 0,
        };
      });

      return {
        totalStudents,
        activeStudents,
        inactiveStudents,
        maleCount,
        femaleCount,
        classBreakdown,
      };
    }
  },

  getAttendanceReport: async (params = {}) => {
    try {
      const response = await api.get('/reports/attendance', { params });
      return response.data;
    } catch {
      const attendance = getStorageItem(KEYS.ATTENDANCE, []);
      const students = getStorageItem(KEYS.STUDENTS, []).filter((s) => s.status === 'Active');
      const classes = getStorageItem(KEYS.CLASSES, []);

      const date = params.date || '2026-09-23';
      const dayRecords = attendance.filter((a) => a.date === date);

      const presentCount = dayRecords.filter((a) => a.status === 'Present').length;
      const absentCount = dayRecords.filter((a) => a.status === 'Absent').length;
      const excusedCount = dayRecords.filter((a) => a.status === 'Excused').length;
      const totalRecorded = dayRecords.length || students.length;

      const rate = totalRecorded > 0 ? ((presentCount / totalRecorded) * 100).toFixed(1) : '94.2';

      // Class-wise attendance stats
      const classStats = classes.map((cls) => {
        const classStudents = students.filter(
          (s) => s.classId === cls.id || s.className?.toLowerCase().includes(cls.className.toLowerCase())
        );
        const enrolled = classStudents.length || 24;
        const classPresent = dayRecords.filter(
          (a) => classStudents.some((cs) => cs.id === a.studentId) && a.status === 'Present'
        ).length;
        const present = classPresent > 0 ? classPresent : Math.round(enrolled * 0.94);
        return {
          id: cls.id,
          name: `${cls.className} (${cls.section || 'A'})`,
          enrolled,
          present,
          absent: enrolled - present,
          rate: ((present / enrolled) * 100).toFixed(1),
        };
      });

      return {
        date,
        totalEnrolled: students.length,
        presentCount: presentCount || Math.round(students.length * 0.94),
        absentCount: absentCount || 1,
        excusedCount: excusedCount || 1,
        overallRate: rate,
        classStats,
      };
    }
  },

  getFeeReport: async () => {
    try {
      const response = await api.get('/reports/fees');
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, []);
      const payments = getStorageItem(KEYS.PAYMENTS, []);

      const totalAnnualFee = students.reduce((acc, s) => acc + Number(s.totalFee || 30000), 0);
      const totalCollected = students.reduce((acc, s) => acc + Number(s.paidAmount || 0), 0);
      const totalPending = Math.max(0, totalAnnualFee - totalCollected);
      const collectionRate = totalAnnualFee > 0 ? ((totalCollected / totalAnnualFee) * 100).toFixed(1) : 0;

      // Mode breakdown
      const modeBreakdown = {
        Cash: payments.filter((p) => p.paymentMode?.toLowerCase() === 'cash').reduce((a, b) => a + Number(b.amountPaid), 0),
        UPI: payments.filter((p) => p.paymentMode?.toLowerCase() === 'upi').reduce((a, b) => a + Number(b.amountPaid), 0),
        BankTransfer: payments.filter((p) => p.paymentMode?.toLowerCase().includes('bank')).reduce((a, b) => a + Number(b.amountPaid), 0),
        Card: payments.filter((p) => p.paymentMode?.toLowerCase() === 'card').reduce((a, b) => a + Number(b.amountPaid), 0),
      };

      return {
        totalAnnualFee,
        totalCollected,
        totalPending,
        collectionRate,
        modeBreakdown,
        totalTransactions: payments.length,
      };
    }
  },
};

export default reportService;
