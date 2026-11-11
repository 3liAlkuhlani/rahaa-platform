import React, { useState } from 'react';
import { ShieldCheck, UserCheck, FileText, Calendar, Star } from 'lucide-react';

export default function DriverRulesCard() {
  const [rules, setRules] = useState({
    idVerification: true,
    backgroundCheck: true,
    maxVehicleAge: '10 سنوات',
    minRating: '4.2',
  });

  const handleToggle = (key) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setRules((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-cairo">قواعد التحقق من السائقين</h2>
          <p className="text-xs text-gray-500 font-tajawal">شروط الانضمام وتدقيق الوثائق ومعايير القبول</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ID Verification Rule */}
        <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-100 text-brand-700 rounded-lg mt-0.5">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 font-cairo">
                التحقق من الهوية الشخصية الرسمية
              </h4>
              <p className="text-xs text-gray-500 font-tajawal mt-0.5">
                إلزام السائقين برفع صورة البطاقة الشخصية أو جواز السفر المعتمد
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={rules.idVerification}
              onChange={() => handleToggle('idVerification')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Background Check Rule */}
        <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 font-cairo">
                فحص السجل الجنائي والسلوك المهني
              </h4>
              <p className="text-xs text-gray-500 font-tajawal mt-0.5">
                إلزامية تقديم شهادة حسن سيرة وسلوك من الجهات المختصة
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={rules.backgroundCheck}
              onChange={() => handleToggle('backgroundCheck')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Max Vehicle Age */}
        <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 font-cairo">عمر المركبة الأقصى</h4>
              <p className="text-xs text-gray-500 font-tajawal mt-0.5">
                منع تسجيل المركبات التي يتجاوز عمرها المدة المحددة
              </p>
            </div>
          </div>

          <select
            value={rules.maxVehicleAge}
            onChange={(e) => handleChange('maxVehicleAge', e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 font-tajawal focus:ring-2 focus:ring-brand-500 self-end sm:self-center cursor-pointer"
          >
            <option value="5 سنوات">5 سنوات</option>
            <option value="7 سنوات">7 سنوات</option>
            <option value="10 سنوات">10 سنوات</option>
            <option value="12 سنة">12 سنة</option>
          </select>
        </div>

        {/* Min Rating Threshold */}
        <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg mt-0.5">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 font-cairo">الحد الأدنى للتقييم</h4>
              <p className="text-xs text-gray-500 font-tajawal mt-0.5">
                إيقاف السائق تلقائياً إذا انخفض تقييمه عن هذا الحد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <input
              type="number"
              step="0.1"
              min="3.0"
              max="4.9"
              value={rules.minRating}
              onChange={(e) => handleChange('minRating', e.target.value)}
              className="w-20 bg-white border border-gray-300 rounded-xl px-3 py-2 text-center text-sm font-bold text-gray-900 font-tajawal focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-xs font-bold text-amber-600 font-tajawal">★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
