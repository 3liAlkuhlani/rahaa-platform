import React from 'react';
import {
  FileText,
  Edit2,
  Ban,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileSpreadsheet,
} from 'lucide-react';

export const DriversTable = ({
  drivers,
  onInspectDocs,
  onEditDriver,
  onToggleBan,
  onExportExcel,
}) => {
  const defaultDrivers = [
    {
      id: 1,
      name: 'محمد القاسمي',
      phone: '0771234567',
      vehicleType: 'إقتصادية',
      vehicleColor: 'bg-[#003FB1]',
      plateNumber: '12345 / 1',
      status: 'موثق',
      regDate: '12 مايو 2024',
      avatarBg: 'bg-[#E7EEFE]',
    },
    {
      id: 2,
      name: 'صالح الحميري',
      phone: '0778899001',
      vehicleType: 'عائلية',
      vehicleColor: 'bg-[#6C00BA]',
      plateNumber: '98765 / 2',
      status: 'بانتظار المراجعة',
      regDate: '15 مايو 2024',
      avatarBg: 'bg-[#E7EEFE]',
    },
    {
      id: 3,
      name: 'باسم الشرجبي',
      phone: '0775566778',
      vehicleType: 'إقتصادية',
      vehicleColor: 'bg-[#003FB1]',
      plateNumber: '55443 / 1',
      status: 'محظور',
      regDate: '10 أبريل 2024',
      avatarBg: 'bg-[#E7EEFE]',
    },
    {
      id: 4,
      name: 'أحمد العولقي',
      phone: '0773344556',
      vehicleType: 'راحة بلس',
      vehicleColor: 'bg-[#006C4A]',
      plateNumber: '77112 / 1',
      status: 'موثق',
      regDate: '20 مايو 2024',
      avatarBg: 'bg-[#E7EEFE]',
    },
  ];

  const data = drivers || defaultDrivers;

  const getStatusBadge = (statusName) => {
    switch (statusName) {
      case 'موثق':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-tajawal font-bold bg-[#82F5C1]/40 text-[#00714E] border border-[#00714E]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            موثق
          </span>
        );
      case 'بانتظار المراجعة':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-tajawal font-bold bg-[#872FD7]/20 text-[#6C00BA] border border-[#6C00BA]/20">
            <Clock className="w-3.5 h-3.5" />
            بانتظار المراجعة
          </span>
        );
      case 'محظور':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-tajawal font-bold bg-[#FFDAD6]/60 text-[#BA1A1A] border border-[#BA1A1A]/20">
            <AlertOctagon className="w-3.5 h-3.5" />
            محظور
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#C3C5D7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      
      {/* Table Header: Starts from the Right */}
      <div className="p-5 border-b border-[#C3C5D7] flex items-center justify-between">
        <h3 className="font-cairo font-bold text-xl text-[#151C27] text-right">
          قائمة السائقين
        </h3>

        <button
          onClick={onExportExcel}
          className="text-[#737686] hover:text-[#151C27] font-cairo text-base transition-colors flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>تصدير إكسل</span>
        </button>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#F0F3FF] text-[#434654] font-cairo text-base font-bold border-b border-[#C3C5D7]">
              <th className="py-4 px-6 text-right">السائق</th>
              <th className="py-4 px-6 text-right">نوع المركبة</th>
              <th className="py-4 px-6 text-right">رقم اللوحة</th>
              <th className="py-4 px-6 text-right">الحالة</th>
              <th className="py-4 px-6 text-right">تاريخ التسجيل</th>
              <th className="py-4 px-6 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C3C5D7]/60">
            {data.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50/80 transition-colors">
                
                {/* Driver Profile */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E7EEFE] flex items-center justify-center font-cairo font-bold text-sm text-[#003FB1] shrink-0 border border-[#C3C5D7]/40">
                      {driver.name.split(' ')[0][0]}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-cairo font-bold text-base text-[#151C27]">
                        {driver.name}
                      </span>
                      <span className="font-tajawal text-xs text-[#434654] text-right">
                        {driver.phone}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Vehicle Type */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-tajawal text-base text-[#151C27]">
                      {driver.vehicleType}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${driver.vehicleColor}`}></div>
                  </div>
                </td>

                {/* Plate Number */}
                <td className="py-4 px-6 font-tajawal font-medium text-base text-[#151C27] whitespace-nowrap">
                  {driver.plateNumber}
                </td>

                {/* Status */}
                <td className="py-4 px-6 whitespace-nowrap">
                  {getStatusBadge(driver.status)}
                </td>

                {/* Registration Date */}
                <td className="py-4 px-6 font-tajawal text-xs text-[#434654] whitespace-nowrap">
                  {driver.regDate}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    
                    {/* View Docs */}
                    <button
                      onClick={() => onInspectDocs && onInspectDocs(driver)}
                      title="مراجعة الوثائق"
                      className="p-2 rounded-lg border border-[#C3C5D7] hover:bg-[#F0F3FF] text-[#151C27] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#003FB1]" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditDriver && onEditDriver(driver)}
                      title="تعديل البيانات"
                      className="p-2 rounded-lg border border-[#C3C5D7] hover:bg-gray-100 text-[#151C27] transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-700" />
                    </button>

                    {/* Ban / Unban */}
                    {driver.status === 'محظور' ? (
                      <button
                        onClick={() => onToggleBan && onToggleBan(driver)}
                        className="px-3 py-1 rounded-lg border border-[#003FB1]/30 bg-blue-50 text-[#003FB1] font-tajawal font-bold text-xs hover:bg-blue-100 transition-colors"
                      >
                        إلغاء الحظر
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleBan && onToggleBan(driver)}
                        title="حظر السائق"
                        className="p-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
