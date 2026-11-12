import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Phone, Lock, Eye, EyeOff, 
  AlertCircle, Camera, Upload, X, 
  Car, FileCheck, Key, Truck, Bike, CheckCircle
} from 'lucide-react';
import { api, setToken, setCurrentUser, getDriverPortalRoute } from '../services/api';
import { toWesternDigits } from '../utils/arabicLocalization';
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

  // Single-field validation for real-time feedback
  const validateSingleField = (field, value, comparePassword = password, service = selectedService) => {
    if (field === 'fullName') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'يرجى إدخال اسم السائق الكامل';
      if (trimmed.length < 3) return 'يجب أن يتكون الاسم من 3 أحرف على الأقل';
      return null;
    }
    if (field === 'phone') {
      const clean = toWesternDigits(String(value || '')).replace(/\D/g, '');
      if (!clean) return 'يرجى إدخال رقم الهاتف';
      if (!/^7[0-9]{8}$/.test(clean)) {
        return 'رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بالرقم 7 في اليمن';
      }
      return null;
    }
    if (field === 'selectedService') {
      if (!['taxi', 'rental', 'truck', 'motorcycle'].includes(value)) {
        return 'يرجى اختيار نوع الخدمة / وسيلة النقل';
      }
      return null;
    }
    if (field === 'vehicleModel') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'يرجى إدخال طراز المركبة وسنة الصنع';
      if (trimmed.length < 2) return 'طراز المركبة قصير جداً';
      return null;
    }
    if (field === 'vehiclePlate') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'يرجى إدخال رقم لوحة المركبة';
      if (trimmed.length < 2) return 'رقم لوحة المركبة قصير جداً';
      return null;
    }
    if (field === 'maxPayload' && service === 'truck') {
      const num = Number(toWesternDigits(String(value || '')));
      if (!value || Number.isNaN(num) || num < 100) {
        return 'يرجى إدخال الحمولة القصوى للشاحنة (100 كجم فأكثر)';
      }
      return null;
    }
    if (field === 'rentalDailyRate' && service === 'rental') {
      const num = Number(toWesternDigits(String(value || '')));
      if (!value || Number.isNaN(num) || num < 1000) {
        return 'يرجى إدخال السعر اليومي الصحيح للإيجار (1000 ر.ي فأكثر)';
      }
      return null;
    }
    if (field === 'password') {
      if (!value) return 'يرجى إنشاء كلمة مرور لحساب السائق';
      if (value.length < 6) return 'كلمة المرور يجب أن لا تقل عن 6 خانات';
      return null;
    }
    if (field === 'confirmPassword') {
      if (!value) return 'يرجى تأكيد كلمة المرور';
      if (value !== comparePassword) return 'كلمتا المرور غير متطابقتين';
      return null;
    }
    return null;
  };

  // Full Form Validation before submit
  const validateForm = () => {
    const newErrors = {
      fullName: validateSingleField('fullName', fullName),
      phone: validateSingleField('phone', phone),
      selectedService: validateSingleField('selectedService', selectedService),
      vehicleModel: validateSingleField('vehicleModel', vehicleModel),
      vehiclePlate: validateSingleField('vehiclePlate', vehiclePlate),
      maxPayload: validateSingleField('maxPayload', maxPayload, password, selectedService),
      rentalDailyRate: validateSingleField('rentalDailyRate', rentalDailyRate, password, selectedService),
      licensePhoto: !licensePhoto ? 'يرجى إرفاق صورة رخصة القيادة للتحقق من هوية السائق' : null,
      selfiePhoto: !selfiePhoto ? 'يرجى إرفاق صورة سيلفي واضحة للوجه لمطابقة الهوية' : null,
      carPhotos: carPhotos.length === 0 ? 'يرجى إرفاق صورة واحدة على الأقل لمركبة العمل' : null,
      password: validateSingleField('password', password),
      confirmPassword: validateSingleField('confirmPassword', confirmPassword, password),
    };

    const filtered = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => Boolean(v)));
    setErrors(filtered);

    const firstKey = Object.keys(filtered)[0];
    if (firstKey) {
      const el = document.getElementById(`driver-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof el.focus === 'function') el.focus();
      }
    }

    return Object.keys(filtered).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setStatusMessage(null);

    if (!validateForm()) {
      setStatusMessage({
        type: 'error',
        text: 'يرجى استكمال جميع البيانات والوثائق الإلزامية بشكل صحيح قبل إرسال الطلب.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = toWesternDigits(phone).replace(/\D/g, '');
      const formData = new FormData();
      formData.append('name', fullName.trim());
      formData.append('phone', cleanPhone);
      formData.append('password', password);
      formData.append('password_confirmation', confirmPassword);
      formData.append('service_type', selectedService);
      formData.append('vehicle_plate', vehiclePlate.trim());
      formData.append('vehicle_model', vehicleModel.trim());
      formData.append('vehicle_type', 'comfort');
      if (selectedService === 'truck') {
        formData.append('max_payload_kg', toWesternDigits(String(maxPayload)));
      }
      if (selectedService === 'rental') {
        formData.append('daily_rate', toWesternDigits(String(rentalDailyRate)));
      }

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
        navigate(getDriverPortalRoute(res.user), { replace: true });
      }, 1500);
    } catch (err) {
      const serverErrors = err?.data?.errors;
      if (serverErrors) {
        setErrors((prev) => ({
          ...prev,
          fullName: serverErrors.name?.[0] || prev.fullName,
          phone: serverErrors.phone?.[0] || prev.phone,
          vehicleModel: serverErrors.vehicle_model?.[0] || prev.vehicleModel,
          vehiclePlate: serverErrors.vehicle_plate?.[0] || prev.vehiclePlate,
          licensePhoto: serverErrors.license_photo?.[0] || prev.licensePhoto,
          selfiePhoto: serverErrors.selfie_photo?.[0] || prev.selfiePhoto,
          carPhotos: serverErrors.car_front_photo?.[0] || prev.carPhotos,
          password: serverErrors.password?.[0] || prev.password,
        }));
      }
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
            statusMessage.type === 'success' || statusMessage.type === 'info'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-700 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            )}
            <div className="leading-relaxed font-semibold">{statusMessage.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          
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
                  id="driver-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFullName(val);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: validateSingleField('fullName', val) }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, fullName: validateSingleField('fullName', fullName) }))}
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
                  id="driver-phone"
                  type="tel"
                  dir="rtl"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhone(val);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: validateSingleField('phone', val) }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, phone: validateSingleField('phone', phone) }))}
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

          {/* Section: Vehicle Details */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-cairo font-bold text-rahaa-navy pb-1 border-b border-gray-100">
              بيانات المركبة والخدمة
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Model */}
              <div className="space-y-1 text-right">
                <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                  طراز المركبة وسنة الصنع <span className="text-red-500">*</span>
                </label>
                <input
                  id="driver-vehicleModel"
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVehicleModel(val);
                    if (errors.vehicleModel) setErrors((prev) => ({ ...prev, vehicleModel: validateSingleField('vehicleModel', val) }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, vehicleModel: validateSingleField('vehicleModel', vehicleModel) }))}
                  placeholder="مثال: تويوتا كورولا 2022"
                  className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                    errors.vehicleModel ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                {errors.vehicleModel && <p className="text-xs text-red-600 mt-1">{errors.vehicleModel}</p>}
              </div>

              {/* Vehicle Plate */}
              <div className="space-y-1 text-right">
                <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                  رقم لوحة المركبة <span className="text-red-500">*</span>
                </label>
                <input
                  id="driver-vehiclePlate"
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVehiclePlate(val);
                    if (errors.vehiclePlate) setErrors((prev) => ({ ...prev, vehiclePlate: validateSingleField('vehiclePlate', val) }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, vehiclePlate: validateSingleField('vehiclePlate', vehiclePlate) }))}
                  placeholder="مثال: 1 / 12450"
                  className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                    errors.vehiclePlate ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                {errors.vehiclePlate && <p className="text-xs text-red-600 mt-1">{errors.vehiclePlate}</p>}
              </div>
            </div>

            {selectedService === 'truck' && (
              <div className="space-y-1 text-right">
                <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                  الحمولة القصوى (كجم) <span className="text-red-500">*</span>
                </label>
                <input
                  id="driver-maxPayload"
                  type="number"
                  min="100"
                  value={maxPayload}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxPayload(val);
                    if (errors.maxPayload) setErrors((prev) => ({ ...prev, maxPayload: validateSingleField('maxPayload', val) }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, maxPayload: validateSingleField('maxPayload', maxPayload) }))}
                  className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                    errors.maxPayload ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                {errors.maxPayload && <p className="text-xs text-red-600 mt-1">{errors.maxPayload}</p>}
              </div>
            )}

            {selectedService === 'rental' && (
              <div className="space-y-1 text-right">
                <label className="block text-xs font-cairo font-semibold text-rahaa-navy">
                  السعر اليومي للإيجار (ر.ي) <span className="text-red-500">*</span>
                </label>
                <input
                  id="driver-rentalDailyRate"
                  type="number"
                  min="1000"
                  value={rentalDailyRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRentalDailyRate(val);
                    if (errors.rentalDailyRate) setErrors((prev) => ({ ...prev, rentalDailyRate: validateSingleField('rentalDailyRate', val) }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, rentalDailyRate: validateSingleField('rentalDailyRate', rentalDailyRate) }))}
                  className={`w-full px-4 py-3 bg-gray-50/70 border rounded-xl text-sm focus:outline-none transition-all font-tajawal text-right ${
                    errors.rentalDailyRate ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
                {errors.rentalDailyRate && <p className="text-xs text-red-600 mt-1">{errors.rentalDailyRate}</p>}
              </div>
            )}
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
                  id="driver-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    setErrors((prev) => ({
                      ...prev,
                      password: prev.password ? validateSingleField('password', val) : null,
                      confirmPassword: confirmPassword
                        ? validateSingleField('confirmPassword', confirmPassword, val)
                        : prev.confirmPassword,
                    }));
                  }}
                  onBlur={() => setErrors((prev) => ({ ...prev, password: validateSingleField('password', password) }))}
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
                  id="driver-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateSingleField('confirmPassword', val, password),
                    }));
                  }}
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateSingleField('confirmPassword', confirmPassword, password),
                    }))
                  }
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
