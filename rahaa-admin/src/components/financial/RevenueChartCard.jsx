import React from 'react';
import { Banknote, TrendingUp, Percent, Award, CheckCircle2, Clock } from 'lucide-react';

export const RevenueChartCard = ({ stats = {}, trips = [] }) => {
  const totalRevenue = Number(stats.total_revenue ?? 0);
  const pendingRevenue = Number(stats.pending_revenue ?? 0);
  const platformCommission = Number(stats.platform_commission ?? totalRevenue * 0.1);
  const driverNetEarnings = Number(stats.driver_net_earnings ?? totalRevenue * 0.9);
  const avgTripFare = Number(stats.avg_trip_fare ?? 0);
  const completedCount = Number(stats.completed_trips ?? trips.filter((t) => t.status === 'completed').length);

  const revenueAnalysisCards = [
    {
      title: 'إجمالي الإيرادات المكتملة',
      value: `${totalRevenue.toLocaleString()} ر.ي`,
      subtitle: `من ${completedCount} رحلة مكتملة`,
      badge: '100%',
      icon: Banknote,
      iconBg: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'صافي مستحقات السائقين',
      value: `${driverNetEarnings.toLocaleString()} ر.ي`,
      subtitle: 'حصة الكباتن المعتمدة (90%)',
      badge: '90%',
      icon: Award,
      iconBg: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'صافي عمولة المنصة',
      value: `${platformCommission.toLocaleString()} ر.ي`,
      subtitle: 'عائد التشغيل لمنصة راحة (10%)',
      badge: '10%',
      icon: Percent,
      iconBg: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
    {
      title: 'متوسط العائد لكل رحلة',
      value: `${avgTripFare.toLocaleString()} ر.ي`,
      subtitle: 'معدل قيمة المشوار الواحد',
      badge: 'معدل',
      icon: TrendingUp,
      iconBg: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'إيرادات الرحلات قيد التنفيذ',
      value: `${pendingRevenue.toLocaleString()} ر.ي`,
      subtitle: 'رحلات نشطة بانتظار الإكمال',
      badge: 'نشط',
      icon: Clock,
      iconBg: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
    {
      title: 'إجمالي القيمة المالية الكلية',
      value: `${(totalRevenue + pendingRevenue).toLocaleString()} ر.ي`,
      subtitle: 'مجموع المكتمل وقيد التنفيذ',
      badge: 'إجمالي',
      icon: CheckCircle2,
      iconBg: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
  ];

  return (
    <div className="bg-rahaa-card p-6 rounded-2xl border border-rahaa-border shadow-rahaa-card flex flex-col justify-between h-full space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-rahaa-border">
        <div className="text-right">
          <h3 className="font-cairo font-bold text-base text-rahaa-navy">
            تحليل الإيرادات
          </h3>
          <p className="font-tajawal text-xs text-rahaa-text-muted mt-0.5">
            تفصيل القيم المالية والعوائد الفعلية من قاعدة البيانات (ر.ي)
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-cairo font-bold bg-rahaa-blue-light text-rahaa-blue">
          بيانات حية
        </span>
      </div>

      {/* Revenue Analysis Grid View (Requirement #12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {revenueAnalysisCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              dir="rtl"
              className="bg-rahaa-bg p-4 rounded-2xl border border-rahaa-border hover:border-rahaa-blue/40 hover:bg-white transition-all flex items-start gap-3.5 text-right"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 text-right space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cairo font-semibold text-xs text-rahaa-text-muted truncate">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-cairo font-bold bg-white border border-rahaa-border text-rahaa-navy shrink-0">
                    {item.badge}
                  </span>
                </div>
                <div className="font-cairo font-bold text-lg text-rahaa-navy">
                  {item.value}
                </div>
                <p className="font-tajawal text-[11px] text-rahaa-text-subtle">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
