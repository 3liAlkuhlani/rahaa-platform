import React, { useState } from 'react';
import { User, Phone, LogOut, CheckCircle2 } from 'lucide-react';
import { getCurrentUser } from '../services/api';
import { LogoutConfirmModal } from '../components/common/LogoutConfirmModal';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const PassengerProfile = () => {
  const currentUser = getCurrentUser();
  const [name, setName] = useState(currentUser?.name || 'محمد أحمد الصنعاني');
  const [phone, setPhone] = useState(currentUser?.phone || '771234567');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const walletBalance = Number(currentUser?.profile?.wallet_balance ?? 4500).toLocaleString();

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Profile Header Card */}
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-rahaa-blue-avatar text-rahaa-blue font-cairo font-bold text-3xl flex items-center justify-center shadow-inner">
          {(name || 'م')[0]}
        </div>
        <div className="space-y-1 text-center sm:text-right">
          <h1 className="text-xl font-bold font-cairo text-rahaa-navy">
            {name}
          </h1>
          <p className="text-xs text-rahaa-text-muted font-tajawal text-right">
            {phone} (اليمن)
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rahaa-emerald-bg text-rahaa-emerald text-xs font-cairo font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rahaa-emerald" />
            <span>عميل موثق في راحة - صنعاء</span>
          </div>
        </div>

        <div className="sm:mr-auto p-4 rounded-2xl bg-rahaa-blue-soft border border-rahaa-border text-center">
          <div className="text-[11px] font-cairo text-rahaa-text-muted">رصيد محفظة جيب</div>
          <div className="text-lg font-bold font-cairo text-rahaa-blue">
            {walletBalance} <span className="text-xs font-normal">ر.ي</span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-rahaa-emerald-bg border border-rahaa-emerald/30 text-rahaa-emerald text-xs font-cairo flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم حفظ تعديلات الملف الشخصي بنجاح</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card space-y-4">
        <h2 className="text-sm font-bold font-cairo text-rahaa-navy pb-2 border-b border-rahaa-border">
          تعديل البيانات الأساسية
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-cairo font-semibold text-rahaa-navy">الاسم الكامل</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 pl-4 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal focus:outline-none focus:border-rahaa-blue focus:bg-white transition-all text-right"
            />
            <User className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
          </div>
        </div>

        <div className="space-y-1.5 text-right">
          <label className="text-xs font-cairo font-semibold text-rahaa-navy">رقم الهاتف (اليمن)</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 pl-16 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal focus:outline-none focus:border-rahaa-blue focus:bg-white transition-all text-right"
            />
            <Phone className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
            <span className="absolute left-3.5 top-3.5 text-xs font-tajawal font-bold text-rahaa-text-muted">٩٦٧+</span>
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
      <div className="bg-rahaa-card rounded-3xl p-6 border border-rahaa-border shadow-rahaa-card flex flex-col items-center justify-center text-center gap-4">
        <div className="space-y-1.5">
          <h3 className="font-cairo font-bold text-sm text-rahaa-navy">إنهاء الجلسة</h3>
          <p className="text-xs text-rahaa-text-muted font-tajawal">
            تسجيل الخروج الآمن من حسابك الحالي
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLogoutOpen(true)}
          className="h-11 px-6 rounded-xl bg-rahaa-rose-bg hover:bg-rahaa-rose/15 text-rahaa-rose border border-rahaa-rose/40 font-cairo font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
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
