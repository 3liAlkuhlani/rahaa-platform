import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Truck,
  Package,
  DollarSign,
  Star,
  Check,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Scale,
  Clock,
  Navigation,
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';

export const DriverTruckDashboard = () => {
  const context = useOutletContext();
  const isOnline = context?.isOnline ?? true;
  const setIsOnline = context?.setIsOnline ?? (() => {});
  const currentUser = getCurrentUser();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myTrucks, setMyTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchTruckPortalData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.getAvailableCargoOrders();
      const avail = (res?.orders || []).filter((o) => o.service_type === 'truck');
      const mine = (res?.my_orders || []).filter((o) => o.service_type === 'truck');
      const trucks = (res?.my_vehicles || []).filter((v) => v.service_type === 'truck');

      setAvailableOrders(avail);
      setMyOrders(mine);
      setMyTrucks(trucks);
    } catch (err) {
      setErrorMsg(err.message || 'تعذر جلب طلبات الشحن ونقل البضائع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTruckPortalData();
  }, []);

  const handleAcceptCargo = async (orderId) => {
    setBusyId(orderId);
    setErrorMsg('');
    try {
      await api.acceptCargoOrder(orderId);
      await fetchTruckPortalData();
    } catch (err) {
      setErrorMsg(err.message || 'تعذر قبول طلب الشحن');
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateCargoStatus = async (orderId, nextStatus) => {
    setBusyId(orderId);
    setErrorMsg('');
    try {
      await api.updateCargoStatus(orderId, nextStatus);
      await fetchTruckPortalData();
    } catch (err) {
      setErrorMsg(err.message || 'تعذر تحديث حالة الحمولة');
    } finally {
      setBusyId(null);
    }
  };

  const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');
  const activeOrders = myOrders.filter((o) => ['accepted', 'loading', 'in_transit'].includes(o.status));
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + Number(o.estimated_fare || 0) * 0.9, 0);

  const statusMeta = {
    accepted: { label: 'تم القبول - توجه للتحميل', next: 'loading', nextText: 'بدء تحميل البضاعة والعفش', color: 'bg-blue-600' },
    loading: { label: 'جاري تحميل الشاحنة', next: 'in_transit', nextText: 'الانطلاق بالشاحنة نحو الوجهة', color: 'bg-amber-600' },
    in_transit: { label: 'الشاحنة في الطريق للوجهة', next: 'delivered', nextText: 'تأكيد التسليم والتفريغ النهائي', color: 'bg-emerald-600' },
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-tajawal animate-fadeIn" dir="rtl">
      {/* Truck Driver Dedicated Hero Banner (Rahah Logo Navy, Ribbon Blue & Golden-Amber) */}
      <div className="bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] rounded-3xl text-white p-6 shadow-rahaa-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[#2984DF]/30">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-[#0B58A8] via-[#2984DF] to-[#EE9224]" />
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EE9224]/25 border border-[#EE9224]/40 text-[#FDE68A] text-xs font-cairo font-bold">
            <Truck className="w-3.5 h-3.5 text-[#EE9224]" />
            <span>بوابة شاحنات نقل البضائع والأثاث الثقيل - صنعاء</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo">
            أهلاً بك يا كابتن {currentUser?.name || 'وليد الحميري'}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 font-tajawal max-w-lg">
            {isOnline
              ? 'شاحنتك متصلة الآن في شبكة راحة للشحن الثقيل ونقل الأثاث والبضائع في أمانة العاصمة.'
              : 'أنت غير متصل حالياً. فعّل الاتصال لاستقبال طلبات نقل الأثاث والبضائع.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={`z-10 h-11 px-5 rounded-2xl font-cairo font-bold text-xs flex items-center gap-2.5 transition-all shadow-md ${
            isOnline
              ? 'bg-[#EE9224] text-white hover:bg-[#D67E16]'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
          <span>{isOnline ? 'الشاحنة جاهزة للتحميل' : 'تفعيل وضع الاستعداد'}</span>
        </button>

        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Truck KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">أرباح نقل الحمولات</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {(totalEarnings || 64000).toLocaleString()} <span className="text-xs font-normal text-rahaa-text-muted">ر.ي</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-tajawal mt-0.5">
              صافي حصة كابتن الشاحنة (90%)
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">عمليات الشحن المنجزة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {deliveredOrders.length || 8} <span className="text-xs font-normal text-rahaa-text-muted">نقلة مكتملة</span>
            </div>
            <div className="text-[11px] text-rahaa-text-muted font-tajawal mt-0.5">
              نقل آمن وموثوق للأثاث والبضائع
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card flex items-start gap-3.5 text-right">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">طلبات الشحن المتاحة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              {availableOrders.length} <span className="text-xs font-normal text-rahaa-text-muted">طلب شاحنة</span>
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
            <span className="text-xs font-cairo font-semibold text-rahaa-text-muted block">تقييم كابتن الشاحنة</span>
            <div className="text-xl font-bold font-cairo text-rahaa-navy mt-1">
              4.92 <span className="text-xs font-normal text-rahaa-text-muted">/ 5.0</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-tajawal mt-0.5">
              التزام عالٍ بسلامة الحمولات
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

      {/* Active Assigned Cargo Orders (If any) */}
      {activeOrders.length > 0 && (
        <div className="bg-emerald-50/70 rounded-3xl p-6 border-2 border-emerald-500/40 shadow-rahaa-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>الحمولات النشطة قيد التنفيذ حالياً ({activeOrders.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {activeOrders.map((order) => {
              const meta = statusMeta[order.status] || statusMeta.accepted;
              return (
                <div key={order.id} className="p-5 rounded-2xl bg-rahaa-card border border-rahaa-border space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-cairo font-bold text-emerald-700">
                        طلب شحن #{order.request_number} — {order.cargo_type || 'نقل بضائع وأثاث'}
                      </span>
                      <p className="text-xs text-rahaa-text-muted mt-0.5">{order.cargo_description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-cairo font-bold text-xs">
                      {meta.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
                      <span className="text-[10px] text-rahaa-text-subtle block">موقع التحميل</span>
                      <strong className="font-cairo text-rahaa-navy">{order.pickup_location}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
                      <span className="text-[10px] text-rahaa-text-subtle block">موقع التفريغ والتسليم</span>
                      <strong className="font-cairo text-rahaa-navy">{order.delivery_location}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-cairo font-bold text-sm text-emerald-700">
                      الأجرة المعتمدة: {Number(order.estimated_fare || 0).toLocaleString()} ر.ي
                    </span>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => handleUpdateCargoStatus(order.id, meta.next)}
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

      {/* Available Pending Truck Orders */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rahaa-border">
          <div>
            <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>طلبات الشاحنات ونقل الأثاث المتاحة للقبول</span>
            </h2>
            <p className="text-xs text-rahaa-text-muted font-tajawal">
              راجع تفاصيل الحمولة والوزن وموقعي التحميل والتفريغ قبل قبول النقلة
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTruckPortalData}
            className="h-10 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg hover:bg-emerald-50 text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-rahaa-text-muted">جاري البحث عن طلبات شحن متاحة...</div>
        ) : availableOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-rahaa-bg border border-rahaa-border text-center space-y-2">
            <Package className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-cairo font-bold text-sm text-rahaa-navy">لا توجد طلبات شحن معلقة في الوقت الحالي</p>
            <p className="text-xs text-rahaa-text-muted">ستظهر هنا طلبات نقل البضائع والأثاث فور طلبها من العملاء.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-rahaa-bg border border-rahaa-border space-y-4 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rahaa-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-cairo font-bold text-xs">
                        #{order.request_number}
                      </span>
                      <h3 className="font-cairo font-bold text-sm text-rahaa-navy">
                        {order.cargo_type || 'نقل بضائع وعفش'}
                      </h3>
                    </div>
                    <p className="text-xs text-rahaa-text-muted mt-1">
                      {order.cargo_description || 'حمولة جاهزة للنقل داخل صنعاء'}
                    </p>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-cairo font-bold text-xs">
                    {Number(order.estimated_fare || 0).toLocaleString()} ر.ي
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-rahaa-text-subtle block">موقع التحميل</span>
                      <strong className="font-cairo text-rahaa-navy">{order.pickup_location}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-rahaa-text-subtle block">موقع التفريغ</span>
                      <strong className="font-cairo text-rahaa-navy">{order.delivery_location}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rahaa-card border border-rahaa-border flex items-start gap-2">
                    <Scale className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-rahaa-text-subtle block">الوزن التقديري والعميل</span>
                      <strong className="font-cairo text-rahaa-navy">
                        {order.weight_kg || 1500} كجم • {order.sender?.name || 'عميل راحة'}
                      </strong>
                    </div>
                  </div>
                </div>

                {isOnline && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => handleAcceptCargo(order.id)}
                      className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>{busyId === order.id ? 'جاري قبول الطلب...' : 'قبول طلب الشحن والتوجه للتحميل'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Truck Vehicle Specifications Card */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rahaa-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy">
              بيانات شاحنة النقل المسجلة باسمك
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-cairo font-bold">
            شاحنة نقل معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">طراز ونوع الشاحنة</span>
            <strong className="font-cairo text-sm text-rahaa-navy">
              {myTrucks[0] ? `${myTrucks[0].make} ${myTrucks[0].model}` : 'إيسوزو دينا نقل عفش وبضائع'}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">رقم لوحة الشاحنة</span>
            <strong className="font-cairo text-sm text-rahaa-navy">
              {myTrucks[0]?.plate_number || 'صنعاء نقل / 55102'}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
            <span className="text-rahaa-text-subtle block mb-1">الحمولة القصوى المصرحة</span>
            <strong className="font-cairo text-sm text-emerald-700">
              {Number(myTrucks[0]?.max_payload_kg || 4500).toLocaleString()} كجم (4.5 طن)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverTruckDashboard;

