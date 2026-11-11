import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api, setToken, setCurrentUser } from '../services/api';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { StepBackButton } from '../components/common/StepBackButton';

export const PassengerRegister = () => {
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI & Validation states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكامل';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'يجب أن يتكون الاسم من 3 أحرف على الأقل';
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!/^7[0-9]{8}$/.test(cleanPhone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بالرقم 7 (مثال: 771234567)';
    }

    if (!password) {
      newErrors.password = 'يرجى إنشاء كلمة مرور';
    } else if (password.length < 6) {
      newErrors.password = 'يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'يرجى تأكيد كلمة المرور';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const res = await api.registerPassenger({
        name: fullName.trim(),
        phone: cleanPhone,
        password: password,
        password_confirmation: confirmPassword,
      });

      setToken(res.token);
      setCurrentUser(res.user);

      setStatusMessage({
        type: 'success',
        text: 'تم إنشاء وتوثيق حساب الراكب بنجاح في قاعدة البيانات! جاري تحويلك إلى لوحة الرحلات...',
      });

      setTimeout(() => {
        navigate('/passenger');
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'فشل إنشاء الحساب. يرجى التأكد من صحة البيانات وعدم تكرار رقم الهاتف.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rahaa-bg tech-mesh-bg flex flex-col justify-center items-center p-4 relative overflow-hidden font-tajawal" dir="rtl">
      {/* Floating Top Controls: Single-Step Back & Theme Switcher */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <StepBackButton variant="compact" label="تراجع خطوة" />
        </div>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Background Soft Glow Bulbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rahaa-navy/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-rahaa-blue/15 blur-3xl pointer-events-none" />

      {/* Main Registration Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-rahaa-card border border-rahaa-border p-8 space-y-6 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-[#0B1B36] via-[#0B58A8] to-[#38BDF8]" />
        
        {/* Header with Rahaa Official Brand Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center">
            <img 
              src="/rahaa_logo.png" 
              alt="شعار راحة" 
              className="h-32 sm:h-36 w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>

          <h1 className="font-cairo font-bold text-2xl text-rahaa-navy">
            إنشاء حساب راكب جديد
          </h1>
        </div>

        {/* Status / Notice Box */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border text-xs font-tajawal flex items-start gap-2.5 ${
            statusMessage.type === 'info' 
              ? 'bg-blue-50 border-blue-200 text-blue-900' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rahaa-blue mt-0.5" />
            <div className="leading-relaxed">{statusMessage.text}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Full Name */}
          <div className="space-y-1 text-right">
            <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                placeholder="أدخل اسمك الثلاثي أو الرباعي"
                className={`w-full pl-4 pr-10 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                  errors.fullName 
                    ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
                    : 'border-gray-200 focus:border-rahaa-navy focus:bg-white'
                }`}
              />
              <User className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 font-tajawal mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* 2. Phone Number */}
          <div className="space-y-1 text-right">
            <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
              رقم الهاتف المحمول (اليمن) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                placeholder="770 000 000"
                className={`w-full pl-16 pr-10 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-mono text-left tracking-wider ${
                  errors.phone 
                    ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
                    : 'border-gray-200 focus:border-rahaa-navy focus:bg-white'
                }`}
              />
              <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
              <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-500 font-mono">
                +967
              </span>
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600 font-tajawal mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 3. Password */}
          <div className="space-y-1 text-right">
            <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
              إنشاء كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                  errors.password 
                    ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
                    : 'border-gray-200 focus:border-rahaa-navy focus:bg-white'
                }`}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-rahaa-navy transition-colors"
                aria-label="إظهار أو إخفاء كلمة المرور"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 font-tajawal mt-1">{errors.password}</p>
            )}
          </div>

          {/* 5. Confirm Password */}
          <div className="space-y-1 text-right">
            <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                  errors.confirmPassword 
                    ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
                    : 'border-gray-200 focus:border-rahaa-navy focus:bg-white'
                }`}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-rahaa-navy transition-colors"
                aria-label="إظهار أو إخفاء تأكيد كلمة المرور"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 font-tajawal mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-sm rounded-xl shadow-lg shadow-rahaa-blue/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <span>جاري التحقق والمعالجة...</span>
            ) : (
              <>
                <User className="w-5 h-5" />
                <span>إنشاء الحساب والمتابعة</span>
              </>
            )}
          </button>

          {/* Return to Login Link */}
          <div className="text-center pt-3 border-t border-rahaa-border/60">
            <span className="text-xs text-rahaa-text-muted font-tajawal ml-1.5">
              لديك حساب بالفعل؟
            </span>
            <Link
              to="/login"
              className="text-xs font-cairo font-bold text-rahaa-blue hover:text-rahaa-blue-hover underline underline-offset-4 transition-colors inline-flex items-center"
            >
              تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
