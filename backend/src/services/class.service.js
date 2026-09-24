/**
 * Class Service
 * Business logic for class management.
 * Enforces uniqueness rule: className + section + academicYear must be unique.
 */

const classRepo   = require('../repositories/class.repository');
const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

const classService = {
  /**
   * Get paginated + filtered list of classes.
   */
  getClasses: async (query) => {
    const filters = {
      search:       query.search       || '',
      status:       query.status       || '',
      academicYear: query.academicYear || '',
    };
    const options = {
      page:  query.page  || 1,
      limit: query.limit || 20,
      sort:  { className: 1, section: 1 },
    };
    return classRepo.findAll(filters, options);
  },

  /**
   * Get all active classes — lightweight list for dropdowns.
   */
  getAllActiveClasses: async () => {
    return classRepo.findAllActive();
  },

  /**
   * Get a single class by id.
   */
  getClassById: async (id) => {
    const cls = await classRepo.findById(id);
    if (!cls) {
      throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);
    }
    return cls;
  },

  /**
   * Create a new class.
   * Rejects if the same className + section + academicYear already exists.
   */
  createClass: async (data) => {
    const duplicate = await classRepo.findDuplicate(
      data.className,
      data.section,
      data.academicYear
    );
    if (duplicate) {
      throw new AppError(
        `Class '${data.className} – ${data.section.toUpperCase()}' already exists for academic year ${data.academicYear}.`,
        HTTP_STATUS.CONFLICT
      );
    }
    return classRepo.create(data);
  },

  /**
   * Update an existing class.
   * Re-runs duplicate check excluding current document.
   */
  updateClass: async (id, data) => {
    const existing = await classRepo.findById(id);
    if (!existing) {
      throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);
    }

    // Check uniqueness only if name/section/year is being changed
    const newName  = data.className   || existing.className;
    const newSec   = data.section     || existing.section;
    const newYear  = data.academicYear || existing.academicYear;

    const duplicate = await classRepo.findDuplicate(newName, newSec, newYear, id);
    if (duplicate) {
      throw new AppError(
        `Class '${newName} – ${newSec.toUpperCase()}' already exists for academic year ${newYear}.`,
        HTTP_STATUS.CONFLICT
      );
    }

    const updated = await classRepo.updateById(id, data);
    if (!updated) {
      throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);
    }
    return updated;
  },

  /**
   * Soft-delete a class.
   */
  deleteClass: async (id) => {
    const deleted = await classRepo.softDeleteById(id);
    if (!deleted) {
      throw new AppError('Class not found.', HTTP_STATUS.NOT_FOUND);
    }
    return deleted;
  },
};

module.exports = classService;
