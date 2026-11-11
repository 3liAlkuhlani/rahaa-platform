import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Coins,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Printer,
  ChevronDown
} from 'lucide-react';

export const RentalGuaranteeCard = ({
  vehicle,
  guarantee,
  booking,
  isOwner = false,
  onStatusUpdated,
}) => {
  const [selectedType, setSelectedType] = useState('cash'); // 'cash', 'gold', 'weapon'
  const [description, setDescription] = useState('');
  const [legalLicense, setLegalLicense] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  const securityDeposit = vehicle?.security_deposit || 50000;

  const handleUpdateGuarantee = async (newStatus) => {
    if (!booking?.id) return;
    try {
      setUpdating(true);
      setMessage(null);
      const res = await api.updateRentalGuaranteeStatus(booking.id, {
        status: newStatus,
        inspection_notes: description || 'تم فحص ومطابقة الضمان المالي المودع بنجاح وفق العقد',
      });
      setMessage({ type: 'success', text: res.message || 'تم تحديث حالة الضمان المالي بنجاح' });
      if (onStatusUpdated) onStatusUpdated(res.guarantee);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'فشل تحديث حالة الضمان' });
    } finally {
      setUpdating(false);
    }
  };

  const currentStatus = guarantee?.status || 'pending';

  const statusLabels = {
    pending: { label: 'بانتظار التسليم', color: 'bg-amber-100 text-amber-800' },
    awaiting_handover: { label: 'جاهز للاستلام الميداني', color: 'bg-blue-100 text-blue-800' },
    received: { label: 'تم استلام الضمان رسمياً', color: 'bg-emerald-100 text-emerald-800' },
    under_inspection: { label: 'قيد الفحص عند الإعادة', color: 'bg-purple-100 text-purple-800' },
    returned: { label: 'تمت إعادة الضمان للمستأجر', color: 'bg-emerald-100 text-emerald-800' },
    disputed: { label: 'معلق لوجود ملاحظات', color: 'bg-rose-100 text-rose-800' },
  };

  const currentBadge = statusLabels[currentStatus] || statusLabels.pending;

  return (
    <div className="bg-white rounded-2xl border border-rahaa-border p-5 shadow-rahaa-sm font-tajawal space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-cairo font-bold text-sm text-rahaa-navy">
              نظام الضمان المالي للسيارة (Security Deposit)
            </h4>
            <span className="text-[11px] text-rahaa-text-subtle">
              ضمان تأميني مسترد بالكامل بعد فحص وإعادة السيارة سالمة
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${currentBadge.color}`}>
          {currentBadge.label}
        </span>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-bold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Value & Deposit Details */}
      <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 text-xs">
        <div>
          <span className="text-rahaa-text-subtle block">قيمة الضمان المعتمدة:</span>
          <span className="font-cairo font-black text-base text-amber-800">
            {Number(securityDeposit).toLocaleString()} ر.ي
          </span>
        </div>
        <div>
          <span className="text-rahaa-text-subtle block">رقم إيصال الضمان الرقمي:</span>
          <span className="font-mono font-bold text-rahaa-navy">
            {guarantee?.guarantee_receipt_number || 'سيتم إصداره فور التأكيد'}
          </span>
        </div>
      </div>

      {/* Guarantee Options Selection (When booking) */}
      {!guarantee && (
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-cairo font-bold text-rahaa-navy">
            اختر نوع الضمان الذي ستقدمه عند استلام السيارة:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'ضمان نقدي', desc: 'مبلغ مالي مسترد' },
              { id: 'gold', label: 'ضمان ذهب', desc: 'مصوغات أو سبائك' },
              { id: 'weapon', label: 'سلاح مرخص', desc: 'بموجب تصريح رسمي' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedType(item.id)}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  selectedType === item.id
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                    : 'border-rahaa-border hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-cairo text-xs block">{item.label}</span>
                <span className="text-[10px] text-slate-500 block">{item.desc}</span>
              </button>
            ))}
          </div>

          {selectedType === 'weapon' && (
            <div className="space-y-1.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
              <span className="font-cairo font-bold text-rose-800 block">
                تنبيه قانوني وتنظيمي بخصوص السلاح الشخصي:
              </span>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                يجب إبراز ترخيص حمل السلاح الرسمي الصادر من وزارة الداخلية، وتسجيل الرقم التسلسلي والنوع عند المعاينة اليدوية لدى المعرض. لا يُعتبر السلاح وسيلة دفع بل أمانة عينية فقط.
              </p>
              <input
                type="text"
                placeholder="رقم تصريح السلاح الرسمي..."
                value={legalLicense}
                onChange={(e) => setLegalLicense(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-rose-300 bg-white text-xs mt-1 focus:outline-none"
              />
            </div>
          )}

          {selectedType === 'gold' && (
            <input
              type="text"
              placeholder="وصف الذهب (الوزن بالجرام، العيار التقريبي)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-rahaa-border bg-slate-50 text-xs focus:outline-none"
            />
          )}
        </div>
      )}

      {/* Owner Handover Actions (When booking active) */}
      {isOwner && guarantee && (
        <div className="pt-2 border-t border-rahaa-border flex items-center gap-2">
          {currentStatus === 'pending' && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleUpdateGuarantee('received')}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>تأكيد استلام الضمان من المستأجر</span>
            </button>
          )}

          {currentStatus === 'received' && (
            <button
              type="button"
              disabled={updating}
              onClick={() => handleUpdateGuarantee('returned')}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-cairo font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>إعادة الضمان للمستأجر وإغلاق المحضر</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RentalGuaranteeCard;
