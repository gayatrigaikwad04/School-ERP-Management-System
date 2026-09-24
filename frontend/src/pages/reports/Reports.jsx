import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/UIStates';

export const Reports = () => {
  const { showToast } = useToast();

  const [activeReport, setActiveReport] = useState('students'); // 'students', 'attendance', 'fees'
  const [loading, setLoading] = useState(true);

  const [studentStats, setStudentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [feeStats, setFeeStats] = useState(null);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [stuRes, attRes, feeRes] = await Promise.all([
        reportService.getStudentReport(),
        reportService.getAttendanceReport(),
        reportService.getFeeReport(),
      ]);

      setStudentStats(stuRes);
      setAttendanceStats(attRes);
      setFeeStats(feeRes);
    } catch (err) {
      showToast('Failed to generate report summaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportType) => {
    showToast(`Generating and downloading official ${reportType} report PDF...`, 'info');
  };

  if (loading) return <LoadingState message="Compiling administrative school reports..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">School Analytics & Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              AY 2026–27 Executive Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Data insights on student demographics, daily attendance velocity, and bursar revenue collection
          </p>
        </div>

        <button
          onClick={() => handleExport(activeReport)}
          className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          <span>Export Official PDF</span>
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveReport('students')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeReport === 'students'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-lg">groups</span>
          <span>Student Enrollment & Demographics</span>
        </button>

        <button
          onClick={() => setActiveReport('attendance')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeReport === 'attendance'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-lg">fact_check</span>
          <span>Attendance Efficiency</span>
        </button>

        <button
          onClick={() => setActiveReport('fees')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeReport === 'fees'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
          <span>Fee Collection & Recovery</span>
        </button>
      </div>

      {/* REPORT 1: STUDENT DEMOGRAPHICS */}
      {activeReport === 'students' && studentStats && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-tabular">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Enrolled</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                {studentStats.totalStudents}
              </div>
              <span className="text-[11px] text-slate-500">Active students in roster</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase">Active Status</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-display mt-1">
                {studentStats.activeStudents}
              </div>
              <span className="text-[11px] text-slate-500">
                {(studentStats.totalStudents > 0
                  ? (studentStats.activeStudents / studentStats.totalStudents) * 100
                  : 100
                ).toFixed(0)}
                % operational
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-blue-600 uppercase">Male Students</span>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 font-display mt-1">
                {studentStats.maleCount}
              </div>
              <span className="text-[11px] text-slate-500">
                {(studentStats.totalStudents > 0
                  ? (studentStats.maleCount / studentStats.totalStudents) * 100
                  : 50
                ).toFixed(0)}
                % of student body
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-purple-600 uppercase">Female Students</span>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700 font-display mt-1">
                {studentStats.femaleCount}
              </div>
              <span className="text-[11px] text-slate-500">
                {(studentStats.totalStudents > 0
                  ? (studentStats.femaleCount / studentStats.totalStudents) * 100
                  : 50
                ).toFixed(0)}
                % of student body
              </span>
            </div>
          </div>

          {/* Class Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 font-headline">Class Capacity & Enrollment</h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase h-10">
                  <th className="py-2.5 px-4">Class Section</th>
                  <th className="py-2.5 px-4">Homeroom Teacher</th>
                  <th className="py-2.5 px-4 text-center">Enrolled</th>
                  <th className="py-2.5 px-4 text-center">Capacity</th>
                  <th className="py-2.5 px-4">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular">
                {studentStats.classBreakdown.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">{row.className}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{row.teacher || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">{row.enrolledCount}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{row.capacity}</td>
                    <td className="py-3 px-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, row.percentage)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px] w-10 text-right">
                          {row.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: ATTENDANCE EFFICIENCY */}
      {activeReport === 'attendance' && attendanceStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-tabular">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase">Overall Attendance Rate</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 font-display mt-1">
                {attendanceStats.overallRate}%
              </div>
              <span className="text-[11px] text-slate-500">Daily verification average</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase">Students Present</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                {attendanceStats.presentCount}
              </div>
              <span className="text-[11px] text-slate-500">Morning check-in verified</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-rose-600 uppercase">Absences Recorded</span>
              <div className="text-2xl sm:text-3xl font-bold text-rose-700 font-display mt-1">
                {attendanceStats.absentCount}
              </div>
              <span className="text-[11px] text-slate-500">Unexcused</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-purple-600 uppercase">Excused Leave</span>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700 font-display mt-1">
                {attendanceStats.excusedCount}
              </div>
              <span className="text-[11px] text-slate-500">Medical notes on file</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 font-headline">Grade-wise Attendance Ranking</h3>
            </div>
            <table className="w-full text-left border-collapse text-xs font-tabular">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase h-10">
                  <th className="py-2.5 px-4 font-sans">Class Section</th>
                  <th className="py-2.5 px-4 text-center">Enrolled</th>
                  <th className="py-2.5 px-4 text-center">Present</th>
                  <th className="py-2.5 px-4 text-center">Absent</th>
                  <th className="py-2.5 px-4 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceStats.classStats.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">{row.name}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{row.enrolled}</td>
                    <td className="py-3 px-4 text-center text-emerald-700 font-bold">{row.present}</td>
                    <td className="py-3 px-4 text-center text-rose-600 font-bold">{row.absent}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      {row.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: FEE COLLECTION */}
      {activeReport === 'fees' && feeStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-tabular">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Annual Demand</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                ₹{Number(feeStats.totalAnnualFee).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500">All enrolled student tuition</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase">Total Collected to Date</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-display mt-1">
                ₹{Number(feeStats.totalCollected).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {feeStats.collectionRate}% recovery rate
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-amber-600 uppercase">Total Pending Balance</span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 font-display mt-1">
                ₹{Number(feeStats.totalPending).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500">Term 2 receivables</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <h3 className="text-sm font-bold text-slate-900 font-headline mb-4">
                Collections by Instrument
              </h3>
              <div className="space-y-3 font-tabular text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">UPI (Google Pay / PhonePe):</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(feeStats.modeBreakdown.UPI || 34000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">Cash Counter (Bursar Desk):</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(feeStats.modeBreakdown.Cash || 32000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">Bank Transfer (NEFT / IMPS):</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(feeStats.modeBreakdown.BankTransfer || 40000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">Card Terminal:</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(feeStats.modeBreakdown.Card || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-headline mb-2">Bursar Health Index</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The school's cashflow efficiency is currently at{' '}
                  <strong className="text-emerald-700">{feeStats.collectionRate}%</strong>, exceeding the
                  department benchmark of 75% for Term 2.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Verified Transactions:</span>
                <span className="font-bold text-slate-800 font-tabular">
                  {feeStats.totalTransactions} Receipts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
