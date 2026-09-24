import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal, ConfirmationModal } from '../../components/common/Modal';
import { LoadingState, EmptyState } from '../../components/common/UIStates';

export const Classes = () => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Deactivate Modal
  const [toggleClass, setToggleClass] = useState(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    className: '',
    section: 'A',
    classTeacherName: '',
    room: '',
    capacity: 35,
    academicYear: '2026–27',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getClasses();
      setClasses(res?.classes || []);
    } catch (err) {
      showToast(err.message || 'Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = classes.filter(
    (c) => filterStatus === 'All' || c.status === filterStatus
  );

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      section: 'A',
      classTeacherName: '',
      room: '',
      capacity: 35,
      academicYear: '2026–27',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      className: cls.className,
      section: cls.section,
      classTeacherName: cls.classTeacherName || '',
      room: cls.room || '',
      capacity: cls.capacity || 35,
      academicYear: cls.academicYear || '2026–27',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.className.trim() || !formData.section.trim()) {
      showToast('Class name and section are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingClass) {
        await classService.updateClass(editingClass.id, formData);
        showToast('Class section updated successfully.', 'success');
      } else {
        await classService.createClass(formData);
        showToast('New class section created.', 'success');
      }
      setIsModalOpen(false);
      loadClasses();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleClass) return;
    try {
      setSubmitting(true);
      const updated = await classService.deactivateClass(toggleClass.id);
      showToast(`Class marked as ${updated.status}.`, 'success');
      setIsToggleModalOpen(false);
      loadClasses();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Classes & Sections</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {classes.length} Total Sections
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure grade levels, assigned homeroom teachers, student capacity, and room allocations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Create New Section</span>
        </button>
      </div>

      {/* Filter and Rule Notification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
          <span>
            <strong>Business Rule:</strong> Inactive classes cannot receive new student enrollments.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Sections</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Grid of Classes Cards */}
      {loading ? (
        <LoadingState message="Loading class structures..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="meeting_room"
          title="No classes found"
          description="Create your first class and section to begin allocating students."
          actionText="Create New Section"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cls) => {
            const enrolled = cls.studentCount || 0;
            const capacity = cls.capacity || 35;
            const percentFilled = Math.min(100, Math.round((enrolled / capacity) * 100));

            return (
              <div
                key={cls.id}
                className={`bg-white rounded-xl border shadow-xs p-5 flex flex-col justify-between transition-all ${
                  cls.status === 'Inactive' ? 'border-slate-300 bg-slate-50/50 opacity-80' : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 font-headline">
                          {cls.className} {cls.section}
                        </h3>
                        <StatusBadge status={cls.status} size="sm" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {cls.room || 'Room Unassigned'} • {cls.academicYear}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">meeting_room</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Homeroom Teacher:</span>
                      <span className="font-semibold text-slate-800">
                        {cls.classTeacherName || 'Not Assigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Enrolled Students:</span>
                      <span className="font-bold text-slate-900 font-tabular">
                        {enrolled} / {capacity}
                      </span>
                    </div>

                    {/* Capacity Progress */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentFilled >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="text-blue-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setToggleClass(cls);
                      setIsToggleModalOpen(true);
                    }}
                    className={`font-semibold flex items-center gap-1 ${
                      cls.status === 'Active'
                        ? 'text-rose-600 hover:underline'
                        : 'text-emerald-600 hover:underline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {cls.status === 'Active' ? 'power_settings_new' : 'check'}
                    </span>
                    <span>{cls.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class Section' : 'Create New Class Section'}
        subtitle="Configure section details and assign teacher"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Class / Grade Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Junior KG or Grade 3"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Section <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A, B, or C"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class Teacher Name</label>
            <input
              type="text"
              placeholder="e.g. Ms. Sunita Rao"
              value={formData.classTeacherName}
              onChange={(e) => setFormData({ ...formData, classTeacherName: e.target.value })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number / Wing</label>
              <input
                type="text"
                placeholder="e.g. Room 204"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Student Capacity</label>
              <input
                type="number"
                min="5"
                max="60"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              readOnly
              value={formData.academicYear}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {submitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              <span>{editingClass ? 'Save Changes' : 'Create Section'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Class Confirmation Modal */}
      <ConfirmationModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleToggleStatus}
        title={toggleClass?.status === 'Active' ? 'Deactivate Class Section?' : 'Reactivate Class Section?'}
        message={
          toggleClass?.status === 'Active'
            ? `Are you sure you want to deactivate ${toggleClass?.className} ${toggleClass?.section}? Note: Inactive classes cannot accept new student enrollments.`
            : `Are you sure you want to reactivate ${toggleClass?.className} ${toggleClass?.section}?`
        }
        confirmText={toggleClass?.status === 'Active' ? 'Deactivate Class' : 'Reactivate Class'}
        isDestructive={toggleClass?.status === 'Active'}
        loading={submitting}
      />
    </div>
  );
};

export default Classes;
