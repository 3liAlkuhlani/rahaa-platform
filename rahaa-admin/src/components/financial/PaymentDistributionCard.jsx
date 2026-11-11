import React from 'react';
import { Wallet, Banknote, CreditCard } from 'lucide-react';

export const PaymentDistributionCard = ({ distribution = [] }) => {
  const defaultDistribution = [
    {
      method: 'wallet',
      title: 'محفظة التطبيق (جيب)',
      amount: 0,
      trips_count: 0,
      percentage: 0,
    },
    {
      method: 'cash',
      title: 'الدفع النقدي (كاش)',
      amount: 0,
      trips_count: 0,
      percentage: 0,
    },
    {
      method: 'card',
      title: 'بطاقة / تحويل بنكي',
      amount: 0,
      trips_count: 0,
      percentage: 0,
    },
  ];

  const items = distribution.length > 0 ? distribution : defaultDistribution;

  const getMethodMeta = (method) => {
    switch (method) {
      case 'wallet':
        return {
          icon: Wallet,
          iconBg: 'bg-rahaa-blue-light',
          iconColor: 'text-rahaa-blue',
          barColor: 'bg-rahaa-blue',
        };
      case 'cash':
        return {
          icon: Banknote,
          iconBg: 'bg-rahaa-emerald-bg',
          iconColor: 'text-rahaa-emerald',
          barColor: 'bg-rahaa-emerald',
        };
      default:
        return {
          icon: CreditCard,
          iconBg: 'bg-rahaa-orange-light',
          iconColor: 'text-rahaa-orange',
          barColor: 'bg-rahaa-orange',
        };
    }
  };

  return (
    <div className="bg-rahaa-card p-6 rounded-2xl border border-rahaa-border shadow-rahaa-card flex flex-col justify-between h-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-rahaa-border">
        <div className="text-right">
          <h3 className="font-cairo font-bold text-base text-rahaa-navy">
            توزيع المدفوعات
          </h3>
          <p className="font-tajawal text-xs text-rahaa-text-muted mt-0.5">
            توزيع العمليات والقيم المالية حسب كل طريقة دفع
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-cairo font-bold bg-rahaa-orange-light text-rahaa-orange">
          طرق الدفع
        </span>
      </div>

      {/* Payment Distribution Grid View (Requirement #12 - matching Revenue Analysis Card Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch flex-1">
        {items.map((item, idx) => {
          const meta = getMethodMeta(item.method);
          const Icon = meta.icon;
          const pct = Number(item.percentage ?? 0);

          return (
            <div
              key={idx}
              dir="rtl"
              className="bg-rahaa-bg p-4 rounded-2xl border border-rahaa-border hover:border-rahaa-blue/40 hover:bg-white transition-all flex items-start gap-3.5 text-right"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 text-right space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cairo font-semibold text-xs text-rahaa-text-muted truncate">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-cairo font-bold bg-white border border-rahaa-border text-rahaa-navy shrink-0">
                    {pct}%
                  </span>
                </div>
                <div className="font-cairo font-bold text-lg text-rahaa-navy">
                  {Number(item.amount || 0).toLocaleString()} ر.ي
                </div>
                <div className="flex items-center justify-between text-[11px] font-tajawal text-rahaa-text-subtle">
                  <span>عدد العمليات: {item.trips_count ?? 0}</span>
                  <span>النسبة: {pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-rahaa-border/60 mt-1">
                  <div
                    className={`h-full ${meta.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(pct, 4))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
