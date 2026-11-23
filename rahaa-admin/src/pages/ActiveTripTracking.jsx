import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Navigation,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Shield,
  Car,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { RahahGoogleMap } from '../components/maps/RahahGoogleMap';

export const ActiveTripTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedTrip = location.state?.trip || null;
  const [trip, setTrip] = useState(passedTrip);
  const normalizeStage = (status) => {
    if (['accepted', 'driver_arriving', 'arrived', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return status;
    }
    return 'accepted';
  };
  const [tripStage, setTripStage] = useState(normalizeStage(passedTrip?.status));
  const [tripDurationSeconds, setTripDurationSeconds] = useState(120);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [stageError, setStageError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'rider', text: 'أهلاً كابتن، أنا في موقع الالتقاط المحدد', time: 'الآن' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [driverCoords, setDriverCoords] = useState({
    lat: Number(passedTrip?.driver_lat || 15.349),
    lng: Number(passedTrip?.driver_lng || 44.201),
  });
  const [routeMeta, setRouteMeta] = useState({ distanceText: '4.2 كم', durationText: '' });
  const lastSyncRef = useRef(0);

  // Broadcast driver's real GPS coordinates to backend while trip is active
  useEffect(() => {
    if (tripStage === 'completed' || !('geolocation' in navigator)) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDriverCoords({ lat, lng });

        const now = Date.now();
        if (trip?.id && now - lastSyncRef.current >= 4000) {
          lastSyncRef.current = now;
          api.updateTripDriverLocation(trip.id, lat, lng).catch(() => {});
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [trip?.id, tripStage]);

  useEffect(() => {
    if (!passedTrip) {
      api
        .getMyTrips()
        .then((res) => {
          const list = res?.trips?.data || [];
          const activeFirst =
            list.find((t) => ['accepted', 'driver_arriving', 'arrived', 'in_progress'].includes(t.status)) ||
            list[0];
          if (activeFirst) {
            setTrip(activeFirst);
            setTripStage(normalizeStage(activeFirst.status));
          }
        })
        .catch(() => {});
    }
  }, [passedTrip]);

  useEffect(() => {
    if (tripStage === 'completed') return;
    const timer = setInterval(() => {
      setTripDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [tripStage]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const tripDetails = {
    dbId: trip?.id || null,
    id: trip?.trip_number ? `#رحلة-${String(trip.trip_number).replace(/^[A-Za-z-]+/, '')}` : '#رحلة-١٠٠١',
    riderName: trip?.passenger?.name || 'محمد أحمد الصنعاني',
    riderPhone: trip?.passenger?.phone || '٧٧١٢٣٤٥٦٧',
    pickup: trip?.pickup_name || 'شارع حدة - جولة الرويشان',
    dropoff: trip?.dropoff_name || 'شارع الستين الجنوبي - فندق موفنبيك',
    paymentMethod: trip?.payment_method === 'cash' ? 'نقداً عند الوصول' : 'محفظة جيب',
    totalFare: `${Number(trip?.fare || 2400).toLocaleString('ar-YE')} ر.ي`,
  };

  const handleNextStage = async () => {
    if (updatingStage) return;
    setStageError('');

    // Strict sequential 7-state progression:
    // accepted -> driver_arriving -> arrived -> in_progress -> completed
    let nextStage = null;
    if (tripStage === 'accepted') nextStage = 'driver_arriving';
    else if (tripStage === 'driver_arriving') nextStage = 'arrived';
    else if (tripStage === 'arrived') nextStage = 'in_progress';
    else if (tripStage === 'in_progress') nextStage = 'completed';

    if (!nextStage) return;

    if (tripDetails.dbId) {
      setUpdatingStage(true);
      try {
        const res = await api.updateTripStatus(tripDetails.dbId, nextStage);
        if (res?.trip) setTrip(res.trip);
        setTripStage(nextStage);
      } catch (err) {
        setStageError(err.message || 'تعذر تحديث حالة الرحلة في الخادم');
      } finally {
        setUpdatingStage(false);
      }
    } else {
      setTripStage(nextStage);
    }
  };

  const handleConfirmPayment = async () => {
    if (!tripDetails.dbId || confirmingPayment) return;
    setConfirmingPayment(true);
    setStageError('');
    setPaymentMessage('');
    try {
      const res = await api.confirmTripPayment(tripDetails.dbId, 'paid');
      if (res?.trip) setTrip(res.trip);
      setPaymentMessage(res?.message || 'تم تأكيد استلام المبلغ وتسجيل الدفع بنجاح');
    } catch (err) {
      setStageError(err.message || 'تعذر تأكيد استلام الدفع');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'driver', text: newMessage.trim(), time: 'الآن' },
    ]);
    setNewMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Top Cockpit Header */}
      <div className="bg-rahaa-card rounded-3xl p-5 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rahaa-blue-light text-rahaa-blue flex items-center justify-center font-cairo font-bold">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cairo font-bold text-base text-rahaa-navy">
                خريطة تتبع الرحلة النشطة
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-cairo font-bold bg-rahaa-emerald-bg text-rahaa-emerald">
                {tripStage === 'accepted' && 'تم قبول الطلب — جاهز للتحرك'}
                {tripStage === 'driver_arriving' && 'في الطريق لنقطة الالتقاط'}
                {tripStage === 'arrived' && 'تم الوصول لموقع الراكب'}
                {tripStage === 'in_progress' && 'الرحلة جارية نحو الوجهة'}
                {tripStage === 'completed' && 'اكتملت الرحلة'}
              </span>
            </div>
            <span className="text-xs text-rahaa-text-muted font-mono">
              رقم المشوار: {tripDetails.id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('تم إرسال تنبيه طوارئ لغرفة عمليات راحة في صنعاء')}
          className="h-10 px-4 rounded-xl bg-rahaa-rose-bg text-rahaa-rose border border-rahaa-rose/30 text-xs font-cairo font-bold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <Shield className="w-4 h-4" />
          <span>نداء طوارئ عاجل</span>
        </button>
      </div>

      {stageError && (
        <div className="p-3.5 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{stageError}</span>
        </div>
      )}

      {/* Main HUD & Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Official Google Maps Driver Navigation Cockpit */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="bg-slate-800/90 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rahaa-blue text-white flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-rahaa-orange font-cairo block">
                  التوجيه الملاحي المباشر (Google Maps)
                </span>
                <span className="text-sm font-cairo font-bold text-white truncate block">
                  {tripStage === 'accepted' && `جاهز للتوجه إلى: ${tripDetails.pickup}`}
                  {tripStage === 'driver_arriving' && `مسار الوصول إلى الراكب: ${tripDetails.pickup}`}
                  {tripStage === 'arrived' && 'أنت في موقع الالتقاط، بانتظار الراكب'}
                  {tripStage === 'in_progress' && `مسار الرحلة إلى الوجهة: ${tripDetails.dropoff}`}
                  {tripStage === 'completed' && 'وصلت إلى الوجهة المحددة وتم إيقاف التتبع'}
                </span>
              </div>
            </div>
            <div className="text-right font-tajawal font-bold text-xs text-sky-300 shrink-0">
              {routeMeta.durationText || 'مباشر'}
            </div>
          </div>

          <RahahGoogleMap
            heightClass="h-[320px] sm:h-[380px]"
            showRoute={tripStage !== 'completed' && tripStage !== 'cancelled'}
            showGpsButton={tripStage !== 'completed'}
            pickup={{
              lat: Number(trip?.pickup_lat || 15.3547),
              lng: Number(trip?.pickup_lng || 44.2066),
              label: `موقع الراكب: ${tripDetails.pickup}`,
            }}
            dropoff={{
              lat: Number(trip?.dropoff_lat || 15.3694),
              lng: Number(trip?.dropoff_lng || 44.191),
              label: `الوجهة: ${tripDetails.dropoff}`,
            }}
            driver={
              tripStage !== 'completed'
                ? {
                    lat: driverCoords.lat,
                    lng: driverCoords.lng,
                    label: 'موقعك الحالي (الكابتن)',
                  }
                : null
            }
            routeOrigin={
              ['accepted', 'driver_arriving', 'arrived'].includes(tripStage)
                ? { lat: driverCoords.lat, lng: driverCoords.lng }
                : { lat: Number(trip?.pickup_lat || 15.3547), lng: Number(trip?.pickup_lng || 44.2066) }
            }
            routeDestination={
              ['accepted', 'driver_arriving', 'arrived'].includes(tripStage)
                ? { lat: Number(trip?.pickup_lat || 15.3547), lng: Number(trip?.pickup_lng || 44.2066) }
                : { lat: Number(trip?.dropoff_lat || 15.3694), lng: Number(trip?.dropoff_lng || 44.191) }
            }
            onGpsLocated={({ lat, lng }) => {
              setDriverCoords({ lat, lng });
              if (trip?.id && tripStage !== 'completed') {
                api.updateTripDriverLocation(trip.id, lat, lng).catch(() => {});
              }
            }}
            onRouteCalculated={(meta) => {
              if (meta?.distanceText) setRouteMeta(meta);
            }}
          />

          <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center z-10">
            <div>
              <span className="text-[11px] text-slate-400 font-cairo block">المدة</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {formatTimer(tripDurationSeconds)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-cairo block">المسافة</span>
              <span className="text-sm font-mono font-bold text-white">
                {routeMeta.distanceText || '4.2 كم'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-cairo block">الأجرة</span>
              <span className="text-sm font-cairo font-bold text-amber-400">
                {tripDetails.totalFare}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Passenger Details & Trip Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-rahaa-card rounded-3xl p-5 border border-rahaa-border shadow-rahaa-card space-y-4">
            <h3 className="text-xs font-cairo font-bold text-rahaa-text-muted uppercase tracking-wider pb-2 border-b border-rahaa-border">
              بيانات الراكب والمسار
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rahaa-blue text-white font-cairo font-bold text-base flex items-center justify-center">
                  {tripDetails.riderName[0]}
                </div>
                <div>
                  <div className="font-cairo font-bold text-sm text-rahaa-navy">
                    {tripDetails.riderName}
                  </div>
                  <div className="text-xs text-rahaa-text-muted font-tajawal">
                    طريقة الدفع: {tripDetails.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${tripDetails.riderPhone}`}
                  className="p-2.5 rounded-xl bg-rahaa-emerald-bg text-rahaa-emerald transition-colors"
                  title="اتصال بالراكب"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="p-2.5 rounded-xl bg-rahaa-blue-light text-rahaa-blue transition-colors"
                  title="محادثة الراكب"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-rahaa-bg p-3.5 rounded-2xl border border-rahaa-border text-xs">
              <div className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rahaa-emerald mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-rahaa-text-subtle font-cairo block">موقع الالتقاط</span>
                  <span className="font-cairo font-bold text-rahaa-navy">{tripDetails.pickup}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rahaa-orange mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-rahaa-text-subtle font-cairo block">وجهة النزول</span>
                  <span className="font-cairo font-bold text-rahaa-navy">{tripDetails.dropoff}</span>
                </div>
              </div>
            </div>
          </div>

          {isChatOpen && (
            <div className="bg-rahaa-card rounded-3xl p-4 border border-rahaa-border shadow-rahaa-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rahaa-border text-xs font-cairo font-bold text-rahaa-navy">
                <span>محادثة سريعة مع الراكب</span>
                <button onClick={() => setIsChatOpen(false)} className="text-rahaa-text-subtle hover:text-rahaa-navy">×</button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 p-1 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl max-w-[85%] font-tajawal ${
                      msg.sender === 'driver'
                        ? 'bg-rahaa-blue text-white mr-auto text-right'
                        : 'bg-rahaa-bg text-rahaa-navy ml-auto text-right'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <span className="text-[9px] opacity-70 block mt-0.5">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالة للراكب..."
                  className="flex-1 h-10 px-3 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs focus:outline-none focus:border-rahaa-blue"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-rahaa-blue text-white rounded-xl text-xs font-cairo font-bold"
                >
                  إرسال
                </button>
              </form>
            </div>
          )}

          <div className="bg-rahaa-card rounded-3xl p-5 border border-rahaa-border shadow-rahaa-card space-y-3">
            {tripStage === 'completed' ? (
              <div className="text-center space-y-3 py-2">
                <div className="w-12 h-12 rounded-full bg-rahaa-emerald-bg text-rahaa-emerald flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-cairo font-bold text-base text-rahaa-navy">
                  تم إنهاء الرحلة بنجاح
                </h4>
                <div className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs space-y-1 text-right">
                  <div className="flex justify-between">
                    <span className="text-rahaa-text-subtle">المبلغ النهائي:</span>
                    <span className="font-cairo font-black text-rahaa-navy">
                      {Number(trip?.final_fare ?? trip?.fare ?? 0).toLocaleString()} ر.ي
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rahaa-text-subtle">طريقة الدفع:</span>
                    <span className="font-bold text-rahaa-navy">{tripDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rahaa-text-subtle">حالة الدفع:</span>
                    <span className={`font-bold ${trip?.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {trip?.payment_status === 'paid'
                        ? 'مدفوعة ومؤكدة ✓'
                        : trip?.payment_status === 'failed'
                        ? 'فشل الدفع'
                        : 'بانتظار تأكيد الدفع'}
                    </span>
                  </div>
                </div>

                {paymentMessage && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                    {paymentMessage}
                  </p>
                )}

                {trip?.payment_status !== 'paid' && tripDetails.dbId && (
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-60"
                  >
                    {confirmingPayment
                      ? 'جاري تسجيل الدفع...'
                      : trip?.payment_method === 'cash'
                      ? `تأكيد استلام المبلغ النقدي (${Number(trip?.final_fare ?? trip?.fare ?? 0).toLocaleString()} ر.ي)`
                      : 'تأكيد استلام الدفع'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/driver')}
                  className="w-full h-11 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  العودة للرئيسية واستقبال طلبات جديدة
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNextStage}
                disabled={updatingStage}
                className="w-full h-12 px-4 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {updatingStage
                    ? 'جاري التحديث...'
                    : tripStage === 'accepted'
                    ? 'في الطريق إلى الراكب'
                    : tripStage === 'driver_arriving'
                    ? 'تأكيد الوصول لموقع الراكب'
                    : tripStage === 'arrived'
                    ? 'بدء الرحلة الآن'
                    : `إنهاء الرحلة (${tripDetails.totalFare})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
