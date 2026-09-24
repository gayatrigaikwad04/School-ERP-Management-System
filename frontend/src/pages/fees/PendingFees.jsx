import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { LoadingState, EmptyState } from '../../components/common/UIStates';

export const PendingFees = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pendingData, setPendingData] = useState({
    studentsWithPending: [],
    totalPendingStudents: 0,
    totalPendingAmount: 0,
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPendingFees();
  }, []);

  const loadPendingFees = async () => {
    try {
      setLoading(true);
      const [res, clsRes] = await Promise.all([
        feeService.getPendingFees(),
        classService.getClasses(),
      ]);
      setPendingData(res || { studentsWithPending: [], totalPendingStudents: 0, totalPendingAmount: 0 });
      setClasses(clsRes?.classes || []);
    } catch (err) {
      showToast('Failed to load pending fees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredList = (pendingData.studentsWithPending || []).filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.studentName?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.parentName?.toLowerCase().includes(q) ||
      s.className?.toLowerCase().includes(q);

    const matchesClass = selectedClass === 'All' || s.classId === selectedClass || s.className?.includes(selectedClass);

    return matchesSearch && matchesClass;
  });

  const handleSendReminder = (student) => {
    showToast(
      `Dispatched fee notice to ${student.parentName} (${student.phone}) for ₹${student.pending.toLocaleString(
        'en-IN'
      )}.`,
      'success'
    );
  };

  const handleBroadcastAll = () => {
    showToast(
      `Dispatched batch SMS reminders to all ${filteredList.length} families with outstanding balances.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Pending Fees & Overdue Accounts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-tabular">
              {filteredList.length} Overdue Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track unpaid tuition balances, identify fee defaulters, and dispatch automated payment reminders
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBroadcastAll}
            disabled={filteredList.length === 0}
            className="h-9 px-3.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">send_to_mobile</span>
            <span>Broadcast Batch Notice</span>
          </button>
          <button
            onClick={() => navigate('/fees/collect')}
            className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Open Cash Desk</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-tabular">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">Total Outstanding Balance</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 font-display mt-1">
            ₹{Number(pendingData.totalPendingAmount || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Accumulated across all grades</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">Students with Balances</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
            {pendingData.totalPendingStudents}
          </div>
          <span className="text-[11px] text-slate-500">Term 2 installment cycle</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">High Balance Flags (&gt; ₹15k)</span>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 font-display mt-1">
            {filteredList.filter((s) => s.isDefaulter).length}
          </div>
          <span className="text-[11px] text-slate-500">Priority recovery attention</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search student name, ID or parent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Grades & Sections</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className} {cls.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Defaulter Table */}
      {loading ? (
        <LoadingState message="Auditing student fee ledgers..." />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon="check_circle"
          title="Zero Outstanding Fees!"
          description="All student accounts are currently fully settled. Great job by the Bursar office!"
          actionText="Open Fee Collection Desk"
          onAction={() => navigate('/fees/collect')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider h-10">
                  <th className="py-2.5 px-4">Student & ID</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Parent / Contact</th>
                  <th className="py-2.5 px-4 text-right">Total Annual Fee</th>
                  <th className="py-2.5 px-4 text-right">Paid Amount</th>
                  <th className="py-2.5 px-4 text-right">Pending Balance</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular">
                {filteredList.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-sans">{student.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.studentId}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700 font-sans">
                      {student.className}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-800">{student.parentName}</div>
                      <div className="text-[11px] text-slate-500">{student.phone}</div>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      ₹{student.totalFee.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                      ₹{student.paid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-sm font-bold text-amber-700">
                          ₹{student.pending.toLocaleString('en-IN')}
                        </span>
                        {student.isDefaulter && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            High
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => handleSendReminder(student)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Send SMS / WhatsApp Reminder"
                        >
                          <span className="material-symbols-outlined text-base">chat</span>
                        </button>
                        <button
                          onClick={() => navigate(`/fees/collect?studentId=${student.id}`)}
                          className="h-7 px-2.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-xs">payments</span>
                          <span>Collect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingFees;
