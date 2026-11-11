import React, { useState } from 'react';
import { Phone, Car, FileCheck, Star, CheckCircle2, LogOut } from 'lucide-react';
import { getCurrentUser } from '../services/api';
import { LogoutConfirmModal } from '../components/common/LogoutConfirmModal';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const DriverProfile = () => {
  const currentUser = getCurrentUser();
  const [phone, setPhone] = useState(currentUser?.phone || '772223344');
  const [vehiclePlate, setVehiclePlate] = useState(
    currentUser?.profile?.vehicle_plate || '12450 / 1'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Driver Identity Card */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-rahaa-blue-light text-rahaa-blue font-cairo font-bold text-3xl flex items-center justify-center shadow-inner">
          {(currentUser?.name || 'ص')[0]}
        </div>
        <div className="space-y-1 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold font-cairo text-rahaa-navy">
              الكابتن / {currentUser?.name || 'صالح علي الحميري'}
            </h1>
            <span className="p-1 rounded-full bg-rahaa-emerald-bg text-rahaa-emerald" title="سائق موثق ومعتمد">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-rahaa-text-muted font-tajawal text-right">
            {phone} (اليمن)
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-cairo">
            <span className="flex items-center gap-1 text-rahaa-orange font-bold bg-rahaa-orange-light px-2.5 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{currentUser?.profile?.rating || '4.95'}</span>
            </span>
            <span className="text-rahaa-text-subtle font-tajawal">كابتن معتمد في صنعاء</span>
          </div>
        </div>

        <div className="sm:mr-auto p-4 rounded-2xl bg-rahaa-emerald-bg border border-rahaa-emerald/25 text-center">
          <div className="text-[11px] font-cairo text-rahaa-emerald font-semibold">حالة الحساب</div>
          <div className="text-sm font-bold font-cairo text-rahaa-emerald">
            {currentUser?.status === 'pending' ? 'قيد المراجعة' : 'نشط ومعتمد'}
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-rahaa-emerald-bg border border-rahaa-emerald/30 text-rahaa-emerald text-xs font-cairo flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم حفظ تحديثات ملف الكابتن بنجاح</span>
        </div>
      )}

      {/* Vehicle & Official Documents Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-rahaa-border">
            <div className="p-2.5 rounded-xl bg-rahaa-blue-light text-rahaa-blue">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-cairo text-rahaa-navy">بيانات مركبة العمل</h2>
              <span className="text-[11px] text-rahaa-text-subtle font-tajawal">السيارة المسجلة في الخدمة</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
              <span className="text-rahaa-text-muted font-tajawal">طراز السيارة:</span>
              <span className="font-cairo font-bold text-rahaa-navy">
                {currentUser?.profile?.vehicle_model || 'تويوتا كورولا 2022'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
              <span className="text-rahaa-text-muted font-tajawal">رقم اللوحة:</span>
              <span className="font-mono font-bold text-rahaa-navy">{vehiclePlate}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
              <span className="text-rahaa-text-muted font-tajawal">الفئة المعتمدة:</span>
              <span className="font-cairo font-bold text-rahaa-blue bg-rahaa-blue-light px-2.5 py-0.5 rounded-full">
                راحة بلس
              </span>
            </div>
          </div>
        </div>

        <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-rahaa-border">
            <div className="p-2.5 rounded-xl bg-rahaa-emerald-bg text-rahaa-emerald">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-cairo text-rahaa-navy">الوثائق والتراخيص الرسمية</h2>
              <span className="text-[11px] text-rahaa-text-subtle font-tajawal">معتمدة من إدارة راحة</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
              <span className="font-cairo font-bold text-rahaa-navy">رخصة القيادة المهنية</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-cairo font-bold bg-rahaa-emerald-bg text-rahaa-emerald">
                سارية ومطابقة
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
              <span className="font-cairo font-bold text-rahaa-navy">ملكية السيارة</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-cairo font-bold bg-rahaa-emerald-bg text-rahaa-emerald">
                معتمدة
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rahaa-bg border border-rahaa-border">
              <span className="font-cairo font-bold text-rahaa-navy">الفحص الفني الدوري</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-cairo font-bold bg-rahaa-emerald-bg text-rahaa-emerald">
                صالح
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
        <h2 className="text-sm font-bold font-cairo text-rahaa-navy pb-2 border-b border-rahaa-border">
          تعديل بيانات الاتصال
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-cairo font-semibold text-rahaa-navy">رقم الهاتف المحمول</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 pl-16 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal focus:outline-none focus:border-rahaa-blue focus:bg-white text-right"
              />
              <Phone className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
              <span className="absolute left-3.5 top-3.5 text-xs font-tajawal font-bold text-rahaa-text-muted">٩٦٧+</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-cairo font-semibold text-rahaa-navy">رقم لوحة المركبة</label>
            <div className="relative">
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full h-11 pl-4 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-mono focus:outline-none focus:border-rahaa-blue focus:bg-white text-right"
              />
              <Car className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="h-11 px-6 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          حفظ التغييرات
        </button>
      </form>

      {/* Theme Preference Settings */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-cairo font-bold text-sm text-rahaa-navy">المظهر العام للواجهة</h3>
          <p className="text-xs text-rahaa-text-muted font-tajawal mt-0.5">
            التبديل بين الوضع النهاري والوضع الليلي المريح للعين
          </p>
        </div>

        <ThemeToggle variant="segmented" />
      </div>

      {/* Logout Action with Confirmation Dialog */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card flex items-center justify-between">
        <div>
          <h3 className="font-cairo font-bold text-sm text-rahaa-navy">إنهاء الجلسة</h3>
          <p className="text-xs text-rahaa-text-muted font-tajawal">
            تسجيل الخروج الآمن من حساب الكابتن
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="h-11 px-5 rounded-xl bg-rahaa-rose-bg hover:opacity-90 text-rahaa-rose border border-rahaa-rose/30 font-cairo font-bold text-xs flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </div>
  );
};
