import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Compass,
  Crosshair,
  Plus,
  Minus,
  Car,
  Bike,
  Shield,
  Phone,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api, getCurrentUser } from '../../services/api';

const SANA_HOTSPOTS = [
  { name: 'شارع حدة - أمام سيتي ماكس', x: 38, y: 55 },
  { name: 'ميدان السبعين - جامع الصالح', x: 55, y: 62 },
  { name: 'شارع الزبيري - جولة كنتاكي', x: 42, y: 40 },
  { name: 'جامعة صنعاء - البوابة الشرقية', x: 32, y: 32 },
  { name: 'شارع الستين الجنوبي - فندق موفنبيك', x: 62, y: 48 },
  { name: 'مطار صنعاء الدولي', x: 70, y: 18 },
  { name: 'حي الأصبحي - بريد الأصبحي', x: 48, y: 72 },
];

export const HomeLiveTrackingMap = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Location States
  const [userLocation, setUserLocation] = useState('شارع حدة - أمانة العاصمة');
  const [userCoords, setUserCoords] = useState({ x: 40, y: 56 });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  // Map Controls State
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, 1.15 = zoom in, 0.85 = zoom out

  // Active Trip State
  const [activeTrip, setActiveTrip] = useState(null);
  const [driverPos, setDriverPos] = useState({ x: 30, y: 45 });
  const [simulatedNearbyCaptains, setSimulatedNearbyCaptains] = useState([
    { id: 'c1', type: 'taxi', name: 'كابتن أحمد (كامري)', eta: '3 دقائق', x: 34, y: 50, angle: 45 },
    { id: 'c2', type: 'vip', name: 'كابتن سامي (لاندكروزر)', eta: '6 دقائق', x: 48, y: 62, angle: 120 },
    { id: 'c3', type: 'moto', name: 'كابتن عصام (دراجة سريعة)', eta: 'دقيقتان', x: 44, y: 48, angle: -30 },
  ]);

  // Fetch active trip from API
  const fetchActiveTrip = async () => {
    try {
      const res = await api.getMyTrips();
      const trips = res?.trips?.data || [];
      const current = trips.find((t) =>
        ['requested', 'accepted', 'arrived', 'in_progress'].includes(t.status)
      );
      if (current) {
        setActiveTrip(current);
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      // Keep silent to avoid interrupting user map experience
    }
  };

  useEffect(() => {
    fetchActiveTrip();
    const interval = setInterval(fetchActiveTrip, 5000);
    return () => clearInterval(interval);
  }, []);

  // Driver Real-time movement simulation when trip is active
  useEffect(() => {
    if (!activeTrip) return;

    const moveInterval = setInterval(() => {
      setDriverPos((prev) => {
        // Move gradually towards user coordinates
        const targetX = userCoords.x;
        const targetY = userCoords.y;
        const deltaX = (targetX - prev.x) * 0.08;
        const deltaY = (targetY - prev.y) * 0.08;

        if (Math.abs(deltaX) < 0.2 && Math.abs(deltaY) < 0.2) {
          return { x: targetX, y: targetY };
        }
        return { x: prev.x + deltaX, y: prev.y + deltaY };
      });
    }, 1500);

    return () => clearInterval(moveInterval);
  }, [activeTrip, userCoords]);

  // Subtle patrol animation for nearby captains when NO trip is active
  useEffect(() => {
    if (activeTrip) return;

    const patrolInterval = setInterval(() => {
      setSimulatedNearbyCaptains((prev) =>
        prev.map((c) => ({
          ...c,
          x: c.x + (Math.random() * 0.8 - 0.4),
          y: c.y + (Math.random() * 0.8 - 0.4),
        }))
      );
    }, 2500);

    return () => clearInterval(patrolInterval);
  }, [activeTrip]);

  // Handle GPS detection
  const handleDetectGps = () => {
    setIsGpsLoading(true);
    setGpsError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsLoading(false);
          setUserLocation('موقعي الحالي المباشر - أمانة العاصمة');
          setUserCoords({ x: 42, y: 52 });
          setZoomLevel(1.1);
        },
        (err) => {
          setIsGpsLoading(false);
          setGpsError('تعذر تحديد الموقع تلقائياً. يمكنك تحديده يدوياً');
          setUserLocation('شارع حدة - أمانة العاصمة');
        },
        { timeout: 6000 }
      );
    } else {
      setIsGpsLoading(false);
      setGpsError('المتصفح لا يدعم تحديد الموقع المباشر');
    }
  };

  const handleSelectHotspot = (spot) => {
    setUserLocation(spot.name);
    setUserCoords({ x: spot.x, y: spot.y });
    setShowManualModal(false);
    setGpsError(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return { text: 'جاري البحث عن كابتن...', color: 'bg-amber-500 text-white' };
      case 'accepted':
        return { text: 'تم قبول الرحلة - الكابتن في الطريق', color: 'bg-blue-600 text-white' };
      case 'arrived':
        return { text: 'وصل الكابتن إلى موقعك', color: 'bg-emerald-600 text-white' };
      case 'in_progress':
        return { text: 'الرحلة جارية الآن', color: 'bg-indigo-600 text-white' };
      default:
        return { text: 'رحلة نشطة', color: 'bg-rahaa-primary text-white' };
    }
  };

  return (
    <section className="w-full font-tajawal animate-fadeIn" dir="rtl">
      {/* Map Outer Card */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-rahaa-card relative">
        {/* Stylized Modern Sana'a Dark Vector Map Grid */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20px 20px, rgba(56,189,248,0.25) 1.5px, transparent 0%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Vector Arterial Roads of Sana'a */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none transition-transform duration-500 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Main Ring Road / Al-Sitteen */}
          <ellipse cx="50" cy="50" rx="38" ry="34" fill="none" stroke="#334155" strokeWidth="2.5" />
          {/* Al-Zubairi St (East-West Arterial) */}
          <path d="M 5 42 Q 50 40 95 43" fill="none" stroke="#475569" strokeWidth="2.2" />
          {/* Hadda St (South Arterial) */}
          <path d="M 45 42 L 35 90" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeOpacity="0.7" />
          {/* Airport Rd (North Arterial) */}
          <path d="M 52 40 L 72 8" fill="none" stroke="#475569" strokeWidth="2" />
          {/* Taiz St */}
          <path d="M 55 45 L 75 92" fill="none" stroke="#334155" strokeWidth="1.8" />

          {/* Active Trip Route Line if Trip is Active */}
          {activeTrip && (
            <path
              d={`M ${driverPos.x} ${driverPos.y} Q ${(driverPos.x + userCoords.x) / 2} ${(driverPos.y + userCoords.y) / 2 - 5} ${userCoords.x} ${userCoords.y}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Top Header / Telemetry Bar on Map */}
        <div className="relative z-20 p-3 sm:p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          {/* Left: Status / Active Trip Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700 text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cairo font-bold text-xs sm:text-sm text-white">
                  خريطة التتبع المباشر - أمانة العاصمة
                </span>
                {activeTrip ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(activeTrip.status).color}`}>
                    {getStatusBadge(activeTrip.status).text}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    تحديد الموقع متصل
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5 truncate max-w-xs sm:max-w-md">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{userLocation}</span>
              </p>
            </div>
          </div>

          {/* Right: GPS and Manual Location Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isGpsLoading}
              className="h-8 px-3 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 font-cairo font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs"
              title="تحديد موقعي المباشر"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'جاري التحديد...' : 'تحديد موقعي'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="h-8 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-cairo font-semibold text-[11px] transition-all"
            >
              تغيير يدوياً
            </button>
          </div>
        </div>

        {/* GPS Error Notification if Denied */}
        {gpsError && (
          <div className="relative z-20 mx-3 sm:mx-4 mb-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{gpsError}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-900 font-bold text-[10px]"
            >
              اختر معلماً
            </button>
          </div>
        )}

        {/* Central Map Canvas Area */}
        <div className="relative h-[280px] sm:h-[320px] md:h-[350px] w-full overflow-hidden select-none">
          {/* Zoom Wrapper */}
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* 1. Passenger Location Marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 z-10"
              style={{ left: `${userCoords.x}%`, top: `${userCoords.y}%` }}
            >
              <div className="bg-white/95 backdrop-blur-xs text-rahaa-navy font-cairo font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-slate-200 whitespace-nowrap mb-1">
                موقعي الحالي
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-sky-500/30 animate-ping absolute inset-0" />
                <div className="w-8 h-8 rounded-full bg-rahaa-primary text-white flex items-center justify-center shadow-xl border-2 border-white relative z-10">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 2. When Trip IS Active: Show Driver Live Moving Marker */}
            {activeTrip ? (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 z-20"
                style={{ left: `${driverPos.x}%`, top: `${driverPos.y}%` }}
              >
                <div className="bg-sky-600 text-white font-cairo font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border border-sky-400 whitespace-nowrap mb-1 animate-pulse">
                  الكابتن: {activeTrip.driver?.name || 'كابتن راحة'} ({activeTrip.driver?.driver_profile?.vehicle_plate || 'صنعاء'})
                </div>
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-2xl border-2 border-white">
                  <Car className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            ) : (
              /* 3. When NO Trip is Active: Show Simulated Nearby Rahah Captains */
              simulatedNearbyCaptains.map((captain) => (
                <div
                  key={captain.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 z-10 opacity-90 hover:opacity-100"
                  style={{ left: `${captain.x}%`, top: `${captain.y}%` }}
                >
                  <div className="bg-slate-800/90 text-sky-300 font-cairo font-bold text-[9px] px-2 py-0.5 rounded-md shadow-xs border border-slate-700 whitespace-nowrap mb-0.5 hidden sm:block">
                    {captain.name} • {captain.eta}
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-sky-400 border border-sky-400/50 flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    {captain.type === 'moto' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Floating Map Zoom Controls */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
              title="تكبير الخريطة"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
              title="تصغير الخريطة"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Active Trip Live Footer Card (If Trip is Active) */}
          {activeTrip && (
            <div className="absolute bottom-3 right-3 left-16 sm:left-auto sm:w-96 z-20 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-sky-500/40 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-cairo font-bold text-xs text-white">رحلتك قيد التنفيذ المباشر</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-sky-400">
                  {Number(activeTrip.fare || 0).toLocaleString()} ر.ي
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-300 block font-semibold text-[11px]">
                    الكابتن: {activeTrip.driver?.name || 'كابتن راحة'}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {activeTrip.pickup_name} ← {activeTrip.dropoff_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/passenger/map/${activeTrip.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-cairo font-bold text-[11px] flex items-center gap-1 shadow-md transition-all shrink-0"
                >
                  <span>تتبع كامل</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map Bottom Status Bar */}
        <div className="relative z-20 bg-slate-950/90 border-t border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>كباتن راحة متاحون بالقرب منك وجاهزون للطلب الفوري في شوارع صنعاء.</span>
          </div>
          <span className="text-[11px] text-slate-400">
            اختر وسيلة النقل المناسبة أدناه لبدء رحلتك
          </span>
        </div>
      </div>

      {/* Manual Location Selection Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rahaa-border max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border mb-3">
              <div>
                <h3 className="font-cairo font-bold text-base text-rahaa-navy">
                  تحديد موقع الانطلاق يدوياً
                </h3>
                <span className="text-xs text-rahaa-text-subtle">
                  اختر أحد معالم أمانة العاصمة لتثبيت موقعك
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Landmarks List */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {SANA_HOTSPOTS.map((spot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectHotspot(spot)}
                  className="w-full p-3 rounded-xl border border-rahaa-border hover:border-rahaa-primary hover:bg-blue-50/60 text-right transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rahaa-primary shrink-0" />
                    <span className="font-semibold text-rahaa-navy">{spot.name}</span>
                  </div>
                  <span className="text-[10px] text-rahaa-primary font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                    تثبيت
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="mt-4 w-full h-10 rounded-xl border border-rahaa-border text-slate-600 hover:bg-gray-50 font-cairo font-bold text-xs"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeLiveTrackingMap;

