import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingState, EmptyState } from '../../components/common/UIStates';

export const PaymentHistory = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPayments();
      setPayments(res?.payments || []);
    } catch (err) {
      showToast('Failed to load payment transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.receiptNumber?.toLowerCase().includes(q) ||
      p.studentName?.toLowerCase().includes(q) ||
      p.studentCode?.toLowerCase().includes(q) ||
      p.refNumber?.toLowerCase().includes(q);

    const matchesMode = selectedMode === 'All' || p.paymentMode === selectedMode;

    return matchesSearch && matchesMode;
  });

  const totalCollected = filtered.reduce((acc, p) => acc + Number(p.amountPaid || 0), 0);

  const handleOpenReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptOpen(true);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('No payments to export', 'warning');
      return;
    }
    const headers = ['Receipt #', 'Student Name', 'Student ID', 'Class', 'Amount Paid', 'Mode', 'Ref Number', 'Date', 'Remarks'];
    const rows = filtered.map((p) => [
      p.receiptNumber,
      p.studentName,
      p.studentCode,
      p.className,
      p.amountPaid,
      p.paymentMode,
      p.refNumber,
      p.paymentDate,
      p.remarks || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Fee_Receipts_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Payment ledger exported as CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Tuition Fee Ledger & Receipts</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-tabular">
              {filtered.length} Verified Entries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official immutable audit trail of all tuition installments collected via Bursar desk
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
            onClick={() => navigate('/fees/collect')}
            className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by receipt #, student name, roll ID or txn ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="w-40 shrink-0">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        {/* Sum amount banner */}
        <div className="flex items-center gap-2 text-xs font-tabular">
          <span className="text-slate-500">Filtered Total:</span>
          <span className="text-base font-bold text-slate-900 font-display">
            ₹{totalCollected.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <LoadingState message="Loading payment transactions..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="payments"
          title="No payment records found"
          description="Try adjusting your search criteria or collect a new payment."
          actionText="Collect Payment"
          onAction={() => navigate('/fees/collect')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider h-10">
                  <th className="py-2.5 px-4">Receipt #</th>
                  <th className="py-2.5 px-4">Student & Class</th>
                  <th className="py-2.5 px-4 text-right">Amount Received</th>
                  <th className="py-2.5 px-4">Instrument</th>
                  <th className="py-2.5 px-4">Txn / Bank Ref #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{p.receiptNumber}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-sans">{p.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        {p.className} • {p.studentCode}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      ₹{Number(p.amountPaid).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
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

                    <td className="py-3 px-4 font-mono text-slate-600">{p.refNumber || '—'}</td>

                    <td className="py-3 px-4 text-slate-500">{p.paymentDate}</td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status || 'Verified'} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenReceipt(p)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Print / View Receipt"
                      >
                        <span className="material-symbols-outlined text-base">print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Voucher Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Official Bursar Payment Receipt"
        subtitle="Oakridge Academy • Finance & Fee Division"
        maxWidth="max-w-lg"
      >
        {selectedReceipt && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-blue-700 uppercase block tracking-wider">
                  Verified Receipt Number
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {selectedReceipt.receiptNumber}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified
              </span>
            </div>

            <div className="space-y-2 border-y border-slate-200 py-3 font-tabular">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Student ID / Roll:</span>
                <span className="font-mono text-slate-700">{selectedReceipt.studentCode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Class Section:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.className}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-800">{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment Instrument:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentMode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reference / Txn:</span>
                <span className="font-mono text-slate-700">{selectedReceipt.refNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Remarks:</span>
                <span className="text-slate-700">{selectedReceipt.remarks || 'Tuition installment'}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-200 text-base">
                <span className="font-bold text-slate-900">Total Received:</span>
                <span className="font-bold text-emerald-700">
                  ₹{Number(selectedReceipt.amountPaid).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
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

export default PaymentHistory;
