import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/UIStates';

export const FeeStructure = () => {
  const { showToast } = useToast();
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    totalAnnualFee: 32000,
    labTechFee: 1500,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feesRes, classesRes] = await Promise.all([
        feeService.getFeeStructures(),
        classService.getClasses(),
      ]);
      setFeeStructures(feesRes || []);
      setClasses(classesRes?.classes || []);
    } catch (err) {
      showToast('Failed to load fee structures', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFee(null);
    const firstClass = classes[0];
    setFormData({
      classId: firstClass?.id || '',
      className: firstClass?.className || '',
      totalAnnualFee: 30000,
      labTechFee: 1500,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      classId: fee.classId,
      className: fee.className,
      totalAnnualFee: fee.totalAnnualFee,
      labTechFee: fee.labTechFee || 1500,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingFee) {
        await feeService.updateFeeStructure(editingFee.id, formData);
        showToast('Fee schedule updated successfully.', 'success');
      } else {
        await feeService.createFeeStructure(formData);
        showToast('New grade fee structure added.', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
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
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Annual Fee Structures</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              AY 2026–27 Schedule
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Define grade-wise tuition schedules, term installment splits, and technology laboratory dues
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Fee Schedule</span>
        </button>
      </div>

      {/* Grid of Fee Cards */}
      {loading ? (
        <LoadingState message="Loading fee schedules..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feeStructures.map((f) => {
            const term1 = Math.round(f.totalAnnualFee / 2);
            const term2 = f.totalAnnualFee - term1;

            return (
              <div
                key={f.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-blue-400 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-headline">{f.className}</h3>
                      <span className="text-xs text-slate-400 font-medium">
                        Academic Year {f.academicYear || '2026–27'}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 text-xs font-tabular">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Total Annual Tuition:</span>
                      <span className="text-base font-bold text-slate-900">
                        ₹{Number(f.totalAnnualFee).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Term 1 Installment:</span>
                      <span className="font-semibold text-slate-700">₹{term1.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Term 2 Installment:</span>
                      <span className="font-semibold text-slate-700">₹{term2.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lab & Tech Levy:</span>
                      <span className="font-semibold text-slate-700">
                        ₹{(f.labTechFee || 1500).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {f.enrolledCount || 0} active students enrolled
                  </span>
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="text-blue-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit Fee</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Fee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFee ? 'Edit Grade Fee Schedule' : 'Create New Fee Schedule'}
        subtitle="Term 1 and Term 2 installments are automatically apportioned (50/50)"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Class Grade <span className="text-rose-500">*</span>
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
              Total Annual Tuition Fee (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1000"
              step="500"
              value={formData.totalAnnualFee}
              onChange={(e) => setFormData({ ...formData, totalAnnualFee: Number(e.target.value) })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-bold font-tabular text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lab / Tech Fee Levy (₹)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.labTechFee}
              onChange={(e) => setFormData({ ...formData, labTechFee: Number(e.target.value) })}
              className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Term 1 Due:</span>
              <span className="font-bold">
                ₹{Math.round(formData.totalAnnualFee / 2).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Term 2 Due:</span>
              <span className="font-bold">
                ₹{Math.round(formData.totalAnnualFee / 2).toLocaleString('en-IN')}
              </span>
            </div>
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
              <span>{editingFee ? 'Save Changes' : 'Create Schedule'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructure;
