import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/UIStates';

export const FeeCollection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const queryStudentId = searchParams.get('studentId');

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Form State
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [refNumber, setRefNumber] = useState('');
  const [remarks, setRemarks] = useState('Term 2 fee installment');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getStudents();
      const list = res?.students || [];
      setStudents(list);

      if (queryStudentId) {
        const found = list.find((s) => s.id === queryStudentId || s.studentId === queryStudentId);
        if (found) {
          selectStudent(found);
        }
      } else if (list.length > 0) {
        // Select first student with pending fee by default
        const firstPending = list.find((s) => Number(s.totalFee) > Number(s.paidAmount)) || list[0];
        selectStudent(firstPending);
      }
    } catch (err) {
      showToast('Failed to load students directory for fee collection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    const pending = Math.max(0, Number(student.totalFee) - Number(student.paidAmount));
    // Default suggest paying remaining or round installment
    setAmountPaid(pending > 0 ? String(pending) : '');
    setRefNumber(
      paymentMode === 'UPI'
        ? `UPI-${Math.floor(100000 + Math.random() * 900000)}`
        : paymentMode === 'Cash'
        ? `CSH-2026-${Math.floor(10 + Math.random() * 90)}`
        : `NEFT-HDFC-${Math.floor(1000 + Math.random() * 9000)}`
    );
    setErrorMessage('');
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.className?.toLowerCase().includes(q) ||
      s.parentName?.toLowerCase().includes(q)
    );
  });

  const pendingAmount = selectedStudent
    ? Math.max(0, Number(selectedStudent.totalFee) - Number(selectedStudent.paidAmount))
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedStudent) {
      setErrorMessage('Please select an enrolled student.');
      return;
    }

    const payVal = Number(amountPaid);
    if (!payVal || payVal <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than zero.');
      return;
    }

    // CRITICAL PRD VALIDATION: Overpayment Prevention
    if (payVal > pendingAmount) {
      setErrorMessage(
        `Payment amount (₹${payVal.toLocaleString('en-IN')}) exceeds total outstanding pending fee (₹${pendingAmount.toLocaleString('en-IN')}). Overpayment is not permitted.`
      );
      showToast('Overpayment rejected by accounting engine.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const result = await paymentService.createPayment({
        studentId: selectedStudent.id,
        amountPaid: payVal,
        paymentMode,
        paymentDate,
        refNumber,
        remarks,
      });

      // Show receipt modal
      setGeneratedReceipt(result.payment);
      setReceiptModalOpen(true);
      showToast(
        `Tuition fee payment of ₹${payVal.toLocaleString('en-IN')} verified for ${selectedStudent.firstName}!`,
        'success'
      );

      // Update student local state
      setSelectedStudent(result.student);
      // Reload students in background
      studentService.getStudents().then((r) => setStudents(r?.students || []));
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed.');
      showToast(err.message || 'Transaction failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) return <LoadingState message="Connecting to Bursar cashier terminal..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Bursar Fee Collection Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Cash Desk Operational
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Process tuition installments, generate verified payment receipts, and balance student accounts
          </p>
        </div>

        <button
          onClick={() => navigate('/payments')}
          className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">receipt_long</span>
          <span>View All Receipts</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col h-[640px]">
          <h2 className="text-sm font-bold text-slate-900 font-headline mb-2">Select Student</h2>
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Filter by student name, ID or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredStudents.map((s) => {
              const pending = Math.max(0, Number(s.totalFee) - Number(s.paidAmount));
              const isSelected = selectedStudent?.id === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={s.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.studentId}`}
                      alt={s.firstName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {s.firstName} {s.lastName}
                        </span>
                        <span
                          className={`text-[11px] font-bold font-tabular ${
                            pending > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {pending > 0 ? `₹${pending.toLocaleString('en-IN')}` : 'Settled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{s.className}</span>
                        <span className="font-mono">{s.studentId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Collection Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          {selectedStudent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Student Summary Header Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedStudent.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedStudent.studentId}`
                    }
                    alt={selectedStudent.firstName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-headline">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-mono text-blue-700">{selectedStudent.studentId}</span>
                      <span>•</span>
                      <span>{selectedStudent.className}</span>
                      <span>•</span>
                      <span>Parent: {selectedStudent.parentName}</span>
                    </div>
                  </div>
                </div>

                {/* Ledger Quick Pill */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Outstanding Balance
                    </span>
                    <span
                      className={`text-xl font-bold font-display font-tabular ${
                        pendingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      ₹{pendingAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-rose-600">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Payment Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount to Collect (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      max={pendingAmount || 100000}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0"
                      className="w-full h-10 pl-8 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-bold font-tabular"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Maximum payable: ₹{pendingAmount.toLocaleString('en-IN')} (Overpayment prevented)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Instrument / Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash (Bursar Desk Counter)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="Card">Debit / Credit Card (POS Terminal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction / Bank Reference #
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="e.g. UPI-992140 / CSH-01"
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks & Ledger Note</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Term 2 installment received from mother"
                    className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  A verifiable bursar receipt will be created immediately.
                </span>
                <button
                  type="submit"
                  disabled={submitting || pendingAmount === 0}
                  className="h-10 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">
                        progress_activity
                      </span>
                      <span>Verifying & Recording...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Collect & Generate Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a student from the left panel.</div>
          )}
        </div>
      </div>

      {/* Verified Receipt Voucher Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Bursar Payment Receipt"
        subtitle="Oakridge Academy • Finance & Fee Division"
        maxWidth="max-w-lg"
      >
        {generatedReceipt && (
          <div className="space-y-4 text-xs font-sans print:p-0">
            {/* Printable Voucher Header */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-blue-700 uppercase block tracking-wider">
                  Verified Receipt Number
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {generatedReceipt.receiptNumber}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified
              </span>
            </div>

            {/* Receipt Summary Details */}
            <div className="space-y-2 border-y border-slate-200 py-3 font-tabular">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{generatedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student ID / Roll:</span>
                <span className="font-mono text-slate-700">{generatedReceipt.studentCode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Class Section:</span>
                <span className="font-semibold text-slate-800">{generatedReceipt.className}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-800">{generatedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Instrument:</span>
                <span className="font-semibold text-slate-800">{generatedReceipt.paymentMode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reference / Txn:</span>
                <span className="font-mono text-slate-700">{generatedReceipt.refNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 text-base">
                <span className="font-bold text-slate-900">Total Received:</span>
                <span className="font-bold text-emerald-700">
                  ₹{Number(generatedReceipt.amountPaid).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic">
              This is a computer-generated school fee receipt and does not require a physical signature.
            </p>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeeCollection;
