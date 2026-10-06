import React from 'react';
import { PreservationStatus } from '../../types';

interface PreservationBadgeProps {
  status: PreservationStatus | string;
}

export const PreservationBadge: React.FC<PreservationBadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'LIVING':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30';
      case 'THRIVING':
        return 'bg-teal-900/40 text-teal-300 border-teal-500/30';
      case 'VULNERABLE':
        return 'bg-amber-900/40 text-amber-300 border-amber-500/30';
      case 'ENDANGERED':
      case 'CRITICALLY_ENDANGERED':
        return 'bg-rose-900/40 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
};
