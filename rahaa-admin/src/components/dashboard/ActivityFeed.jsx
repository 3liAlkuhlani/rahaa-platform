import React from 'react';
import { UserPlus, AlertTriangle, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActivityFeed = ({ logs = [] }) => {
  const navigate = useNavigate();

  const defaultActivities = [
    {
      id: 1,
      title: 'تحديث بيانات السائقين',
      description: 'مراجعة طلبات انضمام السائقين الجدد في أمانة العاصمة.',
      time: 'الآن',
      icon: UserPlus,
      nodeColor: 'bg-rahaa-blue',
    },
    {
      id: 2,
      title: 'متابعة مناطق الذروة',
      description: 'نشاط مرتفع للرحلات في شارع حدة وميدان السبعين.',
      time: 'منذ 15 دقيقة',
      icon: AlertTriangle,
      nodeColor: 'bg-rahaa-orange',
    },
    {
      id: 3,
      title: 'عمليات المحفظة والدفع',
      description: 'تسوية المدفوعات الإلكترونية والنقدية للرحلات المكتملة.',
      time: 'منذ 30 دقيقة',
      icon: CreditCard,
      nodeColor: 'bg-rahaa-emerald',
    },
  ];

  const mappedLogs =
    logs.length > 0
      ? logs.slice(0, 5).map((log) => ({
          id: log.id,
          title:
            log.action === 'driver_approved'
              ? 'اعتماد سائق'
              : log.action === 'driver_rejected'
              ? 'رفض طلب سائق'
              : log.action === 'password_changed'
              ? 'تحديث أمان المشرف'
              : 'إجراء إداري',
          description: log.details,
          time: new Date(log.created_at).toLocaleTimeString('ar-YE', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          icon: ShieldCheck,
          nodeColor: 'bg-rahaa-blue',
        }))
      : defaultActivities;

  return (
    <div className="bg-rahaa-card p-6 rounded-2xl border border-rahaa-border shadow-rahaa-card flex flex-col justify-between h-full">
      <div>
        <div className="pb-4 border-b border-rahaa-border">
          <h3 className="font-cairo font-bold text-base text-rahaa-navy">
            نشاطات النظام الأخيرة
          </h3>
          <p className="font-tajawal text-xs text-rahaa-text-muted mt-0.5">
            سجل التحديثات والعمليات المباشرة في منصة راحة
          </p>
        </div>

        <div className="pt-5 relative pr-4">
          <div className="absolute top-7 right-6 bottom-6 w-0.5 bg-rahaa-border" />

          <div className="space-y-4">
            {mappedLogs.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4 pr-6">
                <div
                  className={`absolute right-0 top-1.5 w-3.5 h-3.5 rounded-full ${item.nodeColor} ring-4 ring-white shadow-xs`}
                />

                <div className="flex-1 bg-rahaa-bg p-3.5 rounded-xl border border-rahaa-border">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-cairo font-bold text-xs text-rahaa-navy">
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-tajawal text-rahaa-text-subtle">
                      {item.time}
                    </span>
                  </div>

                  <p className="font-tajawal text-xs text-rahaa-text-muted mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5">
        <button
          type="button"
          onClick={() => navigate('/admin/trips')}
          className="w-full h-10 px-4 rounded-xl border border-rahaa-blue/30 text-rahaa-blue hover:bg-rahaa-blue-light font-cairo text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <span>عرض جميع الرحلات والعمليات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
