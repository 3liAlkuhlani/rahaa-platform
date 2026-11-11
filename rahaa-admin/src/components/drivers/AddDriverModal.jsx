import React, { useState } from 'react';
import { X, UserPlus, Upload, CheckCircle2 } from 'lucide-react';

export const AddDriverModal = ({ isOpen, onClose, onAddDriver }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: 'إقتصادية',
    plateNumber: '',
    vehicleModel: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.plateNumber) {
      alert('يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }

    const newDriver = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      vehicleType: formData.vehicleType,
      vehicleColor:
        formData.vehicleType === 'عائلية'
          ? 'bg-[#6C00BA]'
          : formData.vehicleType === 'راحة بلس'
          ? 'bg-[#006C4A]'
          : 'bg-[#003FB1]',
      plateNumber: formData.plateNumber,
      status: 'بانتظار المراجعة',
      regDate: 'الآن',
      avatarBg: 'bg-[#E7EEFE]',
    };

    if (onAddDriver) onAddDriver(newDriver);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-right space-y-4 border border-[#C3C5D7] shadow-2xl animate-in fade-in zoom-in duration-200">
        
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
              إضافة سائق جديد
            </h3>
            <UserPlus className="w-5 h-5 text-[#003FB1]" />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-tajawal text-xs text-[#151C27] font-semibold mb-1">
              اسم السائق الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: عبدالمجيد علي الشميري"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-[#F9F9FF] border border-[#C3C5D7] rounded-xl text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-[#003FB1]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-tajawal text-xs text-[#151C27] font-semibold mb-1">
                رقم الهاتف (+967) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="0771234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-[#F9F9FF] border border-[#C3C5D7] rounded-xl text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-[#003FB1] dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block font-tajawal text-xs text-[#151C27] font-semibold mb-1">
                نوع المركبة <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full p-2.5 bg-[#F9F9FF] border border-[#C3C5D7] rounded-xl text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-[#003FB1] cursor-pointer"
              >
                <option value="إقتصادية">إقتصادية</option>
                <option value="راحة بلس">راحة بلس</option>
                <option value="عائلية">عائلية</option>
                <option value="تكسي">تكسي</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-tajawal text-xs text-[#151C27] font-semibold mb-1">
                رقم اللوحة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: 12345 / 1"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full p-2.5 bg-[#F9F9FF] border border-[#C3C5D7] rounded-xl text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-[#003FB1]"
              />
            </div>

            <div>
              <label className="block font-tajawal text-xs text-[#151C27] font-semibold mb-1">
                طراز المركبة وسنة الصنع
              </label>
              <input
                type="text"
                placeholder="تويوتا كورولا 2021"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className="w-full p-2.5 bg-[#F9F9FF] border border-[#C3C5D7] rounded-xl text-sm font-tajawal text-[#151C27] focus:outline-none focus:border-[#003FB1]"
              />
            </div>
          </div>

          {/* Upload Documents Mock Box */}
          <div className="border-2 border-dashed border-[#C3C5D7] p-4 rounded-xl bg-[#F0F3FF]/40 text-center space-y-1">
            <Upload className="w-6 h-6 text-[#003FB1] mx-auto" />
            <p className="font-tajawal text-xs text-[#151C27] font-bold">
              رفع رخصة القيادة وملكية السيارة (PDF أو صور)
            </p>
            <p className="font-tajawal text-[11px] text-gray-500">
              اسحب الصور إلى هنا أو انقر للاستعراض
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#434654] font-cairo font-semibold text-sm rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#003FB1] hover:bg-[#003390] text-white font-cairo font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              حفظ السائق
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
