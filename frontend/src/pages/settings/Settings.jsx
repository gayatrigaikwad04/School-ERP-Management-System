import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/UIStates';

export const Settings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: 'Oakridge Academy',
    affiliationBoard: 'CBSE Affiliated',
    affiliationNumber: 'CBSE/AFF/113042',
    phone: '+91 20 2740 5500',
    email: 'admissions@oakridge.edu.in',
    address: 'Survey No. 42, Viman Nagar, Pune, Maharashtra 411014',
    academicYear: '2026–27',
    currencySymbol: '₹',
    currencyCode: 'INR',
    feeInstallments: 2,
    workingDays: 'Mon - Fri',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res) {
        setFormData(res);
      }
    } catch (err) {
      showToast('Failed to load school settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings(formData);
      showToast('School configuration updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset demo data? This will restore all original students, classes, and payment records.'
      )
    ) {
      localStorage.clear();
      showToast('Demo data restored to original state. Reloading...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (loading) return <LoadingState message="Loading school settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Institution Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              System Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure school profile, affiliation certificates, academic terms, and financial currency
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: School Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700">school</span>
            <h2 className="text-base font-bold text-slate-900 font-headline">School Profile & Affiliation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Legal Name</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Board of Education</label>
              <input
                type="text"
                value={formData.affiliationBoard}
                onChange={(e) => setFormData({ ...formData, affiliationBoard: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affiliation / Registration Code</label>
              <input
                type="text"
                value={formData.affiliationNumber}
                onChange={(e) => setFormData({ ...formData, affiliationNumber: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Helpdesk Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admissions & Accounts Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Bursar Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700">payments</span>
            <h2 className="text-base font-bold text-slate-900 font-headline">Financial & Accounting Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency ISO Code</label>
              <input
                type="text"
                value={formData.currencyCode}
                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Installments per Year</label>
              <select
                value={formData.feeInstallments}
                onChange={(e) => setFormData({ ...formData, feeInstallments: Number(e.target.value) })}
                className="w-full h-9.5 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              >
                <option value={1}>1 (Full Annual Payment)</option>
                <option value={2}>2 (Biannual / Terms 1 & 2)</option>
                <option value={4}>4 (Quarterly Terms)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Data Management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700">database</span>
            <h2 className="text-base font-bold text-slate-900 font-headline">Demo Data & Storage</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Restore Default Mock Data</p>
              <p className="text-slate-500">
                Resets student records, daily roll-calls, and bursar payment vouchers back to initial state.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="h-9 px-4 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold transition-colors shrink-0"
            >
              Reset Mock Data
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                <span>Save School Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
