import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Car,
  DollarSign,
  Clock,
  Star,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Compass,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';

export const DriverTaxiDashboard = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const isOnline = context?.isOnline ?? true;
  const setIsOnline = context?.setIsOnline ?? (() => {});
  const currentUser = getCurrentUser();
  const dropdownRef = useRef(null);

  const [availableTrips, setAvailableTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripError, setTripError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  const fetchTaxiData = async () => {
    setLoadingTrips(true);
    setTripError('');
    try {
      const [availRes, myRes, srvRes] = await Promise.allSettled([
        api.getAvailableTrips(),
        api.getMyTrips(),
        api.getMyTransportServices(),
      ]);

      if (availRes.status === 'fulfilled' && availRes.value?.trips?.data) {
        const list = availRes.value.trips.data;
        setAvailableTrips(list);
        if (list.length > 0 && !selectedTrip) {
          setSelectedTrip(list[0]);
        }
      }

      if (myRes.status === 'fulfilled' && myRes.value?.trips?.data) {
        setMyTrips(myRes.value.trips.data);
      }

      if (srvRes.status === 'fulfilled' && srvRes.value?.vehicles) {
        setMyVehicles(srvRes.value.vehicles.filter((v) => v.service_type === 'taxi'));
      }
    } catch (err) {
      setTripError(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchTaxiData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAcceptRide = async (tripToAccept) => {
    if (!tripToAccept || accepting) return;
    setAccepting(true);
    setAcceptError('');

    try {
      const res = await api.acceptTrip(tripToAccept.id);
      const confirmedTrip = res?.trip || tripToAccept;
      navigate('/driver/active-trip', {
        state: { trip: confirmedTrip },
      });
    } catch (err) {
      setAcceptError(err.message || 'تعذر قبول وتأكيد الرحلة');
    } finally {
      setAccepting(false);
    }
  };

  const completedTrips = myTrips.filter((t) => t.status === 'completed');
  const todayEarnings = completedTrips.reduce((sum, t) => sum + Number(t.fare || 0) * 0.9, 0);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-tajawal animate-fadeIn" dir="rtl">
      {/* Taxi Driver Dedicated Banner */}
      <div className="bg-gradient-to-l from-[#0B1B36] via-[#122B56] to-[#1D4ED8] rounded-3xl text-white p-6 shadow-rahaa-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-cairo font-bold">
            <Car className="w-3.5 h-3.5" />
            <span>بوابة كابتن سيارات الأجرة (تاكسي) - صنعاء</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo">
            أهلاً بك يا كابتن {currentUser?.name || 'صالح'}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 font-tajawal max-w-md">
            {isOnline
              ? 'سيارة الأجرة الخاصة بك متصلة الآن وجاهزة لاستقبال طلبات المشاوير الفورية داخل أمانة العاصمة.'
              : 'أنت في وضع غير متصل حالياً. فعّل الاتصال لاستقبال مشاوير التاكسي القريبة منك.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={`z-10 h-11 px-5 rounded-2xl font-cairo font-bold text-xs flex items-center gap-2.5 transition-all shadow-md ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
          <span>{isOnline ? 'متصل وجاهز للمشاوير' : 'تفعيل وضع الاستعداد'}</span>
        </button>

        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Taxi Performance KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-rahaa-emerald-bg text-rahaa-emerald flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">صافي أرباح التاكسي</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {(todayEarnings || 18450).toLocaleString()} <span className="text-xs font-normal text-rahaa-text-muted">ر.ي</span>
            </div>
            <div className="text-[11px] text-rahaa-emerald font-tajawal mt-0.5">
              صافي حصة الكابتن (90%)
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-rahaa-blue-light text-rahaa-blue flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">مشاوير التاكسي المنفذة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {completedTrips.length || currentUser?.profile?.total_trips || 1} <span className="text-xs font-normal text-rahaa-text-muted">مشوار</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              معدل قبول المشاوير 98%
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">طلبات التاكسي المتاحة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {availableTrips.length} <span className="text-xs font-normal text-rahaa-text-muted">طلب فوري</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              تحديث لحظي من رادار صنعاء
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">تقييم كابتن التاكسي</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {currentUser?.profile?.rating || '4.95'} <span className="text-xs font-normal text-rahaa-text-muted">/ 5.0</span>
            </div>
            <div className="text-[11px] text-rahaa-emerald font-tajawal mt-0.5">
              كابتن معتمد وموثق
            </div>
          </div>
        </div>
      </div>

      {/* Live Available Taxi Rides */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rahaa-border">
          <div>
            <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Car className="w-4 h-4 text-rahaa-blue" />
              <span>طلبات مشاوير التاكسي المتاحة الآن</span>
            </h2>
            <p className="text-xs text-rahaa-text-muted font-tajawal">
              اختر مشواراً من القائمة لعرض نقطة الانطلاق والوجهة وتأكيد القبول الفوري
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTaxiData}
            className="h-10 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-rahaa-blue-light text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rahaa-blue ${loadingTrips ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        {acceptError && (
          <div className="p-3.5 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{acceptError}</span>
          </div>
        )}

        {/* Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full h-12 px-4 bg-rahaa-bg hover:bg-rahaa-blue-soft border border-rahaa-border rounded-xl text-xs font-cairo font-bold text-rahaa-navy flex items-center justify-between transition-colors"
          >
            <span className="truncate">
              {selectedTrip
                ? `#${selectedTrip.trip_number} : ${selectedTrip.pickup_name} ← ${selectedTrip.dropoff_name} (${Number(selectedTrip.fare).toLocaleString()} ر.ي)`
                : 'انقر هنا لعرض واختيار طلبات التاكسي المتاحة...'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-rahaa-blue shrink-0 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-30 mt-1.5 w-full bg-rahaa-card rounded-2xl border border-rahaa-border shadow-xl max-h-64 overflow-y-auto divide-y divide-rahaa-border/50">
              {loadingTrips && (
                <div className="p-4 text-center text-xs font-tajawal text-rahaa-text-muted flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-rahaa-blue border-t-transparent rounded-full animate-spin" />
                  <span>جاري تحميل مشاوير التاكسي...</span>
                </div>
              )}

              {!loadingTrips && tripError && (
                <div className="p-4 text-center text-xs text-rahaa-rose font-tajawal">
                  {tripError}
                </div>
              )}

              {!loadingTrips && !tripError && availableTrips.length === 0 && (
                <div className="p-4 text-center text-xs text-rahaa-text-muted font-tajawal">
                  لا توجد طلبات تاكسي معلقة في الوقت الحالي.
                </div>
              )}

              {!loadingTrips &&
                !tripError &&
                availableTrips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      setSelectedTrip(trip);
                      setIsDropdownOpen(false);
                      setAcceptError('');
                    }}
                    className={`w-full p-3.5 text-right hover:bg-rahaa-blue-soft transition-colors flex items-center justify-between gap-2 ${
                      selectedTrip?.id === trip.id ? 'bg-rahaa-blue-light/60' : ''
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-cairo font-bold text-xs text-rahaa-navy truncate">
                        #{trip.trip_number} — {trip.pickup_name} ← {trip.dropoff_name}
                      </div>
                      <div className="text-[11px] text-rahaa-text-muted font-tajawal">
                        الراكب: {trip.passenger?.name || 'راكب راحة'}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rahaa-blue text-white font-cairo font-bold text-xs shrink-0">
                      {Number(trip.fare).toLocaleString()} ر.ي
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Selected Trip Details Card */}
        {selectedTrip && isOnline ? (
          <div className="p-5 rounded-2xl bg-rahaa-bg border border-rahaa-border space-y-4">
            <div className="flex items-center justify-between border-b border-rahaa-border pb-3">
              <div>
                <span className="text-xs font-cairo font-bold text-rahaa-blue block">
                  تفاصيل مشوار التاكسي المختار (#{selectedTrip.trip_number})
                </span>
                <span className="text-xs font-tajawal text-rahaa-text-muted">
                  الراكب: {selectedTrip.passenger?.name || 'عميل راحة'} • الهاتف: {selectedTrip.passenger?.phone || '—'}
                </span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-rahaa-blue text-white font-cairo font-bold text-xs">
                {Number(selectedTrip.fare || 0).toLocaleString()} ر.ي
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rahaa-emerald mt-1 shrink-0" />
                <div>
                  <span className="text-[11px] text-rahaa-text-subtle font-cairo block">نقطة انطلاق الراكب</span>
                  <span className="font-cairo font-bold text-rahaa-navy">{selectedTrip.pickup_name}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rahaa-orange mt-1 shrink-0" />
                <div>
                  <span className="text-[11px] text-rahaa-text-subtle font-cairo block">وجهة الوصول</span>
                  <span className="font-cairo font-bold text-rahaa-navy">{selectedTrip.dropoff_name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="h-11 px-4 rounded-xl border border-rahaa-border bg-rahaa-card hover:bg-rahaa-bg text-rahaa-navy font-cairo font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-4 h-4 text-rahaa-rose" />
                <span>تجاهل الطلب</span>
              </button>

              <button
                type="button"
                onClick={() => handleAcceptRide(selectedTrip)}
                disabled={accepting}
                className="h-11 px-4 rounded-xl bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{accepting ? 'جاري التأكيد...' : 'قبول المشوار والانتقال للخريطة'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-rahaa-bg border border-rahaa-border text-center space-y-2">
            <Compass className="w-8 h-8 text-rahaa-blue mx-auto" />
            <p className="font-cairo font-bold text-sm text-rahaa-navy">
              {isOnline ? 'اختر مشواراً من القائمة المنسدلة أعلاه لعرض تفاصيله وقبوله' : 'فعّل حالة الاتصال لاستقبال وتأكيد مشاوير التاكسي'}
            </p>
          </div>
        )}
      </div>

      {/* My Taxi Vehicle Card */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rahaa-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rahaa-blue" />
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy">
              بيانات سيارة الأجرة المسجلة باسمك
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-cairo font-bold">
            مركبة تاكسي معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">طراز سيارة الأجرة</span>
            <strong className="font-cairo text-sm text-rahaa-navy">
              {currentUser?.profile?.vehicle_model || myVehicles[0]?.model || 'تويوتا كامري 2022'}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">رقم اللوحة المعدنية</span>
            <strong className="font-cairo text-sm text-rahaa-navy">
              {currentUser?.profile?.vehicle_plate || myVehicles[0]?.plate_number || 'أمانة / 44821'}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">فئة التاكسي</span>
            <strong className="font-cairo text-sm text-rahaa-blue">
              تاكسي راحة المميز (Comfort)
            </strong>
          </div>
        </div>
      </div>

      {/* Completed Taxi Trips History */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rahaa-border">
          <h2 className="text-sm font-cairo font-bold text-rahaa-navy">
            سجل مشاوير التاكسي المنفذة
          </h2>
          <span className="text-xs text-rahaa-text-muted font-tajawal">
            {completedTrips.length} مشوار مكتمل
          </span>
        </div>

        {completedTrips.length === 0 ? (
          <p className="text-xs text-rahaa-text-muted font-tajawal py-4 text-center">
            لا توجد مشاوير تاكسي مكتملة مسجلة بعد.
          </p>
        ) : (
          <div className="space-y-3">
            {completedTrips.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border text-xs"
              >
                <div className="space-y-1">
                  <div className="font-cairo font-bold text-rahaa-navy">
                    {t.pickup_name} ← {t.dropoff_name}
                  </div>
                  <div className="text-[11px] text-rahaa-text-muted font-tajawal">
                    رقم المشوار: #{t.trip_number} • الراكب: {t.passenger?.name || 'عميل راحة'}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-cairo font-bold text-rahaa-emerald">
                    {Number(t.fare || 0).toLocaleString()} ر.ي
                  </div>
                  <div className="text-[10px] text-rahaa-text-subtle font-tajawal">
                    {t.payment_method === 'cash' ? 'نقداً (كاش)' : 'محفظة جيب'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTaxiDashboard;

