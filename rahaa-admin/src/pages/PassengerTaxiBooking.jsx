import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Search,
  Navigation,
  Car,
  Shield,
  CheckCircle2,
  AlertCircle,
  Compass,
  ChevronDown,
  Clock,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';
import { ServiceWorkflowStepper } from '../components/transport/ServiceWorkflowStepper';

const DEFAULT_QUICK_TRIPS = [
  {
    id: 'qt-1',
    title: 'شارع حدة ← ميدان السبعين (جامع الصالح)',
    pickup: 'شارع حدة - أمام سيتي ماكس',
    dropoff: 'جامع الصالح - ميدان السبعين',
    category: 'comfort',
    fare: 2600,
    distance: '4.2 كم',
    eta: '8 دقائق',
  },
  {
    id: 'qt-2',
    title: 'شارع الزبيري (كنتاكي) ← جامعة صنعاء',
    pickup: 'شارع الزبيري - جولة كنتاكي',
    dropoff: 'جامعة صنعاء - البوابة الشرقية',
    category: 'economy',
    fare: 1800,
    distance: '3.5 كم',
    eta: '6 دقائق',
  },
  {
    id: 'qt-3',
    title: 'حي حدة (الكميم) ← مطار صنعاء الدولي',
    pickup: 'حي حدة - مركز الكميم',
    dropoff: 'مطار صنعاء الدولي',
    category: 'vip',
    fare: 4500,
    distance: '14.0 كم',
    eta: '20 دقيقة',
  },
  {
    id: 'qt-4',
    title: 'جولة الرويشان ← شارع الستين الجنوبي',
    pickup: 'شارع حدة - جولة الرويشان',
    dropoff: 'شارع الستين الجنوبي - فندق موفنبيك',
    category: 'comfort',
    fare: 2600,
    distance: '5.1 كم',
    eta: '10 دقائق',
  },
];

export const PassengerTaxiBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const dropdownRef = useRef(null);

  // Locations State
  const [pickupLocation, setPickupLocation] = useState(
    location.state?.pickup || 'شارع حدة - أمام سيتي ماكس'
  );
  const [dropoffLocation, setDropoffLocation] = useState(
    location.state?.dropoff || 'ميدان السبعين - جامع الصالح'
  );
  const isLocationConfirmed = !!location.state?.locationConfirmed;

  useEffect(() => {
    if (location.state?.pickup) setPickupLocation(location.state.pickup);
    if (location.state?.dropoff) setDropoffLocation(location.state.dropoff);
  }, [location.state]);

  const [selectedCategory, setSelectedCategory] = useState('comfort');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [workflowStep, setWorkflowStep] = useState(location.state?.locationConfirmed ? 3 : 2);

  // Quick Trips Dropdown States
  const [isQuickDropdownOpen, setIsQuickDropdownOpen] = useState(false);
  const [quickTrips, setQuickTrips] = useState([]);
  const [selectedQuickTrip, setSelectedQuickTrip] = useState(null);
  const [quickLoading, setQuickLoading] = useState(true);
  const [quickError, setQuickError] = useState('');

  // Trip Confirmation States
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Taxi Categories
  const rideCategories = [
    {
      id: 'economy',
      name: 'راحة توفير',
      desc: 'مشاوير اقتصادية يومية وسريعة',
      fareNumeric: 1800,
      fare: '1,800 ر.ي',
      eta: '4 دقائق',
      icon: Car,
    },
    {
      id: 'comfort',
      name: 'راحة بلس',
      desc: 'سيارات حديثة ومكيفة بأعلى راحة',
      fareNumeric: 2600,
      fare: '2,600 ر.ي',
      eta: '3 دقائق',
      icon: Car,
    },
    {
      id: 'vip',
      name: 'عائلي VIP',
      desc: 'مركبات دفع رباعي واسعة للعائلات',
      fareNumeric: 4500,
      fare: '4,500 ر.ي',
      eta: '6 دقائق',
      icon: Shield,
    },
  ];

  // Fetch Quick Trips
  const fetchQuickTrips = async () => {
    setQuickLoading(true);
    setQuickError('');
    try {
      const res = await api.getMyTrips();
      const apiTrips = res?.trips?.data || [];
      const mappedApiTrips = apiTrips.slice(0, 3).map((t) => ({
        id: `api-${t.id}`,
        title: `${t.pickup_name} ← ${t.dropoff_name}`,
        pickup: t.pickup_name,
        dropoff: t.dropoff_name,
        category: t.vehicle_type || 'comfort',
        fare: Number(t.fare) || 2600,
        distance: '4.0 كم',
        eta: '8 دقائق',
        tripNumber: t.trip_number,
      }));

      const combined = [...mappedApiTrips];
      DEFAULT_QUICK_TRIPS.forEach((item) => {
        if (!combined.some((c) => c.dropoff === item.dropoff && c.pickup === item.pickup)) {
          combined.push(item);
        }
      });

      setQuickTrips(combined);
    } catch (err) {
      setQuickTrips(DEFAULT_QUICK_TRIPS);
    } finally {
      setQuickLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickTrips();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuickDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectQuickTrip = (tripItem) => {
    setSelectedQuickTrip(tripItem);
    setPickupLocation(tripItem.pickup);
    setDropoffLocation(tripItem.dropoff);
    if (['economy', 'comfort', 'vip'].includes(tripItem.category)) {
      setSelectedCategory(tripItem.category);
    }
    setIsQuickDropdownOpen(false);
  };

  const handleConfirmTrip = async (e) => {
    e.preventDefault();
    setConfirmError('');

    if (!dropoffLocation.trim()) {
      setConfirmError('يرجى تحديد وجهة الوصول قبل تأكيد الرحلة');
      return;
    }

    if (!pickupLocation.trim()) {
      setConfirmError('يرجى تحديد نقطة الانطلاق');
      return;
    }

    setIsConfirming(true);

    try {
      const activeCat = rideCategories.find((c) => c.id === selectedCategory) || rideCategories[1];
      const payload = {
        pickup_name: pickupLocation.trim(),
        dropoff_name: dropoffLocation.trim(),
        vehicle_type: selectedCategory,
        payment_method: paymentMethod,
        fare: activeCat.fareNumeric,
        pickup_lat: 15.3280,
        pickup_lng: 44.1850,
        dropoff_lat: 15.3520,
        dropoff_lng: 44.1950,
      };

      const res = await api.requestTrip(payload);

      if (!res || !res.success || !res.trip) {
        throw new Error(res?.message || 'تعذر تأكيد الرحلة في الخادم');
      }

      navigate('/passenger/map', {
        state: { trip: res.trip },
      });
    } catch (err) {
      setConfirmError(err.message || 'فشل تأكيد الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsConfirming(false);
    }
  };

  const currentCatObj = rideCategories.find((c) => c.id === selectedCategory) || rideCategories[1];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-tajawal animate-fadeIn" dir="rtl">
      {/* 1. Stepper Progress */}
      <ServiceWorkflowStepper
        steps={[
          { id: 1, label: 'اختيار الخدمة' },
          { id: 2, label: 'تحديد المسار' },
          { id: 3, label: 'فئة التاكسي' },
          { id: 4, label: 'تأكيد الحجز' },
          { id: 5, label: 'تتبع السائق' },
        ]}
        currentStep={workflowStep}
        onStepClick={(step) => {
          if (step === 1) {
            navigate('/passenger');
          } else {
            setWorkflowStep(step);
          }
        }}
      />

      {/* 2. Taxi Dedicated Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B1B36] via-[#122B56] to-[#1D4ED8] rounded-3xl p-6 sm:p-8 text-white shadow-rahaa-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur-xs">
            <Car className="w-3.5 h-3.5 text-sky-300" />
            خدمة سيارات الأجرة (تاكسي)
          </span>
          <h1 className="font-cairo font-black text-2xl sm:text-3xl text-white">
            طلب تاكسي فوري في أمانة العاصمة
          </h1>
          <p className="text-white/85 text-xs sm:text-sm max-w-xl leading-relaxed">
            أسرع وسيلة للتنقل داخل صنعاء مع كباتن راحة المعتمدين والمفحوصين أمنياً، بأسعار ثابتة ومقننة وتتبع لحظي.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs text-xs font-bold shrink-0">
          <Shield className="w-6 h-6 text-sky-300" />
          <span>رحلات مؤمنة ومعتمدة 100%</span>
        </div>
      </div>

      {/* 3. Main Grid: Booking Form (6 cols) & Route Preview / Map Helper (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Taxi Booking Form (7 cols) */}
        <div className="lg:col-span-7 bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
            <h2 className="text-base font-bold font-cairo text-rahaa-navy flex items-center gap-2">
              <Navigation className="w-5 h-5 text-rahaa-primary" />
              <span>تفاصيل الرحلة وحجز التاكسي</span>
            </h2>
            <button
              type="button"
              onClick={() => navigate('/passenger')}
              className="text-xs font-cairo font-bold text-slate-500 hover:text-rahaa-primary flex items-center gap-1 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>اختيار وسيلة أخرى</span>
            </button>
          </div>

          {confirmError && (
            <div className="p-3.5 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{confirmError}</span>
            </div>
          )}

          <form onSubmit={handleConfirmTrip} className="space-y-4">
            {/* Quick Trips Dropdown */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-cairo font-semibold text-rahaa-navy">
                  الرحلات السريعة والمقترحة:
                </label>
                <button
                  type="button"
                  onClick={fetchQuickTrips}
                  className="text-[11px] font-cairo text-rahaa-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${quickLoading ? 'animate-spin' : ''}`} />
                  <span>تحديث</span>
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsQuickDropdownOpen((prev) => !prev)}
                  className="w-full h-11 px-3.5 bg-rahaa-bg hover:bg-blue-50/50 border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy flex items-center justify-between transition-colors"
                >
                  <span className="truncate">
                    {selectedQuickTrip ? selectedQuickTrip.title : 'اختر مشواراً جاهزاً من القائمة...'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-rahaa-primary shrink-0 transition-transform duration-200 ${
                      isQuickDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isQuickDropdownOpen && (
                  <div className="absolute z-30 mt-1.5 w-full bg-rahaa-card rounded-2xl border border-rahaa-border shadow-xl max-h-64 overflow-y-auto divide-y divide-rahaa-border/50">
                    {quickTrips.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectQuickTrip(item)}
                        className="w-full p-3 text-right hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 truncate">
                          <p className="font-cairo font-bold text-xs text-rahaa-navy truncate">
                            {item.title}
                          </p>
                          <span className="text-[11px] text-rahaa-text-subtle font-tajawal">
                            {item.distance} • ~{item.eta}
                          </span>
                        </div>
                        <span className="font-cairo font-bold text-xs text-rahaa-primary shrink-0">
                          {Number(item.fare).toLocaleString()} ر.ي
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Inputs */}
            <div className="space-y-3">
              {/* Pickup */}
              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  نقطة الانطلاق (موقعك):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="مثال: شارع حدة - أمام سيتي ماكس"
                    className="w-full h-11 pr-10 pl-24 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-semibold text-rahaa-navy focus:border-rahaa-primary focus:bg-white focus:outline-none"
                  />
                  <MapPin className="w-4 h-4 text-rahaa-primary absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/passenger/location', {
                        state: { serviceType: 'taxi', pickup: pickupLocation, dropoff: dropoffLocation },
                      })
                    }
                    className="absolute left-2 top-2 h-7 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-rahaa-primary font-cairo font-bold text-[10px] transition-colors"
                  >
                    تحديد بالخريطة
                  </button>
                </div>
              </div>

              {/* Dropoff */}
              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  وجهة الوصول (إلى أين):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="مثال: ميدان السبعين - جامع الصالح"
                    className="w-full h-11 pr-10 pl-24 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-semibold text-rahaa-navy focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                  <Navigation className="w-4 h-4 text-emerald-600 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/passenger/location', {
                        state: { serviceType: 'taxi', pickup: pickupLocation, dropoff: dropoffLocation },
                      })
                    }
                    className="absolute left-2 top-2 h-7 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-cairo font-bold text-[10px] transition-colors"
                  >
                    تحديد بالخريطة
                  </button>
                </div>
              </div>
            </div>

            {/* Ride Categories Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-cairo font-bold text-rahaa-navy block">
                اختر فئة سيارة الأجرة:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {rideCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-rahaa-primary bg-blue-50/80 shadow-xs ring-2 ring-rahaa-primary/30'
                          : 'border-rahaa-border bg-rahaa-bg hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-rahaa-primary text-white shadow-xs'
                            : 'bg-white text-rahaa-primary border border-rahaa-border'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-cairo font-bold text-xs text-rahaa-navy truncate">
                            {cat.name}
                          </span>
                          <span className="font-cairo font-black text-[11px] text-rahaa-primary shrink-0">
                            {cat.fare}
                          </span>
                        </div>
                        <span className="text-[10px] text-rahaa-text-subtle font-tajawal block mt-0.5 leading-snug">
                          {cat.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs">
              <span className="font-cairo font-bold text-rahaa-navy">طريقة الدفع:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`h-9 px-3 rounded-xl font-cairo font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    paymentMethod === 'cash'
                      ? 'bg-rahaa-primary text-white shadow-xs'
                      : 'bg-white border border-rahaa-border text-slate-600 hover:text-rahaa-navy'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>نقداً (كاش)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`h-9 px-3 rounded-xl font-cairo font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    paymentMethod === 'wallet'
                      ? 'bg-rahaa-primary text-white shadow-xs'
                      : 'bg-white border border-rahaa-border text-slate-600 hover:text-rahaa-navy'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>محفظة جيب</span>
                </button>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5 text-xs font-tajawal">
              <div className="flex justify-between text-rahaa-text-muted">
                <span>الفئة المختارة:</span>
                <span className="font-bold text-rahaa-navy">{currentCatObj.name}</span>
              </div>
              <div className="flex justify-between text-rahaa-text-muted">
                <span>وقت الوصول التقديري:</span>
                <span className="font-bold text-rahaa-navy">{currentCatObj.eta}</span>
              </div>
              <div className="pt-2 border-t border-blue-200 flex justify-between font-cairo font-black text-sm text-rahaa-primary">
                <span>الأجرة المقدرة:</span>
                <span>{currentCatObj.fare}</span>
              </div>
            </div>

            {/* Main Action Buttons: Sequential Next & Previous */}
            <div className="space-y-2.5 pt-2">
              {/* Requirement #3: Taxi Button strictly Navy Blue to Blue Gradient */}
              <button
                type="submit"
                disabled={isConfirming}
                className="w-full h-12 px-4 rounded-xl bg-gradient-to-l from-[#0B1B36] via-[#122B56] to-[#1D4ED8] hover:from-[#081326] hover:via-[#0F2244] hover:to-[#1E40AF] active:scale-[0.99] text-white font-cairo font-bold text-sm shadow-md shadow-blue-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري تأكيد وحجز التاكسي...</span>
                  </>
                ) : (
                  <>
                    <Car className="w-5 h-5" />
                    <span>تأكيد طلب التاكسي والبحث عن أقرب كابتن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/passenger')}
                className="w-full h-10 px-4 border border-rahaa-border text-slate-600 hover:bg-slate-50 font-cairo font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة إلى الرئيسية واختيار وسيلة أخرى</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Map Helper / Sana'a Visual Guide (5 cols) */}
        <div className="lg:col-span-5 bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Compass className="w-5 h-5 text-rahaa-primary" />
              <span>مسار التاكسي على الخريطة</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              كباتن نشطون
            </span>
          </div>

          {/* Sana'a Route Map Preview Canvas */}
          <div className="relative w-full h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 select-none">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Route Svg Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse cx="50" cy="50" rx="35" ry="30" fill="none" stroke="#334155" strokeWidth="3" />
              <path d="M 10 45 Q 50 42 90 45" fill="none" stroke="#475569" strokeWidth="2.5" />
              <path d="M 35 75 Q 48 55 60 25" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3,3" />
            </svg>

            {/* Pickup Marker */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <div className="bg-white text-rahaa-navy font-cairo font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
                  الانطلاق: {pickupLocation}
                </div>
                <div className="w-9 h-9 rounded-full bg-rahaa-primary text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>

              <div className="w-0.5 h-8 border-r-2 border-dashed border-sky-400"></div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="bg-emerald-600 text-white font-cairo font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md mt-1 whitespace-nowrap">
                  الوجهة: {dropoffLocation}
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-slate-800/90 backdrop-blur-xs p-3 rounded-xl border border-slate-700 text-center text-xs text-slate-300">
              <span>سيتم توجيه أقرب سائق فور تأكيد الطلب، مع إمكانية التتبع المباشر لحظة بلحظة.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerTaxiBooking;

