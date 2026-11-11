import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Car,
  Phone,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Compass,
  RefreshCw,
  XCircle,
  Star,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';
import { RatingModal } from '../components/common/RatingModal';
import { ServiceWorkflowStepper } from '../components/transport/ServiceWorkflowStepper';

export const PassengerTripMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const currentUser = getCurrentUser();

  const initialTrip = location.state?.trip || null;
  const [trip, setTrip] = useState(initialTrip);
  const [loading, setLoading] = useState(!initialTrip);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const fetchLatestTrip = async () => {
    try {
      setError('');
      const targetId = tripId || trip?.id;
      if (targetId) {
        const res = await api.getTrip(targetId);
        if (res?.trip) {
          setTrip(res.trip);
          return;
        }
      }
      // Fallback: load latest trip from user's trips
      const myTripsRes = await api.getMyTrips();
      const list = myTripsRes?.trips?.data || [];
      if (list.length > 0) {
        setTrip(list[0]);
      } else {
        setError('لم يتم العثور على رحلة نشطة حالياً.');
      }
    } catch (err) {
      setError(err.message || 'تعذر جلب بيانات الرحلة من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTrip) {
      fetchLatestTrip();
    }
  }, [tripId]);

  const handleCancelTrip = async () => {
    if (!trip?.id || cancelling) return;
    setCancelling(true);
    setError('');
    try {
      const res = await api.updateTripStatus(trip.id, 'cancelled', 'تم إلغاء الرحلة من قبل الراكب');
      if (res?.trip) {
        setTrip(res.trip);
      }
    } catch (err) {
      setError(err.message || 'تعذر إلغاء الرحلة');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'requested':
        return 'جاري البحث عن أقرب سائق معتمد...';
      case 'accepted':
        return 'تم قبول الرحلة - السائق في طريقه إليك';
      case 'arrived':
        return 'وصل السائق إلى نقطة الالتقاط';
      case 'in_progress':
        return 'الرحلة جارية الآن باتجاه الوجهة';
      case 'completed':
        return 'اكتملت الرحلة بنجاح';
      case 'cancelled':
        return 'تم إلغاء الرحلة';
      default:
        return 'نشطة';
    }
  };

  const getVehicleLabel = (type) => {
    switch (type) {
      case 'economy':
        return 'راحة توفير';
      case 'vip':
        return 'عائلية فاخرة';
      default:
        return 'راحة بلس';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex flex-col items-center justify-center min-h-[420px] space-y-3">
        <div className="w-10 h-10 border-3 border-rahaa-blue border-t-transparent rounded-full animate-spin" />
        <p className="font-cairo font-bold text-sm text-rahaa-navy">
          جاري تحميل خريطة الرحلة وبيانات التتبع...
        </p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-rahaa-card rounded-3xl p-8 border border-rahaa-border text-center space-y-4 shadow-rahaa-card">
          <AlertCircle className="w-12 h-12 text-rahaa-orange mx-auto" />
          <h2 className="font-cairo font-bold text-lg text-rahaa-navy">
            {error || 'لا توجد بيانات رحلة لعرضها على الخريطة'}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/passenger')}
            className="h-11 px-6 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl transition-colors"
          >
            العودة لحجز رحلة جديدة
          </button>
        </div>
      </div>
    );
  }

  const driverName = trip.driver?.name || 'بانتظار تعيين أقرب كابتن';
  const driverPhone = trip.driver?.phone || null;
  const driverPlate = trip.driver?.driver_profile?.vehicle_plate || 'صنعاء';
  const driverModel = trip.driver?.driver_profile?.vehicle_model || getVehicleLabel(trip.vehicle_type);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Top Status Banner */}
      <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rahaa-blue-light text-rahaa-blue flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-cairo font-bold text-lg text-rahaa-navy">
                خريطة تتبع الرحلة المباشرة
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-cairo font-bold bg-rahaa-blue text-white">
                #رحلة-{String(trip.trip_number || trip.id || '').replace(/^[A-Za-z-]+/, '')}
              </span>
            </div>
            <p className="text-xs font-tajawal text-rahaa-text-muted mt-1">
              {getStatusText(trip.status)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={fetchLatestTrip}
            className="h-10 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-rahaa-blue-light text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rahaa-blue" />
            <span>تحديث الموقع</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/passenger')}
            className="h-10 px-4 rounded-xl bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs transition-colors"
          >
            رحلة جديدة
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Map Viewport (7 cols) & Trip Information Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Interactive Map */}
        <div className="lg:col-span-7 bg-rahaa-card rounded-3xl p-5 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="relative w-full h-[460px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 select-none">
            {/* Subtle Map Grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Simulated Roads & Active Route Path */}
            <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 40 340 Q 240 260 420 190 T 680 110" fill="none" stroke="#334155" strokeWidth="10" />
              <path d="M 100 90 L 360 230 L 580 370" fill="none" stroke="#334155" strokeWidth="8" />
              {/* Highlighted Route Line between Pickup and Dropoff */}
              <path
                d="M 160 320 Q 310 230 490 140"
                fill="none"
                stroke="#EE9224"
                strokeWidth="4"
                strokeDasharray="8,6"
              />
            </svg>

            {/* Top Map Telemetry Overlay */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-800/90 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-cairo font-bold">تتبع الموقع المباشر نشط - صنعاء</span>
              </div>
              <div className="font-mono text-amber-400 font-bold">
                الأجرة: {Number(trip.fare || 0).toLocaleString()} ر.ي
              </div>
            </div>

            {/* Map Markers: Passenger Pickup, Driver, and Destination */}
            <div className="relative z-10 flex-1">
              {/* 1. Passenger Pickup Marker */}
              <div className="absolute bottom-14 left-16 sm:left-24 flex flex-col items-center">
                <div className="bg-white text-rahaa-navy font-cairo font-bold text-[11px] px-3 py-1 rounded-full shadow-lg border border-rahaa-border mb-1.5 whitespace-nowrap">
                  موقع الانطلاق: {trip.pickup_name}
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-rahaa-blue/40 animate-ping absolute inset-0" />
                  <div className="w-10 h-10 rounded-full bg-rahaa-blue text-white flex items-center justify-center shadow-xl border-2 border-white relative z-10">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* 2. Driver Live Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-rahaa-orange text-white font-cairo font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
                  {trip.driver ? `الكابتن: ${trip.driver.name}` : 'كابتن راحة القريب'}
                </div>
                <div className="w-10 h-10 rounded-full bg-rahaa-orange text-white flex items-center justify-center shadow-xl border-2 border-white">
                  <Car className="w-5 h-5" />
                </div>
              </div>

              {/* 3. Destination Marker */}
              <div className="absolute top-10 right-12 sm:right-20 flex flex-col items-center">
                <div className="bg-emerald-600 text-white font-cairo font-bold text-[11px] px-3 py-1 rounded-full shadow-lg mb-1.5 whitespace-nowrap">
                  الوجهة: {trip.dropoff_name}
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
                  <Navigation className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Bottom Map Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-800/90 backdrop-blur-xs p-3 rounded-xl border border-slate-700 text-[11px] text-slate-200 font-tajawal">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rahaa-blue inline-block" />
                  موقع المستخدم
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rahaa-orange inline-block" />
                  موقع السائق
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  موقع الوجهة
                </span>
              </div>
              <span className="font-mono text-slate-400">
                {trip.pickup_lat || '15.3547'}, {trip.pickup_lng || '44.2066'}
              </span>
            </div>
          </div>
        </div>

        {/* Trip & Driver Details Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Trip Summary Card */}
          <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy">
                تفاصيل الرحلة المؤكدة
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-cairo font-bold bg-rahaa-blue-light text-rahaa-blue">
                {getVehicleLabel(trip.vehicle_type)}
              </span>
            </div>

            {/* Route Breakdown */}
            <div className="space-y-3 bg-rahaa-bg p-4 rounded-2xl border border-rahaa-border">
              <div className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-rahaa-blue mt-1 shrink-0" />
                <div>
                  <span className="text-[11px] text-rahaa-text-subtle font-cairo block">
                    موقع الانطلاق (المستخدم)
                  </span>
                  <span className="font-cairo font-bold text-sm text-rahaa-navy">
                    {trip.pickup_name}
                  </span>
                </div>
              </div>

              <div className="border-r-2 border-dashed border-rahaa-border mr-1.5 h-4" />

              <div className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full bg-rahaa-emerald mt-1 shrink-0" />
                <div>
                  <span className="text-[11px] text-rahaa-text-subtle font-cairo block">
                    موقع الوجهة
                  </span>
                  <span className="font-cairo font-bold text-sm text-rahaa-navy">
                    {trip.dropoff_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Fare & Payment Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border">
                <span className="text-[11px] text-rahaa-text-subtle font-cairo block">
                  التكلفة الإجمالية
                </span>
                <span className="font-cairo font-bold text-base text-rahaa-blue mt-0.5 block">
                  {Number(trip.fare || 0).toLocaleString()} ر.ي
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border">
                <span className="text-[11px] text-rahaa-text-subtle font-cairo block">
                  طريقة الدفع
                </span>
                <span className="font-cairo font-bold text-sm text-rahaa-navy mt-0.5 block">
                  {trip.payment_method === 'cash' ? 'نقداً (كاش)' : 'محفظة جيب'}
                </span>
              </div>
            </div>

            {/* Passenger & Driver Cards */}
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-rahaa-blue-soft border border-rahaa-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rahaa-blue text-white font-cairo font-bold flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-cairo font-bold text-sm text-rahaa-navy">
                      {driverName}
                    </div>
                    <div className="text-xs text-rahaa-text-muted font-tajawal">
                      {driverModel} • {driverPlate}
                    </div>
                  </div>
                </div>

                {driverPhone && (
                  <a
                    href={`tel:${driverPhone}`}
                    className="h-9 px-3 rounded-xl bg-rahaa-emerald text-white font-cairo font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال</span>
                  </a>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border flex items-center justify-between text-xs">
                <span className="text-rahaa-text-muted font-cairo">بيانات الراكب:</span>
                <span className="font-cairo font-bold text-rahaa-navy">
                  {trip.passenger?.name || currentUser?.name || 'الراكب'}
                </span>
              </div>
            </div>

            {/* Cancel Trip Button (if active) */}
            {['requested', 'accepted', 'arrived'].includes(trip.status) && (
              <button
                type="button"
                onClick={handleCancelTrip}
                disabled={cancelling}
                className="w-full h-11 rounded-xl border border-rahaa-rose/30 bg-rahaa-rose-bg hover:opacity-90 text-rahaa-rose font-cairo font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>{cancelling ? 'جاري إلغاء الرحلة...' : 'إلغاء الرحلة'}</span>
              </button>
            )}

            {/* If completed, prompt rating */}
            {trip.status === 'completed' && (
              <button
                type="button"
                onClick={() => setIsRatingOpen(true)}
                className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-rahaa-sm"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>تقييم الكابتن والرحلة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trip Rating Modal */}
      {trip && (
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          entityType="trip"
          entityId={trip.id}
          title={`تقييم رحلة التاكسي #${trip.trip_number}`}
          onSubmitted={() => {
            alert('شكراً لك، تم حفظ تقييمك للكابتن!');
            navigate('/passenger');
          }}
        />
      )}
    </div>
  );
};

export default PassengerTripMap;

