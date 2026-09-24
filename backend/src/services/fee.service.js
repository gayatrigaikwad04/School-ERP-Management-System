/**
 * Fee Service
 * Business logic for fee structure management.
 *
 * Business rules enforced:
 *  - Only ONE fee structure per classId + academicYear (unique).
 *  - term1Fee + term2Fee must equal totalAnnualFee.
 *  - Class must exist.
 *  - Deleting a fee structure sets it Inactive (soft delete).
 */

const feeRepo     = require('../repositories/fee.repository');
const classRepo   = require('../repositories/class.repository');
const studentRepo = require('../repositories/student.repository');
const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// Helper: compute term split from total
// ─────────────────────────────────────────────
const computeTerms = (total, term1, term2) => {
  // If both terms explicitly provided, validate they sum correctly
  if (term1 !== undefined && term2 !== undefined) {
    if (Math.round(term1 + term2) !== Math.round(total)) {
      throw new AppError(
        `Term 1 fee (${term1}) + Term 2 fee (${term2}) must equal Total Annual Fee (${total}).`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return { term1Fee: term1, term2Fee: term2 };
  }
  // Auto-split 50/50 (round up term1 for odd values)
  const t1 = Math.ceil(total / 2);
  const t2 = total - t1;
  return { term1Fee: t1, term2Fee: t2 };
};

const feeService = {
  /**
   * Get all fee structures with enrolled student counts.
   */
  getFeeStructures: async (queryParams) => {
    const filters = {
      academicYear: queryParams.academicYear || '',
      status:       queryParams.status       || '',
      classId:      queryParams.classId      || '',
    };

    const feeStructures = await feeRepo.findAll(filters);

    // Attach enrolled student count to each structure
    const enriched = await Promise.all(
      feeStructures.map(async (fee) => {
        const enrolledCount = await studentRepo.countByClass(fee.classId?._id || fee.classId);
        return { ...fee, enrolledCount };
      })
    );

    return enriched;
  },

  /**
   * Get a single fee structure by id.
   */
  getFeeById: async (id) => {
    const fee = await feeRepo.findById(id);
    if (!fee) throw new AppError('Fee structure not found.', HTTP_STATUS.NOT_FOUND);
    return fee;
  },

  /**
   * Get pending fees for all students.
   * Returns student-level pending fee data for the Fees page.
   */
  getPendingFees: async (queryParams) => {
    const filters = {
      search:  queryParams.search  || '',
      classId: queryParams.classId || '',
      status:  'Active',           // Only active students have pending fees
    };
    const options = { page: queryParams.page || 1, limit: queryParams.limit || 50 };

    const result = await studentRepo.findAll(
      { ...filters, status: queryParams.onlyPending === 'false' ? '' : 'Active' },
      options
    );

    const studentsWithPending = result.students.map((student) => {
      const totalFee   = Number(student.totalFee  || 0);
      const paidAmount = Number(student.paidAmount || 0);
      const pending    = Math.max(0, totalFee - paidAmount);
      return {
        id:          student._id,
        studentId:   student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        firstName:   student.firstName,
        lastName:    student.lastName,
        avatar:      student.avatar,
        classId:     student.classId,
        className:   student.className,
        parentName:  student.parentName,
        phone:       student.phone,
        totalFee,
        paidAmount,
        pending,
        isDefaulter: pending > 15000,
        status:      student.status,
      };
    });

    // Filter to only those with pending > 0
    const pendingOnly = queryParams.onlyPending !== 'false'
      ? studentsWithPending.filter((s) => s.pending > 0)
      : studentsWithPending;

    const totalPendingAmount = pendingOnly.reduce((acc, s) => acc + s.pending, 0);

    return {
      studentsWithPending: pendingOnly,
      totalPendingStudents: pendingOnly.length,
      totalPendingAmount,
      page:  result.page,
      limit: result.limit,
    };
  },

  /**
   * Create a new fee structure.
   */
  createFeeStructure: async (data) => {
    // 1. Validate class exists
    const cls = await classRepo.findById(data.classId);
    if (!cls) throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);

    // 2. Check uniqueness: classId + academicYear
    const existing = await feeRepo.findByClassAndYear(data.classId, data.academicYear);
    if (existing) {
      throw new AppError(
        `A fee structure for '${cls.className} – ${cls.section}' in ${data.academicYear} already exists.`,
        HTTP_STATUS.CONFLICT
      );
    }

    // 3. Compute / validate term split
    const total = Number(data.totalAnnualFee);
    const { term1Fee, term2Fee } = computeTerms(
      total,
      data.term1Fee !== undefined ? Number(data.term1Fee) : undefined,
      data.term2Fee !== undefined ? Number(data.term2Fee) : undefined
    );

    // 4. Denormalise class name
    const payload = {
      ...data,
      className:     `${cls.className} ${cls.section}`,
      totalAnnualFee: total,
      term1Fee,
      term2Fee,
      labTechFee: Number(data.labTechFee || 0),
    };

    return feeRepo.create(payload);
  },

  /**
   * Update an existing fee structure.
   */
  updateFeeStructure: async (id, data) => {
    const existing = await feeRepo.findById(id);
    if (!existing) throw new AppError('Fee structure not found.', HTTP_STATUS.NOT_FOUND);

    // Uniqueness check if classId or academicYear changed
    const newClassId     = data.classId      || String(existing.classId._id || existing.classId);
    const newAcademicYear = data.academicYear || existing.academicYear;

    if (
      String(newClassId) !== String(existing.classId._id || existing.classId) ||
      newAcademicYear    !== existing.academicYear
    ) {
      const dup = await feeRepo.findByClassAndYear(newClassId, newAcademicYear, id);
      if (dup) {
        throw new AppError(
          `A fee structure for this class in ${newAcademicYear} already exists.`,
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Recompute terms if total is being updated
    let updatePayload = { ...data };
    if (data.totalAnnualFee !== undefined) {
      const total = Number(data.totalAnnualFee);
      const { term1Fee, term2Fee } = computeTerms(
        total,
        data.term1Fee !== undefined ? Number(data.term1Fee) : undefined,
        data.term2Fee !== undefined ? Number(data.term2Fee) : undefined
      );
      updatePayload = { ...updatePayload, totalAnnualFee: total, term1Fee, term2Fee };
    }

    const updated = await feeRepo.updateById(id, updatePayload);
    if (!updated) throw new AppError('Fee structure not found.', HTTP_STATUS.NOT_FOUND);
    return updated;
  },

  /**
   * Soft-delete a fee structure.
   */
  deleteFeeStructure: async (id) => {
    const deleted = await feeRepo.softDeleteById(id);
    if (!deleted) throw new AppError('Fee structure not found.', HTTP_STATUS.NOT_FOUND);
    return deleted;
  },
};

module.exports = feeService;
