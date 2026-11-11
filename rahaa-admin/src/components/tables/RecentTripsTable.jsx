import React, { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentTripsTable = ({ apiTrips = [], loading = false }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const mappedTrips = apiTrips.map((t) => {
    let statusLabel = 'قيد الانتظار';
    if (t.status === 'completed') statusLabel = 'مكتملة';
    else if (t.status === 'cancelled') statusLabel = 'ملغاة';
    else if (['in_progress', 'accepted', 'arrived'].includes(t.status)) statusLabel = 'جارية';

    const customerName = t.passenger?.name || 'راكب راحة';
    const cleanNum = String(t.trip_number || t.id || '').replace(/^[A-Za-z-]+/, '');
    return {
      id: `#رحلة-${cleanNum}`,
      customer: customerName,
      customerAvatar: customerName[0] || 'ر',
      driver: t.driver?.name || 'بانتظار سائق',
      route: `${t.pickup_name} ← ${t.dropoff_name}`,
      cost: `${Number(t.fare || 0).toLocaleString('ar-YE')} ر.ي`,
      status: statusLabel,
    };
  });

  const filteredTrips = mappedTrips.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
      {/* Table Top Header Bar */}
      <div className="p-5 border-b border-rahaa-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-cairo font-bold text-base text-rahaa-navy">
            الرحلات الأخيرة المسجلة
          </h3>
          <p className="font-tajawal text-xs text-rahaa-text-muted mt-0.5">
            سجل العمليات الأخيرة لجميع قطاعات النقل في أمانة العاصمة صنعاء
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="تصفية بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-3 pr-9 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal focus:outline-none focus:border-rahaa-blue"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/trips')}
            className="h-10 px-4 bg-rahaa-blue text-white rounded-xl text-xs font-cairo font-bold hover:bg-rahaa-blue-hover transition-colors"
          >
            إدارة كافة الرحلات
          </button>
        </div>
      </div>

      {/* Table Surface */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-rahaa-blue-soft border-b border-rahaa-border text-xs font-cairo font-bold text-rahaa-text-muted">
              <th className="py-3.5 px-4">رقم الرحلة</th>
              <th className="py-3.5 px-4">العميل</th>
              <th className="py-3.5 px-4">السائق</th>
              <th className="py-3.5 px-4">المسار</th>
              <th className="py-3.5 px-4">التكلفة</th>
              <th className="py-3.5 px-4">الحالة</th>
              <th className="py-3.5 px-4 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rahaa-border/50 font-tajawal text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-rahaa-text-muted font-cairo">
                  جاري تحميل الرحلات...
                </td>
              </tr>
            ) : filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-rahaa-text-muted font-cairo">
                  لا توجد رحلات مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-rahaa-bg/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-rahaa-navy">
                    {trip.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rahaa-blue-avatar text-rahaa-blue font-cairo font-bold flex items-center justify-center text-xs">
                        {trip.customerAvatar}
                      </div>
                      <span className="font-bold text-xs text-rahaa-navy">{trip.customer}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-rahaa-text-muted font-medium">
                    {trip.driver}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-rahaa-bg border border-rahaa-border text-xs font-tajawal text-rahaa-navy">
                      {trip.route}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-cairo font-bold text-xs text-rahaa-blue">
                    {trip.cost}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={trip.status} />
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/trips')}
                      title="عرض التفاصيل"
                      className="p-1.5 rounded-lg text-rahaa-blue hover:bg-rahaa-blue-light transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
