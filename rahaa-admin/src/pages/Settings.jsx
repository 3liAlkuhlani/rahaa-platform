import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import AdminPasswordCard from '../components/settings/AdminPasswordCard';
import PricingConfigCard from '../components/settings/PricingConfigCard';
import ServiceZonesCard from '../components/settings/ServiceZonesCard';
import PromoCodesCard from '../components/settings/PromoCodesCard';
import DriverRulesCard from '../components/settings/DriverRulesCard';
import SystemSecurityCard from '../components/settings/SystemSecurityCard';

export const Settings = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Settings Page Header — using rahaa design tokens */}
      <div className="bg-rahaa-card rounded-2xl p-6 border border-rahaa-border shadow-rahaa-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="إعدادات النظام"
          subtitle="إدارة تسعير الرحلات، النطاقات الجغرافية، أكواد الخصم، وقواعد الأمان للمنصة"
        />
        <div className="px-4 py-2 bg-rahaa-emerald-bg border border-rahaa-emerald/30 rounded-xl text-rahaa-emerald text-xs font-bold font-tajawal flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rahaa-emerald animate-pulse" />
          <span>جميع الأنظمة تعمل بكفاءة ومحدثة</span>
        </div>
      </div>

      {/* Admin Password Change - Inside Dashboard Only */}
      <AdminPasswordCard />

      {/* Pricing Configuration */}
      <PricingConfigCard />

      {/* Service Geographic Zones */}
      <ServiceZonesCard />

      {/* Promo Codes & Discounts */}
      <PromoCodesCard />

      {/* Driver Verification Rules */}
      <DriverRulesCard />

      {/* Advanced Security & Backup */}
      <SystemSecurityCard />
    </div>
  );
};

export default Settings;
