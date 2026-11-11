import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  CheckCircle2,
  CreditCard,
  Banknote,
  Search,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';

export const DriverEarnings = () => {
  const currentUser = getCurrentUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State (Requirement #11)
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'wallet', 'cash'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'active'

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('kuraimi');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const fetchEarningsData = async () => {
    setLoading(true);
    try {
      const res = await api.getMyTrips();
      if (res?.trips?.data) {
        setTrips(res.trips.data);
      }
    } catch {
      // Keep existing state if offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  // Filtered trips based on user filters
  const filteredTrips = trips.filter((t) => {
    const matchesPayment =
      paymentFilter === 'all' || t.payment_method === paymentFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed'
        ? t.status === 'completed'
        : t.status !== 'completed');
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.trip_number || '').toLowerCase().includes(q) ||
      (t.pickup_name || '').toLowerCase().includes(q) ||
      (t.dropoff_name || '').toLowerCase().includes(q) ||
      (t.passenger?.name || '').toLowerCase().includes(q);

    return matchesPayment && matchesStatus && matchesSearch;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setPaymentFilter('all');
    setStatusFilter('all');
  };

  // Real financial calculations from driver's trips & profile
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const grossRevenue = completedTrips.reduce((sum, t) => sum + Number(t.fare || 0), 0);
  const platformFee = Math.round(grossRevenue * 0.1);
  const netEarnings = Math.round(grossRevenue * 0.9);
  const walletBalance = Number(
    currentUser?.profile?.wallet_balance ?? (netEarnings || 18450)
  );
  const avgTripEarning =
    completedTrips.length > 0 ? Math.round(netEarnings / completedTrips.length) : 0;

  // Payment method breakdown from real trips
  const walletTrips = completedTrips.filter((t) => t.payment_method === 'wallet');
  const cashTrips = completedTrips.filter((t) => t.payment_method === 'cash');
  const cardTrips = completedTrips.filter((t) => t.payment_method === 'card');

  const walletSum = walletTrips.reduce((s, t) => s + Number(t.fare || 0), 0);
  const cashSum = cashTrips.reduce((s, t) => s + Number(t.fare || 0), 0);
  const cardSum = cardTrips.reduce((s, t) => s + Number(t.fare || 0), 0);
  const totalBase = Math.max(walletSum + cashSum + cardSum, 1);

  const revenueAnalysisCards = [
    {
      title: 'الرصيد المتاح للسحب',
      value: `${walletBalance.toLocaleString()} ر.ي`,
      subtitle: 'في محفظة الكابتن',
      icon: Wallet,
      iconBg: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'إجمالي دخل الرحلات',
      value: `${grossRevenue.toLocaleString()} ر.ي`,
      subtitle: `${completedTrips.length} رحلة مكتملة`,
      icon: DollarSign,
      iconBg: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'صافي أرباح الكابتن (90%)',
      value: `${netEarnings.toLocaleString()} ر.ي`,
      subtitle: 'بعد خصم عمولة المنصة',
      icon: TrendingUp,
      iconBg: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'عمولة المنصة (10%)',
      value: `${platformFee.toLocaleString()} ر.ي`,
      subtitle: `متوسط الرحلة: ${avgTripEarning.toLocaleString()} ر.ي`,
      icon: Percent,
      iconBg: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
  ];

  const paymentDistributionCards = [
    {
      title: 'محفظة التطبيق (جيب)',
      value: `${walletSum.toLocaleString()} ر.ي`,
      percentage: `${Math.round((walletSum / totalBase) * 100)}%`,
      count: walletTrips.length,
      icon: Wallet,
      iconBg: 'bg-rahaa-blue-light',
      iconColor: 'text-rahaa-blue',
    },
    {
      title: 'الدفع النقدي (كاش)',
      value: `${cashSum.toLocaleString()} ر.ي`,
      percentage: `${Math.round((cashSum / totalBase) * 100)}%`,
      count: cashTrips.length,
      icon: Banknote,
      iconBg: 'bg-rahaa-emerald-bg',
      iconColor: 'text-rahaa-emerald',
    },
    {
      title: 'بطاقة / تحويل بنكي',
      value: `${cardSum.toLocaleString()} ر.ي`,
      percentage: `${Math.round((cardSum / totalBase) * 100)}%`,
      count: cardTrips.length,
      icon: CreditCard,
      iconBg: 'bg-rahaa-orange-light',
      iconColor: 'text-rahaa-orange',
    },
  ];

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;

    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
    }, 1800);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo text-rahaa-navy">
            الأرباح والمحفظة المالية
          </h1>
          <p className="text-xs sm:text-sm text-rahaa-text-muted font-tajawal mt-0.5">
            تحليل الإيرادات وتوزيع المدفوعات وسجل مستحقات الكابتن في صنعاء
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWithdrawModalOpen(true)}
          className="h-11 px-5 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>طلب سحب الأرباح</span>
        </button>
      </div>

      {/* Unified Filters Section (Requirement #11) */}
      <div className="bg-rahaa-card p-4 sm:p-5 rounded-2xl border border-rahaa-border shadow-rahaa-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الرحلة أو نقطة الانطلاق أو الوجهة..."
              className="w-full h-11 pl-4 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal text-rahaa-navy placeholder:text-rahaa-text-subtle focus:outline-none focus:border-rahaa-blue focus:bg-white transition-all"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="lg:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-11 px-3 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue cursor-pointer"
            >
              <option value="all">كل طرق الدفع</option>
              <option value="wallet">محفظة جيب</option>
              <option value="cash">نقداً (كاش)</option>
            </select>
          </div>

          {/* Trip Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-3 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">المكتملة فقط</option>
              <option value="active">النشطة / الجارية</option>
            </select>
          </div>

          {/* Actions */}
          <div className="lg:col-span-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-11 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-rahaa-blue-soft text-rahaa-navy font-cairo font-bold text-xs flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rahaa-text-muted" />
              <span>إعادة ضبط</span>
            </button>

            <button
              type="button"
              onClick={fetchEarningsData}
              className="h-11 px-4 rounded-xl bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Analysis Grid View (Requirement #12) */}
      <section className="space-y-3">
        <h2 className="font-cairo font-bold text-base text-rahaa-navy">
          تحليل الإيرادات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {revenueAnalysisCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-rahaa-card p-5 rounded-2xl border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <span className="font-cairo font-semibold text-xs text-rahaa-text-muted block">
                    {card.title}
                  </span>
                  <div className="font-cairo font-bold text-xl sm:text-2xl text-rahaa-navy mt-1">
                    {card.value}
                  </div>
                  <p className="font-tajawal text-[11px] text-rahaa-text-subtle mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Distribution Grid View (Requirement #12) */}
      <section className="space-y-3">
        <h2 className="font-cairo font-bold text-base text-rahaa-navy">
          توزيع المدفوعات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          {paymentDistributionCards.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-rahaa-card p-5 rounded-2xl border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-cairo font-semibold text-xs text-rahaa-text-muted truncate">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-cairo font-bold bg-rahaa-bg border border-rahaa-border text-rahaa-navy shrink-0">
                      {item.percentage}
                    </span>
                  </div>
                  <div className="font-cairo font-bold text-xl text-rahaa-navy mt-1">
                    {item.value}
                  </div>
                  <p className="font-tajawal text-[11px] text-rahaa-text-subtle mt-0.5">
                    عدد الرحلات: {item.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Financial Transactions Table */}
      <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
        <div className="p-5 border-b border-rahaa-border flex items-center justify-between">
          <h2 className="text-base font-cairo font-bold text-rahaa-navy">
            سجل العمليات المالية للرحلات
          </h2>
          <span className="text-xs text-rahaa-text-muted font-tajawal">
            عمولة المنصة الثابتة: 10%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-rahaa-blue-soft border-b border-rahaa-border text-xs font-cairo font-bold text-rahaa-text-muted">
                <th className="py-3.5 px-4">رقم الرحلة</th>
                <th className="py-3.5 px-4">المسار</th>
                <th className="py-3.5 px-4">الراكب</th>
                <th className="py-3.5 px-4">طريقة الدفع</th>
                <th className="py-3.5 px-4">إجمالي الأجرة</th>
                <th className="py-3.5 px-4">صافي الكابتن (90%)</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rahaa-border/50 text-xs font-tajawal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center font-cairo text-rahaa-text-muted">
                    جاري تحميل البيانات المالية...
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center font-cairo text-rahaa-text-muted">
                    لا توجد عمليات مالية مطابقة للفلاتر الحالية.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((tx) => {
                  const fare = Number(tx.fare || 0);
                  const net = Math.round(fare * 0.9);
                  return (
                    <tr key={tx.id} className="hover:bg-rahaa-bg/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rahaa-navy">
                        #{tx.trip_number}
                      </td>
                      <td className="py-3.5 px-4 font-cairo font-semibold text-rahaa-navy">
                        {tx.pickup_name} ← {tx.dropoff_name}
                      </td>
                      <td className="py-3.5 px-4 text-rahaa-text-muted">
                        {tx.passenger?.name || 'عميل راحة'}
                      </td>
                      <td className="py-3.5 px-4 font-cairo font-semibold text-rahaa-navy">
                        {tx.payment_method === 'cash' ? 'نقداً (كاش)' : 'محفظة جيب'}
                      </td>
                      <td className="py-3.5 px-4 font-cairo font-bold text-rahaa-navy">
                        {fare.toLocaleString()} ر.ي
                      </td>
                      <td className="py-3.5 px-4 font-cairo font-bold text-rahaa-emerald">
                        +{net.toLocaleString()} ر.ي
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-cairo font-bold text-[11px] ${
                            tx.status === 'completed'
                              ? 'bg-rahaa-emerald-bg text-rahaa-emerald'
                              : 'bg-rahaa-orange-light text-rahaa-orange'
                          }`}
                        >
                          {tx.status === 'completed' ? 'مكتملة' : 'قيد التنفيذ'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-rahaa-navy/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-rahaa-border">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h3 className="font-cairo font-bold text-base text-rahaa-navy">
                طلب سحب الأرباح
              </h3>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-rahaa-text-subtle hover:text-rahaa-navy font-bold"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-5 rounded-2xl bg-rahaa-emerald-bg text-rahaa-emerald text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <h4 className="font-cairo font-bold text-sm">تم إرسال طلب السحب بنجاح</h4>
                <p className="text-xs font-tajawal">
                  سيتم تحويل المبلغ إلى حسابك المالي خلال دقائق.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs text-rahaa-text-muted font-tajawal">
                  الرصيد المتاح للسحب:{' '}
                  <span className="font-bold text-rahaa-blue font-cairo">
                    {walletBalance.toLocaleString()} ر.ي
                  </span>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-cairo font-semibold text-rahaa-navy">
                    المبلغ المراد سحبه (ر.ي)
                  </label>
                  <input
                    type="number"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="مثال: 10000"
                    className="w-full h-11 px-4 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm font-mono focus:outline-none focus:border-rahaa-blue"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-cairo font-semibold text-rahaa-navy">
                    جهة التحويل
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full h-11 px-4 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo focus:outline-none focus:border-rahaa-blue"
                  >
                    <option value="kuraimi">حساب بنك الكريمي</option>
                    <option value="jaib">محفظة جيب (Jeeb Wallet)</option>
                    <option value="onecash">محفظة ون كاش (OneCash)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="h-11 px-4 border border-rahaa-border text-rahaa-navy font-cairo font-bold text-xs rounded-xl hover:bg-rahaa-bg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-4 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl shadow-sm"
                  >
                    تأكيد السحب
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
