import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Car,
  Phone,
  AlertTriangle,
  Radio,
  Clock,
  Gauge,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export const LiveTripMapCard = ({ selectedTrip }) => {
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fallback trip if none selected
  const trip = selectedTrip || {
    id: '#رحلة-٩٠٢٥',
    rider: { name: 'سارة منصور', phone: '٧٧١٢٣٤٥٦٧' },
    driver: { name: 'سعيد عبده', phone: '٧٧٣٩٨٧٦٥٤', rating: '٤.٩', car: 'تويوتا كورولا ٢٠٢٢' },
    route: { from: 'شارع حدة (أمام الحداء مول)', to: 'جامعة صنعاء (البوابة الجديدة)' },
    fare: '٢٬٢٠٠ ر.ي',
    status: 'قيد التنفيذ',
    vehicleType: 'راحة بلس',
    speed: '٤٢ كم/س',
    eta: '١٢ دقيقة',
    distance: '٣.٨ كم',
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-full" dir="rtl">
      {/* Top Header Bar: Title on the Right, Status on the Left */}
      <div className="p-4 border-b border-[#C3C5D7]/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <h3 className="font-cairo font-bold text-base text-[#151C27] text-right">
          موقع الرحلة المختارة
        </h3>

        <div className="flex items-center gap-2">
          {trip.status === 'قيد التنفيذ' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-tajawal font-bold bg-purple-100 text-purple-700 border border-purple-300/50">
              <Radio className="w-3.5 h-3.5 animate-pulse text-purple-600" />
              مباشر
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-tajawal font-bold bg-gray-100 text-gray-700 border border-gray-300/50">
              مكتمل/سابق
            </span>
          )}
          <span className="font-cairo font-bold text-xs text-[#003FB1] bg-blue-100 px-2 py-0.5 rounded">
            {trip.id}
          </span>
        </div>
      </div>

      {/* Simulated Live Sana'a Map Area */}
      <div className="relative h-64 bg-[#E4E9F2] overflow-hidden border-b border-[#E5E7EB]">
        {/* Map Grid Pattern / Street Lines Simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="0.8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Main Simulated Roads (Sana'a Streets) */}
          <path d="M-10 120 Q 150 180 320 80 T 500 220" fill="none" stroke="#CBD5E1" strokeWidth="14" />
          <path d="M-10 120 Q 150 180 320 80 T 500 220" fill="none" stroke="#FFFFFF" strokeWidth="10" />

          <path d="M 100 -20 Q 180 140 220 300" fill="none" stroke="#CBD5E1" strokeWidth="12" />
          <path d="M 100 -20 Q 180 140 220 300" fill="none" stroke="#FFFFFF" strokeWidth="8" />

          {/* Active Trip Route Line */}
          <path
            d="M 60 180 C 120 140, 200 160, 260 90"
            fill="none"
            stroke="#003FB1"
            strokeWidth="4"
            strokeDasharray="6 4"
            className="animate-[dash_1.5s_linear_infinite]"
          />
        </svg>

        {/* Departure Marker (Origin) */}
        <div className="absolute top-[170px] right-[60px] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-emerald-600 text-white text-[10px] font-tajawal font-bold px-2 py-0.5 rounded shadow-sm mb-1">
            البداية: {trip.route.from.split(' ')[0]}
          </div>
          <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute top-[80px] left-[60px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-purple-700 text-white text-[10px] font-tajawal font-bold px-2 py-0.5 rounded shadow-sm mb-1">
            الوجهة: {trip.route.to.split(' ')[0]}
          </div>
          <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Live Car Position Marker (Animated Pulse) */}
        {trip.status === 'قيد التنفيذ' && (
          <div className="absolute top-[130px] right-[160px] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-1000">
            <div className="bg-[#003FB1] text-white text-[10px] font-cairo font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1 mb-1">
              <Car className="w-3 h-3 text-emerald-400" />
              <span>{trip.speed || '42 كم/س'}</span>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-blue-600/30 animate-ping absolute inset-0"></div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#003FB1] to-purple-600 text-white border-2 border-white shadow-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 transform rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* Floating Live Telemetry Pill */}
        <div className="absolute bottom-3 right-3 left-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-white/60 shadow-lg flex items-center justify-around text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-tajawal text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              الوقت المتبقي
            </span>
            <span className="font-cairo font-bold text-xs text-rahaa-navy">
              {trip.eta || '12 دقيقة'}
            </span>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-tajawal text-gray-500 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-purple-600" />
              السرعة الحالية
            </span>
            <span className="font-cairo font-bold text-xs text-rahaa-navy">
              {trip.speed || '42 كم/س'}
            </span>
          </div>

          <div className="w-px h-6 bg-gray-300"></div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-tajawal text-gray-500 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-600" />
              المسافة
            </span>
            <span className="font-cairo font-bold text-xs text-rahaa-navy">
              {trip.distance || '3.8 كم'}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Trip Detail Cards & Actions */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Route Details Box: Starts from the Right */}
        <div className="bg-[#F0F3FF]/60 p-3.5 rounded-xl border border-[#C3C5D7]/40 text-right space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-cairo font-semibold text-xs text-[#434654]">
              تفاصيل المسار
            </span>
            <span className="font-cairo font-bold text-sm text-[#003FB1]">
              {trip.fare}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-tajawal pt-1 text-right">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
              <span className="text-[#151C27] font-medium">{trip.route.from}</span>
            </div>
            <div className="w-0.5 h-3 bg-gray-300 mr-1"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></div>
              <span className="text-[#151C27] font-medium">{trip.route.to}</span>
            </div>
          </div>
        </div>

        {/* Driver & Passenger Mini Profile */}
        <div className="grid grid-cols-2 gap-3 text-right">
          {/* Driver */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-col justify-between">
            <span className="text-[11px] font-tajawal text-rahaa-text-muted">السائق</span>
            <span className="font-cairo font-bold text-sm text-[#151C27] mt-0.5">
              {trip.driver.name}
            </span>
            <span className="text-[10px] font-tajawal text-gray-500">
              {trip.driver.car || 'تويوتا كورولا'}
            </span>
          </div>

          {/* Rider */}
          <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-col justify-between">
            <span className="text-[11px] font-tajawal text-rahaa-text-muted">الراكب</span>
            <span className="font-cairo font-bold text-sm text-[#151C27] mt-0.5">
              {trip.rider.name}
            </span>
            <span className="text-[10px] font-tajawal text-gray-500">
              {trip.rider.phone || '+967 771234567'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => alert(`جاري الاتصال بالسائق ${trip.driver.name}...`)}
            className="bg-[#003FB1] hover:bg-[#003390] text-white py-2.5 px-3 rounded-xl font-cairo font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            الاتصال بالسائق
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            disabled={trip.status !== 'قيد التنفيذ'}
            className={`py-2.5 px-3 rounded-xl font-cairo font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border ${
              trip.status === 'قيد التنفيذ'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            إلغاء الرحلة
          </button>
        </div>
      </div>

      {/* Cancel Trip Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right space-y-4 border border-rahaa-border shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
                تأكيد إلغاء الرحلة ({trip.id})
              </h3>
            </div>

            <p className="font-tajawal text-sm text-rahaa-text-muted">
              هل أنت تأكد من إعطاء أمر لإلغاء هذه الرحلة الجارية؟ سيتم إشعار السائق والراكب فوراً.
            </p>

            <div>
              <label className="block font-tajawal text-xs text-rahaa-navy mb-1 font-semibold">
                سبب الإلغاء
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="اكتب سبب إلغاء الرحلة (مثال: طلب الراكب، عطل فني...)"
                rows={3}
                className="w-full p-2.5 border border-rahaa-border rounded-xl text-sm font-tajawal focus:outline-none focus:border-rahaa-blue"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-cairo font-semibold text-xs rounded-xl"
              >
                تراجع
              </button>              <button
                onClick={() => {
                  alert(`تم إلغاء الرحلة ${trip.id} بنجاح`);
                  setShowCancelModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-cairo font-semibold text-xs rounded-xl shadow-sm"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
