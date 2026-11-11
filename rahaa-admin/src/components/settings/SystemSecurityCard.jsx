import React, { useState } from 'react';
import { Database, Lock, MessageSquare, RefreshCw, CheckCircle2, Shield } from 'lucide-react';

export default function SystemSecurityCard() {
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [smsActive, setSmsActive] = useState(true);

  const handleTriggerBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      setBackingUp(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-100 text-brand-700 rounded-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-cairo">إعدادات النظام المتقدمة</h2>
          <p className="text-xs text-gray-500 font-tajawal">الأمان، النسخ الاحتياطي، وإشعارات الطوارئ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Item 1: Auto Backup */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 font-cairo">
                النسخ الاحتياطي التلقائي
              </h4>
            </div>
            <p className="text-xs text-gray-600 font-tajawal leading-relaxed mb-4">
              تتم عملية المزامنة وحفظ نسخة احتياطية كل 6 ساعات لضمان سلامة قاعدة البيانات والبيانات.
            </p>
          </div>

          <button
            onClick={handleTriggerBackup}
            disabled={backingUp}
            className="flex items-center justify-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-800 underline font-tajawal self-start transition-all disabled:opacity-50"
          >
            {backingUp ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري النسخ الاحتياطي...</span>
              </>
            ) : backupSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 no-underline">تمت الحفظ بنجاح!</span>
              </>
            ) : (
              <span>إجراء نسخ الآن</span>
            )}
          </button>
        </div>

        {/* Item 2: User Data Encryption */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 font-cairo">
                تشفير بيانات المستخدمين
              </h4>
            </div>
            <p className="text-xs text-gray-600 font-tajawal leading-relaxed mb-4">
              تطبيق معايير التشفير الرقمي المتقدم على كافة البيانات الشخصية والحساسة لمنع أي تسريب.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold font-tajawal">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>مفعل دائماً</span>
          </div>
        </div>

        {/* Item 3: SMS Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-900 font-cairo">
                إشعارات الرسائل النصية الفورية
              </h4>
            </div>
            <p className="text-xs text-gray-600 font-tajawal leading-relaxed mb-4">
              إرسال تفاصيل الرحلة وتنبيهات الأمان للراكب عبر الرسائل النصية في حال عدم وجود اتصال إنترنت.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 font-tajawal">
              {smsActive ? 'نشط حالياً' : 'معطل'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsActive}
                onChange={() => setSmsActive(!smsActive)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
