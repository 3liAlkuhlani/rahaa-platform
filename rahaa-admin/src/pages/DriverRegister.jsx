import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Phone, Lock, Eye, EyeOff, 
  AlertCircle, Camera, Upload, X, 
  Car, FileCheck, Key, Truck, Bike, CheckCircle
} from 'lucide-react';
import { api, setToken, setCurrentUser, getDriverPortalRoute } from '../services/api';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const DriverRegister = () => {
  const navigate = useNavigate();

  // Multi-Service Selection
  const [selectedService, setSelectedService] = useState('taxi'); // taxi, rental, truck, motorcycle

  // Basic Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Vehicle Specific States
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [maxPayload, setMaxPayload] = useState('3500');
  const [rentalDailyRate, setRentalDailyRate] = useState('25000');

  // Image Upload States
  const [licensePhoto, setLicensePhoto] = useState(null); // { file, previewUrl }
  const [selfiePhoto, setSelfiePhoto] = useState(null); // { file, previewUrl }
  const [carPhotos, setCarPhotos] = useState([]); // Array of { file, previewUrl, id }

  // UI & Validation States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  // Hidden File Input Refs
  const licenseInputRef = useRef(null);
  const selfieInputRef = useRef(null);
  const carInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Helper to validate individual file
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة (JPEG, PNG, WEBP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت';
    }
    return null;
  };

  // 1. License Photo Handler
  const handleLicenseSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, licensePhoto: fileError }));
      return;
    }

    setLicensePhoto({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setErrors((prev) => ({ ...prev, licensePhoto: null }));
  };

  const removeLicensePhoto = () => {
    if (licensePhoto?.previewUrl) {
      URL.revokeObjectURL(licensePhoto.previewUrl);
    }
    setLicensePhoto(null);
    if (licenseInputRef.current) licenseInputRef.current.value = '';
  };

  // 2. Selfie Photo Handler
  const handleSelfieSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, selfiePhoto: fileError }));
      return;
    }

    setSelfiePhoto({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setErrors((prev) => ({ ...prev, selfiePhoto: null }));
  };

  const removeSelfiePhoto = () => {
    if (selfiePhoto?.previewUrl) {
      URL.revokeObjectURL(selfiePhoto.previewUrl);
    }
    setSelfiePhoto(null);
    if (selfieInputRef.current) selfieInputRef.current.value = '';
  };

  // 3. Car Photos Handler (Multiple)
  const handleCarPhotosSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let errorFound = null;
    const newItems = [];

    files.forEach((file) => {
      const err = validateFile(file);
      if (err) {
        errorFound = err;
      } else {
        newItems.push({
          file,
          previewUrl: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2, 9),
        });
      }
    });

    if (errorFound) {
      setErrors((prev) => ({ ...prev, carPhotos: errorFound }));
    } else {
      setCarPhotos((prev) => [...prev, ...newItems]);
      setErrors((prev) => ({ ...prev, carPhotos: null }));
    }
  };

  const removeCarPhoto = (idToRemove) => {
    setCarPhotos((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال اسم السائق الكامل';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'يجب أن يتكون الاسم من 3 أحرف على الأقل';
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!/^7[0-9]{8}$/.test(cleanPhone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بـ 7 في اليمن';
    }

    if (!licensePhoto) {
      newErrors.licensePhoto = 'صورة رخصة القيادة مطلوبة للتحقق من هوية السائق';
    }

    if (!selfiePhoto) {
      newErrors.selfiePhoto = 'صورة سيلفي السائق مطلوبة لمطابقة الهوية';
    }

    if (carPhotos.length === 0) {
      newErrors.carPhotos = 'يرجى رفع صورة واحدة على الأقل لسيارة العمل';
    }

    if (!password) {
      newErrors.password = 'يرجى إنشاء كلمة مرور لحساب السائق';
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن لا تقل عن 6 خانات';
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
      const formData = new FormData();
      formData.append('name', fullName.trim());
      formData.append('phone', cleanPhone);
      formData.append('password', password);
      formData.append('password_confirmation', confirmPassword);
      formData.append('service_type', selectedService);
      formData.append('vehicle_plate', vehiclePlate.trim() || 'صنعاء / 12345');
      formData.append('vehicle_model', vehicleModel.trim() || (selectedService === 'truck' ? 'إيسوزو دينا' : selectedService === 'motorcycle' ? 'سانيانغ سكوتر' : 'تويوتا كورولا 2022'));
      formData.append('vehicle_type', 'comfort');
      formData.append('max_payload_kg', maxPayload);
      formData.append('daily_rate', rentalDailyRate);

      if (licensePhoto?.file) {
        formData.append('license_photo', licensePhoto.file);
      }
      if (selfiePhoto?.file) {
        formData.append('selfie_photo', selfiePhoto.file);
      }
      if (carPhotos.length > 0 && carPhotos[0]?.file) {
        formData.append('car_front_photo', carPhotos[0].file);
      }
      if (carPhotos.length > 1 && carPhotos[1]?.file) {
        formData.append('car_back_photo', carPhotos[1].file);
      }

      const res = await api.registerDriver(formData);

      setToken(res.token);
      setCurrentUser(res.user);

      setStatusMessage({
        type: 'success',
        text: 'تم تسجيل حساب السائق بنجاح في قاعدة البيانات! حالة الحساب الحالية: قيد مراجعة المشرف الإداري. جاري نقلك إلى لوحة السائق...',
      });

      setTimeout(() => {
        navigate(getDriverPortalRoute(res.user));
      }, 2000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'فشل إرسال طلب تسجيل السائق. يرجى مراجعة البيانات المرفقة.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rahaa-bg tech-mesh-bg flex flex-col justify-center items-center p-4 relative overflow-hidden font-tajawal" dir="rtl">
      {/* Floating Top Control: Theme Switcher */}
      <div className="absolute top-5 left-5 z-20">
        <ThemeToggle />
      </div>

      {/* Background Soft Glow Bulbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rahaa-navy/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-rahaa-card border border-rahaa-border p-8 space-y-6 relative z-10 my-8 overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-[#0B1B36] via-[#0B58A8] to-[#059669]" />
        
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
            إنشاء حساب مقدم خدمة / كابتن جديد
          </h1>
          <p className="text-xs text-rahaa-text-subtle">
            اختر نوع وسيلة النقل والخدمة التي ترغب بتقديمها في منصة راحة
          </p>
        </div>

        {/* Step: Choose Service Type First */}
        <div className="space-y-2 text-right">
          <label className="block text-xs font-cairo font-bold text-rahaa-navy">
            اختر نوع الخدمة التي تريد تقديمها:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'taxi', name: 'سائق تاكسي', desc: 'سيارات أجرة ومشاوير', icon: Car, color: 'border-[#0B58A8] bg-[#E8F2FC] text-[#0D2D56]' },
              { id: 'rental', name: 'مالك تأجير سيارات', desc: 'سيارات خاصة بالساعة واليوم', icon: Key, color: 'border-[#EE9224] bg-[#FEF5E8] text-[#0D2D56]' },
              { id: 'truck', name: 'سائق شاحنة نقل', desc: 'عفش وبضائع ومواد بناء', icon: Truck, color: 'border-[#0D2D56] bg-[#E8F2FC] text-[#0D2D56]' },
              { id: 'motorcycle', name: 'سائق دراجة نارية', desc: 'توصيل ومشاوير سريعة', icon: Bike, color: 'border-[#2984DF] bg-[#E8F2FC] text-[#0D2D56]' },
            ].map((srv) => {
              const Icon = srv.icon;
              const isSel = selectedService === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 text-right ${
                    isSel
                      ? `${srv.color} ring-2 ring-rahaa-primary shadow-xs`
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/90 border border-current/15 flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="font-cairo font-bold text-xs block truncate">{srv.name}</span>
                    <span className="text-[10px] text-gray-500 block leading-tight mt-0.5 truncate">{srv.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Box */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border text-xs font-tajawal flex items-start gap-2.5 ${
            statusMessage.type === 'info' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-emerald-700 mt-0.5" />
            <div className="leading-relaxed">{statusMessage.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section: Personal Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy pb-1 border-b border-gray-100">
              البيانات الشخصية
            </h2>

            {/* 1. Name */}
            <div className="space-y-1 text-right">
              <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                اسم السائق الكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: null });
                  }}
                  placeholder="أدخل الاسم الثلاثي أو الرباعي المطابق للرخصة"
                  className={`w-full pl-4 pr-10 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                    errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                <User className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
              </div>
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* 2. Phone */}
            <div className="space-y-1 text-right">
              <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                رقم الهاتف (اليمن) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="rtl"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  placeholder="٧٧٠ ٠٠٠ ٠٠٠"
                  className={`w-full pl-16 pr-10 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right tracking-wider ${
                    errors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-500 font-mono">+967</span>
              </div>
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Section: Document & Image Uploads */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy pb-1 border-b border-gray-100 flex items-center justify-between">
              <span>الوثائق والصور الرسمية</span>
              <span className="text-[11px] text-gray-400 font-normal">الحد الأقصى لكل صورة 5MB</span>
            </h2>

            {/* 4. License Photo */}
            <div className="space-y-2 text-right">
              <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                صورة رخصة القيادة (سارية المفعول) <span className="text-red-500">*</span>
              </label>

              <input
                ref={licenseInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLicenseSelect}
              />

              {licensePhoto ? (
                <div className="relative rounded-2xl border border-gray-200 p-2 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={licensePhoto.previewUrl}
                      alt="معاينة رخصة القيادة"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-cairo font-bold text-rahaa-navy">
                        تم اختيار صورة الرخصة
                      </p>
                      <p className="text-[11px] text-gray-500 font-tajawal">
                        {(licensePhoto.file.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeLicensePhoto}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="إزالة الصورة"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => licenseInputRef.current?.click()}
                  className="w-full py-5 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50/50 hover:bg-emerald-50/20 transition-all text-gray-600"
                >
                  <FileCheck className="w-7 h-7 text-emerald-600" />
                  <span className="text-xs font-cairo font-bold text-rahaa-navy">
                    اضغط لاختيار صورة رخصة القيادة
                  </span>
                  <span className="text-[11px] text-gray-400 font-tajawal">
                    صيغ مدعومة: JPG, PNG, WebP
                  </span>
                </button>
              )}
              {errors.licensePhoto && <p className="text-xs text-red-600">{errors.licensePhoto}</p>}
            </div>

            {/* 5. Driver Selfie Photo */}
            <div className="space-y-2 text-right">
              <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                صورة سيلفي واضحة للوجه <span className="text-red-500">*</span>
              </label>

              <input
                ref={selfieInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="user"
                className="hidden"
                onChange={handleSelfieSelect}
              />

              {selfiePhoto ? (
                <div className="relative rounded-2xl border border-gray-200 p-2 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selfiePhoto.previewUrl}
                      alt="معاينة صورة السيلفي"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-cairo font-bold text-rahaa-navy">
                        تم التقاط / اختيار صورة الوجه
                      </p>
                      <p className="text-[11px] text-gray-500 font-tajawal">
                        {(selfiePhoto.file.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelfiePhoto}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="إزالة الصورة"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => selfieInputRef.current?.click()}
                  className="w-full py-5 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50/50 hover:bg-emerald-50/20 transition-all text-gray-600"
                >
                  <Camera className="w-7 h-7 text-emerald-600" />
                  <span className="text-xs font-cairo font-bold text-rahaa-navy">
                    التقط بالكاميرا أو اختر صورة سيلفي
                  </span>
                  <span className="text-[11px] text-gray-400 font-tajawal">
                    يرجى التأكد من وضوح ملامح الوجه والإضاءة الكافية
                  </span>
                </button>
              )}
              {errors.selfiePhoto && <p className="text-xs text-red-600">{errors.selfiePhoto}</p>}
            </div>

            {/* 6. Vehicle Photos (Multiple) */}
            <div className="space-y-2 text-right">
              <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                صور السيارة (من الأمام والخلف والداخل) <span className="text-red-500">*</span>
              </label>

              <input
                ref={carInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleCarPhotosSelect}
              />

              {carPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {carPhotos.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video">
                      <img
                        src={item.previewUrl}
                        alt="معاينة سيارة"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeCarPhoto(item.id)}
                        className="absolute top-1 left-1 bg-black/60 hover:bg-red-600 text-white p-1 rounded-lg transition-colors"
                        title="حذف هذه الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => carInputRef.current?.click()}
                className="w-full py-4 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-2xl flex items-center justify-center gap-2 bg-gray-50/50 hover:bg-emerald-50/20 transition-all text-gray-600"
              >
                <Upload className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-cairo font-bold text-rahaa-navy">
                  {carPhotos.length > 0 ? 'إضافة المزيد من صور السيارة' : 'اختيار صور السيارة (واحدة أو أكثر)'}
                </span>
              </button>
              {errors.carPhotos && <p className="text-xs text-red-600">{errors.carPhotos}</p>}
            </div>
          </div>

          {/* Section: Password Creation */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy pb-1 border-b border-gray-100">
              الأمان وكلمة المرور
            </h2>

            {/* 7. Password */}
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
                    errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-gray-400 hover:text-rahaa-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* 8. Confirm Password */}
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
                    errors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
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
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-rahaa-blue hover:bg-rahaa-blue-hover text-white font-cairo font-bold text-sm rounded-xl shadow-lg shadow-rahaa-blue/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <span>جاري التحقق من الوثائق والبيانات...</span>
            ) : (
              <>
                <Car className="w-5 h-5" />
                <span>إرسال طلب التسجيل والانضمام ككابتن</span>
              </>
            )}
          </button>

          {/* Return to Login Link */}
          <div className="text-center pt-3 border-t border-rahaa-border/60">
            <span className="text-xs text-rahaa-text-muted font-tajawal ml-1.5">
              لديك حساب كابتن بالفعل؟
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
