import React from 'react';

export const StatusBadge = ({ status, variant, count, size = 'md' }) => {
  const normalized = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['active', 'paid', 'verified', 'present', 'complete', 'fully paid'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['overdue', 'absent', 'inactive', 'unexcused', 'withdrawn', 'unexcused absence'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['partial', 'pending', 'due soon', 'excused', 'medical note filed'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['late', 'excused / late'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${styles} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
      {count !== undefined && <span className="font-semibold ml-0.5">({count})</span>}
    </span>
  );
};

export default StatusBadge;
