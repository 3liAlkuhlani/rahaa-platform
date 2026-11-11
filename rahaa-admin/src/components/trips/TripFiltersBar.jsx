import React, { useState } from 'react';
import { Filter, Calendar, Search, RotateCcw, ChevronDown } from 'lucide-react';

export const TripFiltersBar = ({ onFilterChange, onReset }) => {
  const [vehicleType, setVehicleType] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApply = () => {
    if (onFilterChange) {
      onFilterChange({ vehicleType, status, selectedDate, searchTerm });
    }
  };

  const handleReset = () => {
    setVehicleType('all');
    setStatus('all');
    setSelectedDate('');
    setSearchTerm('');
    if (onReset) onReset();
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.04)] space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rahaa-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن رقم الرحلة، اسم السائق أو الراكب..."
            className="w-full pl-4 pr-10 py-2.5 bg-[#F0F3FF]/50 border border-[#C3C5D7] rounded-xl text-sm font-tajawal text-rahaa-navy placeholder:text-rahaa-text-muted focus:outline-none focus:border-rahaa-blue transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Vehicle Type Dropdown */}
          <div className="flex flex-col min-w-[140px]">
            <label className="font-tajawal text-xs text-[#151C27] mb-1 text-right">
              نوع المركبة
            </label>
            <div className="relative">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full appearance-none bg-white border border-[#C3C5D7] rounded-lg px-3 py-2 text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-rahaa-blue pr-3 pl-8 text-right cursor-pointer"
              >
                <option value="all">الكل</option>
                <option value="economy">راحة توفير</option>
                <option value="plus">راحة بلس</option>
                <option value="vip">عائلية فاخرة</option>
                <option value="taxi">تاكسي</option>
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Trip Status Dropdown */}
          <div className="flex flex-col min-w-[140px]">
            <label className="font-tajawal text-xs text-[#151C27] mb-1 text-right">
              حالة الرحلة
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none bg-white border border-[#C3C5D7] rounded-lg px-3 py-2 text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-rahaa-blue pr-3 pl-8 text-right cursor-pointer"
              >
                <option value="all">الكل</option>
                <option value="مكتملة">مكتملة</option>
                <option value="قيد التنفيذ">قيد التنفيذ</option>
                <option value="ملغاة">ملغاة</option>
              </select>
              <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="flex flex-col min-w-[150px]">
            <label className="font-tajawal text-xs text-[#151C27] mb-1 text-right">
              التاريخ
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-[#C3C5D7] rounded-lg px-3 py-2 text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-rahaa-blue pr-3 pl-8 text-right cursor-pointer"
              />
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Apply & Reset Buttons */}
          <div className="flex items-end gap-2 pt-5">
            <button
              onClick={handleApply}
              className="bg-[#003FB1] hover:bg-[#003390] text-white px-5 py-2.5 rounded-lg font-cairo font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Filter className="w-4 h-4" />
              تطبيق الفلاتر
            </button>

            <button
              onClick={handleReset}
              title="إعادة ضبط"
              className="bg-[#F0F3FF] hover:bg-gray-200 text-[#434654] p-2.5 rounded-lg transition-colors border border-[#C3C5D7]/50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
