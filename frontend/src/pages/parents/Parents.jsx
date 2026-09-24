import React, { useState, useEffect, useMemo } from 'react';
import { parentService } from '../../services/parentService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { LoadingState, EmptyState, Pagination } from '../../components/common/UIStates';

export const Parents = () => {
  const { showToast } = useToast();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal for Add/Edit Parent
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
  });

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      const res = await parentService.getParents();
      setParents(res?.parents || []);
    } catch (err) {
      showToast(err.message || 'Failed to load parents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = useMemo(() => {
    const q = search.toLowerCase();
    return parents.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.parentId?.toLowerCase().includes(q) ||
        p.occupation?.toLowerCase().includes(q)
    );
  }, [parents, search]);

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / pageSize));
  const paginatedParents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParents.slice(start, start + pageSize);
  }, [filteredParents, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingParent(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (parent) => {
    setEditingParent(parent);
    setFormData({
      name: parent.name || '',
      phone: parent.phone || '',
      email: parent.email || '',
      address: parent.address || '',
      occupation: parent.occupation || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Parent name and phone number are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingParent) {
        await parentService.updateParent(editingParent.id, formData);
        showToast('Parent details updated successfully.', 'success');
      } else {
        await parentService.createParent(formData);
        showToast('New guardian added to directory.', 'success');
      }
      setIsModalOpen(false);
      loadParents();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallParent = (name, phone) => {
    showToast(`Calling ${name} at ${phone}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Parents & Guardians</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-tabular">
              {filteredParents.length} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage contact information, linked wards, address details, and communication logs
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>Add Guardian</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search parent by name, phone, email, or guardian ID..."
            className="w-full h-9.5 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading parents directory..." />
      ) : filteredParents.length === 0 ? (
        <EmptyState
          icon="family_restroom"
          title="No parents found"
          description="No parents matching your search criteria."
          actionText="Add Guardian"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider h-10">
                  <th className="py-2.5 px-4">Guardian ID & Name</th>
                  <th className="py-2.5 px-4">Contact Phone</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Linked Students</th>
                  <th className="py-2.5 px-4">Occupation</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{parent.name}</div>
                      <div className="text-[11px] text-blue-700 font-mono font-medium">{parent.parentId}</div>
                    </td>

                    <td className="py-3 px-4 font-tabular text-slate-700 font-medium">
                      {parent.phone}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {parent.email || <span className="text-slate-400">—</span>}
                    </td>

                    <td className="py-3 px-4">
                      {parent.students && parent.students.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {parent.students.map((st) => (
                            <span
                              key={st.id}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200"
                            >
                              {st.firstName} ({st.className})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">No linked ward</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {parent.occupation || <span className="text-slate-400">—</span>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCallParent(parent.name, parent.phone)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Dial Parent"
                        >
                          <span className="material-symbols-outlined text-base">call</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(parent)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Guardian"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredParents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add/Edit Guardian Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParent ? 'Edit Guardian Details' : 'Register New Guardian'}
        subtitle="Ensure phone number is active for SMS & WhatsApp payment notifications"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Primary Phone (WhatsApp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="+91 98220 11223"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              placeholder="Apartment, Street, Pune, 411014"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
            <input
              type="text"
              placeholder="e.g. IT Consultant / Architect"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
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
              <span>{editingParent ? 'Update Details' : 'Add Guardian'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parents;
