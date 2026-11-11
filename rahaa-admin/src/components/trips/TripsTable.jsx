import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Navigation, MapPin, User, ArrowLeft } from 'lucide-react';

export const TripsTable = ({ trips, selectedTripId, onSelectTrip, onShowAll }) => {
  const defaultTrips = [
    {
      id: '#رحلة-٩٠٢٥',
      rider: { name: 'سارة منصور', avatarBg: 'bg-[#D3DAEA]', initials: 'س' },
      driver: { name: 'سعيد عبده', avatarBg: 'bg-[#DBE1FF]', initials: 'س' },
      route: { from: 'شارع حدة', to: 'جامعة صنعاء' },
      fare: '٢٬٢٠٠ ر.ي',
      status: 'قيد التنفيذ',
      vehicleType: 'راحة بلس',
      time: '١٠:٤٥ ص',
      speed: '٤٢ كم/س',
      eta: '١٢ دقيقة',
      distance: '٣.٨ كم',
    },
    {
      id: '#رحلة-٩٠٢١',
      rider: { name: 'محمد صالح', avatarBg: 'bg-[#D3DAEA]', initials: 'م' },
      driver: { name: 'علي اليافعي', avatarBg: 'bg-[#DBE1FF]', initials: 'ع' },
      route: { from: 'حي الحصبة', to: 'حي السبعين' },
      fare: '٣٬٥٠٠ ر.ي',
      status: 'مكتملة',
      vehicleType: 'راحة توفير',
      time: '٠٩:٣٠ ص',
      speed: '٠ كم/س',
      eta: 'مكتملة',
      distance: '٦.٢ كم',
    },
    {
      id: '#رحلة-٨٩٩١',
      rider: { name: 'عبدالله محمد', avatarBg: 'bg-[#D3DAEA]', initials: 'ع' },
      driver: { name: 'باسم خالد', avatarBg: 'bg-[#DBE1FF]', initials: 'ب' },
      route: { from: 'مطار صنعاء', to: 'وسط المدينة' },
      fare: '٥٬٠٠٠ ر.ي',
      status: 'ملغاة',
      vehicleType: 'فاخرة',
      time: '٠٨:١٥ ص',
      speed: '٠ كم/س',
      eta: 'ملغاة',
      distance: '١٢.٥ كم',
    },
    {
      id: '#رحلة-٨٨٤٢',
      rider: { name: 'فاطمة أحمد', avatarBg: 'bg-[#D3DAEA]', initials: 'ف' },
      driver: { name: 'كمال صالح', avatarBg: 'bg-[#DBE1FF]', initials: 'ك' },
      route: { from: 'حي النهضة', to: 'باب اليمن' },
      fare: '٢٬٨٠٠ ر.ي',
      status: 'مكتملة',
      vehicleType: 'تاكسي',
      time: 'أمس',
      speed: '٠ كم/س',
      eta: 'مكتملة',
      distance: '٤.١ كم',
    },
  ];

  const dataList = trips || defaultTrips;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden" dir="rtl">
      {/* Header: Starts from the Right */}
      <div className="p-5 border-b border-[#C3C5D7]/50 flex items-center justify-between">
        <h3 className="font-cairo font-bold text-lg text-[#151C27] text-right">
          سجل الرحلات الأخير
        </h3>

        <button
          onClick={onShowAll}
          className="text-[#003FB1] hover:text-[#002d80] font-cairo font-semibold text-sm transition-colors flex items-center gap-1"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#F0F3FF] text-[#434654] font-cairo text-sm font-semibold border-b border-[#C3C5D7]">
              <th className="py-3.5 px-4 text-right">رقم الرحلة</th>
              <th className="py-3.5 px-4 text-right">الراكب</th>
              <th className="py-3.5 px-4 text-right">السائق</th>
              <th className="py-3.5 px-4 text-right">المسار</th>
              <th className="py-3.5 px-4 text-right">الأجرة</th>
              <th className="py-3.5 px-4 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {dataList.map((trip) => {
              const isSelected = selectedTripId === trip.id;
              return (
                <tr
                  key={trip.id}
                  onClick={() => onSelectTrip && onSelectTrip(trip)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-50/80 border-r-4 border-r-[#003FB1]'
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Trip ID */}
                  <td className="py-4 px-4 font-cairo font-bold text-sm text-[#151C27] whitespace-nowrap">
                    {trip.id}
                  </td>

                  {/* Rider */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full ${trip.rider.avatarBg} flex items-center justify-center font-cairo font-bold text-xs text-rahaa-navy shrink-0`}
                      >
                        {trip.rider.initials}
                      </div>
                      <span className="font-tajawal text-sm text-[#151C27] font-medium">
                        {trip.rider.name}
                      </span>
                    </div>
                  </td>

                  {/* Driver */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full ${trip.driver.avatarBg} flex items-center justify-center font-cairo font-bold text-xs text-rahaa-navy shrink-0`}
                      >
                        {trip.driver.initials}
                      </div>
                      <span className="font-tajawal text-sm text-[#151C27] font-medium">
                        {trip.driver.name}
                      </span>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col text-xs font-tajawal">
                      <span className="text-[#151C27] font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600 inline" />
                        {trip.route.from}
                      </span>
                      <span className="text-[#737686] flex items-center gap-1 mt-0.5">
                        <Navigation className="w-3 h-3 text-rahaa-blue inline" />
                        {trip.route.to}
                      </span>
                    </div>
                  </td>

                  {/* Fare */}
                  <td className="py-4 px-4 font-cairo font-bold text-sm text-[#003FB1] whitespace-nowrap">
                    {trip.fare}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <StatusBadge status={trip.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
