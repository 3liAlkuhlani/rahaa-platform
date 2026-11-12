import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  Car,
  Key,
  Truck,
  Bike,
  MessageSquare,
  CheckCircle,
  X,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { api, setToken, setCurrentUser, getDriverPortalRoute, getAdminDefaultRoute } from '../services/api';
import { ThemeToggle } from '../components/common/ThemeToggle';

const DRIVER_VEHICLE_PORTALS = [
  {
    id: 'taxi',
    title: 'كابتن تاكسي',
    subtitle: 'سيارات الأجرة',
    routeLabel: 'بوابة التاكسي المستقلة',
    icon: Car,
    activeClass: 'border-blue-600 bg-blue-50/90 text-blue-900 ring-2 ring-blue-500/30',
    iconClass: 'bg-blue-600 text-white',
    btnClass: 'bg-gradient-to-l from-[#0B1B36] via-[#122B56] to-[#1D4ED8] hover:opacity-95',
  },
  {
    id: 'rental',
    title: 'تأجير سيارات',
    subtitle: 'السيارات الخاصة',
    routeLabel: 'بوابة التأجير المستقلة',
    icon: Key,
    activeClass: 'border-[#EE9224] bg-[#FEF5E8] text-[#0D2D56] ring-2 ring-[#EE9224]/30',
    iconClass: 'bg-[#EE9224] text-white',
    btnClass: 'bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#EE9224] hover:opacity-95',
  },
  {
    id: 'truck',
    title: 'شاحنة نقل',
    subtitle: 'نقل البضائع والعفش',
    routeLabel: 'بوابة الشاحنات المستقلة',
    icon: Truck,
    activeClass: 'border-[#0B58A8] bg-[#E8F2FC] text-[#0D2D56] ring-2 ring-[#0B58A8]/30',
    iconClass: 'bg-[#0D2D56] text-white',
    btnClass: 'bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] hover:opacity-95',
  },
  {
    id: 'motorcycle',
    title: 'دراجة نارية',
    subtitle: 'توصيل ومشاوير',
    routeLabel: 'بوابة الدراجات المستقلة',
    icon: Bike,
    activeClass: 'border-cyan-600 bg-cyan-50/90 text-cyan-900 ring-2 ring-cyan-500/30',
    iconClass: 'bg-cyan-600 text-white',
    btnClass: 'bg-gradient-to-l from-[#0B1B36] via-[#0369A1] to-[#06B6D4] hover:opacity-95',
  },
];

const DEMO_ACCOUNTS = [
  {
    id: 'passenger',
    role: 'passenger',
    serviceType: null,
    title: 'الراكب',
    phone: '٧٧١٢٣٤٥٦٧',
    password: 'password123',
    icon: '🧑',
    desc: 'محمد أحمد الصنعاني',
  },
  {
    id: 'taxi',
    role: 'driver',
    serviceType: 'taxi',
    title: 'كابتن تاكسي',
    phone: '٧٧٢٢٢٣٣٤٤',
    password: 'password123',
    icon: '🚕',
    desc: 'صالح علي الحميري',
  },
  {
    id: 'rental',
    role: 'driver',
    serviceType: 'rental',
    title: 'تأجير سيارات',
    phone: '٧٧٤٤٤٥٥٦٦',
    password: 'password123',
    icon: '🔑',
    desc: 'معرض الصنعاني للسيارات',
  },
  {
    id: 'truck',
    role: 'driver',
    serviceType: 'truck',
    title: 'شاحنة نقل',
    phone: '٧٧٥٥٥٦٦٧٧',
    password: 'password123',
    icon: '🚚',
    desc: 'وليد الحميري للنقل',
  },
  {
    id: 'moto',
    role: 'driver',
    serviceType: 'motorcycle',
    title: 'دراجة نارية',
    phone: '٧٧٦٦٦٧٧٨٨',
    password: 'password123',
    icon: '🏍️',
    desc: 'عصام البعداني للتوصيل',
  },
  {
    id: 'admin',
    role: 'admin',
    serviceType: null,
    title: 'مدير النظام',
    phone: '٧٧٠٠٠٠٠٠٠',
    password: '12345',
    icon: '🛡️',
    desc: 'علي نشوان (الإدارة)',
  },
];

export const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('passenger'); // 'passenger' or 'driver'
  const [driverServiceType, setDriverServiceType] = useState('taxi'); // 'taxi' | 'rental' | 'truck' | 'motorcycle'
  const [suggestedOwnedService, setSuggestedOwnedService] = useState(null);

  // Login states
  const [phone, setPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // SMS Password Recovery Modal States (Passenger & Driver)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const activeDriverPortal =
    DRIVER_VEHICLE_PORTALS.find((p) => p.id === driverServiceType) || DRIVER_VEHICLE_PORTALS[0];


  const handleFillDemo = (acc) => {
    setPhone(acc.phone);
    setUserPassword(acc.password);
    setSuggestedOwnedService(null);
    if (acc.role === 'passenger') {
      setUserRole('passenger');
    } else if (acc.role === 'driver') {
      setUserRole('driver');
      if (acc.serviceType) {
        setDriverServiceType(acc.serviceType);
      }
    }
    setErrorMsg('');
    setSuccessMsg(`تمت تعبئة بيانات ${acc.title} — اضغط تسجيل الدخول للانتقال إلى صفحة ${acc.desc}`);
  };

  const performLogin = async (overrideServiceType = null) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSuggestedOwnedService(null);

    if (!phone.trim() || !userPassword.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف وكلمة المرور للمتابعة');
      return;
    }

    const effectiveDriverService = overrideServiceType || driverServiceType;

    setIsLoading(true);
    try {
      const payload = {
        login_type: 'user',
        phone: phone.trim(),
        password: userPassword,
      };

      if (userRole === 'driver') {
        payload.driver_service_type = effectiveDriverService;
      }

      const res = await api.login(payload);

      setToken(res.token);
      setCurrentUser(res.user);

      if (onLoginSuccess) onLoginSuccess(res.user);

      if (res.user.role === 'admin' || res.user.role === 'supervisor') {
        navigate(getAdminDefaultRoute(res.user), { replace: true });
      } else if (res.user.role === 'driver') {
        // Redirect driver directly to the dedicated page of the vehicle they own
        const targetDriverRoute = getDriverPortalRoute(res.user);
        navigate(targetDriverRoute, { replace: true });
      } else {
        navigate('/passenger', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات');
      if (err.data?.owned_service) {
        setSuggestedOwnedService(err.data.owned_service);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    await performLogin();
  };

  // SMS Reset Handlers
  const handleRequestSmsCode = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetPhone.trim()) {
      setResetError('يرجى إدخال رقم الهاتف');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.requestSmsReset(resetPhone.trim());
      setResetSuccess(res.message);
      setResetStep(2);
    } catch (err) {
      setResetError(err.message || 'تعذر إرسال رمز التحقق');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifySmsCode = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setResetError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.verifySmsCode(resetPhone.trim(), resetCode.trim());
      setResetSuccess(res.message);
      setResetStep(3);
    } catch (err) {
      setResetError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setResetError('يجب ألا تقل كلمة المرور عن 6 خانات');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setResetError('تأكيد كلمة المرور غير متطابق');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.resetPasswordWithSms({
        phone: resetPhone.trim(),
        code: resetCode.trim(),
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      });

      setResetSuccess(res.message);
      setTimeout(() => {
        setShowResetModal(false);
        setResetStep(1);
        setResetPhone('');
        setResetCode('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setSuccessMsg('تم تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.');
      }, 1500);
    } catch (err) {
      setResetError(err.message || 'فشل تحديث كلمة المرور');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rahaa-bg tech-mesh-bg flex flex-col justify-center items-center p-4 relative overflow-hidden font-tajawal" dir="rtl">
      {/* Floating Top Control: Theme Switcher */}
      <div className="absolute top-5 left-5 z-20">
        <ThemeToggle />
      </div>

      {/* Background Soft Brand Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rahaa-blue/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-rahaa-card/95 backdrop-blur-xl rounded-3xl shadow-rahaa-card border border-rahaa-border p-6 sm:p-8 space-y-5 relative z-10 overflow-hidden">
        {/* Top Tech Gradient Accent Bar */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-[#0B1B36] via-[#0B58A8] to-[#38BDF8]" />
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center">
            <img
              src="/rahaa_logo.png"
              alt="شعار راحة"
              className="h-28 sm:h-32 w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>

          <h1 className="font-cairo font-bold text-xl sm:text-2xl text-rahaa-navy">
            {userRole === 'driver'
              ? `تسجيل دخول ${activeDriverPortal.title}`
              : 'تسجيل الدخول لمنصة راحة'}
          </h1>
          <p className="text-xs text-rahaa-text-muted">
            {userRole === 'driver'
              ? `بوابة خاصة ومستقلة لـ ${activeDriverPortal.subtitle} (${activeDriverPortal.routeLabel})`
              : 'سجل دخولك لحجز مشاوير التاكسي، تأجير السيارات، الشاحنات والدراجات'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rahaa-rose-bg border border-rahaa-rose/30 rounded-xl text-rahaa-rose text-xs font-tajawal space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {suggestedOwnedService && (
              <button
                type="button"
                onClick={() => {
                  setDriverServiceType(suggestedOwnedService);
                  performLogin(suggestedOwnedService);
                }}
                className="w-full h-9 px-3 rounded-lg bg-rahaa-navy text-white font-cairo font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>الانتقال والتسجيل عبر بوابة مركبتك المسجلة فوراً</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="p-3.5 bg-rahaa-emerald-bg border border-rahaa-emerald/30 rounded-xl text-rahaa-emerald text-xs font-tajawal flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleUserSubmit} className="space-y-4">
          {/* Primary Role Switcher: Passenger vs Driver */}
          <div className="grid grid-cols-2 border border-rahaa-border p-1 rounded-xl gap-1.5 bg-rahaa-bg">
            <button
              type="button"
              onClick={() => {
                setUserRole('passenger');
                setErrorMsg('');
                setSuggestedOwnedService(null);
              }}
              className={`h-10 px-3 rounded-lg text-xs font-cairo font-bold flex items-center justify-center gap-1.5 transition-all ${
                userRole === 'passenger'
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>بوابة الراكب</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserRole('driver');
                setErrorMsg('');
              }}
              className={`h-10 px-3 rounded-lg text-xs font-cairo font-bold flex items-center justify-center gap-1.5 transition-all ${
                userRole === 'driver'
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>بوابات السائقين (حسب المركبة)</span>
            </button>
          </div>

          {/* Dedicated Driver Vehicle Mode Selector (Only when Driver is active) */}
          {userRole === 'driver' && (
            <div className="space-y-2 p-3 rounded-2xl bg-rahaa-bg border border-rahaa-border animate-fadeIn">
              <label className="block text-[11px] font-cairo font-bold text-rahaa-navy">
                اختر وسيلة النقل التي تملكها للدخول إلى صفحتها الخاصة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DRIVER_VEHICLE_PORTALS.map((portal) => {
                  const Icon = portal.icon;
                  const isSel = driverServiceType === portal.id;
                  return (
                    <button
                      key={portal.id}
                      type="button"
                      onClick={() => {
                        setDriverServiceType(portal.id);
                        setErrorMsg('');
                        setSuggestedOwnedService(null);
                      }}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                        isSel
                          ? portal.activeClass
                          : 'bg-rahaa-card border-rahaa-border text-rahaa-navy hover:border-rahaa-blue/40'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSel ? portal.iconClass : 'bg-rahaa-bg text-rahaa-text-muted'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-cairo font-bold text-xs truncate">{portal.title}</div>
                        <div className="text-[10px] opacity-75 truncate">{portal.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Phone Input */}
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
              رقم الهاتف
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="٧٧١٢٣٤٥٦٧"
                className="w-full h-11 pl-4 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm focus:outline-none focus:border-rahaa-blue focus:bg-white transition-all font-tajawal text-right"
              />
              <Phone className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm focus:outline-none focus:border-rahaa-blue focus:bg-white transition-all font-tajawal text-right"
              />
              <Lock className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-rahaa-text-subtle hover:text-rahaa-navy transition-colors"
                aria-label="إظهار أو إخفاء كلمة المرور"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between text-xs font-tajawal pt-0.5">
            <button
              type="button"
              onClick={() => {
                setResetPhone(phone);
                setResetStep(1);
                setResetError('');
                setResetSuccess('');
                setShowResetModal(true);
              }}
              className="text-rahaa-blue hover:text-rahaa-blue-hover underline underline-offset-4 font-semibold transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 px-4 text-white font-cairo font-bold text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 ${
              userRole === 'driver' ? activeDriverPortal.btnClass : 'bg-rahaa-blue hover:bg-rahaa-blue-hover'
            }`}
          >
            {isLoading ? (
              <span>جاري التحقق وتسجيل الدخول...</span>
            ) : userRole === 'driver' ? (
              <span>دخول إلى صفحة {activeDriverPortal.title}</span>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>

          {/* Registration Link */}
          <div className="text-center pt-3 border-t border-rahaa-border/60">
            <span className="text-xs text-rahaa-text-muted font-tajawal ml-1.5">
              ليس لديك حساب؟
            </span>
            <Link
              to={userRole === 'driver' ? '/register/driver' : '/register'}
              className="inline-flex items-center text-sm font-cairo font-bold text-rahaa-blue hover:text-rahaa-blue-hover underline underline-offset-4 transition-colors cursor-pointer"
            >
              {userRole === 'driver' ? 'تسجيل سائق / مركبة جديدة' : 'إنشاء حساب راكب جديد'}
            </Link>
          </div>

          {/* Quick Demo Accounts Selection Panel */}
          <div className="pt-3 border-t border-rahaa-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-cairo font-bold text-rahaa-navy">
              <span className="flex items-center gap-1.5 text-rahaa-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حسابات تجريبية سريعة (كل سائق لبوابته الخاصة):</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelectedDemo =
                  phone === acc.phone &&
                  (acc.role !== 'driver' || driverServiceType === acc.serviceType);

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleFillDemo(acc)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2.5 group shadow-2xs ${
                      isSelectedDemo
                        ? 'border-rahaa-primary bg-blue-50/90 ring-1 ring-rahaa-primary'
                        : 'border-rahaa-border/80 bg-rahaa-bg hover:bg-blue-50/50 hover:border-rahaa-primary/60'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-rahaa-border/70 flex items-center justify-center text-base shrink-0 shadow-2xs">
                      {acc.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-rahaa-navy font-bold font-cairo text-xs group-hover:text-rahaa-primary truncate">
                        {acc.title}
                      </div>
                      <div className="text-[10px] text-rahaa-text-muted truncate">
                        {acc.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* SMS PASSWORD RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rahaa-border relative space-y-5">
            {resetStep > 1 && (
              <button
                type="button"
                onClick={() => {
                  setResetStep((prev) => prev - 1);
                  setResetError('');
                  setResetSuccess('');
                }}
                className="absolute right-5 top-5 h-8 px-3 rounded-xl bg-rahaa-bg hover:bg-rahaa-blue-soft text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1 border border-rahaa-border transition-colors"
              >
                <span>تراجع خطوة</span>
              </button>
            )}
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute left-5 top-5 p-2 rounded-full text-rahaa-text-subtle hover:text-rahaa-navy hover:bg-rahaa-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rahaa-blue-light text-rahaa-blue rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-cairo font-bold text-xl text-rahaa-navy">
                استعادة كلمة المرور عبر الرسائل النصية
              </h3>
              <p className="text-xs text-rahaa-text-muted font-tajawal">
                {resetStep === 1 && 'أدخل رقم هاتفك المسجل لاستلام رمز التحقق الفعلي'}
                {resetStep === 2 && 'أدخل رمز التحقق المكون من ٦ أرقام المرسل إلى هاتفك'}
                {resetStep === 3 && 'قم بتعيين كلمة المرور الجديدة وتأكيدها'}
              </p>
            </div>

            {resetError && (
              <div className="p-3 bg-rahaa-rose-bg border border-rahaa-rose/30 rounded-xl text-rahaa-rose text-xs font-tajawal flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-rahaa-emerald-bg border border-rahaa-emerald/30 rounded-xl text-rahaa-emerald text-xs font-tajawal flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 1 && (
              <form onSubmit={handleRequestSmsCode} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                    رقم الهاتف المسجل
                  </label>
                  <input
                    type="text"
                    required
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="٧٧٠٠٠٠٠٠٠"
                    dir="rtl"
                    className="w-full h-11 px-4 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm focus:outline-none focus:border-rahaa-blue text-right"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-11 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {resetLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق عبر الرسائل النصية'}
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifySmsCode} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                    رمز التحقق (٦ أرقام)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="١٢٣٤٥٦"
                    dir="rtl"
                    className="w-full h-11 px-4 bg-rahaa-bg border border-rahaa-border rounded-xl text-right tracking-widest font-cairo text-base focus:outline-none focus:border-rahaa-blue"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-11 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {resetLoading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm focus:outline-none focus:border-rahaa-blue text-right"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm focus:outline-none focus:border-rahaa-blue text-right"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-11 bg-rahaa-emerald hover:opacity-95 text-white font-cairo font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {resetLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
