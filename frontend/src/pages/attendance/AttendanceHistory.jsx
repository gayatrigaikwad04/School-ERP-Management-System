import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, EmptyState } from '../../components/common/UIStates';

export const AttendanceHistory = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClass, setFilterClass] = useState('All');
  const [filterDate, setFilterDate] = useState('2026-09-23');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchHistory();
  }, [filterDate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [attRes, clsRes] = await Promise.all([
        attendanceService.getAttendance({ date: filterDate }),
        classService.getClasses(),
      ]);

      setRecords(attRes || []);
      setClasses(clsRes?.classes || []);
    } catch (err) {
      showToast('Failed to load attendance history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((r) => {
    const matchesClass = filterClass === 'All' || r.className?.includes(filterClass);
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesClass && matchesStatus;
  });

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No records to export.', 'warning');
      return;
    }
    const headers = ['Date', 'Student Name', 'Class', 'Status', 'Remarks'];
    const rows = filtered.map((r) => [r.date, r.studentName, r.className, r.status, r.remarks || '']);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Attendance_Log_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported as CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/attendance" className="hover:text-blue-700">
          Attendance
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-semibold">Historical Logs</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-headline">Attendance Logs & Archives</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit daily roll-calls, verify excuse documentation, and export attendance records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/attendance')}
            className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">playlist_add_check</span>
            <span>Take Today's Attendance</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Class
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={`${c.className} ${c.section}`}>
                {c.className} {c.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Excused">Excused Only</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <LoadingState message="Querying attendance history..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="event_busy"
          title="No records found for this date"
          description="Try selecting a different date or clearing the status filter."
          actionText="Take Attendance Now"
          onAction={() => navigate('/attendance')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider h-10">
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.studentName}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.className}</td>
                    <td className="py-3 px-4 font-tabular text-slate-500">{item.date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.remarks || '—'}</td>
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

export default AttendanceHistory;
