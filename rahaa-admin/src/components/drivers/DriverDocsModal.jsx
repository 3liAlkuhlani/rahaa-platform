import React from 'react';
import { X, CheckCircle2, XCircle, FileCheck, ShieldCheck, Car, CreditCard } from 'lucide-react';

export const DriverDocsModal = ({ driver, isOpen, onClose, onApprove, onReject }) => {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full text-right space-y-5 border border-[#C3C5D7] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="font-cairo font-bold text-xl text-[#151C27]">
              مراجعة وثائق السائق: {driver.name}
            </h3>
            <ShieldCheck className="w-6 h-6 text-[#003FB1]" />
          </div>
        </div>

        {/* Driver Meta Summary */}
        <div className="bg-[#F0F3FF] p-4 rounded-xl border border-[#C3C5D7]/50 grid grid-cols-2 gap-4 text-xs font-tajawal">
          <div>
            <span className="text-gray-500 block">رقم اللوحة:</span>
            <span className="font-bold text-[#151C27] text-sm">{driver.plateNumber}</span>
          </div>
          <div>
            <span className="text-gray-500 block">نوع المركبة:</span>
            <span className="font-bold text-[#151C27] text-sm">{driver.vehicleType}</span>
          </div>
          <div>
            <span className="text-gray-500 block">رقم الهاتف:</span>
            <span className="font-bold text-[#151C27] text-sm dir-ltr text-right">{driver.phone}</span>
          </div>
          <div>
            <span className="text-gray-500 block">تاريخ الطلب:</span>
            <span className="font-bold text-[#151C27] text-sm">{driver.regDate}</span>
          </div>
        </div>

        {/* Simulated Document Previews */}
        <div className="space-y-3">
          <h4 className="font-cairo font-bold text-sm text-[#151C27]">
            الوثائق والمستندات المرفقة
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Document 1: Driving License */}
            <div className="p-3 border border-[#C3C5D7] rounded-xl bg-gray-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#151C27]">
                <span className="text-emerald-600">جاهزة للمراجعة</span>
                <span className="flex items-center gap-1">
                  رخصة القيادة
                  <CreditCard className="w-4 h-4 text-[#003FB1]" />
                </span>
              </div>
              <div className="h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center border border-blue-200">
                <span className="font-tajawal text-xs text-[#003FB1] font-bold">
                  [معاينة صورة رخصة القيادة]
                </span>
              </div>
            </div>

            {/* Document 2: Vehicle Registration (الملكية) */}
            <div className="p-3 border border-[#C3C5D7] rounded-xl bg-gray-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#151C27]">
                <span className="text-emerald-600">جاهزة للمراجعة</span>
                <span className="flex items-center gap-1">
                  ملكية السيارة
                  <Car className="w-4 h-4 text-[#003FB1]" />
                </span>
              </div>
              <div className="h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center border border-emerald-200">
                <span className="font-tajawal text-xs text-emerald-700 font-bold">
                  [معاينة صورة كرت الملكية]
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Decision Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              if (onReject) onReject(driver);
              onClose();
            }}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-cairo font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            رفض الطلب
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#434654] font-cairo font-semibold text-xs rounded-xl transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                if (onApprove) onApprove(driver);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#006C4A] hover:bg-emerald-800 text-white font-cairo font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              اعتماد توثيق السائق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
