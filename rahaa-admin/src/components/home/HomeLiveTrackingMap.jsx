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
import { RahahGoogleMap } from '../maps/RahahGoogleMap';

const SANA_HOTSPOTS = [
  { name: 'شارع حدة - أمام سيتي ماكس', lat: 15.328, lng: 44.185 },
  { name: 'ميدان السبعين - جامع الصالح', lat: 15.325, lng: 44.208 },
  { name: 'شارع الزبيري - جولة كنتاكي', lat: 15.352, lng: 44.195 },
  { name: 'جامعة صنعاء - البوابة الشرقية', lat: 15.372, lng: 44.182 },
  { name: 'شارع الستين الجنوبي - فندق موفنبيك', lat: 15.341, lng: 44.221 },
  { name: 'مطار صنعاء الدولي', lat: 15.476, lng: 44.219 },
  { name: 'حي الأصبحي - بريد الأصبحي', lat: 15.312, lng: 44.215 },
];

export const HomeLiveTrackingMap = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Location States (real GPS lat/lng)
  const [userLocation, setUserLocation] = useState('شارع حدة - أمانة العاصمة');
  const [userCoords, setUserCoords] = useState({ lat: 15.3547, lng: 44.2066 });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  // Active Trip State
  const [activeTrip, setActiveTrip] = useState(null);

  // Fetch active trip from API (single source of truth)
  const fetchActiveTrip = async () => {
    try {
      const res = await api.getActiveTrip();
      if (res?.active_trip) {
        setActiveTrip(res.active_trip);
      } else {
        setActiveTrip(null);
      }
    } catch {
      // Keep silent to avoid interrupting user map experience
    }
  };

  useEffect(() => {
    fetchActiveTrip();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchActiveTrip();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle GPS detection
  const handleDetectGps = () => {
    setIsGpsLoading(true);
    setGpsError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsLoading(false);
          setUserLocation('موقعي الحالي المباشر - أمانة العاصمة');
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setIsGpsLoading(false);
          if (err.code === 1) {
            setGpsError('تم رفض إذن الموقع. يرجى السماح بصلاحية الموقع أو اختياره يدوياً');
          } else {
            setGpsError('تعذر تحديد الموقع تلقائياً. يمكنك تحديده يدوياً');
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsGpsLoading(false);
      setGpsError('المتصفح لا يدعم تحديد الموقع المباشر');
    }
  };

  const handleSelectHotspot = (spot) => {
    setUserLocation(spot.name);
    setUserCoords({ lat: spot.lat, lng: spot.lng });
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

        {/* Official Google Maps Canvas Area */}
        <div className="relative w-full">
          <RahahGoogleMap
            heightClass="h-[300px] sm:h-[340px] md:h-[370px]"
            className="rounded-none border-0"
            showRoute={Boolean(activeTrip)}
            showGpsButton={true}
            pickup={
              activeTrip
                ? {
                    lat: Number(activeTrip.pickup_lat || userCoords.lat),
                    lng: Number(activeTrip.pickup_lng || userCoords.lng),
                    label: `موقع الانطلاق: ${activeTrip.pickup_name || userLocation}`,
                  }
                : {
                    lat: userCoords.lat,
                    lng: userCoords.lng,
                    label: `موقعي الحالي: ${userLocation}`,
                  }
            }
            dropoff={
              activeTrip
                ? {
                    lat: Number(activeTrip.dropoff_lat || 15.3694),
                    lng: Number(activeTrip.dropoff_lng || 44.191),
                    label: `الوجهة: ${activeTrip.dropoff_name || ''}`,
                  }
                : null
            }
            driver={
              activeTrip?.driver_id &&
              (activeTrip.driver_lat || activeTrip.driver?.driver_profile?.current_lat)
                ? {
                    lat: Number(activeTrip.driver_lat || activeTrip.driver?.driver_profile?.current_lat),
                    lng: Number(activeTrip.driver_lng || activeTrip.driver?.driver_profile?.current_lng),
                    label: `الكابتن: ${activeTrip.driver?.name || 'كابتن راحة'}`,
                  }
                : null
            }
            onGpsLocated={({ lat, lng, address }) => {
              setUserCoords({ lat, lng });
              setUserLocation(address || 'موقعي الحالي المباشر - أمانة العاصمة');
              setGpsError(null);
            }}
          />

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

