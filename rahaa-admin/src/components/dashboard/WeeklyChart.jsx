import React, { useState } from 'react';
import { Calendar, ChevronDown, TrendingUp } from 'lucide-react';

export const WeeklyChart = () => {
  const [activeRange, setActiveRange] = useState('7_days');

  // Chart data from Figma design specs
  const chartData = [
    { day: 'اليوم', count: 850, valueStr: '850', heightPercent: 40, isCurrent: true },
    { day: 'الخميس', count: 1720, valueStr: '1,720', heightPercent: 81, isCurrent: false },
    { day: 'الأربعاء', count: 2100, valueStr: '2,100', heightPercent: 100, isCurrent: false, isPeak: true },
    { day: 'الثلاثاء', count: 1400, valueStr: '1,400', heightPercent: 66, isCurrent: false },
    { day: 'الاثنين', count: 920, valueStr: '920', heightPercent: 44, isCurrent: false },
    { day: 'الأحد', count: 1850, valueStr: '1,850', heightPercent: 88, isCurrent: false },
    { day: 'السبت', count: 1240, valueStr: '1,240', heightPercent: 59, isCurrent: false },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-rahaa-border shadow-rahaa-card flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rahaa-border/50">
        <div>
          <h3 className="font-cairo font-semibold text-lg text-rahaa-navy flex items-center gap-2">
            إحصائيات الرحلات الأسبوعية
            <span className="inline-flex items-center gap-1 text-xs font-tajawal font-medium text-rahaa-emerald bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              <TrendingUp className="w-3 h-3" />
              +14% نمو أسبوعي
            </span>
          </h3>
          <p className="font-tajawal text-xs text-rahaa-text-muted mt-1">
            مقارنة أداء الرحلات خلال الـ 7 أيام الماضية في قطاعات أمانة العاصمة
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-rahaa-blue-light border border-rahaa-border rounded-lg text-xs font-cairo font-medium text-rahaa-navy hover:bg-rahaa-blue-soft transition-colors">
              <Calendar className="w-4 h-4 text-rahaa-blue" />
              <span>آخر 7 أيام</span>
              <ChevronDown className="w-3.5 h-3.5 text-rahaa-text-subtle" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Bar Graph */}
      <div className="pt-8 pb-4">
        {/* Y-Axis Grid Guidelines Container */}
        <div className="relative h-64 w-full flex items-end justify-between px-2 sm:px-6">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-rahaa-border/40">
            <div className="border-b border-dashed border-rahaa-border/30 w-full text-xs text-rahaa-text-subtle flex justify-start pl-1">2,500</div>
            <div className="border-b border-dashed border-rahaa-border/30 w-full text-xs text-rahaa-text-subtle flex justify-start pl-1">1,800</div>
            <div className="border-b border-dashed border-rahaa-border/30 w-full text-xs text-rahaa-text-subtle flex justify-start pl-1">1,200</div>
            <div className="border-b border-dashed border-rahaa-border/30 w-full text-xs text-rahaa-text-subtle flex justify-start pl-1">600</div>
            <div className="w-full text-xs text-rahaa-text-subtle flex justify-start pl-1">0</div>
          </div>

          {/* Bar Columns */}
          {chartData.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group flex-1 max-w-[54px] mx-1">
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-10 bg-rahaa-navy text-white text-xs font-tajawal px-2.5 py-1 rounded shadow-md pointer-events-none whitespace-nowrap">
                {item.valueStr} رحلة
              </div>

              {/* Bar Container */}
              <div className="w-full bg-rahaa-bg rounded-t-lg h-48 flex items-end p-1">
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 ease-out group-hover:brightness-110 ${
                    item.isCurrent
                      ? 'bg-gradient-to-t from-rahaa-emerald to-emerald-400 shadow-sm'
                      : item.isPeak
                      ? 'bg-gradient-to-t from-rahaa-blue to-blue-500 shadow-sm'
                      : 'bg-rahaa-blue/70 hover:bg-rahaa-blue'
                  }`}
                  style={{ height: `${item.heightPercent}%` }}
                />
              </div>

              {/* Day Label */}
              <span 
                className={`font-tajawal text-xs ${
                  item.isCurrent 
                    ? 'font-bold text-rahaa-emerald' 
                    : 'font-normal text-rahaa-text-subtle'
                }`}
              >
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
