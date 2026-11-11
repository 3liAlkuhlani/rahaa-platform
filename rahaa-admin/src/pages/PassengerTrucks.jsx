import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Truck,
  MapPin,
  Package,
  Weight,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Star
} from 'lucide-react';
import { MultiTransportSelector } from '../components/transport/MultiTransportSelector';
import { ServiceWorkflowStepper } from '../components/transport/ServiceWorkflowStepper';
import { RatingModal } from '../components/common/RatingModal';

export const PassengerTrucks = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [pickupLocation, setPickupLocation] = useState(location.state?.pickup || '');
  const [deliveryLocation, setDeliveryLocation] = useState(location.state?.dropoff || '');
  const [truckType, setTruckType] = useState('furniture');
  const [cargoType, setCargoType] = useState('أثاث وعفش منزلي');
  const [cargoDescription, setCargoDescription] = useState('');
  const [weightKg, setWeightKg] = useState('1500');
  const [volumeSize, setVolumeSize] = useState('medium');
  const [scheduledAt, setScheduledAt] = useState('');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Workflow current step:
  // 1: تحديد الموقع, 2: تفاصيل الشحنة, 3: تأكيد الطلب, 4: جاري النقل والتنفيذ, 5: الدفع والتقييم
  const [workflowStep, setWorkflowStep] = useState(location.state?.locationConfirmed ? 2 : 1);

  // Available Truck Categories in Sana'a
  const truckTypes = [
    {
      id: 'small',
      name: 'شاحنة صغيرة (دبّاب نقل)',
      capacity: 'حتى 1 طن',
      baseFare: 3500,
      icon: '🚛',
      suitableFor: 'الكراتين، الأجهزة الكهربائية المفردة، البضائع الخفيفة',
    },
    {
      id: 'furniture',
      name: 'دينا نقل عفش وأثاث',
      capacity: 'حتى 4.5 طن',
      baseFare: 8000,
      icon: '🚚',
      suitableFor: 'نقل غرف النوم، المجالس، الأثاث المكتبي، البضائع المغلقة',
    },
    {
      id: 'medium',
      name: 'شاحنة متوسطة مفتوحة (جامبو)',
      capacity: 'حتى 7 طن',
      baseFare: 14000,
      icon: '🚜',
      suitableFor: 'البضائع التجارية، المواد الغذائية، الأعلاف، المعدات',
    },
    {
      id: 'building',
      name: 'شاحنة مواد بناء وقلابات',
      capacity: 'حتى 15 طن',
      baseFare: 22000,
      icon: '🏗️',
      suitableFor: 'النيس، الكري، الإسمنت، الحديد، الركام، مواد المقاولات',
    },
    {
      id: 'heavy',
      name: 'قاطرة ثقيلة وتريلا',
      capacity: 'حتى 30 طن',
      baseFare: 45000,
      icon: '🛑',
      suitableFor: 'الحاويات والشحنات الصناعية الضخمة بين المدن والمحافظات',
    },
  ];

  const selectedTruck = truckTypes.find((t) => t.id === truckType) || truckTypes[1];
  const estimatedFare = selectedTruck.baseFare + Math.round((Number(weightKg) || 1000) * 1.5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLocation || !deliveryLocation) {
      setErrorMsg('يرجى تحديد موقع التحميل وموقع التسليم');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.requestCargo({
        service_type: 'truck',
        sub_service: 'cargo',
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        cargo_type: cargoType,
        cargo_description: cargoDescription,
        weight_kg: Number(weightKg),
        volume_size: volumeSize,
        required_truck_type: truckType,
        estimated_fare: estimatedFare,
        payment_method: 'cash',
        scheduled_at: scheduledAt || null,
      });

      setSuccessOrder(res.cargo);
      setWorkflowStep(4);
    } catch (err) {
      setErrorMsg(err.message || 'فشل إرسال طلب الشاحنة. يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tajawal animate-fadeIn p-4 sm:p-6 lg:p-8">
      {/* Return to Home Action Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => navigate('/passenger')}
          className="h-10 px-4 rounded-xl border border-rahaa-border bg-white hover:bg-slate-50 text-slate-700 font-cairo font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
        >
          <ArrowRight className="w-4 h-4 text-emerald-600" />
          <span>العودة إلى الرئيسية واختيار وسيلة أخرى</span>
        </button>
      </div>

      {/* 2. Truck Workflow Stepper */}
      <ServiceWorkflowStepper
        steps={[
          { id: 1, label: 'تحديد الموقع' },
          { id: 2, label: 'تفاصيل الشحنة' },
          { id: 3, label: 'تأكيد السعر' },
          { id: 4, label: 'متابعة النقل' },
          { id: 5, label: 'الدفع والتقييم' },
        ]}
        currentStep={workflowStep}
        onStepClick={(s) => {
          if (successOrder && s < 4) {
            setSuccessOrder(null);
          }
          setWorkflowStep(s);
        }}
      />

      {/* 2. Banner Header (Rahah Logo Navy, Ribbon Blue & Golden-Amber Accent) */}
      <div className="bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] rounded-3xl p-6 sm:p-8 text-white shadow-rahaa-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden border border-[#2984DF]/30">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-[#0B58A8] via-[#2984DF] to-[#EE9224]" />
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EE9224]/25 border border-[#EE9224]/40 text-[#FDE68A] text-xs font-bold mb-2 backdrop-blur-xs">
            <Truck className="w-3.5 h-3.5 text-[#EE9224]" />
            شاحنات ونقل العفش والبضائع
          </span>
          <h1 className="font-cairo font-bold text-2xl sm:text-3xl">
            طلب شاحنة نقل عفش وبضائع فورية
          </h1>
          <p className="text-white/90 text-sm mt-1 max-w-2xl leading-relaxed">
            شبكة شاحنات متكاملة في أمانة العاصمة صنعاء؛ دينا نقل عفش، شاحنات مغلقة، قلابات مواد بناء، وقاطرات بأسعار مقننة وتتبع لحظي.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/15 border border-white/20 p-3.5 rounded-2xl backdrop-blur-xs text-xs font-bold">
          <ShieldCheck className="w-6 h-6 text-[#EE9224]" />
          <span>ضمان سلامة الحمولة وسائقين موثقين</span>
        </div>
      </div>

      {successOrder ? (
        <div className="bg-white rounded-2xl border border-rahaa-border p-8 text-center max-w-xl mx-auto shadow-rahaa-md animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h3 className="font-cairo font-bold text-xl text-rahaa-navy mb-1">
            تم استلام طلب الشاحنة بنجاح!
          </h3>
          <p className="text-xs text-rahaa-text-subtle mb-4">
            رقم الطلب: <strong className="text-rahaa-navy font-tajawal">{successOrder.request_number}</strong>
          </p>
          <div className="p-4 rounded-xl bg-rahaa-bg text-right space-y-2 text-xs mb-6 border border-rahaa-border">
            <div className="flex justify-between">
              <span className="text-rahaa-text-subtle">نوع الشاحنة:</span>
              <span className="font-bold text-rahaa-navy">{selectedTruck.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rahaa-text-subtle">نقطة التحميل:</span>
              <span className="font-bold text-rahaa-navy">{successOrder.pickup_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rahaa-text-subtle">نقطة التسليم:</span>
              <span className="font-bold text-rahaa-navy">{successOrder.delivery_location}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-rahaa-border font-cairo font-black text-sm text-emerald-700">
              <span>الأجرة التقديرية:</span>
              <span>{Number(successOrder.estimated_fare).toLocaleString()} ر.ي</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRatingOpen(true)}
            className="w-full h-11 rounded-xl bg-amber-600 text-white font-cairo font-bold text-xs hover:bg-amber-700 transition-all shadow-rahaa-sm mb-2"
          >
            تقييم خدمة النقل والسائق
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccessOrder(null);
              setWorkflowStep(1);
            }}
            className="w-full h-11 rounded-xl bg-slate-100 text-slate-700 font-cairo font-bold text-xs hover:bg-slate-200 transition-all"
          >
            طلب شاحنة جديدة
          </button>
        </div>
      ) : (
        /* Order Form */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Truck Selection & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Truck Categories Selection */}
            <div className="bg-white rounded-3xl border border-rahaa-border p-6 shadow-rahaa-card">
              <h3 className="font-cairo font-bold text-base text-rahaa-navy mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#EE9224]" />
                <span>اختر نوع وسعة الشاحنة المطلوبة:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {truckTypes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTruckType(t.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 text-right ${
                      truckType === t.id
                        ? 'border-[#0B58A8] bg-[#E8F2FC] shadow-xs ring-2 ring-[#0B58A8]/30'
                        : 'border-rahaa-border hover:border-[#0B58A8]/40 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#FEF5E8] border border-[#EE9224]/30 flex items-center justify-center text-2xl shrink-0">
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="font-cairo font-bold text-xs text-rahaa-navy truncate">{t.name}</h4>
                        <span className="text-[11px] font-cairo font-bold text-[#0B58A8] shrink-0">
                          {t.baseFare.toLocaleString()} ر.ي
                        </span>
                      </div>
                      <span className="text-[10px] text-rahaa-text-subtle block font-semibold mb-0.5">
                        سعة الحمولة: {t.capacity}
                      </span>
                      <p className="text-[10px] text-rahaa-text-muted leading-tight line-clamp-2">
                        {t.suitableFor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Cargo Details */}
            <div className="bg-white rounded-3xl border border-rahaa-border p-6 shadow-rahaa-card space-y-4">
              <h3 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0B58A8]" />
                <span>تفاصيل الشحنة والبضائع المنقولة:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    تصنيف البضاعة:
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-cairo font-bold text-rahaa-navy focus:border-rahaa-primary focus:outline-none"
                  >
                    <option value="أثاث وعفش منزلي">أثاث وعفش منزلي</option>
                    <option value="بضائع تجارية وكراتين">بضائع تجارية وكراتين</option>
                    <option value="أجهزة كهربائية ومعدات">أجهزة كهربائية ومعدات</option>
                    <option value="مواد بناء ومقاولات">مواد بناء ومقاولات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    الوزن التقريبي (كجم):
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="مثال: 1500"
                    className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-rahaa-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  وصف الشحنة وملاحظات السائق:
                </label>
                <textarea
                  rows="3"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  placeholder="اكتب تفاصيل إضافية (مثل: عدد الغرف، هل يوجد عمال تحميل وتنزيل، الدور، إلخ)..."
                  className="w-full p-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-rahaa-primary focus:outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Locations & Price Confirmation (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-rahaa-border p-6 shadow-rahaa-card space-y-4">
              <h3 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#EE9224]" />
                <span>مواقع التحميل والتسليم:</span>
              </h3>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  موقع التحميل (من أين):
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="مثال: صنعاء - حي الأصبحي - قرب بريد الأصبحي"
                  className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-rahaa-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  موقع التسليم (إلى أين):
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="مثال: صنعاء - حي النهضة - خلف المستشفى السعودي"
                  className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-rahaa-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  موعد النقل (اختياري / اتركه للطلب الفوري):
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-medium focus:border-rahaa-primary focus:outline-none"
                />
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#E8F2FC]/80 border border-[#0B58A8]/25 space-y-2 text-xs">
                <div className="flex justify-between text-rahaa-text-muted">
                  <span>نوع الشاحنة:</span>
                  <span className="font-bold text-rahaa-navy">{selectedTruck.name}</span>
                </div>
                <div className="flex justify-between text-rahaa-text-muted">
                  <span>الأجرة الأساسية:</span>
                  <span className="font-bold text-rahaa-navy">
                    {selectedTruck.baseFare.toLocaleString()} ر.ي
                  </span>
                </div>
                <div className="flex justify-between text-rahaa-text-muted">
                  <span>حمولة الشحنة:</span>
                  <span className="font-bold text-rahaa-navy">{weightKg} كجم</span>
                </div>
                <div className="pt-2 border-t border-[#0B58A8]/25 flex justify-between font-cairo font-black text-sm text-[#0B58A8]">
                  <span>السعر التقديري الإجمالي:</span>
                  <span>{estimatedFare.toLocaleString()} ر.ي</span>
                </div>
              </div>

              {/* Action Buttons: Next & Previous */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] hover:from-[#051124] hover:to-[#1668BE] text-white font-cairo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/25 disabled:opacity-50"
                >
                  <Truck className="w-4 h-4 text-[#EE9224]" />
                  <span>{loading ? 'جاري إرسال الطلب...' : 'التالي: تأكيد وإرسال طلب الشاحنة'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/passenger/location', {
                      state: {
                        serviceType: 'truck',
                        pickup: pickupLocation,
                        dropoff: deliveryLocation,
                      },
                    })
                  }
                  className="w-full h-10 px-4 border border-rahaa-border text-slate-600 hover:bg-slate-50 font-cairo font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق: تحديد أو تعديل الموقع على الخريطة</span>
                </button>
              </div>
            </div>
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
          title="تقييم خدمة سائق الشاحنة"
          onSubmitted={() => {
            alert('تم حفظ تقييمك للشاحنة بنجاح!');
            setWorkflowStep(5);
          }}
        />
      )}
    </div>
  );
};

export default PassengerTrucks;
