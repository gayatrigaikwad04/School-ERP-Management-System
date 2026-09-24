/**
 * Payment Repository
 * All Mongoose operations for the Payment collection.
 */

const Payment = require('../models/Payment');

const paymentRepository = {
  /**
   * Paginated + filtered payment list.
   * @param {object} filters - { search, studentId, mode, date, startDate, endDate, status }
   * @param {object} options - { page, limit }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = { isDeleted: false };

    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.status && filters.status !== 'All') query.status = filters.status;

    if (filters.mode && filters.mode !== 'All') {
      query.paymentMode = filters.mode;
    }

    if (filters.date) {
      query.paymentDate = filters.date;
    } else if (filters.startDate || filters.endDate) {
      query.paymentDate = {};
      if (filters.startDate) query.paymentDate.$gte = filters.startDate;
      if (filters.endDate)   query.paymentDate.$lte = filters.endDate;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { studentName: regex },
        { studentCode: regex },
        { receiptNumber: regex },
        { refNumber: regex },
        { className: regex },
      ];
    }

    const page  = Math.max(1, Number(options.page)  || 1);
    const limit = Math.min(100, Number(options.limit) || 20);
    const skip  = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    return { payments, total, page, limit };
  },

  /**
   * Find a payment by MongoDB _id.
   */
  findById: async (id) => {
    return Payment.findOne({ _id: id, isDeleted: false })
      .populate('studentId', 'firstName lastName studentId className')
      .populate('recordedBy', 'name email');
  },

  /**
   * Find by receipt number.
   */
  findByReceiptNumber: async (receiptNumber) => {
    return Payment.findOne({ receiptNumber: receiptNumber.toUpperCase(), isDeleted: false });
  },

  /**
   * Get last receipt number to generate next sequential one.
   */
  findLastReceiptNumber: async () => {
    return Payment.findOne({ isDeleted: false }, { receiptNumber: 1 })
      .sort({ receiptNumber: -1 })
      .lean();
  },

  /**
   * Get all payments for a student — used in student detail view.
   */
  findByStudent: async (studentId) => {
    return Payment.find({ studentId, isDeleted: false, status: { $ne: 'Cancelled' } })
      .sort({ paymentDate: -1 })
      .lean();
  },

  /**
   * Sum of all verified payments (for dashboard KPI).
   */
  getTotalCollected: async () => {
    const result = await Payment.aggregate([
      { $match: { isDeleted: false, status: 'Verified' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    return result[0]?.total || 0;
  },

  /**
   * Recent payments for dashboard (last N records).
   */
  getRecent: async (limit = 5) => {
    return Payment.find({ isDeleted: false, status: 'Verified' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  /**
   * Create a payment record.
   */
  create: async (data) => {
    const payment = new Payment(data);
    return payment.save();
  },

  /**
   * Aggregate payment totals by mode — for reports.
   */
  getTotalsByMode: async (filters = {}) => {
    const match = { isDeleted: false, status: 'Verified' };
    if (filters.startDate || filters.endDate) {
      match.paymentDate = {};
      if (filters.startDate) match.paymentDate.$gte = filters.startDate;
      if (filters.endDate)   match.paymentDate.$lte = filters.endDate;
    }

    return Payment.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMode', total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
  },
};

module.exports = paymentRepository;
