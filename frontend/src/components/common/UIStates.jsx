import React from 'react';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-base font-bold text-slate-800 font-headline">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export const LoadingState = ({ message = 'Loading records...' }) => {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
      <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <span className="text-sm font-medium text-slate-600">{message}</span>
    </div>
  );
};

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
      <div>
        Showing <strong className="font-semibold text-slate-900">{startItem} - {endItem}</strong> of{' '}
        <strong className="font-semibold text-slate-900">{totalItems}</strong> records
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
          title="Previous page"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(0, 5)
          .map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 rounded font-semibold text-xs transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {page}
            </button>
          ))}

        {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
          title="Next page"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, badge, actionButton, secondaryButton }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-slate-900 font-headline tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {secondaryButton}
        {actionButton}
      </div>
    </div>
  );
};
