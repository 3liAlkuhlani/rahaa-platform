import React, { useState, useEffect } from 'react';
import {
  Key,
  Car,
  DollarSign,
  Calendar,
  Star,
  Check,
  X,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Clock,
  User,
  MapPin,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';

export const DriverRentalDashboard = () => {
  const currentUser = getCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Add Rental Vehicle Modal
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [addingCar, setAddingCar] = useState(false);
  const [carFormMsg, setCarFormMsg] = useState(null);
  const [newCar, setNewCar] = useState({
    service_type: 'rental',
    make: 'تويوتا',
    model: 'برادو TXL 2023',
    year: 2023,
    color: 'أبيض لؤلؤي',
    plate_number: '',
    category: 'suv',
    seats: 7,
    daily_rate: 35000,
    hourly_rate: 4000,
    with_driver_available: true,
    self_drive_available: true,
    location_name: 'صنعاء - شارع حدة',
  });

  const fetchRentalPortalData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getMyRentalBookings();
      setBookings(res?.as_owner || []);
      if (res?.my_vehicles && res.my_vehicles.length > 0) {
        setFleet(res.my_vehicles);
      } else {
        const srvRes = await api.getMyTransportServices();
        setFleet((srvRes?.vehicles || []).filter((v) => v.service_type === 'rental'));
      }
    } catch (err) {
      setErrorMsg(err.message || 'تعذر جلب بيانات حجوزات وأسطول التأجير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalPortalData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    setErrorMsg('');
    try {
      await api.updateRentalBookingStatus(bookingId, newStatus);
      await fetchRentalPortalData();
    } catch (err) {
      setErrorMsg(err.message || 'تعذر تحديث حالة الحجز');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddRentalCar = async (e) => {
    e.preventDefault();
    setAddingCar(true);
    setCarFormMsg(null);
    try {
      const res = await api.addVehicle({ ...newCar, service_type: 'rental' });
      setCarFormMsg({ type: 'success', text: res.message || 'تمت إضافة السيارة لأسطول التأجير بنجاح!' });
      setTimeout(() => {
        setIsAddCarOpen(false);
        setCarFormMsg(null);
        fetchRentalPortalData();
      }, 1200);
    } catch (err) {
      setCarFormMsg({ type: 'error', text: err.message || 'فشل إضافة سيارة التأجير' });
    } finally {
      setAddingCar(false);
    }
  };

  const completedOrActive = bookings.filter((b) => ['accepted', 'active', 'completed'].includes(b.status));
  const totalRevenue = completedOrActive.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  const statusBadgeMap = {
    pending: { label: 'بانتظار موافقتك', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    accepted: { label: 'مؤكد - جاهز للتسليم', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    active: { label: 'قيد التأجير حالياً', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    completed: { label: 'مكتمل ومستلم', cls: 'bg-slate-100 text-slate-800 border-slate-200' },
    rejected: { label: 'مرفوض', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
    cancelled: { label: 'ملغي', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-tajawal animate-fadeIn" dir="rtl">
      {/* Car Rental Owner Dedicated Hero Banner (Rahah Logo Navy & Golden-Amber) */}
      <div className="bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#EE9224] rounded-3xl text-white p-6 shadow-rahaa-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#FDE68A] text-xs font-cairo font-bold">
            <Key className="w-3.5 h-3.5" />
            <span>بوابة تأجير السيارات الخاصة وإدارة الأسطول - صنعاء</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo">
            أهلاً بك، {currentUser?.name || 'معرض الصنعاني للسيارات'}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 font-tajawal max-w-lg">
            إدارة متكاملة لأسطول السيارات الخاصة، مراجعة طلبات الاستئجار اليومي والأسبوعي، وتوثيق الضمانات وتسليم المركبات.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCarOpen(true)}
          className="z-10 h-11 px-5 rounded-2xl bg-white text-[#0D2D56] hover:bg-[#FEF5E8] font-cairo font-bold text-xs flex items-center gap-2 transition-all shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-[#EE9224]" />
          <span>إضافة سيارة للتأجير</span>
        </button>

        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Rental KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">إجمالي عوائد التأجير</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {(totalRevenue || 135000).toLocaleString()} <span className="text-xs font-normal text-rahaa-text-muted">ر.ي</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-tajawal mt-0.5">
              عقود تأجير موثقة ومضمونة
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">طلبات الحجز الجديدة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {pendingBookings.length} <span className="text-xs font-normal text-rahaa-text-muted">طلب بانتظارك</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              إجمالي الحجوزات: {bookings.length}
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">حجم أسطول السيارات</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {fleet.length} <span className="text-xs font-normal text-rahaa-text-muted">سيارة مسجلة</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              متاحة للحجز الفوري والمرن
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">تقييم خدمة التأجير</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              4.95 <span className="text-xs font-normal text-rahaa-text-muted">/ 5.0</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-tajawal mt-0.5">
              مؤجر معتمد لدى منصة راحة
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rental Bookings Management Section */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rahaa-border">
          <div>
            <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span>طلبات وحجوزات استئجار السيارات</span>
            </h2>
            <p className="text-xs text-rahaa-text-muted font-tajawal">
              راجع طلبات المستأجرين، اعتمد الحجز، وسجّل تسليم واستلام السيارة
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRentalPortalData}
            className="h-10 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-amber-50 text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الحجوزات</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-rahaa-text-muted">جاري تحميل حجوزات التأجير...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-rahaa-bg border border-rahaa-border text-center space-y-2">
            <Calendar className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="font-cairo font-bold text-sm text-rahaa-navy">لا توجد طلبات حجز مسجلة حالياً</p>
            <p className="text-xs text-rahaa-text-muted">ستظهر هنا جميع طلبات استئجار سياراتك فور إرسالها من العملاء.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((bk) => {
              const badge = statusBadgeMap[bk.status] || statusBadgeMap.pending;
              const isBusy = actionLoadingId === bk.id;

              return (
                <div
                  key={bk.id}
                  className="p-5 rounded-2xl bg-rahaa-bg border border-rahaa-border space-y-4 transition-all hover:border-amber-400/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rahaa-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-xl bg-amber-600 text-white font-cairo font-bold text-xs">
                        #{bk.booking_number}
                      </span>
                      <div>
                        <h3 className="font-cairo font-bold text-sm text-rahaa-navy">
                          {bk.vehicle ? `${bk.vehicle.make} ${bk.vehicle.model} (${bk.vehicle.year})` : 'سيارة تأجير'}
                        </h3>
                        <span className="text-[11px] text-rahaa-text-muted">
                          رقم اللوحة: {bk.vehicle?.plate_number || '—'} • نوع القيادة:{' '}
                          {bk.rental_mode === 'with_driver' ? 'مع سائق خاص' : 'قيادة ذاتية للمستأجر'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-cairo font-bold border ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-rahaa-card border border-rahaa-border font-cairo font-bold text-xs text-amber-700">
                        {Number(bk.total_amount || 0).toLocaleString()} ر.ي
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-center gap-2.5">
                      <User className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-rahaa-text-subtle block">المستأجر</span>
                        <strong className="font-cairo text-rahaa-navy">
                          {bk.renter?.name || 'عميل راحة'} ({bk.renter?.phone || '—'})
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-rahaa-text-subtle block">فترة الإيجار</span>
                        <strong className="font-cairo text-rahaa-navy">
                          من {bk.start_date} إلى {bk.end_date}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-rahaa-text-subtle block">الضمان والدفع</span>
                        <strong className="font-cairo text-rahaa-navy">
                          {bk.payment_method === 'wallet' ? 'محفظة جيب' : 'نقداً'} • ضمان موثق
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Booking Lifecycle Actions for Owner */}
                  {bk.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateBookingStatus(bk.id, 'rejected')}
                        className="h-10 px-4 rounded-xl border border-rahaa-border bg-rahaa-card hover:bg-rose-50 text-rose-600 font-cairo font-bold text-xs flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>رفض الطلب</span>
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateBookingStatus(bk.id, 'accepted')}
                        className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isBusy ? 'جاري الاعتماد...' : 'الموافقة واعتماد الحجز'}</span>
                      </button>
                    </div>
                  )}

                  {bk.status === 'accepted' && (
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateBookingStatus(bk.id, 'active')}
                        className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Key className="w-4 h-4" />
                        <span>{isBusy ? 'جاري التحديث...' : 'تأكيد تسليم المفتاح وبدء الإيجار'}</span>
                      </button>
                    </div>
                  )}

                  {bk.status === 'active' && (
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
                        className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isBusy ? 'جاري الإغلاق...' : 'تأكيد استلام السيارة وإنهاء العقد'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rental Fleet Section */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
          <div>
            <h2 className="font-cairo font-bold text-base text-rahaa-navy">
              أسطول السيارات المعروضة للتأجير ({fleet.length})
            </h2>
            <p className="text-xs text-rahaa-text-muted">السيارات المملوكة والمدرجة تحت حسابك في قسم التأجير</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddCarOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>إضافة سيارة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fleet.map((car) => (
            <div
              key={car.id}
              className="rounded-2xl bg-rahaa-bg border border-rahaa-border p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-cairo font-bold text-sm text-rahaa-navy">
                    {car.make} {car.model}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-cairo font-bold ${
                      car.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {car.status === 'approved' ? 'معتمدة ومتاحة' : 'قيد المراجعة'}
                  </span>
                </div>

                <div className="text-xs text-rahaa-text-muted space-y-1">
                  <div>رقم اللوحة: <strong className="text-rahaa-navy">{car.plate_number}</strong></div>
                  <div>سنة الصنع: <strong className="text-rahaa-navy">{car.year}</strong> • الفئة: <strong className="text-rahaa-navy">{car.category?.toUpperCase()}</strong></div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>{car.location_name || 'صنعاء'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-rahaa-border flex items-center justify-between">
                <span className="text-[11px] text-rahaa-text-subtle">إيجار يومي:</span>
                <span className="font-cairo font-bold text-sm text-amber-700">
                  {Number(car.daily_rate || 25000).toLocaleString()} ر.ي / يوم
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Rental Vehicle Modal */}
      {isAddCarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rahaa-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h3 className="font-cairo font-bold text-base text-rahaa-navy">إضافة سيارة جديدة لأسطول التأجير</h3>
              <button
                type="button"
                onClick={() => setIsAddCarOpen(false)}
                className="w-8 h-8 rounded-lg bg-rahaa-bg text-rahaa-navy flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {carFormMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  carFormMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {carFormMsg.text}
              </div>
            )}

            <form onSubmit={handleAddRentalCar} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-cairo font-bold text-rahaa-navy mb-1">الشركة المصنعة</label>
                  <input
                    type="text"
                    required
                    value={newCar.make}
                    onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg"
                  />
                </div>
                <div>
                  <label className="block font-cairo font-bold text-rahaa-navy mb-1">الموديل والطراز</label>
                  <input
                    type="text"
                    required
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-cairo font-bold text-rahaa-navy mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    required
                    placeholder="صنعاء / 88412"
                    value={newCar.plate_number}
                    onChange={(e) => setNewCar({ ...newCar, plate_number: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg"
                  />
                </div>
                <div>
                  <label className="block font-cairo font-bold text-rahaa-navy mb-1">الإيجار اليومي (ر.ي)</label>
                  <input
                    type="number"
                    required
                    value={newCar.daily_rate}
                    onChange={(e) => setNewCar({ ...newCar, daily_rate: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-cairo font-bold text-rahaa-navy mb-1">موقع استلام السيارة</label>
                <input
                  type="text"
                  required
                  value={newCar.location_name}
                  onChange={(e) => setNewCar({ ...newCar, location_name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg"
                />
              </div>

              <button
                type="submit"
                disabled={addingCar}
                className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs shadow-md"
              >
                {addingCar ? 'جاري الحفظ...' : 'إدراج السيارة في أسطول التأجير'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverRentalDashboard;

