import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  User,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';

export const RenterVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Files state
  const [personalPhoto, setPersonalPhoto] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);

  // Input refs
  const personalRef = useRef(null);
  const idFrontRef = useRef(null);
  const idBackRef = useRef(null);
  const licenseFrontRef = useRef(null);
  const licenseBackRef = useRef(null);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getRenterVerification();
      if (res?.verification) {
        setVerification(res.verification);
        if (res.verification.status === 'approved' && onVerified) {
          onVerified(res.verification);
        }
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVerificationStatus();
    }
  }, [isOpen]);

  const handleSubmitDocuments = async (e) => {
    e.preventDefault();
    if (!personalPhoto && !idFront && !licenseFront) {
      setErrorMsg('يرجى اختيار صور الهوية ورخصة القيادة والصورة الشخصية على الأقل');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      const formData = new FormData();
      if (personalPhoto) formData.append('personal_photo', personalPhoto);
      if (idFront) formData.append('id_card_front', idFront);
      if (idBack) formData.append('id_card_back', idBack);
      if (licenseFront) formData.append('driving_license_front', licenseFront);
      if (licenseBack) formData.append('driving_license_back', licenseBack);

      const res = await api.submitRenterVerification(formData);
      setSuccessMsg(res.message || 'تم رفع وثائقك بنجاح وجاري تدقيقها من قبل الإدارة');
      setVerification(res.verification);
      setTimeout(() => {
        if (onVerified) onVerified(res.verification);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'فشل رفع الوثائق. يرجى المحاولة مرة أخرى');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const isApproved = verification?.status === 'approved';
  const isUnderReview = verification?.status === 'under_review';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-tajawal animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-rahaa-xl border border-rahaa-border max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rahaa-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-base text-rahaa-navy">
                توثيق هوية المستأجر ورخصة القيادة
              </h3>
              <p className="text-xs text-rahaa-text-subtle">
                متطلب أمني وتنظيمي إلزامي قبل تأكيد حجز واستلام السيارة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Verification Status Banner */}
        {isApproved ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 mb-4">
            <div className="flex items-center gap-2 font-cairo font-bold text-sm text-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>حسابك موثق ومعتمد بنجاح كمستأجر رسمي!</span>
            </div>
            <p className="text-xs leading-relaxed">
              تم التحقق من هويتك ورخصة قيادتك السارية مسبقاً، يمكنك الآن إتمام تأكيد الحجز فوراً دون إعادة الرفع.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-xs"
            >
              متابعة تأكيد الحجز
            </button>
          </div>
        ) : isUnderReview ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 mb-4">
            <div className="flex items-center gap-2 font-cairo font-bold text-sm text-amber-800">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
              <span>وثائقك قيد المراجعة والتدقيق الإداري</span>
            </div>
            <p className="text-xs leading-relaxed">
              تم استلام صور الهوية والرخصة وهي الآن قيد المراجعة السريعة. تستغرق العملية دقائق معدودة.
            </p>
            <button
              type="button"
              onClick={fetchVerificationStatus}
              className="mt-2 h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث حالة المراجعة</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitDocuments} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Document Upload Cards */}
            <div className="space-y-3">
              {/* 1. Personal Photo */}
              <div className="p-3.5 rounded-2xl border border-rahaa-border bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-rahaa-primary flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-cairo font-bold text-xs text-rahaa-navy block">
                      1. صورة شخصية واضحة للوجه
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {personalPhoto ? personalPhoto.name : 'صورة أمامية مباشرة بدون نظارات'}
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={personalRef}
                  className="hidden"
                  onChange={(e) => setPersonalPhoto(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => personalRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-cairo font-bold text-rahaa-primary hover:bg-slate-100"
                >
                  {personalPhoto ? 'تغيير' : 'رفع الصورة'}
                </button>
              </div>

              {/* 2. National ID Card Front & Back */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl border border-rahaa-border bg-slate-50 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-cairo font-bold text-xs text-rahaa-navy block">
                      2. البطاقة الشخصية (الوجه)
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {idFront ? idFront.name : 'الصورة الأمامية'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={idFrontRef}
                    className="hidden"
                    onChange={(e) => setIdFront(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => idFrontRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-cairo font-bold text-rahaa-primary shrink-0"
                  >
                    {idFront ? 'تم' : 'رفع'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl border border-rahaa-border bg-slate-50 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-cairo font-bold text-xs text-rahaa-navy block">
                      3. البطاقة الشخصية (الظهر)
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {idBack ? idBack.name : 'الصورة الخلفية'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={idBackRef}
                    className="hidden"
                    onChange={(e) => setIdBack(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => idBackRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-cairo font-bold text-rahaa-primary shrink-0"
                  >
                    {idBack ? 'تم' : 'رفع'}
                  </button>
                </div>
              </div>

              {/* 3. Driving License Front & Back */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl border border-rahaa-border bg-slate-50 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-cairo font-bold text-xs text-rahaa-navy block">
                      4. رخصة القيادة (الوجه)
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {licenseFront ? licenseFront.name : 'سارية المفعول'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={licenseFrontRef}
                    className="hidden"
                    onChange={(e) => setLicenseFront(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => licenseFrontRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-cairo font-bold text-rahaa-primary shrink-0"
                  >
                    {licenseFront ? 'تم' : 'رفع'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl border border-rahaa-border bg-slate-50 flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-cairo font-bold text-xs text-rahaa-navy block">
                      5. رخصة القيادة (الظهر)
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {licenseBack ? licenseBack.name : 'الجهة الخلفية'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={licenseBackRef}
                    className="hidden"
                    onChange={(e) => setLicenseBack(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => licenseBackRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-cairo font-bold text-rahaa-primary shrink-0"
                  >
                    {licenseBack ? 'تم' : 'رفع'}
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              * تحفظ وثائقك بأعلى درجات التشفير والسرية في خوادم راحة المحمية ولا تتاح إلا للتحقق الأمني المعتمد لغرض توقيع عقد الإيجار.
            </p>

            {/* Action Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 h-11 rounded-xl border border-rahaa-border font-cairo font-bold text-xs text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="w-2/3 h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-cairo font-bold text-xs flex items-center justify-center gap-2 shadow-rahaa-sm disabled:opacity-50"
              >
                {uploading ? 'جاري إرسال الوثائق...' : 'إرسال وتوثيق الحساب'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RenterVerificationModal;
