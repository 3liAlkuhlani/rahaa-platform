import React from 'react';
import { RefreshCw, FileSpreadsheet, Search, RotateCcw } from 'lucide-react';

export const FinancialHeaderBar = ({
  searchTerm = '',
  onSearchChange,
  paymentFilter = 'all',
  onPaymentFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  onResetFilters,
  onRefresh,
  onExportExcel,
  isRefreshing = false,
}) => {
  return (
    <div className="bg-rahaa-card p-4 sm:p-5 rounded-2xl border border-rahaa-border shadow-rahaa-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="بحث برقم الرحلة أو اسم الراكب أو السائق..."
            className="w-full h-11 pl-4 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal text-rahaa-navy placeholder:text-rahaa-text-subtle focus:outline-none focus:border-rahaa-blue focus:bg-white transition-all"
          />
        </div>

        {/* Payment Method Filter */}
        <div className="lg:col-span-2">
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange && onPaymentFilterChange(e.target.value)}
            className="w-full h-11 px-3 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue cursor-pointer"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="wallet">محفظة التطبيق</option>
            <option value="cash">الدفع النقدي</option>
            <option value="card">بطاقة / تحويل</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
            className="w-full h-11 px-3 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue cursor-pointer"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="requested">قيد الطلب</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="h-11 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-rahaa-blue-soft text-rahaa-navy font-cairo font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            title="إعادة ضبط الفلاتر"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rahaa-text-muted" />
            <span>إعادة ضبط</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="h-11 px-3.5 rounded-xl border border-rahaa-border bg-white hover:bg-rahaa-emerald-bg text-rahaa-navy font-cairo font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-rahaa-emerald" />
            <span>تصدير</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="h-11 px-4 rounded-xl bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>
    </div>
  );
};
