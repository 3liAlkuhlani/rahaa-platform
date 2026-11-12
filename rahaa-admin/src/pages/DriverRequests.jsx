import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  ClipboardList,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  User,
  Car,
  Truck,
  Bike,
  Key,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  Inbox,
  Ruler,
  X,
} from 'lucide-react';
import { api, getDriverPortalRoute, getCurrentUser } from '../services/api';

const STATUS_META = {
  new: {
    label: 'طلب جديد',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  accepted: {
    label: 'تم القبول',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  rejected: {
    label: 'تم الرفض',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  },
  assigned_other: {
    label: 'أُسند لسائق آخر',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  completed: {
    label: 'مكتمل',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  expired_cancelled: {
    label: 'ملغي / منتهي',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
};

const SERVICE_ICONS = {
  taxi: Car,
  motorcycle: Bike,
  truck: Truck,
  rental: Key,
};

function formatRequestTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  return date.toLocaleString('ar-YE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const DriverRequests = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const outlet = useOutletContext() || {};
  const {
    requestsPayload = { requests: [], counts: { new: 0, accepted: 0, previous: 0, total: 0 }, driver_services: [] },
    requestsLoading = false,
    requestsError = '',
    refreshRequests = () => {},
  } = outlet;

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'accepted' | 'previous'
  const [busyUid, setBusyUid] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = useMemo(() => {
    const list = requestsPayload.requests || [];
    if (activeTab === 'new') {
      return list.filter((r) => r.request_status === 'new');
    }
    if (activeTab === 'accepted') {
      return list.filter((r) => r.request_status === 'accepted');
    }
    return list.filter((r) => !['new', 'accepted'].includes(r.request_status));
  }, [requestsPayload.requests, activeTab]);

  const handleAccept = async (item) => {
    if (busyUid) return;
    setBusyUid(item.uid);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.acceptDriverRequest(item.request_type, item.id);
      if (res?.success) {
        setActionSuccess(res.message || 'تم قبول الطلب بنجاح');
        await refreshRequests(true);
        setActiveTab('accepted');
      }
    } catch (err) {
      setActionError(err?.message || 'تعذر قبول الطلب، ربما تم قبوله من سائق آخر');
      await refreshRequests(true);
    } finally {
      setBusyUid(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || busyUid) return;
    setBusyUid(rejectTarget.uid);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.rejectDriverRequest(
        rejectTarget.request_type,
        rejectTarget.id,
        rejectReason.trim() || 'رفض السائق الطلب'
      );
      if (res?.success) {
        setActionSuccess(res.message || 'تم رفض الطلب');
        setRejectTarget(null);
        setRejectReason('');
        await refreshRequests(true);
      }
    } catch (err) {
      setActionError(err?.message || 'تعذر رفض الطلب');
    } finally {
      setBusyUid(null);
    }
  };

  const counts = requestsPayload.counts || { new: 0, accepted: 0, previous: 0, total: 0 };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5 font-tajawal" dir="rtl">
      {/* Page Header */}
      <div className="bg-rahaa-card rounded-3xl border border-rahaa-border p-5 sm:p-6 shadow-rahaa-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rahaa-blue-soft text-rahaa-blue flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-cairo font-black text-xl sm:text-2xl text-rahaa-navy">طلباتي</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF5E8] text-[#D67E16] border border-[#EE9224]/30">
                {counts.new} طلب جديد
              </span>
            </div>
            <p className="text-xs text-rahaa-text-muted mt-1">
              استقبال الطلبات المخصصة لخدمتك ومتابعة تفاصيلها وقبولها فورياً
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refreshRequests(false)}
          disabled={requestsLoading}
          className="h-10 px-4 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-rahaa-blue-soft text-rahaa-navy text-xs font-cairo font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${requestsLoading ? 'animate-spin' : ''}`} />
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {/* Feedback Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(getDriverPortalRoute(currentUser))}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shrink-0"
          >
            الانتقال لبوابة التنفيذ
          </button>
        </div>
      )}

      {(actionError || requestsError) && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{actionError || requestsError}</span>
          </div>
          <button
            type="button"
            onClick={() => refreshRequests(false)}
            className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-rahaa-card p-1.5 rounded-2xl border border-rahaa-border shadow-2xs">
        {[
          { key: 'new', label: 'الجديدة', count: counts.new },
          { key: 'accepted', label: 'المقبولة', count: counts.accepted },
          { key: 'previous', label: 'السابقة', count: counts.previous },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-2.5 px-3 rounded-xl font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-bg hover:text-rahaa-navy'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-rahaa-bg text-rahaa-navy border border-rahaa-border'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {requestsLoading && filteredRequests.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-rahaa-card rounded-3xl border border-rahaa-border p-5 animate-pulse space-y-4"
            >
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        /* Empty State */
        <div className="bg-rahaa-card rounded-3xl border border-rahaa-border p-10 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-rahaa-blue-soft text-rahaa-blue flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-cairo font-bold text-base text-rahaa-navy">
            {activeTab === 'new'
              ? 'لا توجد طلبات جديدة حالياً'
              : activeTab === 'accepted'
              ? 'لا توجد طلبات مقبولة نشطة حالياً'
              : 'لا توجد طلبات سابقة'}
          </h3>
          <p className="text-xs text-rahaa-text-muted max-w-md mx-auto">
            {activeTab === 'new'
              ? 'سيتم تحديث هذه القائمة تلقائياً فور وصول أي طلب جديد مطابق لنوع مركبتك وخدمتك.'
              : 'ستظهر الطلبات هنا فور قبولها أو التعامل معها.'}
          </p>
        </div>
      ) : (
        /* Request Cards */
        <div className="space-y-4">
          {filteredRequests.map((item) => {
            const statusInfo = STATUS_META[item.request_status] || STATUS_META.new;
            const ServiceIcon = SERVICE_ICONS[item.service_type] || Car;
            const isBusy = busyUid === item.uid;
            const isNew = item.request_status === 'new';

            return (
              <div
                key={item.uid}
                className="bg-rahaa-card rounded-3xl border border-rahaa-border p-5 shadow-rahaa-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Service Type + Reference + Time + Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rahaa-blue-soft text-rahaa-blue text-xs font-bold">
                      <ServiceIcon className="w-3.5 h-3.5" />
                      <span>{item.service_label}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-rahaa-text-subtle">
                      #{item.reference_number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-rahaa-text-muted font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRequestTime(item.created_at)}</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Customer + Price + Distance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-rahaa-bg/70 rounded-2xl p-3.5 border border-rahaa-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-rahaa-border flex items-center justify-center text-rahaa-navy shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-rahaa-text-subtle">العميل</p>
                      <p className="text-xs sm:text-sm font-bold text-rahaa-navy truncate">
                        {item.customer?.name || 'عميل راحة'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-rahaa-border flex items-center justify-center text-emerald-600 shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-rahaa-text-subtle">السعر المعروض</p>
                      <p className="text-xs sm:text-sm font-black text-emerald-600">
                        {item.fare != null ? `${Number(item.fare).toLocaleString()} ر.ي` : 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-rahaa-border flex items-center justify-center text-[#EE9224] shrink-0">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-rahaa-text-subtle">المسافة التقديرية</p>
                      <p className="text-xs sm:text-sm font-bold text-rahaa-navy">
                        {item.distance_km != null ? `${item.distance_km} كم` : 'حسب المسار'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pickup & Dropoff */}
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-rahaa-text-subtle text-[11px] block">
                        {item.request_type === 'rental' ? 'المركبة المطلوبة' : 'موقع الانطلاق'}
                      </span>
                      <span className="font-bold text-rahaa-navy">{item.pickup_name || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Navigation className="w-4 h-4 text-[#EE9224] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-rahaa-text-subtle text-[11px] block">
                        {item.request_type === 'rental' ? 'فترة الحجز' : 'الوجهة'}
                      </span>
                      <span className="font-bold text-rahaa-navy">{item.dropoff_name || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-rahaa-border flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/driver/requests/${item.request_type}/${item.id}`)}
                    className="flex-1 min-w-[130px] h-11 px-4 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-rahaa-blue-soft text-rahaa-navy font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض التفاصيل</span>
                  </button>

                  {isNew && (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAccept(item)}
                        className="flex-1 min-w-[140px] h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isBusy ? 'جاري التنفيذ...' : 'قبول الطلب'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setRejectTarget(item);
                          setRejectReason('');
                        }}
                        className="h-11 px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl max-w-md w-full p-6 border border-rahaa-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cairo font-black text-base text-rahaa-navy">تأكيد رفض الطلب</h3>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="p-1 text-rahaa-text-subtle hover:text-rahaa-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-rahaa-text-muted leading-relaxed">
              هل أنت متأكد من رفض الطلب{' '}
              <span className="font-bold text-rahaa-navy">#{rejectTarget.reference_number}</span>؟
              سيتم إخفاء الطلب من قائمتك دون إلغاء طلب العميل ليبقى متاحاً للكباتن الآخرين.
            </p>
            <div>
              <label className="block text-xs font-bold text-rahaa-navy mb-1.5">
                سبب الرفض (اختياري)
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: الموقع بعيد حالياً"
                className="w-full px-3.5 py-2.5 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs text-rahaa-navy focus:outline-none focus:ring-2 focus:ring-rahaa-blue"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="flex-1 h-11 rounded-xl border border-rahaa-border bg-rahaa-bg text-rahaa-navy font-bold text-xs"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={busyUid === rejectTarget.uid}
                onClick={handleConfirmReject}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-60"
              >
                {busyUid === rejectTarget.uid ? 'جاري الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
