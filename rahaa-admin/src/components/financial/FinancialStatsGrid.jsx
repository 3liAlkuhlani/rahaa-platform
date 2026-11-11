import React from 'react';
import { DollarSign, Wallet, Banknote, Percent } from 'lucide-react';
import { StatCard } from '../common/StatCard';

export const FinancialStatsGrid = ({ stats = {}, paymentDistribution = [] }) => {
  const walletObj = paymentDistribution.find((d) => d.method === 'wallet');
  const cashObj = paymentDistribution.find((d) => d.method === 'cash');

  const cards = [
    {
      title: 'إجمالي الإيرادات المكتملة',
      value: `${Number(stats.total_revenue ?? 0).toLocaleString()} ر.ي`,
      subtitle: 'العائد المحصل من الرحلات المكتملة',
      trend: 'مباشر',
      isPositive: true,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
      icon: DollarSign,
    },
    {
      title: 'إجمالي مدفوعات المحفظة',
      value: `${Number(walletObj?.amount ?? 0).toLocaleString()} ر.ي`,
      subtitle: `${walletObj?.trips_count ?? 0} عملية عبر المحفظة`,
      trend: `${walletObj?.percentage ?? 0}%`,
      isPositive: true,
      iconBgColor: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
      icon: Wallet,
    },
    {
      title: 'إجمالي المدفوعات النقدية',
      value: `${Number(cashObj?.amount ?? 0).toLocaleString()} ر.ي`,
      subtitle: `${cashObj?.trips_count ?? 0} عملية نقداً (كاش)`,
      trend: `${cashObj?.percentage ?? 0}%`,
      isPositive: true,
      iconBgColor: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
      icon: Banknote,
    },
    {
      title: 'صافي عمولة المنصة (10%)',
      value: `${Number(stats.platform_commission ?? 0).toLocaleString()} ر.ي`,
      subtitle: 'إيراد منصة راحة الصافي',
      trend: '10%',
      isPositive: true,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
      icon: Percent,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
      {cards.map((item, idx) => (
        <StatCard
          key={idx}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          trend={item.trend}
          isPositive={item.isPositive}
          icon={item.icon}
          iconBgColor={item.iconBgColor}
          iconColor={item.iconColor}
        />
      ))}
    </div>
  );
};
