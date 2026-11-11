import React from 'react';
import { UserCheck, ShieldAlert, Users, ArrowUpLeft, AlertCircle } from 'lucide-react';

export const DriverStatsGrid = ({ stats }) => {
  const defaultStats = [
    {
      title: 'بانتظار التحقق',
      value: '42',
      badgeText: 'يتطلب إجراء فوري',
      badgeColor: 'text-[#D97706] font-bold',
      iconBg: 'bg-[#FFDAD6]/60',
      iconColor: 'text-rose-700',
      icon: ShieldAlert,
      hasAlert: true,
    },
    {
      title: 'السائقين النشطين',
      value: '856',
      badgeText: 'متصلون الآن',
      badgeColor: 'text-[#434654] font-medium',
      iconBg: 'bg-[#82F5C1]/40',
      iconColor: 'text-[#006C4A]',
      icon: UserCheck,
      hasDot: true,
    },
    {
      title: 'إجمالي السائقين',
      value: '1,284',
      badgeText: '+12% الشهر الماضي',
      badgeColor: 'text-emerald-700 font-bold',
      iconBg: 'bg-rahaa-primary/15',
      iconColor: 'text-rahaa-primary',
      icon: Users,
      hasArrow: true,
    },
  ];

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            dir="rtl"
            className="bg-white p-6 rounded-2xl border border-[#C3C5D7]/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex items-center gap-4 text-right"
          >
            {/* Right Side: Icon */}
            <div
              className={`w-14 h-14 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 relative`}
            >
              <IconComponent className="w-7 h-7" />
              {item.hasAlert && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
                </span>
              )}
            </div>

            {/* Directly Next to Icon: Titles, Numbers & Explanation */}
            <div className="flex-1 min-w-0 text-right flex flex-col items-start gap-0.5">
              <span className="font-cairo text-[#434654] text-base font-semibold">
                {item.title}
              </span>
              <span className="font-tajawal font-bold text-3xl lg:text-4xl text-[#151C27]">
                {item.value}
              </span>
              
              <div className="flex items-center gap-1.5 mt-1">
                {item.hasDot && (
                  <span className="w-2 h-2 rounded-full bg-[#006C4A] animate-pulse"></span>
                )}
                {item.hasArrow && (
                  <ArrowUpLeft className="w-3.5 h-3.5 text-[#006C4A]" />
                )}
                {item.hasAlert && (
                  <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                )}
                <span className={`font-tajawal text-xs ${item.badgeColor}`}>
                  {item.badgeText}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
