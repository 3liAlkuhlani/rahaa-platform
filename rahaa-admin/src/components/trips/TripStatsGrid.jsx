import React from 'react';
import { CheckCircle2, Navigation, Car, ArrowUpLeft } from 'lucide-react';

export const TripStatsGrid = ({ stats }) => {
  const defaultStats = [
    {
      title: 'الرحلات المكتملة',
      value: '1,104',
      badgeText: 'معدل نجاح 98%',
      badgeColor: 'text-[#006C4A] bg-[#85F8C4]/30 border border-[#006C4A]/20',
      iconBg: 'bg-[#85F8C4]',
      iconColor: 'text-[#006C4A]',
      icon: CheckCircle2,
    },
    {
      title: 'رحلات قيد التنفيذ',
      value: '142',
      badgeText: 'متابعة لحظية مفعلة',
      badgeColor: 'text-[#872FD7] bg-[#F0DBFF]/60 border border-[#872FD7]/20',
      iconBg: 'bg-[#F0DBFF]',
      iconColor: 'text-[#872FD7]',
      icon: Navigation,
      isPulse: true,
    },
    {
      title: 'إجمالي رحلات اليوم',
      value: '1,284',
      badgeText: '+12% عن الأمس',
      badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      iconBg: 'bg-rahaa-primary/15',
      iconColor: 'text-rahaa-primary',
      icon: Car,
    },
  ];

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            dir="rtl"
            className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex items-center gap-4 text-right"
          >
            {/* Right: Icon Container */}
            <div
              className={`w-14 h-14 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center relative shrink-0`}
            >
              <IconComponent className={`w-7 h-7 ${stat.isPulse ? 'animate-bounce' : ''}`} />
              {stat.isPulse && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-600"></span>
                </span>
              )}
            </div>

            {/* Directly Next to Icon: Labels, Value & Explanation */}
            <div className="flex-1 min-w-0 text-right flex flex-col items-start gap-1">
              <span className="font-cairo font-semibold text-sm text-[#434654]">
                {stat.title}
              </span>
              <span className={`font-cairo font-bold text-3xl ${stat.iconColor}`}>
                {stat.value}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {stat.badgeText.includes('+') && (
                  <ArrowUpLeft className="w-3.5 h-3.5 text-[#006C4A]" />
                )}
                <span
                  className={`font-tajawal text-xs font-medium px-2 py-0.5 rounded-full ${stat.badgeColor}`}
                >
                  {stat.badgeText}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
