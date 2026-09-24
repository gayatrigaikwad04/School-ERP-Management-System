import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/UIStates';

export const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'fees', 'attendance'

  // Deactivate modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const studentData = await studentService.getStudentById(id);
      setStudent(studentData);

      const [paymentsRes, attendanceRes] = await Promise.all([
        paymentService.getPayments({ studentId: studentData.id }),
        attendanceService.getAttendance({ studentId: studentData.id }),
      ]);

      setPayments(paymentsRes?.payments || []);
      setAttendance(attendanceRes || []);
    } catch (err) {
      showToast(err.message || 'Failed to load student details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      const updated = await studentService.deactivateStudent(student.id);
      setStudent(updated);
      showToast(`Student marked as ${updated.status}.`, 'success');
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading student profile..." />;
  if (!student) return <div className="p-8 text-center text-slate-500">Student not found.</div>;

  const totalFee = Number(student.totalFee || 30000);
  const paid = Number(student.paidAmount || 0);
  const pending = Math.max(0, totalFee - paid);

  const presentDays = attendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = attendance.length > 0 ? ((presentDays / attendance.length) * 100).toFixed(0) : '95';

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/students" className="hover:text-blue-700">
          Students
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-semibold">
          {student.firstName} {student.lastName}
        </span>
      </nav>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={
                student.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${student.studentId}`
              }
              alt={student.firstName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-600/30 bg-slate-100 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-headline">
                  {student.firstName} {student.lastName}
                </h1>
                <StatusBadge status={student.status} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {student.studentId}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{student.className}</span>
                <span>•</span>
                <span>Roll No: {student.rollNo || '01'}</span>
                <span>•</span>
                <span>Admitted: {student.admissionDate || '2026-06-10'}</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {pending > 0 && (
              <button
                onClick={() => navigate(`/fees/collect?studentId=${student.id}`)}
                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-base">payments</span>
                <span>Collect Fee</span>
              </button>
            )}

            <button
              onClick={() => navigate(`/students/${student.id}/edit`)}
              className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-base text-blue-700">edit</span>
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                student.status === 'Active'
                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {student.status === 'Active' ? 'person_off' : 'person'}
              </span>
              <span>{student.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">Annual Tuition Fee</span>
          <div className="text-2xl font-bold text-slate-900 font-display font-tabular mt-1">
            ₹{totalFee.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">AY 2026–27 Schedule</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">Total Paid</span>
          <div className="text-2xl font-bold text-emerald-600 font-display font-tabular mt-1">
            ₹{paid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">{payments.length} verified receipts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">Balance Pending</span>
          <div
            className={`text-2xl font-bold font-display font-tabular mt-1 ${
              pending > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            ₹{pending.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">
            {pending === 0 ? 'Fully settled' : 'Installment outstanding'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase">Attendance Rate</span>
          <div className="text-2xl font-bold text-blue-700 font-display font-tabular mt-1">
            {attendanceRate}%
          </div>
          <span className="text-[11px] text-slate-500">Roll-call records</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile & Guardian Details
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'fees'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Fee Ledger & Receipts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-tabular">
            {payments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Attendance Record</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-tabular">
            {attendance.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Profile & Guardian Details */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-headline border-b border-slate-100 pb-2">
              Personal Demographics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">{student.dateOfBirth || '2021-05-12'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-800">{student.gender || 'Male'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Blood Group</span>
                <span className="font-semibold text-slate-800">{student.bloodGroup || 'O+'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Admission Date</span>
                <span className="font-semibold text-slate-800">{student.admissionDate || '2026-06-10'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Residential Address</span>
                <span className="font-semibold text-slate-800">{student.address || 'Pune, Maharashtra'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-headline border-b border-slate-100 pb-2">
              Guardian Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <span className="text-slate-400 block">Parent / Guardian Name</span>
                <span className="font-semibold text-slate-800">{student.parentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone (WhatsApp)</span>
                <span className="font-semibold text-slate-800 font-tabular">{student.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Relationship</span>
                <span className="font-semibold text-slate-800">Father / Mother</span>
              </div>
              <div className="col-span-2 pt-2">
                <button
                  onClick={() => showToast(`Calling ${student.parentName} at ${student.phone}`, 'info')}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base text-blue-700">call</span>
                  <span>Direct Dial Parent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fee Ledger & Receipts */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-headline">Bursar Payment Ledger</h3>
            {pending > 0 && (
              <button
                onClick={() => navigate(`/fees/collect?studentId=${student.id}`)}
                className="h-8 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                <span>Collect Installment</span>
              </button>
            )}
          </div>
          {payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No payments recorded yet for this student.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Receipt #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Mode</th>
                  <th className="py-2.5 px-4">Reference #</th>
                  <th className="py-2.5 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-blue-700">{p.receiptNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{p.paymentDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{Number(p.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">{p.paymentMode}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{p.refNumber || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(`Receipt ${p.receiptNumber} ready for printing.`, 'info')}
                        className="p-1 text-slate-500 hover:text-blue-700"
                        title="Print Voucher"
                      >
                        <span className="material-symbols-outlined text-base">print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 font-headline">Attendance Roll-Call History</h3>
          </div>
          {attendance.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No daily roll-call records found yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-800 font-tabular">{a.date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={a.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{a.remarks || 'Standard roll-call'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleToggleStatus}
        title={student.status === 'Active' ? 'Deactivate Student Record?' : 'Activate Student Record?'}
        message={`Are you sure you want to change ${student.firstName} ${student.lastName}'s status to ${
          student.status === 'Active' ? 'Inactive' : 'Active'
        }?`}
        confirmText={student.status === 'Active' ? 'Deactivate' : 'Activate'}
        isDestructive={student.status === 'Active'}
        loading={actionLoading}
      />
    </div>
  );
};

export default StudentDetails;
