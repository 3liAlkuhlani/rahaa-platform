import React from 'react';
import { Search, Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';

export const UserFiltersBar = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-rahaa-border/80 shadow-rahaa-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Search Input Box */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="البحث بالاسم، الهاتف، أو البريد الإلكتروني..."
          className="w-full pl-4 pr-11 py-2.5 bg-rahaa-bg border border-rahaa-border/80 rounded-xl text-sm font-tajawal placeholder:text-rahaa-text-subtle focus:outline-none focus:border-rahaa-blue focus:ring-2 focus:ring-rahaa-blue/20 transition-all"
        />
      </div>

      {/* Filter Options Group */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Role Select */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="appearance-none bg-white border border-rahaa-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-cairo font-semibold text-rahaa-navy hover:bg-rahaa-bg focus:outline-none focus:border-rahaa-blue cursor-pointer transition-colors"
          >
            <option value="all">كل المستخدمين</option>
            <option value="driver">السائقين (الكباتن)</option>
            <option value="passenger">الركاب</option>
          </select>
          <ChevronDown className="w-4 h-4 text-rahaa-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Select */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-white border border-rahaa-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-cairo font-semibold text-rahaa-navy hover:bg-rahaa-bg focus:outline-none focus:border-rahaa-blue cursor-pointer transition-colors"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">قيد التحقق</option>
            <option value="banned">محظور</option>
          </select>
          <ChevronDown className="w-4 h-4 text-rahaa-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Advanced Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy hover:bg-rahaa-blue-soft transition-colors">
          <SlidersHorizontal className="w-4 h-4 text-rahaa-blue" />
          <span>تصفية متقدمة</span>
        </button>
      </div>
    </div>
  );
};
