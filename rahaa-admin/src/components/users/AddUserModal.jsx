import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, User, Car } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    status: 'active',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    onAddUser({
      id: Date.now(),
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@rahah.ye`,
      phone: formData.phone.startsWith('+967') ? formData.phone : `+967 ${formData.phone}`,
      role: formData.role,
      status: formData.status,
      rating: formData.role === 'driver' ? '5.0' : '-.-',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
    });

    setFormData({ name: '', email: '', phone: '', role: 'driver', status: 'active' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-rahaa-border shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-rahaa-border/80 flex items-center justify-between bg-rahaa-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rahaa-blue text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
                إضافة مستخدم جديد
              </h3>
              <p className="font-tajawal text-xs text-rahaa-text-muted">
                إنشاء حساب جديد لسائق أو راكب في منصة راحة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-rahaa-text-subtle hover:bg-rahaa-border/30 hover:text-rahaa-navy transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Full Name */}
          <div>
            <label className="block font-cairo text-xs font-semibold text-rahaa-navy mb-1.5">
              اسم المستخدم الكامل *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="أحمد الكبسي"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-3 pr-10 py-2.5 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm font-tajawal focus:outline-none focus:border-rahaa-blue"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-cairo text-xs font-semibold text-rahaa-navy mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="ahmed@rahah.ye"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-3 pr-10 py-2.5 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm font-tajawal focus:outline-none focus:border-rahaa-blue"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-cairo text-xs font-semibold text-rahaa-navy mb-1.5">
              رقم الهاتف (اليمن +967) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="771 234 567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-3 pr-10 py-2.5 bg-rahaa-bg border border-rahaa-border rounded-xl text-sm font-tajawal text-right dir-ltr focus:outline-none focus:border-rahaa-blue"
              />
            </div>
          </div>

          {/* User Role & Initial Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-cairo text-xs font-semibold text-rahaa-navy mb-1.5">
                نوع الحساب *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2.5 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue"
              >
                <option value="driver">سائق (كابتن)</option>
                <option value="passenger">راكب</option>
              </select>
            </div>

            <div>
              <label className="block font-cairo text-xs font-semibold text-rahaa-navy mb-1.5">
                حالة التفعيل الأولي
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-cairo font-semibold text-rahaa-navy focus:outline-none focus:border-rahaa-blue"
              >
                <option value="active">نشط ومفعل</option>
                <option value="pending">قيد التحقق</option>
                <option value="banned">محظور</option>
              </select>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-rahaa-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-rahaa-border text-rahaa-navy font-cairo text-xs font-semibold hover:bg-rahaa-bg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rahaa-blue text-white font-cairo text-xs font-bold hover:bg-rahaa-blue-hover shadow-sm shadow-rahaa-blue/30 transition-colors"
            >
              إضافة الحساب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
