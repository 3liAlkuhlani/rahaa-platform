import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { RecentTripsTable } from '../components/tables/RecentTripsTable';
import {
  Banknote,
  Car,
  UserCheck,
  Users,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  CalendarCheck,
  Radio,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';

export const Dashboard = () => {
  const [period, setPeriod] = useState('30d');
  const [statsData, setStatsData] = useState(null);
  const [chartsData, setChartsData] = useState({ timeline: [], transport_distribution: [] });
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async (selectedPeriod = period) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminStats(selectedPeriod);
      if (res?.stats) setStatsData(res.stats);
      if (res?.charts) setChartsData(res.charts);
      if (res?.recent_trips) setRecentTrips(res.recent_trips);
      if (res?.recent_logs) setRecentLogs(res.recent_logs);
    } catch (err) {
      setError(err.message || 'تعذر تحميل إحصائيات الأداء من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const timeline = Array.isArray(chartsData?.timeline) ? chartsData.timeline : [];
  const transportDist = Array.isArray(chartsData?.transport_distribution)
    ? chartsData.transport_distribution
    : [];

  // Show last 14 buckets for readable bar display
  const visibleTimeline = timeline.slice(-14);
  const maxTripsBucket = Math.max(1, ...visibleTimeline.map((d) => Number(d.total_trips || 0)));
  const maxUsersBucket = Math.max(
    1,
    ...visibleTimeline.map((d) => Number(d.new_passengers || 0) + Number(d.new_drivers || 0))
  );
  const maxRevenueBucket = Math.max(1, ...visibleTimeline.map((d) => Number(d.revenue || 0)));
  const totalTransportCount = Math.max(
    1,
    transportDist.reduce((acc, item) => acc + Number(item.count || 0), 0)
  );

  const summaryCards = [
    {
      title: 'إجمالي المستخدمين',
      value: Number(statsData?.total_users ?? 0).toLocaleString(),
      subtitle: `${Number(statsData?.total_passengers ?? 0)} راكب • ${Number(statsData?.total_drivers ?? 0)} سائق`,
      trend: 'قاعدة البيانات',
      isPositive: true,
      icon: Users,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'السائقين المتصلين الآن',
      value: Number(statsData?.online_drivers ?? 0).toLocaleString(),
      subtitle: `من أصل ${Number(statsData?.total_drivers ?? 0)} سائق (${Number(statsData?.pending_drivers ?? 0)} بانتظار الاعتماد)`,
      trend: 'متصل',
      isPositive: true,
      icon: Radio,
      iconBgColor: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${Number(statsData?.total_revenue ?? 0).toLocaleString()} ر.ي`,
      subtitle: `عمولة المنصة: ${Number(statsData?.platform_commission ?? 0).toLocaleString()} ر.ي`,
      trend: 'فعلي',
      isPositive: true,
      icon: Banknote,
      iconBgColor: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'الرحلات النشطة حالياً',
      value: Number(statsData?.active_trips ?? 0).toLocaleString(),
      subtitle: `من إجمالي ${Number(statsData?.total_trips ?? 0)} رحلة مسجلة`,
      trend: 'نشط',
      isPositive: true,
      icon: Car,
      iconBgColor: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة التحكم الرئيسية للإدارة"
        description="متابعة حية ومباشرة من قاعدة البيانات للرحلات، المستخدمين، السائقين، الحجوزات، الإيرادات، والشكاوى"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-rahaa-card border border-rahaa-border p-1">
              {[
                { id: '7d', label: '7 أيام' },
                { id: '30d', label: '30 يوماً' },
                { id: '12m', label: '12 شهراً' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-cairo font-bold transition-colors ${
                    period === p.id
                      ? 'bg-rahaa-blue text-white'
                      : 'text-rahaa-text-muted hover:text-rahaa-navy'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <PrimaryButton
              variant="secondary"
              icon={RefreshCw}
              onClick={() => fetchDashboardData(period)}
              disabled={loading}
            >
              {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
            </PrimaryButton>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal">
          {error}
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-tajawal text-rahaa-text-muted">الرحلات المكتملة</div>
            <div className="text-lg font-cairo font-black text-rahaa-navy">
              {Number(statsData?.completed_trips ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-tajawal text-rahaa-text-muted">الرحلات الملغاة</div>
            <div className="text-lg font-cairo font-black text-rahaa-navy">
              {Number(statsData?.cancelled_trips ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-tajawal text-rahaa-text-muted">إجمالي طلبات الحجز</div>
            <div className="text-lg font-cairo font-black text-rahaa-navy">
              {Number(statsData?.total_bookings ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-rahaa-blue">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-tajawal text-rahaa-text-muted">السائقون المعتمدون</div>
            <div className="text-lg font-cairo font-black text-rahaa-navy">
              {Number(statsData?.approved_drivers ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-4 border border-amber-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-tajawal text-rahaa-text-muted">الشكاوى المعلقة</div>
            <div className="text-lg font-cairo font-black text-amber-700">
              {Number(statsData?.pending_complaints ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Real DB Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Completed vs Cancelled Trips */}
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cairo font-bold text-sm text-rahaa-navy">
                مقارنة الرحلات المكتملة والملغاة
              </h3>
              <p className="text-[11px] font-tajawal text-rahaa-text-subtle">
                بيانات فعلية من قاعدة البيانات خلال الفترة المحددة
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-cairo">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> مكتملة
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> ملغاة
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end gap-2 pt-4 border-b border-rahaa-border pb-2 overflow-x-auto">
            {visibleTimeline.map((item, idx) => {
              const compH = Math.round((Number(item.completed_trips || 0) / maxTripsBucket) * 100);
              const cancH = Math.round((Number(item.cancelled_trips || 0) / maxTripsBucket) * 100);
              return (
                <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                  <div className="w-full h-32 flex items-end justify-center gap-0.5">
                    <div
                      title={`مكتملة: ${item.completed_trips}`}
                      className="w-2.5 bg-emerald-500 rounded-t-md transition-all"
                      style={{ height: `${Math.max(4, compH)}%` }}
                    />
                    <div
                      title={`ملغاة: ${item.cancelled_trips}`}
                      className="w-2.5 bg-rose-400 rounded-t-md transition-all"
                      style={{ height: `${Math.max(2, cancH)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-rahaa-text-subtle">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Transport Mode Distribution */}
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div>
            <h3 className="font-cairo font-bold text-sm text-rahaa-navy">
              توزيع الرحلات والطلبات حسب وسيلة النقل
            </h3>
            <p className="text-[11px] font-tajawal text-rahaa-text-subtle">
              تاكسي، تأجير سيارات، شاحنات نقل، ودراجات نارية
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {transportDist.map((item) => {
              const pct = Math.round((Number(item.count || 0) / totalTransportCount) * 100);
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-cairo">
                    <span className="font-bold text-rahaa-navy">{item.label}</span>
                    <span className="text-rahaa-text-muted">
                      {Number(item.count || 0).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-rahaa-bg overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Revenue Trend */}
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cairo font-bold text-sm text-rahaa-navy flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rahaa-blue" />
                <span>إحصائيات الإيرادات المسجلة</span>
              </h3>
              <p className="text-[11px] font-tajawal text-rahaa-text-subtle">
                تطور الإيرادات بالريال اليمني من الرحلات المكتملة
              </p>
            </div>
          </div>

          <div className="h-40 flex items-end gap-2 pt-3 border-b border-rahaa-border pb-2 overflow-x-auto">
            {visibleTimeline.map((item, idx) => {
              const h = Math.round((Number(item.revenue || 0) / maxRevenueBucket) * 100);
              return (
                <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                  <div className="w-full h-28 flex items-end justify-center">
                    <div
                      title={`${Number(item.revenue || 0).toLocaleString()} ر.ي`}
                      className="w-4 bg-rahaa-blue rounded-t-md transition-all"
                      style={{ height: `${Math.max(4, h)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-rahaa-text-subtle">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Users & Drivers Growth */}
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cairo font-bold text-sm text-rahaa-navy">
                نمو المستخدمين والسائقين الجدد
              </h3>
              <p className="text-[11px] font-tajawal text-rahaa-text-subtle">
                التسجيلات الجديدة خلال الفترة الزمنية
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-cairo">
              <span className="flex items-center gap-1 text-sky-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> ركاب
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> سائقون
              </span>
            </div>
          </div>

          <div className="h-40 flex items-end gap-2 pt-3 border-b border-rahaa-border pb-2 overflow-x-auto">
            {visibleTimeline.map((item, idx) => {
              const pH = Math.round((Number(item.new_passengers || 0) / maxUsersBucket) * 100);
              const dH = Math.round((Number(item.new_drivers || 0) / maxUsersBucket) * 100);
              return (
                <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                  <div className="w-full h-28 flex items-end justify-center gap-0.5">
                    <div
                      title={`ركاب: ${item.new_passengers}`}
                      className="w-2.5 bg-sky-500 rounded-t-md"
                      style={{ height: `${Math.max(3, pH)}%` }}
                    />
                    <div
                      title={`سائقون: ${item.new_drivers}`}
                      className="w-2.5 bg-amber-500 rounded-t-md"
                      style={{ height: `${Math.max(3, dH)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-rahaa-text-subtle">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTripsTable trips={recentTrips} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed logs={recentLogs} loading={loading} />
        </div>
      </div>
    </div>
  );
};
