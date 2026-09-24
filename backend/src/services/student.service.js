/**
 * Student Service
 * Business logic for student management.
 *
 * Business rules enforced:
 *  - studentId must be unique.
 *  - Cannot enrol a student in an Inactive class.
 *  - Parent must exist.
 *  - Auto-generates studentId in format OA-YYYY-NNNN if not provided.
 *  - Maintains bidirectional Parent.studentIds reference.
 */

const studentRepo = require('../repositories/student.repository');
const parentRepo  = require('../repositories/parent.repository');
const classRepo   = require('../repositories/class.repository');
const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// Helper: generate next studentId  OA-YYYY-NNNN
// ─────────────────────────────────────────────
const generateStudentId = async () => {
  const year   = new Date().getFullYear();
  const prefix = `OA-${year}-`;

  const last = await studentRepo.findLastStudentId();
  let nextNum = 1;

  if (last && last.studentId && last.studentId.startsWith(prefix)) {
    const parts  = last.studentId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

const studentService = {
  /**
   * Paginated + filtered list of students.
   */
  getStudents: async (queryParams) => {
    const filters = {
      search:  queryParams.search  || '',
      classId: queryParams.classId || '',
      status:  queryParams.status  || '',
      gender:  queryParams.gender  || '',
    };
    const options = {
      page:  queryParams.page  || 1,
      limit: queryParams.limit || 20,
      sort:  { createdAt: -1 },
    };
    return studentRepo.findAll(filters, options);
  },

  /**
   * All active students for a class (attendance page bulk load).
   */
  getActiveStudentsByClass: async (classId) => {
    return studentRepo.findAllActive(classId || null);
  },

  /**
   * Student detail with populated class + parent.
   */
  getStudentById: async (id) => {
    const student = await studentRepo.findById(id);
    if (!student) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);
    return student;
  },

  /**
   * Create a new student.
   *
   * Validates:
   *  - studentId uniqueness
   *  - parent exists
   *  - class exists and is Active
   *  - fee total ≥ 0
   */
  createStudent: async (data) => {
    // 1. Auto-generate studentId if not provided
    if (!data.studentId) {
      data.studentId = await generateStudentId();
    } else {
      const dup = await studentRepo.findDuplicateStudentId(data.studentId);
      if (dup) {
        throw new AppError(
          `Student ID '${data.studentId}' is already assigned to ${dup.firstName} ${dup.lastName}.`,
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // 2. Validate parent exists
    const parent = await parentRepo.findById(data.parentId);
    if (!parent) {
      throw new AppError('Parent not found. Please create the parent first.', HTTP_STATUS.NOT_FOUND);
    }

    // 3. Validate class exists and is Active
    const cls = await classRepo.findById(data.classId);
    if (!cls) {
      throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);
    }
    if (cls.status === 'Inactive') {
      throw new AppError(
        `Cannot enrol student into inactive class '${cls.className} – ${cls.section}'.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 4. Denormalise display fields
    data.parentName = parent.name;
    data.phone      = data.phone || parent.phone;
    data.className  = `${cls.className} ${cls.section}`;

    // 5. Sanitise fee values
    data.paidAmount = Math.max(0, Number(data.paidAmount || 0));
    data.totalFee   = Math.max(0, Number(data.totalFee   || 0));

    // 6. Create student
    const student = await studentRepo.create(data);

    // 7. Maintain bidirectional parent link (non-blocking, best-effort)
    parentRepo.addStudentRef(parent._id, student._id).catch(() => {});

    return student;
  },

  /**
   * Update an existing student.
   */
  updateStudent: async (id, data) => {
    const existing = await studentRepo.findById(id);
    if (!existing) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);

    // Unique studentId check if changing
    if (data.studentId && data.studentId.toUpperCase() !== existing.studentId) {
      const dup = await studentRepo.findDuplicateStudentId(data.studentId, id);
      if (dup) {
        throw new AppError(`Student ID '${data.studentId}' is already in use.`, HTTP_STATUS.CONFLICT);
      }
    }

    // Class validation if changing
    if (data.classId && String(data.classId) !== String(existing.classId)) {
      const cls = await classRepo.findById(data.classId);
      if (!cls) throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);
      if (cls.status === 'Inactive') {
        throw new AppError(
          `Cannot move student to inactive class '${cls.className} – ${cls.section}'.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      data.className = `${cls.className} ${cls.section}`;
    }

    // Parent validation if changing
    if (data.parentId && String(data.parentId) !== String(existing.parentId)) {
      const parent = await parentRepo.findById(data.parentId);
      if (!parent) throw new AppError('Parent not found.', HTTP_STATUS.NOT_FOUND);
      data.parentName = parent.name;

      // Update parent refs (non-blocking)
      parentRepo.removeStudentRef(existing.parentId, id).catch(() => {});
      parentRepo.addStudentRef(parent._id, id).catch(() => {});
    }

    // Sanitise fee values
    if (data.paidAmount !== undefined) data.paidAmount = Math.max(0, Number(data.paidAmount));
    if (data.totalFee   !== undefined) data.totalFee   = Math.max(0, Number(data.totalFee));

    const updated = await studentRepo.updateById(id, data);
    if (!updated) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);
    return updated;
  },

  /**
   * Soft-delete (deactivate) a student.
   */
  deleteStudent: async (id) => {
    const deleted = await studentRepo.softDeleteById(id);
    if (!deleted) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);
    // Remove parent ref (non-blocking)
    parentRepo.removeStudentRef(deleted.parentId, id).catch(() => {});
    return deleted;
  },

  /**
   * Toggle Active ↔ Inactive (used by frontend deactivate button).
   */
  toggleStudentStatus: async (id) => {
    const student = await studentRepo.toggleStatus(id);
    if (!student) throw new AppError('Student not found.', HTTP_STATUS.NOT_FOUND);
    return student;
  },
};

module.exports = studentService;
