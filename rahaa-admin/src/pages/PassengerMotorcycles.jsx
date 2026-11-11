import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Bike,
  MapPin,
  Package,
  User,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Compass
} from 'lucide-react';
import { ServiceWorkflowStepper } from '../components/transport/ServiceWorkflowStepper';
import { RatingModal } from '../components/common/RatingModal';

export const PassengerMotorcycles = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [serviceMode, setServiceMode] = useState('passenger'); // 'passenger' | 'delivery'
  const [pickupLocation, setPickupLocation] = useState(location.state?.pickup || 'شارع حدة - أمانة العاصمة');
  const [deliveryLocation, setDeliveryLocation] = useState(location.state?.dropoff || 'شارع الزبيري - جولة كنتاكي');
  const [deliveryItemType, setDeliveryItemType] = useState('طرد ووثائق مستعجلة');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(location.state?.locationConfirmed ? 2 : 1);

  // Pricing formula for Sana'a Motorcycles
  const baseFare = serviceMode === 'passenger' ? 800 : 1000;
  const estimatedFare = baseFare + 400; // 1,200 - 1,400 YER

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLocation || !deliveryLocation) {
      setErrorMsg('يرجى إدخال موقع الانطلاق وموقع الوصول');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.requestCargo({
        service_type: 'motorcycle',
        sub_service: serviceMode,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        cargo_type: serviceMode === 'passenger' ? 'مشوار راكب فردي' : deliveryItemType,
        cargo_description: notes,
        estimated_fare: estimatedFare,
        payment_method: 'cash',
      });

      setSuccessOrder(res.cargo);
      setWorkflowStep(4);
    } catch (err) {
      setErrorMsg(err.message || 'فشل إرسال طلب الدراجة النارية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-tajawal animate-fadeIn p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* 1. Workflow Stepper */}
      <ServiceWorkflowStepper
        steps={[
          { id: 1, label: 'نوع المشوار' },
          { id: 2, label: 'تحديد المسار' },
          { id: 3, label: 'تأكيد السعر' },
          { id: 4, label: 'متابعة الدراجة' },
          { id: 5, label: 'التقييم والدفع' },
        ]}
        currentStep={workflowStep}
        onStepClick={(s) => {
          if (successOrder && s < 4) {
            setSuccessOrder(null);
          }
          setWorkflowStep(s);
        }}
      />

      {/* 2. Hero Banner: Cyan Blue theme (Navy to Cyan - strictly NO orange) */}
      <div className="bg-gradient-to-r from-[#0B1B36] via-[#0369A1] to-[#06B6D4] rounded-3xl p-6 sm:p-8 text-white shadow-rahaa-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-xs">
            <Bike className="w-3.5 h-3.5 text-cyan-200" />
            خدمة الدراجات النارية السريعة
          </span>
          <h1 className="font-cairo font-black text-2xl sm:text-3xl text-white">
            مشاوير وتوصيل فوري بالدراجات النارية
          </h1>
          <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            تجاوز الازدحام المروري في دقائق معدودة؛ تنقل فردي آمن وسريع، أو توصيل مستندات وطلبات خفيفة بأقل تكلفة.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs font-bold shrink-0">
          <Zap className="w-6 h-6 text-cyan-300" />
          <span>وصول خلال 5-10 دقائق داخل صنعاء</span>
        </div>
      </div>

      {successOrder ? (
        <div className="bg-white rounded-3xl border border-rahaa-border p-8 text-center max-w-xl mx-auto shadow-rahaa-md animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h3 className="font-cairo font-bold text-xl text-rahaa-navy mb-1">
            تم استلام طلب الدراجة بنجاح!
          </h3>
          <p className="text-xs text-rahaa-text-subtle mb-4">
            رقم الطلب: <strong className="text-rahaa-navy font-tajawal">{successOrder.request_number}</strong>
          </p>
          <div className="p-4 rounded-xl bg-slate-50 text-right space-y-2 text-xs mb-6 border border-rahaa-border">
            <div className="flex justify-between">
              <span className="text-rahaa-text-subtle">نوع الخدمة:</span>
              <span className="font-bold text-rahaa-navy">
                {successOrder.sub_service === 'passenger' ? 'مشوار راكب سريع' : 'توصيل طرد وطلبات'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-rahaa-text-subtle">نقطة الانطلاق:</span>
              <span className="font-bold text-rahaa-navy">{successOrder.pickup_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rahaa-text-subtle">نقطة الوصول:</span>
              <span className="font-bold text-rahaa-navy">{successOrder.delivery_location}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-rahaa-border font-cairo font-black text-sm text-cyan-700">
              <span>الأجرة المقدرة:</span>
              <span>{Number(successOrder.estimated_fare).toLocaleString()} ر.ي</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRatingOpen(true)}
            className="w-full h-11 rounded-xl bg-gradient-to-l from-[#0B1B36] via-[#0369A1] to-[#06B6D4] text-white font-cairo font-bold text-xs shadow-md shadow-cyan-900/25 mb-2"
          >
            تقييم كابتن الدراجة
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccessOrder(null);
              setWorkflowStep(1);
            }}
            className="w-full h-11 rounded-xl bg-slate-100 text-slate-700 font-cairo font-bold text-xs hover:bg-slate-200 transition-all"
          >
            طلب دراجة جديدة
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-rahaa-border p-6 sm:p-8 shadow-rahaa-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
            <h3 className="font-cairo font-bold text-lg text-rahaa-navy flex items-center gap-2">
              <Bike className="w-5 h-5 text-cyan-600" />
              <span>حدد نوع الطلب وتفاصيل المسار</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate('/passenger')}
              className="text-xs font-cairo font-bold text-slate-500 hover:text-cyan-700 flex items-center gap-1 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>اختيار وسيلة أخرى</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div>
            <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-2">
              اختر نوع الخدمة:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setServiceMode('passenger')}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  serviceMode === 'passenger'
                    ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-bold ring-2 ring-cyan-600/30'
                    : 'border-rahaa-border text-rahaa-text-muted hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="font-cairo font-bold text-xs block">مشوار راكب</span>
                  <span className="text-[10px] text-rahaa-text-subtle block">تنقل فردي سريع وخوذة أمان</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceMode('delivery')}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  serviceMode === 'delivery'
                    ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-bold ring-2 ring-cyan-600/30'
                    : 'border-rahaa-border text-rahaa-text-muted hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="font-cairo font-bold text-xs block">توصيل طرد وطلبات</span>
                  <span className="text-[10px] text-rahaa-text-subtle block">أوراق ومشتريات وأغراض خفيفة</span>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Item Type if delivery selected */}
          {serviceMode === 'delivery' && (
            <div>
              <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                نوع الغرض المراد توصيله:
              </label>
              <select
                value={deliveryItemType}
                onChange={(e) => setDeliveryItemType(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-cairo font-bold text-rahaa-navy focus:border-cyan-500 focus:outline-none"
              >
                <option value="طرد ووثائق مستعجلة">طرد ووثائق ومستندات رسمية</option>
                <option value="أدوية ومستلزمات طبية">أدوية ومستلزمات صيدلية</option>
                <option value="أطعمة ووجبات سريعة">أطعمة ووجبات غذائية</option>
                <option value="إلكترونيات وهواتف">أجهزة وهواتف ذكية</option>
                <option value="مشتريات عامة">مشتريات عامة صغيرة</option>
              </select>
            </div>
          )}

          {/* Locations */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                موقع الاستلام / الانطلاق:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="مثال: صنعاء - شارع الزبيري - جولة كنتاكي"
                  className="w-full h-11 pr-10 pl-24 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-cyan-500 focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-cyan-600 absolute right-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() =>
                    navigate('/passenger/location', {
                      state: { serviceType: 'motorcycle', pickup: pickupLocation, dropoff: deliveryLocation },
                    })
                  }
                  className="absolute left-2 top-2 h-7 px-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-cairo font-bold text-[10px]"
                >
                  تحديد بالخريطة
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                موقع التوصيل / الوجهة:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="مثال: صنعاء - حي الصافية - قرب المركز الثقافي"
                  className="w-full h-11 pr-10 pl-24 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-cyan-500 focus:outline-none"
                />
                <Navigation className="w-4 h-4 text-cyan-600 absolute right-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() =>
                    navigate('/passenger/location', {
                      state: { serviceType: 'motorcycle', pickup: pickupLocation, dropoff: deliveryLocation },
                    })
                  }
                  className="absolute left-2 top-2 h-7 px-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-cairo font-bold text-[10px]"
                >
                  تحديد بالخريطة
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                ملاحظات إضافية للكابتن:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="رقم المستلم، علامة مميزة للموقع، إلخ..."
                className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-rahaa-text-subtle block">التكلفة التقديرية للرحلة:</span>
              <span className="font-cairo font-black text-base text-cyan-900">
                {estimatedFare.toLocaleString()} ر.ي
              </span>
            </div>
            <span className="text-[11px] font-bold text-cyan-800 bg-white px-3 py-1 rounded-full border border-cyan-200">
              دفع نقدي عند الوصول
            </span>
          </div>

          {/* Action Buttons: Sequential Next & Previous */}
          <div className="space-y-2.5 pt-2">
            {/* Requirement #3: Strictly Navy Blue to Cyan Blue Gradient (NO ORANGE AT ALL) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-l from-[#0B1B36] via-[#0369A1] to-[#06B6D4] hover:from-[#081326] hover:via-[#0284C7] hover:to-[#0891B2] active:scale-[0.99] text-white font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-900/25 disabled:opacity-50"
            >
              <Bike className="w-4 h-4" />
              <span>{loading ? 'جاري البحث عن كابتن دراجة...' : 'التالي: تأكيد وإرسال طلب الدراجة'}</span>
              <ArrowLeft className="w-4 h-4" />
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
      )}

      {/* Rating Modal */}
      {successOrder && (
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          entityType="cargo"
          entityId={successOrder.id}
          title="تقييم رحلة وتوصيل الدراجة النارية"
          onSubmitted={() => {
            alert('تم حفظ تقييمك للدراجة بنجاح!');
            setWorkflowStep(5);
          }}
        />
      )}
    </div>
  );
};

export default PassengerMotorcycles;
