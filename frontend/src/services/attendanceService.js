import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_ATTENDANCE } from '../mock/mockData';

export const attendanceService = {
  getAttendance: async (params = {}) => {
    try {
      const response = await api.get('/attendance', { params });
      return response.data;
    } catch {
      let attendance = getStorageItem(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
      const students = getStorageItem(KEYS.STUDENTS, []);

      if (params.date) {
        attendance = attendance.filter((a) => a.date === params.date);
      }

      if (params.studentId) {
        attendance = attendance.filter((a) => a.studentId === params.studentId);
      }

      // Populate student details
      const populated = attendance.map((a) => {
        const student = students.find((s) => s.id === a.studentId || s.studentId === a.studentId);
        return {
          ...a,
          student: student || null,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
          className: student?.className || 'N/A',
        };
      });

      if (params.classId) {
        return populated.filter(
          (a) => a.student?.classId === params.classId || a.className?.includes(params.classId)
        );
      }

      return populated;
    }
  },

  saveAttendanceBatch: async ({ date, records }) => {
    try {
      const response = await api.post('/attendance', { date, records });
      return response.data;
    } catch {
      let attendance = getStorageItem(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);

      // Business Rule: One attendance record is allowed per student per date.
      // Filter out existing records for this date and students in the batch to avoid duplicates
      const studentIdsInBatch = records.map((r) => r.studentId);
      const remainingAttendance = attendance.filter(
        (a) => !(a.date === date && studentIdsInBatch.includes(a.studentId))
      );

      const newEntries = records.map((r) => ({
        id: `att_${Date.now()}_${r.studentId}`,
        date,
        studentId: r.studentId,
        status: r.status, // Present, Absent, Excused
        remarks: r.remarks || '',
        recordedAt: new Date().toISOString(),
      }));

      const updated = [...newEntries, ...remainingAttendance];
      setStorageItem(KEYS.ATTENDANCE, updated);
      return { success: true, count: newEntries.length, records: newEntries };
    }
  },

  updateAttendance: async (id, updateData) => {
    try {
      const response = await api.put(`/attendance/${id}`, updateData);
      return response.data;
    } catch {
      const attendance = getStorageItem(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
      const index = attendance.findIndex((a) => a.id === id);
      if (index === -1) {
        throw new Error('Attendance record not found');
      }
      attendance[index] = { ...attendance[index], ...updateData };
      setStorageItem(KEYS.ATTENDANCE, [...attendance]);
      return attendance[index];
    }
  },
};

export default attendanceService;
