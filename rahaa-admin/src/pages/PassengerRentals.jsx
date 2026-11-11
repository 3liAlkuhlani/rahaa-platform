import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Key,
  Calendar,
  Clock,
  Car,
  Fuel,
  Users,
  CheckCircle,
  AlertCircle,
  MapPin,
  Star,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Coins
} from 'lucide-react';
import { MultiTransportSelector } from '../components/transport/MultiTransportSelector';
import { RenterVerificationModal } from '../components/transport/RenterVerificationModal';
import { RentalGuaranteeCard } from '../components/transport/RentalGuaranteeCard';
import { ServiceWorkflowStepper } from '../components/transport/ServiceWorkflowStepper';
import { RatingModal } from '../components/common/RatingModal';

export const PassengerRentals = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(location.state?.vehicle || null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Workflow current step
  // 1: اختيار السيارة, 2: تحديد الموقع, 3: مدة التأجير والضمان, 4: توثيق الهوية, 5: الحجز والتنفيذ
  const [workflowStep, setWorkflowStep] = useState(location.state?.locationConfirmed ? 3 : 1);

  // Locations state
  const [pickupLocation, setPickupLocation] = useState(location.state?.pickup || 'حي حدة - شارع الستين الجنوبي');
  const [returnLocation, setReturnLocation] = useState(location.state?.dropoff || 'حي حدة - شارع الستين الجنوبي');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('');
  const [searchMake, setSearchMake] = useState('');

  // Booking Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [rentalMode, setRentalMode] = useState('self_drive');
  const [pickupTime, setPickupTime] = useState('10:00 ص');
  const [returnTime, setReturnTime] = useState('10:00 ص');
  const [submitting, setSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await api.getRentals({
        category: categoryFilter,
        mode: modeFilter,
        make: searchMake,
      });
      if (res.vehicles) {
        setVehicles(res.vehicles);
      }
    } catch (err) {
      console.error('Error fetching rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [categoryFilter, modeFilter, searchMake]);

  const handleSelectCarForLocation = (v) => {
    setSelectedVehicle(v);
    // Transition to location selection
    navigate('/passenger/location', {
      state: {
        serviceType: 'rental',
        vehicle: v,
        pickup: v.location_name || pickupLocation,
        dropoff: v.location_name || returnLocation,
      },
    });
  };

  const handleOpenBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingMessage(null);
    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  // Calculate rental cost
  const calculateTotal = () => {
    if (!selectedVehicle) return { days: 1, total: 20000 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    let base = diffTime * (selectedVehicle.daily_rate || 20000);
    if (rentalMode === 'with_driver') {
      base += diffTime * 5000;
    }
    return { days: diffTime, total: base };
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    try {
      setSubmitting(true);
      setBookingError(null);
      const res = await api.bookRental({
        vehicle_id: selectedVehicle.id,
        start_date: startDate,
        end_date: endDate,
        rental_mode: rentalMode,
        pickup_location: pickupLocation,
        return_location: returnLocation,
        pickup_time: pickupTime,
        return_time: returnTime,
      });

      setConfirmedBooking(res.booking);
      setBookingMessage(res.message || 'تم إرسال طلب الحجز بنجاح!');
      setWorkflowStep(5);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingMessage(null);
      }, 2500);
    } catch (err) {
      setBookingError(err.message || 'فشل إتمام الحجز. يرجى التأكد من التواريخ والضمان');
    } finally {
      setSubmitting(false);
    }
  };

  const cost = calculateTotal();

  const rentalWorkflowSteps = [
    { id: 1, label: 'اختيار السيارة' },
    { id: 2, label: 'موقع الاستلام' },
    { id: 3, label: 'المدة والضمان' },
    { id: 4, label: 'توثيق الهوية' },
    { id: 5, label: 'تنفيذ التأجير' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tajawal animate-fadeIn p-4 sm:p-6 lg:p-8">
      {/* Return to Home Action Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => navigate('/passenger')}
          className="h-10 px-4 rounded-xl border border-rahaa-border bg-white hover:bg-slate-50 text-slate-700 font-cairo font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
        >
          <ArrowRight className="w-4 h-4 text-amber-600" />
          <span>العودة إلى الرئيسية واختيار وسيلة أخرى</span>
        </button>
      </div>

      {/* 2. Interactive Workflow Stepper */}
      <ServiceWorkflowStepper
        steps={rentalWorkflowSteps}
        currentStep={isBookingModalOpen ? Math.max(workflowStep, 3) : workflowStep}
        onStepClick={(step) => {
          if (isBookingModalOpen) {
            setIsBookingModalOpen(false);
          } else if (isVerificationModalOpen) {
            setIsVerificationModalOpen(false);
          }
          setWorkflowStep(step);
        }}
      />

      {/* Top Identity Verification Shortcut */}
      <div className="bg-white rounded-2xl p-4 border border-rahaa-border shadow-rahaa-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-cairo font-bold text-rahaa-navy">
            متطلبات التأجير النظامية: يلزم توثيق الهوية والرخصة وتحديد الضمان المالي
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsVerificationModalOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-cairo font-bold transition-colors"
        >
          فحص / رفع وثائق الهوية
        </button>
      </div>

      {/* 2. Rentals Page Header (Rahah Logo Navy & Golden-Amber Gradient) */}
      <div className="bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#EE9224] rounded-3xl p-6 sm:p-8 text-white shadow-rahaa-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-xs">
            <Key className="w-3.5 h-3.5 text-[#FDE68A]" />
            خدمة التأجير الذكي
          </span>
          <h1 className="font-cairo font-bold text-2xl sm:text-3xl">
            استئجار السيارات الخاصة والفارهة
          </h1>
          <p className="text-white/90 text-sm mt-1 max-w-2xl leading-relaxed">
            تصفح أسطول السيارات المعتمدة والمفحوصة في صنعاء. اختر سيارتك المفضلة واحجزها باليوم أو بالساعة، بقيادتك الذاتية أو مع سائق محترف.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/15 border border-white/20 p-3.5 rounded-2xl backdrop-blur-xs text-xs font-bold">
          <ShieldCheck className="w-6 h-6 text-[#FDE68A]" />
          <span>تأمين شامل وعقود نظامية معتمدة</span>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rahaa-border shadow-rahaa-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ابحث بالشركة المصنعة أو الطراز..."
            value={searchMake}
            onChange={(e) => setSearchMake(e.target.value)}
            className="w-full h-11 pr-10 pl-4 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-amber-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'جميع السيارات' },
            { id: 'sedan', label: 'سيدان واقتصادية' },
            { id: 'suv', label: 'دفع رباعي SUV' },
            { id: 'luxury', label: 'فارهة VIP' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`h-10 px-4 rounded-xl text-xs font-cairo font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-amber-600 text-white shadow-rahaa-sm'
                  : 'bg-rahaa-bg text-rahaa-text-muted hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rental Mode Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-cairo font-bold text-rahaa-navy focus:border-amber-500 focus:outline-none w-full md:w-auto"
          >
            <option value="">كل أنماط القيادة</option>
            <option value="self_drive">قيادة ذاتية فقط</option>
            <option value="with_driver">مع سائق خاص</option>
          </select>
        </div>
      </div>

      {/* 4. Vehicles Catalog Grid */}
      {loading ? (
        <div className="py-16 text-center text-rahaa-text-subtle text-sm">
          جاري تحميل أسطول السيارات المتاحة...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-rahaa-border text-center">
          <Car className="w-12 h-12 text-rahaa-text-subtle mx-auto mb-3" />
          <h3 className="font-cairo font-bold text-lg text-rahaa-navy">لا توجد سيارات مطابقة لخيارات البحث</h3>
          <p className="text-xs text-rahaa-text-subtle mt-1">
            جرب اختيار فئة أخرى أو مسح معايير الفلترة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-rahaa-border overflow-hidden shadow-rahaa-sm hover:shadow-rahaa-lg transition-all flex flex-col justify-between"
            >
              {/* Car Image Banner */}
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={
                    v.images && v.images.length > 0
                      ? v.images[0]
                      : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={`${v.make} ${v.model}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-amber-700 shadow-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {v.rating || '4.9'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                    متاح للحجز
                  </span>
                </div>
              </div>

              {/* Car Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
                        {v.make} {v.model}
                      </h3>
                      <span className="text-xs text-rahaa-text-subtle">
                        موديل سنة {v.year} • {v.color || 'أبيض'}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="font-cairo font-black text-lg text-amber-600">
                        {Number(v.daily_rate).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-rahaa-text-subtle block font-semibold">
                        ريال / يوم
                      </span>
                    </div>
                  </div>

                  {/* Specs Pill Badges: Icon on the Right + Text Directly Next to It */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-rahaa-border/60 my-3">
                    <div className="bg-rahaa-bg px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-right">
                      <Users className="w-4 h-4 text-rahaa-primary shrink-0" />
                      <span className="text-[11px] font-bold text-rahaa-navy truncate">
                        {v.seats || 5} مقاعد
                      </span>
                    </div>
                    <div className="bg-rahaa-bg px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-right">
                      <Fuel className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-bold text-rahaa-navy truncate">
                        {v.fuel_type === 'hybrid' ? 'هايبرد' : 'بنزين'}
                      </span>
                    </div>
                    <div className="bg-rahaa-bg px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-right">
                      <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold text-rahaa-navy truncate">
                        {v.transmission === 'manual' ? 'عادي' : 'أوتوماتيك'}
                      </span>
                    </div>
                  </div>

                  {/* Location & Modes */}
                  <div className="space-y-1.5 text-xs text-rahaa-text-muted mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rahaa-text-subtle shrink-0" />
                      <span>{v.location_name || 'أمانة العاصمة - صنعاء'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.self_drive_available && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-rahaa-primary font-bold">
                          قيادة ذاتية
                        </span>
                      )}
                      {v.with_driver_available && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold">
                          متاح مع سائق
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Book Action */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectCarForLocation(v)}
                    className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-cairo font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>تحديد الموقع</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(v)}
                    className="h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-rahaa-sm"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>حجز وتأكيد</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Booking Modal Dialog */}
      {isBookingModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-rahaa-xl border border-rahaa-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-rahaa-border mb-4">
              <div>
                <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
                  حجز سيارة: {selectedVehicle.make} {selectedVehicle.model}
                </h3>
                <span className="text-xs text-rahaa-text-subtle">
                  أدخل تفاصيل التواريخ ونمط الاستلام
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {bookingMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{bookingMessage}</span>
              </div>
            )}

            {bookingError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Rental Mode Radio */}
              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-2">
                  اختر نمط الإيجار:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRentalMode('self_drive')}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      rentalMode === 'self_drive'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-rahaa-border text-rahaa-text-muted hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-cairo text-xs block font-bold">قيادة ذاتية</span>
                    <span className="text-[10px] text-rahaa-text-subtle block">
                      تقود السيارة بنفسك
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRentalMode('with_driver')}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      rentalMode === 'with_driver'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-rahaa-border text-rahaa-text-muted hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-cairo text-xs block font-bold">مع سائق خاص</span>
                    <span className="text-[10px] text-rahaa-text-subtle block">
                      سائق محترف ومرافق (+5,000 ر.ي/يوم)
                    </span>
                  </button>
                </div>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    تاريخ الاستلام:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    تاريخ التسليم:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    وقت الاستلام:
                  </label>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    وقت التسليم:
                  </label>
                  <input
                    type="text"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cost Summary Box */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2 text-xs">
                <div className="flex justify-between text-rahaa-text-muted">
                  <span>مدة الإيجار:</span>
                  <span className="font-bold text-rahaa-navy">{cost.days} يوم</span>
                </div>
                <div className="flex justify-between text-rahaa-text-muted">
                  <span>سعر اليوم:</span>
                  <span className="font-bold text-rahaa-navy">
                    {Number(selectedVehicle.daily_rate).toLocaleString()} ر.ي
                  </span>
                </div>
                {rentalMode === 'with_driver' && (
                  <div className="flex justify-between text-amber-800">
                    <span>رسوم السائق الخاص:</span>
                    <span className="font-bold">{cost.days * 5000} ر.ي</span>
                  </div>
                )}
                <div className="pt-2 border-t border-amber-200 flex justify-between font-cairo font-black text-sm text-amber-700">
                  <span>المبلغ الإجمالي التقديري:</span>
                  <span>{cost.total.toLocaleString()} ر.ي</span>
                </div>
              </div>

              {/* Rental Guarantee Section Integration */}
              <RentalGuaranteeCard vehicle={selectedVehicle} />

              {/* CTA Buttons: Next & Previous */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-1/3 h-11 rounded-xl border border-rahaa-border text-rahaa-navy font-cairo font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>السابق</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 h-11 rounded-xl bg-gradient-to-l from-[#0B1B36] via-[#78350F] to-[#D97706] hover:from-[#081326] hover:to-[#B45309] text-white font-cairo font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-rahaa-sm disabled:opacity-50"
                >
                  <span>{submitting ? 'جاري تأكيد الحجز...' : 'التالي: تأكيد وإرسال طلب الحجز'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renter Identity Verification Modal */}
      <RenterVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={() => {
          setIsVerificationModalOpen(false);
          setWorkflowStep(3);
        }}
      />

      {/* Rating & Review Modal */}
      {confirmedBooking && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          entityType="rental"
          entityId={confirmedBooking.id}
          title={`تقييم تجربة استئجار ${selectedVehicle?.make} ${selectedVehicle?.model}`}
          onSubmitted={() => alert('تم حفظ تقييمك بنجاح!')}
        />
      )}
    </div>
  );
};

export default PassengerRentals;
