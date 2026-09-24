import api from './api';
import { KEYS, getStorageItem, setStorageItem } from './mockStorage';
import { INITIAL_PAYMENTS } from '../mock/mockData';

export const paymentService = {
  getPayments: async (params = {}) => {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch {
      let payments = getStorageItem(KEYS.PAYMENTS, INITIAL_PAYMENTS);

      if (params.search) {
        const q = params.search.toLowerCase();
        payments = payments.filter(
          (p) =>
            p.studentName?.toLowerCase().includes(q) ||
            p.studentCode?.toLowerCase().includes(q) ||
            p.receiptNumber?.toLowerCase().includes(q) ||
            p.refNumber?.toLowerCase().includes(q)
        );
      }

      if (params.studentId) {
        payments = payments.filter((p) => p.studentId === params.studentId);
      }

      if (params.mode && params.mode !== 'All') {
        payments = payments.filter((p) => p.paymentMode?.toLowerCase() === params.mode.toLowerCase());
      }

      if (params.date) {
        payments = payments.filter((p) => p.paymentDate === params.date);
      }

      return { payments, total: payments.length };
    }
  },

  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch {
      const students = getStorageItem(KEYS.STUDENTS, []);
      const studentIndex = students.findIndex(
        (s) => s.id === paymentData.studentId || s.studentId === paymentData.studentId
      );

      if (studentIndex === -1) {
        throw new Error('Student not found for recording payment.');
      }

      const student = students[studentIndex];
      const amountToPay = Number(paymentData.amountPaid);

      if (!amountToPay || amountToPay <= 0) {
        throw new Error('Payment amount must be greater than zero.');
      }

      const currentPaid = Number(student.paidAmount || 0);
      const totalFee = Number(student.totalFee || 30000);
      const pending = Math.max(0, totalFee - currentPaid);

      // CRITICAL BUSINESS RULE: Prevent overpayment!
      // If payment > pending, reject with validation error!
      if (amountToPay > pending) {
        throw new Error(
          `Overpayment rejected! Payment amount (₹${amountToPay.toLocaleString()}) cannot exceed total pending fee (₹${pending.toLocaleString()}).`
        );
      }

      // Update student's paid amount
      students[studentIndex].paidAmount = currentPaid + amountToPay;
      setStorageItem(KEYS.STUDENTS, students);

      // Create Payment Ledger Record
      const payments = getStorageItem(KEYS.PAYMENTS, INITIAL_PAYMENTS);
      const receiptNumber = paymentData.receiptNumber || `REC-2026-${8820 + payments.length + 1}`;

      const newPayment = {
        id: `pay_${Date.now()}`,
        receiptNumber,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentCode: student.studentId,
        className: student.className,
        amountPaid: amountToPay,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMode: paymentData.paymentMode || 'Cash',
        refNumber: paymentData.refNumber || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        remarks: paymentData.remarks || 'Tuition fee installment collected',
        status: 'Verified',
        createdAt: new Date().toISOString(),
      };

      const updatedPayments = [newPayment, ...payments];
      setStorageItem(KEYS.PAYMENTS, updatedPayments);

      return {
        payment: newPayment,
        newPending: Math.max(0, totalFee - (currentPaid + amountToPay)),
        student: students[studentIndex],
      };
    }
  },
};

export default paymentService;
