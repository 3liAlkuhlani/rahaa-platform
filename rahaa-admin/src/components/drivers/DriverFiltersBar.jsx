import React, { useState } from 'react';
import { Search, ChevronDown, RotateCcw } from 'lucide-react';

export const DriverFiltersBar = ({ onFilterChange, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleType, setVehicleType] = useState('all');
  const [status, setStatus] = useState('all');

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (onFilterChange) onFilterChange({ searchTerm: val, vehicleType, status });
  };

  const handleVehicleTypeChange = (val) => {
    setVehicleType(val);
    if (onFilterChange) onFilterChange({ searchTerm, vehicleType: val, status });
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    if (onFilterChange) onFilterChange({ searchTerm, vehicleType, status: val });
  };

  const handleReset = () => {
    setSearchTerm('');
    setVehicleType('all');
    setStatus('all');
    if (onReset) onReset();
  };

  return (
    <div className="bg-rahaa-card p-4 rounded-2xl border border-rahaa-border shadow-rahaa-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rahaa-text-subtle" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="بحث عن سائق، رقم الهاتف، أو رقم اللوحة..."
          className="w-full pl-4 pr-10 py-2.5 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm font-tajawal text-rahaa-navy placeholder:text-rahaa-text-subtle focus:outline-none focus:border-rahaa-blue transition-colors"
        />
      </div>

      {/* Dropdown Filters & Reset Button */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Vehicle Type Select */}
        <div className="relative min-w-[140px]">
          <select
            value={vehicleType}
            onChange={(e) => handleVehicleTypeChange(e.target.value)}
            className="w-full appearance-none bg-rahaa-bg border border-rahaa-border rounded-xl px-3 py-2 text-sm font-tajawal font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue pr-3 pl-8 text-right cursor-pointer"
          >
            <option value="all">نوع المركبة (الكل)</option>
            <option value="إقتصادية">إقتصادية</option>
            <option value="راحة بلس">راحة بلس</option>
            <option value="عائلية">عائلية</option>
            <option value="تكسي">تكسي</option>
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rahaa-text-subtle pointer-events-none" />
        </div>

        {/* Driver Status Select */}
        <div className="relative min-w-[140px]">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full appearance-none bg-rahaa-bg border border-rahaa-border rounded-xl px-3 py-2 text-sm font-tajawal font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue pr-3 pl-8 text-right cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="موثق">موثق</option>
            <option value="بانتظار المراجعة">بانتظار المراجعة</option>
            <option value="محظور">محظور</option>
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rahaa-text-subtle pointer-events-none" />
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="text-rahaa-blue hover:text-rahaa-blue-hover font-tajawal font-bold text-sm px-3 py-2 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>تفريغ الفلاتر</span>
        </button>

      </div>

    </div>
  );
};
