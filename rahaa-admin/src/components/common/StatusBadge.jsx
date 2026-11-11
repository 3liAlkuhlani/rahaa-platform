import React from 'react';

/**
 * StatusBadge component for rendering standardized trip & entity statuses
 * @param {Object} props
 * @param {string} props.status - Arabic status string ('مكتملة' | 'جارية' | 'قيد الانتظار' | 'ملغاة')
 */
export const StatusBadge = ({ status }) => {
  const getStatusStyle = (statusName) => {
    switch (statusName) {
      case 'مكتملة':
        return 'bg-emerald-100/70 text-rahaa-emerald border-emerald-300/40';
      case 'جارية':
        return 'bg-purple-100/70 text-purple-700 border-purple-300/40';
      case 'قيد الانتظار':
        return 'bg-amber-100/80 text-amber-800 border-amber-300/40';
      case 'ملغاة':
        return 'bg-rose-100/70 text-rahaa-rose border-rose-300/40';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-tajawal font-medium border ${getStatusStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current ml-1.5 animate-pulse"></span>
      {status}
    </span>
  );
};
