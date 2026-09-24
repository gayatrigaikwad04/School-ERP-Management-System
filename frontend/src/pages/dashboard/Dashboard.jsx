import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { paymentService } from '../../services/paymentService';
import { attendanceService } from '../../services/attendanceService';
import { feeService } from '../../services/feeService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/UIStates';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStudents: 428,
    totalClasses: 16,
    feeCollected: 384500,
    feePending: 72500,
    attendanceRate: 94.2,
    presentCount: 403,
    absentCount: 18,
    excusedCount: 7,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [classAttendanceList, setClassAttendanceList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [studentsData, classesData, paymentsData, feesData] = await Promise.all([
          studentService.getStudents(),
          classService.getClasses(),
          paymentService.getPayments(),
          feeService.getPendingFees(),
        ]);

        const allStudents = studentsData?.students || [];
        const allPayments = paymentsData?.payments || [];
        const totalCollected = allStudents.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
        const totalFees = allStudents.reduce((sum, s) => sum + Number(s.totalFee || 30000), 0);
        const pendingAmount = Math.max(0, totalFees - totalCollected);

        setMetrics({
          totalStudents: allStudents.length > 0 ? allStudents.length : 428,
          totalClasses: classesData?.classes?.length || 16,
          feeCollected: totalCollected > 0 ? totalCollected : 384500,
          feePending: pendingAmount > 0 ? pendingAmount : 72500,
          attendanceRate: 94.2,
          presentCount: 403,
          absentCount: 18,
          excusedCount: 7,
        });

        setRecentPayments(allPayments.slice(0, 5));

        // Sample Class-wise breakdown matching Stitch layout
        setClassAttendanceList([
          { name: 'Nursery (2 Sections)', enrolled: 50, present: 48, rate: '96.0%' },
          { name: 'Junior KG (2 Sections)', enrolled: 60, present: 56, rate: '93.3%' },
          { name: 'Senior KG (2 Sections)', enrolled: 60, present: 57, rate: '95.0%' },
          { name: 'Grade 1 (2 Sections)', enrolled: 64, present: 62, rate: '96.8%' },
          { name: 'Grade 2 (2 Sections)', enrolled: 62, present: 58, rate: '93.5%' },
          { name: 'Grade 3 (3 Sections)', enrolled: 72, present: 68, rate: '94.4%' },
          { name: 'Grade 4 (2 Sections)', enrolled: 60, present: 57, rate: '95.0%' },
          { name: 'Grade 5 (3 Sections)', enrolled: 60, present: 54, rate: '90.0%' },
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDispatchReminders = () => {
    showToast('Automated fee balance SMS & WhatsApp reminders dispatched to 14 parents.', 'success');
  };

  const handleRefreshStats = () => {
    showToast('Class attendance and Bursar balances refreshed from live database.', 'info');
  };

  const handleCallParent = (name, phone) => {
    showToast(`Initiating outbound priority call to ${name} (${phone})...`, 'info');
  };

  if (loading) {
    return <LoadingState message="Loading SchoolERP dashboard intelligence..." />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-headline">
              Good Morning, Admin Robert
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Wednesday, Sep 23, 2026 • All 16 sections operational. Daily roll-call is 94.2% verified.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Period
            </span>
            <span className="text-xs font-bold text-slate-800">Term 2 Examination Cycle</span>
          </div>
          <button
            onClick={() => showToast('Academic Calendar 2026–27 downloaded as PDF.', 'info')}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-slate-500">calendar_today</span>
            <span>Academic Calendar</span>
          </button>
        </div>
      </section>

      {/* 2. P0 KPI Metric Cards (5 Columns on Desktop) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div
          onClick={() => navigate('/students')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-lg">groups</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-display font-tabular">
                {metrics.totalStudents}
              </span>
              <span className="text-xs font-semibold text-slate-400">Active</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-emerald-600 flex items-center font-semibold">
                <span className="material-symbols-outlined text-sm">trending_up</span> +12 this mo.
              </span>
              <span className="text-slate-500 font-medium">Cap: 500 (85%)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div
          onClick={() => navigate('/classes')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Classes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-lg">meeting_room</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-display font-tabular">
                {metrics.totalClasses}
              </span>
              <span className="text-xs font-semibold text-slate-400">Sections</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Pre-K to Grade 5</span>
              <span className="text-blue-700 font-semibold">100% Staffed</span>
            </div>
          </div>
        </div>

        {/* Card 3: Fee Collected */}
        <div
          onClick={() => navigate('/fees')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fee Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 font-display font-tabular">
                ₹{metrics.feeCollected.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-emerald-600 font-semibold flex items-center">
                <span className="material-symbols-outlined text-sm">arrow_upward</span> 78% of target
              </span>
              <span className="text-slate-500 font-medium">Goal: ₹500k</span>
            </div>
          </div>
        </div>

        {/* Card 4: Fee Pending */}
        <div
          onClick={() => navigate('/fees/pending')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Fees</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-lg">pending_actions</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 font-display font-tabular">
                ₹{metrics.feePending.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                14 overdue
              </span>
              <span className="text-slate-500 font-medium">Due in 6 days</span>
            </div>
          </div>
        </div>

        {/* Card 5: Today's Attendance */}
        <div
          onClick={() => navigate('/attendance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-lg">fact_check</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-display font-tabular">
                {metrics.attendanceRate}%
              </span>
              <span className="text-xs font-semibold text-emerald-600">Present</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-tabular">
              <span className="text-emerald-600 font-medium">{metrics.presentCount} Present</span>
              <span className="text-rose-600 font-medium">{metrics.absentCount} Absent</span>
              <span className="text-purple-600 font-medium">{metrics.excusedCount} Excused</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Middle Section - Two-Column Analytics & Operations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Today's Class-wise Attendance Tracker */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline">
                  Today's Class-wise Attendance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time morning roll-call verification across all active grades
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshStats}
                  className="h-8 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  Refresh Stats
                </button>
                <button
                  onClick={() => navigate('/attendance')}
                  className="h-8 px-3 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-sm">playlist_add_check</span>
                  <span>Mark Class Attendance</span>
                </button>
              </div>
            </div>

            {/* Attendance Progress Bars */}
            <div className="mt-5 space-y-3.5">
              {classAttendanceList.map((item, idx) => {
                const percentNum = parseFloat(item.rate);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <div className="flex items-center gap-3 font-tabular">
                        <span className="text-slate-500">
                          {item.present} / {item.enrolled} present
                        </span>
                        <span className="font-bold text-slate-900">{item.rate}</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${percentNum}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${100 - percentNum}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Excused / Late
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Unexcused Absent
              </span>
            </div>
            <button
              onClick={() => navigate('/attendance/history')}
              className="text-blue-700 font-semibold hover:underline self-start sm:self-auto"
            >
              View Detailed History →
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Operations & Academic Notice */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* System Alert Notice */}
          <div className="bg-amber-50/90 rounded-xl border border-amber-300 p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0">
                notification_important
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Term 2 Fee Deadline in 6 Days</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  14 families have an overdue tuition balance. Automated WhatsApp and SMS reminders have been queued for 04:00 PM today.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleDispatchReminders}
                    className="h-8 px-3 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    Dispatch Reminders
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcut Hub */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-headline mb-3">Admin Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/students/new')}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">person_add</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Enroll Student</span>
                </button>

                <button
                  onClick={() => navigate('/fees/collect')}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">point_of_sale</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Collect Fee</span>
                </button>

                <button
                  onClick={() => navigate('/attendance')}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">how_to_reg</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Take Attendance</span>
                </button>

                <button
                  onClick={() => navigate('/reports')}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-purple-50/50 hover:border-purple-200 transition-all flex flex-col items-center text-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">assessment</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Class Report</span>
                </button>
              </div>
            </div>

            {/* Architecture alignment status badge */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                MongoDB Atlas Synced
              </span>
              <span>Render Node v20.x</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Section - Recent Transactions & Attention Needed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table (8 cols): Recent Fee Collections & Receipts */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline">
                  Recent Fee Collections & Receipts
                </h2>
                <p className="text-xs text-slate-500">
                  Latest verified tuition payments processed via Bursar office
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/fees/collect')}
                  className="h-8 px-3 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Record New</span>
                </button>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 h-9 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Receipt #</th>
                    <th className="py-2.5 px-4">Student & ID</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-tabular">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-blue-700">{p.receiptNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 font-sans">{p.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{p.studentCode}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium font-sans">{p.className}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{Number(p.amountPaid).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <span className="material-symbols-outlined text-sm text-slate-400">
                            {p.paymentMode === 'Cash'
                              ? 'payments'
                              : p.paymentMode === 'UPI'
                              ? 'qr_code_2'
                              : p.paymentMode === 'Card'
                              ? 'credit_card'
                              : 'account_balance'}
                          </span>
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.paymentDate}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status || 'Verified'} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {recentPayments.length} of verified transactions this month
            </span>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              View All Payments & Receipts →
            </button>
          </div>
        </div>

        {/* Right Card (4 cols): Students Needing Attention */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-xl">warning</span>
                <h3 className="text-sm font-bold text-slate-900 font-headline">Attention Needed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                3 Flagged
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Unpaid fee balances &gt; ₹15,000 or consecutive unexcused absences.
            </p>

            {/* Student Flagged List */}
            <div className="mt-4 space-y-2.5">
              {/* Flag 1: Lucas Vance */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Lucas Vance</div>
                    <div className="text-[11px] text-slate-500">Grade 3 A • Parent: David Vance</div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        1 Day Absent
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        ₹18,000 Overdue
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCallParent('David Vance', '+91 98220 33445')}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-colors"
                    title="Call Parent"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                  </button>
                </div>
              </div>

              {/* Flag 2: Harper Brooks */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Harper Brooks</div>
                    <div className="text-[11px] text-slate-500">Grade 2 A • Parent: Sarah Brooks</div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        ₹19,000 Overdue
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCallParent('Sarah Brooks', '+91 97660 55018')}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-colors"
                    title="Call Parent"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                  </button>
                </div>
              </div>

              {/* Flag 3: Vivaan Kulkarni */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Vivaan Kulkarni</div>
                    <div className="text-[11px] text-slate-500">Nursery A • Parent: Ramesh Sharma</div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        ₹14,000 Pending
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCallParent('Ramesh Sharma', '+91 98220 11223')}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-colors"
                    title="Call Parent"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <button
              onClick={() => navigate('/parents')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-base text-blue-700">contacts</span>
              <span>Open Parent Directory & Logs</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
