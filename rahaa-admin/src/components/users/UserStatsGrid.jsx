import React from 'react';
import { Users, UserCheck, Clock, ShieldAlert } from 'lucide-react';

export const UserStatsGrid = ({ stats }) => {
  const cards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats?.total || '12,480',
      icon: Users,
      bgTint: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'السائقين النشطين',
      value: stats?.activeDrivers || '842',
      icon: UserCheck,
      bgTint: 'bg-emerald-100/70',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'قيد التحقق',
      value: stats?.pending || '45',
      icon: Clock,
      bgTint: 'bg-amber-100/80',
      iconColor: 'text-rahaa-amber',
    },
    {
      title: 'حسابات محظورة',
      value: stats?.banned || '12',
      icon: ShieldAlert,
      bgTint: 'bg-rose-100/70',
      iconColor: 'text-rahaa-rose',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            dir="rtl"
            className="bg-white p-5 rounded-2xl border border-rahaa-border/80 shadow-rahaa-card hover:shadow-md transition-all flex items-center gap-4 text-right"
          >
            {/* Right: Icon */}
            <div className={`w-12 h-12 rounded-2xl ${card.bgTint} ${card.iconColor} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Directly Next to Icon: Title & Value */}
            <div className="flex-1 min-w-0 text-right">
              <span className="font-tajawal text-xs font-medium text-rahaa-text-muted block">
                {card.title}
              </span>
              <h3 className="font-cairo font-bold text-2xl text-rahaa-navy mt-0.5">
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
