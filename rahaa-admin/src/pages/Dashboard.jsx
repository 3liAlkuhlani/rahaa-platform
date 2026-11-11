import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { RecentTripsTable } from '../components/tables/RecentTripsTable';
import {
  Banknote,
  Car,
  UserCheck,
  Users,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';

export const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminStats();
      if (res?.stats) {
        setStatsData(res.stats);
      }
      if (res?.recent_trips) {
        setRecentTrips(res.recent_trips);
      }
      if (res?.recent_logs) {
        setRecentLogs(res.recent_logs);
      }
    } catch (err) {
      setError(err.message || 'تعذر تحميل إحصائيات الأداء اليومي من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dailySummaryCards = [
    {
      title: 'إجمالي الإيرادات المحصلة',
      value: `${Number(statsData?.total_revenue ?? 0).toLocaleString()} ر.ي`,
      subtitle: 'من الرحلات المكتملة فعلياً',
      trend: 'مباشر',
      isPositive: true,
      icon: Banknote,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'الرحلات النشطة حالياً',
      value: Number(statsData?.active_trips ?? 0).toLocaleString(),
      subtitle: 'رحلات قيد الطلب أو التنفيذ',
      trend: 'نشط',
      isPositive: true,
      icon: Car,
      iconBgColor: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
    {
      title: 'الرحلات المكتملة',
      value: Number(statsData?.completed_trips ?? 0).toLocaleString(),
      subtitle: `من إجمالي ${Number(statsData?.total_trips ?? 0)} رحلة مسجلة`,
      trend: 'مكتمل',
      isPositive: true,
      icon: CheckCircle2,
      iconBgColor: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'السائقين المعتمدين',
      value: Number(statsData?.approved_drivers ?? 0).toLocaleString(),
      subtitle: `من إجمالي ${Number(statsData?.total_drivers ?? 0)} سائق`,
      trend: 'موثق',
      isPositive: true,
      icon: UserCheck,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'إجمالي الركاب المسجلين',
      value: Number(statsData?.total_passengers ?? 0).toLocaleString(),
      subtitle: 'حسابات الركاب الفعالة في المنصة',
      trend: 'عميل',
      isPositive: true,
      icon: Users,
      iconBgColor: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'سائقين بانتظار المراجعة',
      value: Number(statsData?.pending_drivers ?? 0).toLocaleString(),
      subtitle: 'طلبات انضمام بانتظار التدقيق',
      trend: statsData?.pending_drivers > 0 ? 'يتطلب مراجعة' : 'مكتمل',
      isPositive: statsData?.pending_drivers === 0,
      icon: ShieldAlert,
      iconBgColor: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
    {
      title: 'متوسط قيمة الرحلة',
      value: `${Number(statsData?.avg_trip_fare ?? 0).toLocaleString()} ر.ي`,
      subtitle: 'معدل أجرة المشوار الواحد',
      trend: 'متوسط',
      isPositive: true,
      icon: TrendingUp,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'صافي عمولة المنصة (10%)',
      value: `${Number(statsData?.platform_commission ?? 0).toLocaleString()} ر.ي`,
      subtitle: 'عائد منصة راحة الصافي',
      trend: '10%',
      isPositive: true,
      icon: Clock,
      iconBgColor: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Page Header Banner */}
      <PageHeader
        title="ملخص الأداء اليومي"
        badge="صنعاء - بيانات مباشرة"
        subtitle="متابعة حية لجميع مؤشرات النقل والرحلات والإيرادات من قاعدة البيانات"
        actions={
          <PrimaryButton onClick={fetchDashboardData} variant="secondary" size="sm">
            <RefreshCw className={`w-4 h-4 text-rahaa-blue ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث المؤشرات</span>
          </PrimaryButton>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-cairo">
          {error}
        </div>
      )}

      {/* Daily Performance Summary - Responsive CSS Grid View (Requirement #9) */}
      <section aria-label="ملخص الأداء اليومي">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {dailySummaryCards.map((card, idx) => (
            <StatCard
              key={idx}
              title={card.title}
              value={loading && !statsData ? '...' : card.value}
              subtitle={card.subtitle}
              trend={card.trend}
              isPositive={card.isPositive}
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
            />
          ))}
        </div>
      </section>

      {/* Middle Section: Weekly Analytics & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <WeeklyChart recentTrips={recentTrips} />
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed logs={recentLogs} />
        </div>
      </div>

      {/* Bottom Section: Recent Trips Data Table */}
      <div>
        <RecentTripsTable apiTrips={recentTrips} loading={loading} />
      </div>
    </div>
  );
};
