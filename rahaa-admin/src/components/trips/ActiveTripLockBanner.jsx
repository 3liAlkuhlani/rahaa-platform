import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Navigation, ArrowLeft, Clock } from 'lucide-react';

export const ACTIVE_TRIP_LOCK_MESSAGE =
  'لديك رحلة نشطة بالفعل، لا يمكنك طلب رحلة جديدة حتى يتم إنهاء الرحلة الحالية أو إلغاؤها.';

const STATUS_LABELS = {
  requested: 'بانتظار قبول السائق',
  pending: 'بانتظار قبول السائق',
  accepted: 'تم قبول الرحلة',
  arrived: 'السائق في طريقه إليك / وصل لموقع الانطلاق',
  driver_arriving: 'السائق في طريقه إليك',
  in_progress: 'الرحلة قيد التنفيذ',
  loading: 'جاري التحميل',
  in_transit: 'الطلب في الطريق',
};

/**
 * Reusable banner shown whenever a passenger already has an active trip/ride.
 * Displays the required Arabic notice and provides a direct link to the active trip.
 */
export const ActiveTripLockBanner = ({ activeTrip, activeCargo = null, className = '' }) => {
  const navigate = useNavigate();

  if (!activeTrip && !activeCargo) return null;

  const isTrip = Boolean(activeTrip);
  const status = isTrip ? activeTrip.status : activeCargo?.status;
  const statusText = STATUS_LABELS[status] || 'رحلة نشطة';
  const refNumber = isTrip ? activeTrip.trip_number : activeCargo?.request_number;
  const pickup = isTrip ? activeTrip.pickup_name : activeCargo?.pickup_location;
  const dropoff = isTrip ? activeTrip.dropoff_name : activeCargo?.delivery_location;

  const handleGoToActiveTrip = () => {
    if (isTrip && activeTrip?.id) {
      navigate(`/passenger/map/${activeTrip.id}`, { state: { trip: activeTrip } });
    } else {
      navigate('/passenger/trips');
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5 shadow-rahaa-sm space-y-3 ${className}`}
      dir="rtl"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-cairo font-bold text-sm text-amber-950">
              لا يمكن إنشاء طلب رحلة جديد حالياً
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-900">
              <Clock className="w-3 h-3" />
              {statusText}
            </span>
            {refNumber && (
              <span className="text-[11px] font-mono font-bold text-amber-800">
                #{refNumber}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-tajawal font-bold text-amber-900 leading-relaxed">
            {ACTIVE_TRIP_LOCK_MESSAGE}
          </p>
          {(pickup || dropoff) && (
            <p className="text-xs text-amber-800/90 truncate">
              {pickup} ← {dropoff}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleGoToActiveTrip}
          className="h-10 px-4 rounded-xl bg-rahaa-blue hover:bg-rahaa-blue/90 text-white font-cairo font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>الانتقال إلى الرحلة الحالية ومتابعة تفاصيلها</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
