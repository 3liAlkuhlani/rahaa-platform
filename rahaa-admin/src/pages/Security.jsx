import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { ShieldCheck, Lock, Eye, Database, CheckCircle2 } from 'lucide-react';

export const Security = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-rahaa-card rounded-2xl p-6 border border-rahaa-border shadow-rahaa-card">
        <PageHeader
          title="الأمان والخصوصية"
          subtitle="سياسات حماية بيانات الركاب والسائقين، تشفير الاتصالات، وموثوقية المنظومة"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-rahaa-blue">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-base text-rahaa-navy">تشفير البيانات والاتصالات</h3>
              <p className="text-xs text-gray-500 font-tajawal">حماية كاملة أثناء النقل والتخزين</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-tajawal leading-relaxed">
            جميع اتصالات تطبيق الراكب والسائق ولوحة التحكم مشفرة بمعايير التشفير الرقمي المتقدمة لحماية بيانات تحديد المواقع والمحادثات والمعاملات المالية.
          </p>
          <div className="flex items-center gap-2 text-xs font-cairo text-emerald-700 bg-emerald-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>بروتوكولات التشفير نشطة ومحدثة</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-base text-rahaa-navy">خصوصية أرقام الهواتف والمواقع</h3>
              <p className="text-xs text-gray-500 font-tajawal">إخفاء البيانات الحساسة</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-tajawal leading-relaxed">
            لا يتم مشاركة أرقام الهواتف الشخصية أو بيانات البطاقات الائتمانية بين الراكب والسائق إلا لغايات تنفيذ الرحلة فقط مع مراعاة أعلى معايير الخصوصية.
          </p>
          <div className="flex items-center gap-2 text-xs font-cairo text-emerald-700 bg-emerald-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>سياسة الخصوصية معتمدة ومتوافقة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
