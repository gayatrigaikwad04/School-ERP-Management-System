/**
 * Parent Service
 * Business logic for parent management.
 * Auto-generates parentId in format PAR-YYYY-NNN.
 */

const parentRepo  = require('../repositories/parent.repository');
const AppError    = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

// ─────────────────────────────────────────────
// Helper: generate next sequential parentId
// ─────────────────────────────────────────────
const generateParentId = async () => {
  const year = new Date().getFullYear();
  const prefix = `PAR-${year}-`;

  const last = await parentRepo.findLastParentId();

  let nextNum = 1;
  if (last && last.parentId && last.parentId.startsWith(prefix)) {
    const parts = last.parentId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

// ─────────────────────────────────────────────
// Service methods
// ─────────────────────────────────────────────

const parentService = {
  /**
   * Paginated + searchable list of parents.
   */
  getParents: async (queryParams) => {
    const filters = { search: queryParams.search || '' };
    const options = { page: queryParams.page || 1, limit: queryParams.limit || 20 };
    return parentRepo.findAll(filters, options);
  },

  /**
   * Lightweight list for dropdowns.
   */
  getAllParentsList: async () => {
    return parentRepo.findAllList();
  },

  /**
   * Get single parent by id.
   */
  getParentById: async (id) => {
    const parent = await parentRepo.findById(id);
    if (!parent) throw new AppError('Parent not found.', HTTP_STATUS.NOT_FOUND);
    return parent;
  },

  /**
   * Create a new parent.
   * - Auto-generates parentId if not provided.
   * - Enforces unique email.
   */
  createParent: async (data) => {
    // Check duplicate email
    const emailExists = await parentRepo.findByEmail(data.email);
    if (emailExists) {
      throw new AppError(
        `A parent with email '${data.email}' already exists.`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Generate parentId if not supplied
    if (!data.parentId) {
      data.parentId = await generateParentId();
    } else {
      // Validate supplied id is unique
      const idExists = await parentRepo.findDuplicateParentId(data.parentId);
      if (idExists) {
        throw new AppError(
          `Parent ID '${data.parentId}' is already in use.`,
          HTTP_STATUS.CONFLICT
        );
      }
    }

    return parentRepo.create(data);
  },

  /**
   * Update an existing parent.
   * Re-validates email uniqueness on change.
   */
  updateParent: async (id, data) => {
    const existing = await parentRepo.findById(id);
    if (!existing) throw new AppError('Parent not found.', HTTP_STATUS.NOT_FOUND);

    if (data.email && data.email.toLowerCase() !== existing.email) {
      const emailExists = await parentRepo.findByEmail(data.email, id);
      if (emailExists) {
        throw new AppError(
          `Email '${data.email}' is already registered to another parent.`,
          HTTP_STATUS.CONFLICT
        );
      }
    }

    const updated = await parentRepo.updateById(id, data);
    if (!updated) throw new AppError('Parent not found.', HTTP_STATUS.NOT_FOUND);
    return updated;
  },

  /**
   * Soft-delete a parent.
   */
  deleteParent: async (id) => {
    const deleted = await parentRepo.softDeleteById(id);
    if (!deleted) throw new AppError('Parent not found.', HTTP_STATUS.NOT_FOUND);
    return deleted;
  },
};

module.exports = parentService;
