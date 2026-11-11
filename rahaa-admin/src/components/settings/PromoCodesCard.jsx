import React, { useState } from 'react';
import { Tag, Filter, Plus, Ticket, Calendar, Percent, CheckCircle, Clock } from 'lucide-react';

export default function PromoCodesCard() {
  const [promos, setPromos] = useState([
    {
      id: 'راحة_٢٠٢٦',
      description: 'خصم ٢٠٪ للرحلات الجديدة • صالح حتى ٣٠ ديسمبر',
      discount: '٢٠٪',
      type: 'نسبة مئوية',
      status: 'active',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'عرض_العيد',
      description: 'خصم ثابت ١٬٠٠٠ ر.ي • منتهي الصلاحية',
      discount: '١٬٠٠٠ ر.ي',
      type: 'مبلغ ثابت',
      status: 'expired',
      badgeColor: 'bg-gray-200 text-gray-700 border-gray-300',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newCode) return;
    setPromos((prev) => [
      {
        id: newCode.toUpperCase(),
        description: `خصم ${newDiscount} • مضاف حديثاً`,
        discount: newDiscount,
        type: 'كود خاص',
        status: 'active',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
      ...prev,
    ]);
    setNewCode('');
    setNewDiscount('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">أكواد الخصم والعروض</h2>
            <p className="text-xs text-gray-500 font-tajawal">إدارة قسائم الخصم وتخفيضات العروض الموسمية</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-100 transition">
          <Filter className="w-4 h-4" />
          <span className="font-cairo">تصفية العروض</span>
        </button>
      </div>

      {/* Promos List */}
      <div className="space-y-3 mb-6">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
              promo.status === 'expired'
                ? 'bg-gray-50/70 border-gray-200 opacity-75'
                : 'bg-brand-50/40 border-brand-200 hover:border-brand-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                  promo.status === 'expired' ? 'bg-gray-400' : 'bg-purple-600'
                }`}
              >
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-gray-900 font-mono tracking-wide">
                    {promo.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${promo.badgeColor}`}
                  >
                    {promo.status === 'active' ? 'نشط' : 'منتهي'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-tajawal mt-1">{promo.description}</p>
              </div>
            </div>

            <div className="text-right self-end sm:self-center">
              <span className="text-sm font-bold text-brand-700 font-tajawal">{promo.discount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Promo Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-3.5 border-2 border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50/30 rounded-xl text-gray-600 hover:text-brand-600 text-sm font-semibold flex items-center justify-center gap-2 transition-all font-cairo"
      >
        <Plus className="w-5 h-5" />
        <span>إنشاء كود خصم جديد</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 font-cairo mb-4">إنشاء كود خصم جديد</h3>
            <form onSubmit={handleAddPromo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-cairo mb-1">
                  رمز الكود (مثال: صيف_راحة)
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="رمز الكود..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono uppercase focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 font-cairo mb-1">
                  قيمة الخصم (مثال: 15% أو 500 ر.ي)
                </label>
                <input
                  type="text"
                  required
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="قيمة الخصم..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-tajawal focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold font-cairo"
                >
                  إضافة الكود
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold font-cairo"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
