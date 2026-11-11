import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { api, setToken } from '../../services/api';

export default function AdminPasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('يرجى إدخال كلمة المرور الحالية للمشرف');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('يجب ألا تقل كلمة المرور الجديدة عن 6 خانات');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('تأكيد كلمة المرور الجديدة غير متطابق');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMsg('يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمة المرور الحالية');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.adminChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (res.token) {
        setToken(res.token);
      }

      setSuccessMsg(res.message || 'تم تحديث كلمة مرور المشرف بنجاح وتأمين الحساب');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'فشل تحديث كلمة المرور. يرجى التأكد من كلمة المرور الحالية');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rahaa-navy/10 text-rahaa-navy rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">تغيير كلمة مرور المشرف الإداري</h2>
            <p className="text-xs text-gray-500 font-tajawal">
              تغيير كلمة المرور الخاصة بحساب المشرف الأساسي (علي نشوان) من داخل لوحة التحكم
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold font-tajawal">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>منطقة تحكم أمني محمية</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-tajawal flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-tajawal flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* Current Password */}
        <div className="space-y-1 text-right">
          <label className="block text-xs font-cairo font-semibold text-gray-700">
            كلمة المرور الحالية
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الحالية (الأولية: 12345)"
              className="w-full pl-10 pr-10 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rahaa-navy focus:bg-white transition-all font-tajawal text-right"
            />
            <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute left-3 top-3.5 text-gray-400 hover:text-rahaa-navy transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1 text-right">
          <label className="block text-xs font-cairo font-semibold text-gray-700">
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rahaa-navy focus:bg-white transition-all font-tajawal text-right"
            />
            <KeyRound className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute left-3 top-3.5 text-gray-400 hover:text-rahaa-navy transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1 text-right">
          <label className="block text-xs font-cairo font-semibold text-gray-700">
            تأكيد كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rahaa-navy focus:bg-white transition-all font-tajawal text-right"
            />
            <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-3 top-3.5 text-gray-400 hover:text-rahaa-navy transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-rahaa-navy hover:bg-rahaa-navy/90 text-white font-cairo font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>جاري حفظ كلمة المرور الجديدة...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
