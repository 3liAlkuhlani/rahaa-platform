import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Bike,
  Zap,
  DollarSign,
  Star,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Package,
  Navigation,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';

export const DriverMotorcycleDashboard = () => {
  const context = useOutletContext();
  const isOnline = context?.isOnline ?? true;
  const setIsOnline = context?.setIsOnline ?? (() => {});
  const currentUser = getCurrentUser();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myMotos, setMyMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchMotorcyclePortalData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getAvailableCargoOrders();
      const avail = (res?.orders || []).filter((o) => o.service_type === 'motorcycle');
      const mine = (res?.my_orders || []).filter((o) => o.service_type === 'motorcycle');
      const motos = (res?.my_vehicles || []).filter((v) => v.service_type === 'motorcycle');

      setAvailableOrders(avail);
      setMyOrders(mine);
      setMyMotos(motos);
    } catch (err) {
      setErrorMsg(err.message || 'تعذر جلب طلبات التوصيل والمشاوير السريعة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorcyclePortalData();
  }, []);

  const handleAcceptMotoOrder = async (orderId) => {
    setBusyId(orderId);
    setErrorMsg('');
    try {
      await api.acceptCargoOrder(orderId);
      await fetchMotorcyclePortalData();
    } catch (err) {
      setErrorMsg(err.message || 'تعذر قبول الطلب الفوري');
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateMotoStatus = async (orderId, nextStatus) => {
    setBusyId(orderId);
    setErrorMsg('');
    try {
      await api.updateCargoStatus(orderId, nextStatus);
      await fetchMotorcyclePortalData();
    } catch (err) {
      setErrorMsg(err.message || 'تعذر تحديث حالة التوصيل');
    } finally {
      setBusyId(null);
    }
  };

  const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');
  const activeOrders = myOrders.filter((o) => ['accepted', 'loading', 'in_transit'].includes(o.status));
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + Number(o.estimated_fare || 0) * 0.9, 0);

  const statusMeta = {
    accepted: { label: 'تم القبول - توجه للاستلام', next: 'loading', nextText: 'تأكيد استلام الطرد / الراكب', color: 'bg-cyan-600' },
    loading: { label: 'تم الاستلام بنجاح', next: 'in_transit', nextText: 'بدء التوصيل السريع للوجهة', color: 'bg-blue-600' },
    in_transit: { label: 'جاري التوصيل السريع', next: 'delivered', nextText: 'تأكيد التسليم وإنهاء الطلب', color: 'bg-emerald-600' },
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-tajawal animate-fadeIn" dir="rtl">
      {/* Motorcycle Driver Dedicated Hero Banner */}
      <div className="bg-gradient-to-l from-[#0B1B36] via-[#0369A1] to-[#06B6D4] rounded-3xl text-white p-6 shadow-rahaa-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-cyan-100 text-xs font-cairo font-bold">
            <Bike className="w-3.5 h-3.5" />
            <span>بوابة كابتن الدراجات النارية والتوصيل الفوري - صنعاء</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo">
            أهلاً بك يا كابتن {currentUser?.name || 'عصام البعداني'}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 font-tajawal max-w-lg">
            {isOnline
              ? 'دراجتك متصلة الآن وجاهزة لتجاوز الزحام وتنفيذ طلبات التوصيل السريع للطرود والركاب.'
              : 'أنت غير متصل حالياً. فعّل الاتصال لاستقبال طلبات التوصيل الفوري والمشاوير السريعة.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={`z-10 h-11 px-5 rounded-2xl font-cairo font-bold text-xs flex items-center gap-2.5 transition-all shadow-md ${
            isOnline
              ? 'bg-white text-cyan-900 hover:bg-cyan-50'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-cyan-500 animate-pulse' : 'bg-gray-300'}`} />
          <span>{isOnline ? 'متصل وجاهز للتوصيل' : 'تفعيل وضع الاستعداد'}</span>
        </button>

        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Motorcycle KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">أرباح التوصيل والمشاوير</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {(totalEarnings || 14200).toLocaleString()} <span className="text-xs font-normal text-rahaa-text-muted">ر.ي</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-tajawal mt-0.5">
              صافي حصة كابتن الدراجة (90%)
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">الطلبات السريعة المنجزة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {deliveredOrders.length || 19} <span className="text-xs font-normal text-rahaa-text-muted">توصيلة سريعة</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              متوسط زمن التوصيل: 14 دقيقة
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">طلبات الدراجة المتاحة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {availableOrders.length} <span className="text-xs font-normal text-rahaa-text-muted">طلب فوري</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              نشطة حالياً: {activeOrders.length}
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">تقييم الكابتن السريع</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              5.00 <span className="text-xs font-normal text-rahaa-text-muted">/ 5.0</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-tajawal mt-0.5">
              أسرع كابتن توصيل في صنعاء
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

      {/* Active Motorcycle Orders Execution */}
      {activeOrders.length > 0 && (
        <div className="bg-cyan-50/70 rounded-3xl p-6 border-2 border-cyan-500/40 shadow-rahaa-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-200">
            <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-600" />
              <span>طلبات التوصيل السريع الجارية حالياً ({activeOrders.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {activeOrders.map((order) => {
              const meta = statusMeta[order.status] || statusMeta.accepted;
              return (
                <div key={order.id} className="p-5 rounded-2xl bg-rahaa-card border border-rahaa-border space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-cairo font-bold text-cyan-700">
                        طلب دراجة #{order.request_number} — {order.cargo_type || 'توصيل طرد فوري'}
                      </span>
                      <p className="text-xs text-rahaa-text-muted mt-0.5">{order.cargo_description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 font-cairo font-bold text-xs">
                      {meta.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
                      <span className="text-[10px] text-rahaa-text-subtle block">نقطة الاستلام</span>
                      <strong className="font-cairo text-rahaa-navy">{order.pickup_location}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
                      <span className="text-[10px] text-rahaa-text-subtle block">وجهة التوصيل السريع</span>
                      <strong className="font-cairo text-rahaa-navy">{order.delivery_location}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-cairo font-bold text-sm text-cyan-700">
                      أجرة التوصيل: {Number(order.estimated_fare || 0).toLocaleString()} ر.ي
                    </span>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => handleUpdateMotoStatus(order.id, meta.next)}
                      className={`h-10 px-5 rounded-xl ${meta.color} hover:opacity-95 text-white font-cairo font-bold text-xs flex items-center gap-2 shadow-sm`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{busyId === order.id ? 'جاري التحديث...' : meta.nextText}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Pending Motorcycle Orders */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rahaa-border">
          <div>
            <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Bike className="w-4 h-4 text-cyan-600" />
              <span>طلبات الدراجات النارية والتوصيل السريع المتاحة</span>
            </h2>
            <p className="text-xs text-rahaa-text-muted font-tajawal">
              اقبل طلبات توصيل الطرود والمستندات والمشاوير الفورية القريبة منك
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMotorcyclePortalData}
            className="h-10 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-cyan-50 text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-rahaa-text-muted">جاري البحث عن طلبات دراجة سريعة...</div>
        ) : availableOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-rahaa-bg border border-rahaa-border text-center space-y-2">
            <Bike className="w-8 h-8 text-cyan-600 mx-auto" />
            <p className="font-cairo font-bold text-sm text-rahaa-navy">لا توجد طلبات توصيل معلقة في الوقت الحالي</p>
            <p className="text-xs text-rahaa-text-muted">ستظهر هنا طلبات الدراجات النارية فور إرسالها من العملاء.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-rahaa-bg border border-rahaa-border space-y-4 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rahaa-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-600 text-white font-cairo font-bold text-xs">
                        #{order.request_number}
                      </span>
                      <h3 className="font-cairo font-bold text-sm text-rahaa-navy">
                        {order.cargo_type || 'توصيل سريع بالدراجة'}
                      </h3>
                    </div>
                    <p className="text-xs text-rahaa-text-muted mt-1">
                      {order.cargo_description || 'طلب توصيل فوري داخل أمانة العاصمة'}
                    </p>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white font-cairo font-bold text-xs">
                    {Number(order.estimated_fare || 0).toLocaleString()} ر.ي
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-rahaa-text-subtle block">نقطة الاستلام</span>
                      <strong className="font-cairo text-rahaa-navy">{order.pickup_location}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-rahaa-text-subtle block">نقطة التسليم</span>
                      <strong className="font-cairo text-rahaa-navy">{order.delivery_location}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2">
                    <Package className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-rahaa-text-subtle block">العميل ونوع الطلب</span>
                      <strong className="font-cairo text-rahaa-navy">
                        {order.sender?.name || 'عميل راحة'} ({order.sub_service === 'passenger' ? 'مشوار راكب' : 'توصيل طرد'})
                      </strong>
                    </div>
                  </div>
                </div>

                {isOnline && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => handleAcceptMotoOrder(order.id)}
                      className="h-11 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-cairo font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>{busyId === order.id ? 'جاري القبول...' : 'قبول الطلب الفوري والانطلاق'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motorcycle Vehicle Info Card */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rahaa-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600" />
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy">
              بيانات الدراجة النارية المسجلة باسمك
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-cairo font-bold">
            دراجة نارية معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">طراز الدراجة النارية</span>
            <strong className="font-cairo text-sm text-rahaa-navy">
              {myMotos[0] ? `${myMotos[0].make} ${myMotos[0].model}` : 'سانيانغ سكوتر ديلفري 150cc'}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">رقم لوحة الدراجة</span>
            <strong className="font-cairo text-sm text-rahaa-navy">
              {myMotos[0]?.plate_number || 'صنعاء دراجة / 9901'}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">نطاق الخدمة</span>
            <strong className="font-cairo text-sm text-cyan-700">
              توصيل فوري للطرود ومشاوير الركاب
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMotorcycleDashboard;

