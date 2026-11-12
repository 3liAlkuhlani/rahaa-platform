import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import {
  api,
  getToken,
  getCurrentUser,
  setToken,
  setCurrentUser,
  isAdminOrSupervisor,
  getAdminDefaultRoute,
} from '../services/api';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const AdminLogin = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const token = getToken();
    const user = getCurrentUser();
    if (token && isAdminOrSupervisor(user)) {
      navigate(getAdminDefaultRoute(user), { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanIdentifier = username.trim();
    if (!cleanIdentifier || !password) {
      setErrorMsg('يرجى إدخال اسم المشرف (أو رقم الهاتف) وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login({
        username: cleanIdentifier,
        password,
        login_type: 'admin',
      });

      if (!res?.success || !res?.token || !isAdminOrSupervisor(res?.user)) {
        setErrorMsg('هذا الحساب غير مصرح له بالدخول إلى لوحة الإدارة والمشرفين');
        setIsLoading(false);
        return;
      }

      setToken(res.token);
      setCurrentUser(res.user);
      setSuccessMsg('تم التحقق من الصلاحيات بنجاح، جاري فتح لوحة التحكم...');
      navigate(getAdminDefaultRoute(res.user), { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || 'بيانات الدخول غير صحيحة أو تعذر الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-[#071932] via-[#0D2D56] to-[#0B58A8] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#EE9224] blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#38BDF8] blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 left-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/15 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] px-6 py-7 text-white text-center relative">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-[#EE9224]" />
            </div>
            <h1 className="text-xl font-black tracking-tight">بوابة الإدارة والمشرفين</h1>
            <p className="text-xs text-blue-100/85 mt-1.5 font-medium">
              منصة راحة للنقل الذكي — دخول مخصص للإدارة والمشرفين فقط
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-amber-300">
              <KeyRound className="w-3.5 h-3.5" />
              <span>اتصال آمن ومراقب بالصلاحيات (RBAC)</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                اسم المشرف أو رقم الهاتف
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم أو رقم الهاتف"
                  autoComplete="username"
                  disabled={isLoading}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B58A8] focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full pr-10 pl-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B58A8] focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-950/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق من الحساب...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#EE9224]" />
                  <span>دخول إلى لوحة الإدارة</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                هذه البوابة مخصصة لمديري النظام والمشرفين المعتمدين فقط. جميع عمليات الدخول والإجراءات مسجلة في سجل المراجعة.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
