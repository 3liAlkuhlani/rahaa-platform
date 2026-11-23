import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Crosshair,
  Car,
  Key,
  Truck,
  Bike
} from 'lucide-react';
import { ServiceWorkflowStepper } from '../components/transport/ServiceWorkflowStepper';
import { RahahGoogleMap } from '../components/maps/RahahGoogleMap';

const SANA_HOTSPOTS = [
  { name: 'شارع حدة - مركز الكميم', lat: 15.3280, lng: 44.1850 },
  { name: 'ميدان السبعين - جامع الصالح', lat: 15.3250, lng: 44.2080 },
  { name: 'شارع الزبيري - جولة كنتاكي', lat: 15.3520, lng: 44.1950 },
  { name: 'جامعة صنعاء - البوابة الشرقية', lat: 15.3720, lng: 44.1820 },
  { name: 'حي الأصبحي - بريد الأصبحي', lat: 15.3120, lng: 44.2150 },
  { name: 'مطار صنعاء الدولي', lat: 15.4760, lng: 44.2190 },
  { name: 'شارع الستين الغربي - مذبح', lat: 15.3850, lng: 44.1720 },
];

export const LocationSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode passed from selector or default to taxi
  const serviceType = location.state?.serviceType || 'taxi';
  const prefilledVehicle = location.state?.vehicle || null;

  // Locations state (name + real lat/lng coordinates)
  const [pickup, setPickup] = useState(location.state?.pickup || 'شارع حدة - أمام سيتي ماكس');
  const [dropoff, setDropoff] = useState(location.state?.dropoff || 'ميدان السبعين - جامع الصالح');
  const [pickupCoords, setPickupCoords] = useState({
    lat: Number(location.state?.pickupLat || 15.328),
    lng: Number(location.state?.pickupLng || 44.185),
  });
  const [dropoffCoords, setDropoffCoords] = useState({
    lat: Number(location.state?.dropoffLat || 15.325),
    lng: Number(location.state?.dropoffLng || 44.208),
  });
  const [routeMeta, setRouteMeta] = useState({ distanceText: '', durationText: '' });
  const [isPickupPinActive, setIsPickupPinActive] = useState(true); // true = selecting pickup, false = selecting dropoff
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Service title and badge
  const serviceMeta = {
    taxi: { title: 'سيارات الأجرة (تاكسي)', icon: Car, nextRoute: '/passenger/taxi', color: 'text-rahaa-primary' },
    rental: { title: 'تأجير السيارات الخاصة', icon: Key, nextRoute: '/passenger/rentals', color: 'text-amber-600' },
    truck: { title: 'شاحنات نقل البضائع والعفش', icon: Truck, nextRoute: '/passenger/trucks', color: 'text-emerald-600' },
    motorcycle: { title: 'الدراجات النارية السريعة', icon: Bike, nextRoute: '/passenger/motorcycles', color: 'text-cyan-600' },
  }[serviceType] || { title: 'تاكسي', icon: Car, nextRoute: '/passenger/taxi', color: 'text-rahaa-primary' };

  const ServiceIcon = serviceMeta.icon;

  const handleUseCurrentLocation = () => {
    setIsGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setPickup('موقعي الحالي المباشر - أمانة العاصمة صنعاء');
          setIsGpsLoading(false);
        },
        () => {
          setPickupCoords({ lat: 15.328, lng: 44.185 });
          setPickup('حي حدة - موقعي الحالي (صنعاء)');
          setIsGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setPickup('حي حدة - موقعي الحالي (صنعاء)');
      setIsGpsLoading(false);
    }
  };

  const handleSelectHotspot = (spot) => {
    if (isPickupPinActive) {
      setPickup(spot.name);
      setPickupCoords({ lat: spot.lat, lng: spot.lng });
      setIsPickupPinActive(false); // Move to destination next
    } else {
      setDropoff(spot.name);
      setDropoffCoords({ lat: spot.lat, lng: spot.lng });
    }
  };

  const handleMapClick = ({ lat, lng, address }) => {
    if (isPickupPinActive) {
      setPickupCoords({ lat, lng });
      setPickup(address || `موقع الانطلاق (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setIsPickupPinActive(false);
    } else {
      setDropoffCoords({ lat, lng });
      setDropoff(address || `موقع الوجهة (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const handleConfirmLocations = () => {
    // Navigate automatically to the service execution screen preserving names and GPS coordinates
    navigate(serviceMeta.nextRoute, {
      state: {
        serviceType,
        pickup,
        dropoff,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        vehicle: prefilledVehicle,
        locationConfirmed: true,
      },
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col font-tajawal animate-fadeIn p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto" dir="rtl">
      {/* 1. Workflow Stepper */}
      <ServiceWorkflowStepper
        steps={[
          { id: 1, label: 'اختيار الخدمة' },
          { id: 2, label: 'تحديد الموقع' },
          { id: 3, label: 'تفاصيل الطلب' },
          { id: 4, label: 'تنفيذ المشوار' },
          { id: 5, label: 'التقييم والدفع' },
        ]}
        currentStep={isPickupPinActive ? 2 : 3}
        onStepClick={(step) => {
          if (step === 1) navigate('/passenger');
          if (step === 2) setIsPickupPinActive(true);
          if (step === 3) setIsPickupPinActive(false);
        }}
      />

      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rahaa-border shadow-rahaa-sm mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/passenger'))}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            title="الرجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ServiceIcon className={`w-4 h-4 ${serviceMeta.color}`} />
              <span className="font-cairo font-bold text-base text-rahaa-navy">
                تحديد الموقع على الخريطة: {serviceMeta.title}
              </span>
            </div>
            <p className="text-xs text-rahaa-text-muted mt-0.5">
              حدد نقطة الانطلاق/الاستلام ووجهة الوصول بدقة ليتم توجيه الخدمة فوراً.
            </p>
          </div>
        </div>

        {/* GPS Quick Action */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-rahaa-primary font-cairo font-bold text-xs flex items-center gap-2 border border-blue-200 transition-colors shadow-xs"
        >
          <Crosshair className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
          <span>تحديد موقعي الحالي المباشر</span>
        </button>
      </div>

      {/* Main Grid: Interactive Map (8 cols) & Location Pinning Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* Left Column: Official Interactive Google Maps (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden shadow-rahaa-card border border-slate-800 relative flex flex-col justify-between p-4 sm:p-5 space-y-4">
          {/* Map Top Floating Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white border border-slate-700 shadow-md">
              <Compass className="w-4 h-4 text-rahaa-orange" />
              <span>خريطة Google Maps التفاعلية - انقر لتحديد {isPickupPinActive ? 'نقطة الانطلاق' : 'الوجهة'}</span>
            </div>

            {/* Toggle selecting Pickup vs Dropoff */}
            <div className="bg-slate-800/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPickupPinActive(true)}
                className={`px-3 py-1 rounded-lg text-xs font-cairo font-bold transition-all ${
                  isPickupPinActive ? 'bg-rahaa-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                موقع الانطلاق
              </button>
              <button
                type="button"
                onClick={() => setIsPickupPinActive(false)}
                className={`px-3 py-1 rounded-lg text-xs font-cairo font-bold transition-all ${
                  !isPickupPinActive ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                نقطة الوجهة
              </button>
            </div>
          </div>

          <RahahGoogleMap
            heightClass="h-[340px] sm:h-[400px]"
            interactive={true}
            showRoute={true}
            showGpsButton={true}
            pickup={{
              lat: pickupCoords.lat,
              lng: pickupCoords.lng,
              label: `الانطلاق: ${pickup}`,
            }}
            dropoff={{
              lat: dropoffCoords.lat,
              lng: dropoffCoords.lng,
              label: `الوجهة: ${dropoff}`,
            }}
            onMapClick={handleMapClick}
            onGpsLocated={({ lat, lng, address }) => {
              setPickupCoords({ lat, lng });
              setPickup(address || 'موقعي الحالي المباشر');
            }}
            onRouteCalculated={(meta) => setRouteMeta(meta)}
          />

          {/* Map Footer Bar */}
          <div className="bg-slate-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
            <span>انقر على أي موقع في الخريطة أو اختر من المعالم لتثبيت المسار فوراً</span>
            <span className="text-white font-cairo font-bold">
              {routeMeta.distanceText
                ? `المسافة: ${routeMeta.distanceText}${routeMeta.durationText ? ` (${routeMeta.durationText})` : ''}`
                : 'المسار عبر Google Directions'}
            </span>
          </div>
        </div>

        {/* Right Column: Search, Popular Spots & Confirmation (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="font-cairo font-bold text-base text-rahaa-navy pb-2 border-b border-rahaa-border">
              بيانات المسار ونقاط التوقف
            </h3>

            {/* Input 1: Pickup Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-cairo font-bold text-rahaa-navy">
                نقطة الانطلاق / الاستلام:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  onFocus={() => setIsPickupPinActive(true)}
                  className="w-full h-11 pr-10 pl-3 rounded-xl border border-rahaa-border bg-slate-50 text-xs font-semibold focus:border-rahaa-primary focus:bg-white focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-rahaa-primary absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Input 2: Dropoff Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-cairo font-bold text-rahaa-navy">
                وجهة الوصول / التسليم:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  onFocus={() => setIsPickupPinActive(false)}
                  className="w-full h-11 pr-10 pl-3 rounded-xl border border-rahaa-border bg-slate-50 text-xs font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
                <Navigation className="w-4 h-4 text-emerald-600 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Hotspots Quick Selection List */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-cairo font-bold text-rahaa-text-subtle block">
                معالم صنعاء البارزة (اختر لتثبيت الموقع):
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {SANA_HOTSPOTS.map((spot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectHotspot(spot)}
                    className="w-full p-2.5 rounded-xl border border-rahaa-border/70 hover:border-rahaa-primary hover:bg-blue-50/50 text-right text-xs transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">{spot.name}</span>
                    <span className="text-[10px] text-rahaa-primary font-bold">تحديد</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sequential Next & Back Action Controls */}
          <div className="pt-4 border-t border-rahaa-border space-y-2.5">
            <button
              type="button"
              onClick={handleConfirmLocations}
              className="w-full h-12 rounded-xl bg-rahaa-primary hover:bg-rahaa-navy text-white font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-rahaa-md hover:shadow-rahaa-lg"
            >
              <span>التالي: تفاصيل وتأكيد الخدمة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/passenger')}
              className="w-full h-10 rounded-xl border border-rahaa-border text-slate-600 hover:bg-slate-50 font-cairo font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق: اختيار وسيلة نقل أخرى</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionScreen;

