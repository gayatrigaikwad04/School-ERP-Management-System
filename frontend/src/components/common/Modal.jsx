import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 w-full ${maxWidth} my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-headline">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {isDestructive ? 'warning' : 'help'}
          </span>
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-xs ${
            isDestructive
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50 flex items-center gap-1.5`}
        >
          {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
          <span>{confirmText}</span>
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
