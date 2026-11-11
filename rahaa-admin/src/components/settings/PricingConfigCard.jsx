import React, { useState } from 'react';
import { DollarSign, Percent, Clock, Navigation, Zap, Save, CheckCircle2 } from 'lucide-react';

export default function PricingConfigCard() {
  const [formData, setFormData] = useState({
    baseFare: '1500',
    perKmRate: '300',
    perMinWaitRate: '50',
    commissionRate: '15',
    surgePricing: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">تهيئة التسعير</h2>
            <p className="text-xs text-gray-500 font-tajawal">ضبط التعرفات والعمولات والتسعير الديناميكي</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md ${
            saved
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-brand-600 hover:bg-brand-700 active:scale-95'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>تم حفظ التغييرات</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-right" dir="rtl">
        {/* Base Fare */}
        <div className="space-y-1.5 text-right">
          <label className="block text-sm font-semibold text-gray-700 font-cairo">
            التعرفة الأساسية (ريال يمني)
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.baseFare}
              onChange={(e) => handleChange('baseFare', e.target.value)}
              className="w-full bg-brand-50/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-tajawal focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-right pl-16 font-semibold"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-tajawal text-sm font-medium">
              ر.ي
            </span>
          </div>
          <p className="text-xs text-gray-500 font-tajawal">سعر ثابت عند بدء كل رحلة</p>
        </div>

        {/* Price Per KM */}
        <div className="space-y-1.5 text-right">
          <label className="block text-sm font-semibold text-gray-700 font-cairo">
            السعر لكل كيلومتر
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.perKmRate}
              onChange={(e) => handleChange('perKmRate', e.target.value)}
              className="w-full bg-brand-50/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-tajawal focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-right pl-20 font-semibold"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-tajawal text-sm font-medium">
              ر.ي/كم
            </span>
          </div>
          <p className="text-xs text-gray-500 font-tajawal">يُحتسب بناءً على المسافة المقطوعة</p>
        </div>

        {/* Price Per Minute Waiting */}
        <div className="space-y-1.5 text-right">
          <label className="block text-sm font-semibold text-gray-700 font-cairo">
            السعر لكل دقيقة انتظار
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.perMinWaitRate}
              onChange={(e) => handleChange('perMinWaitRate', e.target.value)}
              className="w-full bg-brand-50/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-tajawal focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-right pl-16 font-semibold"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-tajawal text-sm font-medium">
              ر.ي/د
            </span>
          </div>
          <p className="text-xs text-gray-500 font-tajawal">احتساب دقائق التأخير أو الانتظار</p>
        </div>

        {/* Company Commission */}
        <div className="space-y-1.5 text-right">
          <label className="block text-sm font-semibold text-gray-700 font-cairo">
            نسبة عمولة الشركة (٪)
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.commissionRate}
              onChange={(e) => handleChange('commissionRate', e.target.value)}
              className="w-full bg-brand-50/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-tajawal focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-right pl-12 font-semibold"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-tajawal text-sm font-medium">
              ٪
            </span>
          </div>
          <p className="text-xs text-gray-500 font-tajawal">النسبة المخصومة لصالح المنصة</p>
        </div>
      </div>

      {/* Surge Pricing Toggle Box */}
      <div className="bg-brand-50/60 border border-brand-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-600 text-white rounded-lg shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-900 font-cairo">
              تفعيل التسعير الديناميكي (أوقات الذروة)
            </h4>
            <p className="text-xs text-gray-600 font-tajawal">
              زيادة الأسعار تلقائياً في أوقات الذروة واشتداد الطلب
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer self-end sm:self-center">
          <input
            type="checkbox"
            checked={formData.surgePricing}
            onChange={(e) => handleChange('surgePricing', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
        </label>
      </div>
    </div>
  );
}
