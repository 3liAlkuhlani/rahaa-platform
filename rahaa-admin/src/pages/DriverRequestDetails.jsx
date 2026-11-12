import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  User,
  Phone,
  MapPin,
  Navigation,
  Car,
  Truck,
  Bike,
  Key,
  DollarSign,
  CreditCard,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Ruler,
  X,
} from 'lucide-react';
import { api, getDriverPortalRoute, getCurrentUser } from '../services/api';

const SERVICE_ICONS = {
  taxi: Car,
  motorcycle: Bike,
  truck: Truck,
  rental: Key,
};

const PAYMENT_LABELS = {
  cash: 'نقداً (كاش)',
  wallet: 'محفظة راحة',
  card: 'بطاقة بنكية',
};

const STATUS_LABELS = {
  new: 'طلب جديد متاح للقبول',
  accepted: 'تم قبول الطلب',
  rejected: 'تم رفض الطلب',
  assigned_other: 'تم إسناد الطلب لسائق آخر',
  completed: 'مكتمل',
  expired_cancelled: 'ملغي / منتهي الصلاحية',
};

export const DriverRequestDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const outlet = useOutletContext() || {};
  const { refreshRequests = () => {} } = outlet;

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getDriverRequestDetails(type, id);
      if (res?.success && res?.request) {
        setRequestData(res.request);
      } else {
        setErrorMsg('تعذر تحميل تفاصيل الطلب');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleAccept = async () => {
    if (submitting || !requestData) return;
    setSubmitting(true);
    setErrorMsg('');
    setActionMsg('');
    try {
      const res = await api.acceptDriverRequest(requestData.request_type, requestData.id);
      if (res?.success) {
        setRequestData(res.request);
        setActionMsg(res.message || 'تم قبول الرحلة بنجاح');
        await refreshRequests(true);
        const nextRoute =
          requestData.request_type === 'trip'
            ? '/driver/active-trip'
            : getDriverPortalRoute(currentUser);
        navigate(nextRoute, {
          replace: true,
          state: { acceptedRequest: res.request || requestData },
        });
      }
    } catch (err) {
      setErrorMsg(err?.message || 'تعذر قبول الطلب');
      await fetchDetails();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (submitting || !requestData) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.rejectDriverRequest(
        requestData.request_type,
        requestData.id,
        rejectReason.trim() || 'رفض السائق الطلب'
      );
      if (res?.success) {
        setShowRejectModal(false);
        await refreshRequests(true);
        navigate('/driver/requests', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err?.message || 'تعذر رفض الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4" dir="rtl">
        <div className="h-12 bg-rahaa-card rounded-2xl animate-pulse" />
        <div className="h-64 bg-rahaa-card rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (errorMsg && !requestData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
        <div className="bg-rahaa-card rounded-3xl border border-red-200 p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchDetails}
              className="px-4 py-2 rounded-xl bg-rahaa-blue text-white text-xs font-bold"
            >
              إعادة المحاولة
            </button>
            <button
              type="button"
              onClick={() => navigate('/driver/requests')}
              className="px-4 py-2 rounded-xl border border-rahaa-border text-rahaa-navy text-xs font-bold"
            >
              العودة إلى طلباتي
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!requestData) return null;

  const ServiceIcon = SERVICE_ICONS[requestData.service_type] || Car;
  const hasCoords = Boolean(
    requestData.pickup_lat &&
      requestData.pickup_lng &&
      requestData.dropoff_lat &&
      requestData.dropoff_lng
  );
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${requestData.pickup_lat},${requestData.pickup_lng}&destination=${requestData.dropoff_lat},${requestData.dropoff_lng}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5 font-tajawal" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/driver/requests')}
          className="h-10 px-4 rounded-xl bg-rahaa-card border border-rahaa-border text-rahaa-navy text-xs font-cairo font-bold flex items-center gap-2 hover:bg-rahaa-blue-soft transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى طلباتي</span>
        </button>

        <span className="text-xs font-mono font-bold text-rahaa-text-subtle">
          #{requestData.reference_number}
        </span>
      </div>

      {/* Feedback */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(getDriverPortalRoute(currentUser))}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            فتح لوحة التنفيذ
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-rahaa-card rounded-3xl border border-rahaa-border p-5 sm:p-6 shadow-rahaa-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-rahaa-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rahaa-blue-soft text-rahaa-blue flex items-center justify-center">
              <ServiceIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-cairo font-black text-lg text-rahaa-navy">
                تفاصيل طلب {requestData.service_label}
              </h1>
              <p className="text-xs text-rahaa-text-muted">
                {STATUS_LABELS[requestData.request_status] || requestData.raw_status}
              </p>
            </div>
          </div>

          <div className="text-left">
            <p className="text-[11px] text-rahaa-text-subtle">تاريخ ووقت الطلب</p>
            <p className="text-xs font-bold text-rahaa-navy flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-rahaa-blue" />
              <span>
                {requestData.created_at
                  ? new Date(requestData.created_at).toLocaleString('ar-YE')
                  : '—'}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-rahaa-bg/80 rounded-2xl p-4 border border-rahaa-border/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-rahaa-border flex items-center justify-center text-rahaa-navy">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-rahaa-text-subtle">اسم العميل</p>
              <p className="text-sm font-black text-rahaa-navy">
                {requestData.customer?.name || 'عميل راحة'}
              </p>
            </div>
          </div>

          {requestData.customer?.phone && (
            <a
              href={`tel:${requestData.customer.phone}`}
              className="h-10 px-4 rounded-xl bg-rahaa-blue text-white text-xs font-bold flex items-center gap-2 hover:opacity-90"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">{requestData.customer.phone}</span>
            </a>
          )}
        </div>

        {/* Route & Map Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-cairo font-bold text-sm text-rahaa-navy">المسار والمواقع</h2>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-rahaa-blue hover:underline flex items-center gap-1"
              >
                <span>فتح المسار في الخرائط</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-rahaa-border bg-rahaa-bg/60 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-rahaa-text-subtle">
                  {requestData.request_type === 'rental' ? 'المركبة' : 'موقع الانطلاق'}
                </p>
                <p className="text-sm font-bold text-rahaa-navy">{requestData.pickup_name || '—'}</p>
                {requestData.pickup_lat && requestData.pickup_lng && (
                  <p className="text-[11px] font-mono text-rahaa-text-subtle mt-0.5" dir="ltr">
                    {Number(requestData.pickup_lat).toFixed(5)}, {Number(requestData.pickup_lng).toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-[#EE9224] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-rahaa-text-subtle">
                  {requestData.request_type === 'rental' ? 'فترة الحجز' : 'الوجهة'}
                </p>
                <p className="text-sm font-bold text-rahaa-navy">{requestData.dropoff_name || '—'}</p>
                {requestData.dropoff_lat && requestData.dropoff_lng && (
                  <p className="text-[11px] font-mono text-rahaa-text-subtle mt-0.5" dir="ltr">
                    {Number(requestData.dropoff_lat).toFixed(5)}, {Number(requestData.dropoff_lng).toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Vehicle Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl border border-rahaa-border bg-rahaa-bg/50">
            <p className="text-[11px] text-rahaa-text-subtle flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>قيمة الرحلة</span>
            </p>
            <p className="text-sm font-black text-emerald-600 mt-1">
              {requestData.fare != null ? `${Number(requestData.fare).toLocaleString()} ر.ي` : 'غير محدد'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-rahaa-border bg-rahaa-bg/50">
            <p className="text-[11px] text-rahaa-text-subtle flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-rahaa-blue" />
              <span>طريقة الدفع</span>
            </p>
            <p className="text-sm font-bold text-rahaa-navy mt-1">
              {PAYMENT_LABELS[requestData.payment_method] || requestData.payment_method || 'غير محدد'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-rahaa-border bg-rahaa-bg/50">
            <p className="text-[11px] text-rahaa-text-subtle flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-[#EE9224]" />
              <span>المسافة / الفئة</span>
            </p>
            <p className="text-sm font-bold text-rahaa-navy mt-1">
              {requestData.distance_km != null
                ? `${requestData.distance_km} كم`
                : requestData.vehicle_category || requestData.service_label}
            </p>
          </div>
        </div>

        {/* Notes / Cargo Description */}
        {requestData.notes && (
          <div className="p-4 rounded-2xl border border-rahaa-border bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
            <p className="text-xs font-bold text-rahaa-navy flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#EE9224]" />
              <span>ملاحظات العميل / تفاصيل إضافية</span>
            </p>
            <p className="text-xs text-rahaa-text-muted leading-relaxed">{requestData.notes}</p>
          </div>
        )}

        {/* Bottom Action Buttons */}
        {requestData.request_status === 'new' && (
          <div className="pt-4 border-t border-rahaa-border flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={handleAccept}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'جاري القبول...' : 'قبول الرحلة'}</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowRejectModal(true)}
              className="sm:w-44 h-12 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-cairo font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <XCircle className="w-5 h-5" />
              <span>رفض الطلب</span>
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl max-w-md w-full p-6 border border-rahaa-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cairo font-black text-base text-rahaa-navy">تأكيد رفض الطلب</h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 text-rahaa-text-subtle hover:text-rahaa-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-rahaa-text-muted">
              سيتم إخفاء الطلب من قائمتك دون إلغاء طلب العميل ليبقى متاحاً للكباتن الآخرين.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="سبب الرفض (اختياري)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs text-rahaa-navy focus:outline-none focus:ring-2 focus:ring-rahaa-blue"
            />
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 h-11 rounded-xl border border-rahaa-border bg-rahaa-bg text-rahaa-navy font-bold text-xs"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmReject}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-60"
              >
                {submitting ? 'جاري الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

