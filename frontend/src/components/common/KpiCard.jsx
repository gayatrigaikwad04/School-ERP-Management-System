import React from 'react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  borderTopColor = 'border-t-blue-600',
  iconBg = 'bg-blue-50 text-blue-600',
  footerLeft,
  footerRight,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between border-t-4 ${borderTopColor} ${
        onClick ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight font-display font-tabular">
            {value}
          </span>
          {subtitle && <span className="text-xs font-medium text-slate-500">{subtitle}</span>}
        </div>

        {(footerLeft || footerRight || trend) && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {trend ? (
              <span
                className={`flex items-center gap-0.5 font-semibold ${
                  trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {trendPositive ? 'trending_up' : 'trending_down'}
                </span>
                {trend}
              </span>
            ) : (
              <span className="text-slate-500 font-medium">{footerLeft}</span>
            )}
            {footerRight && <span className="text-slate-600 font-medium">{footerRight}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
