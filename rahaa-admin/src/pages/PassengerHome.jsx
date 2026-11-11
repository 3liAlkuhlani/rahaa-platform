import React from 'react';
import { HomeLiveTrackingMap } from '../components/home/HomeLiveTrackingMap';
import { MultiTransportSelector } from '../components/transport/MultiTransportSelector';

export const PassengerHome = () => {
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-5 lg:p-8 space-y-6 font-tajawal animate-fadeIn" dir="rtl">
      {/* 1. First Section: Live Tracking Map (خريطة التتبع المباشر) */}
      <HomeLiveTrackingMap />

      {/* 2. Second Section: Choose Your Service (اختيار وسيلة النقل - 2 Cards per row) */}
      <MultiTransportSelector />

      {/* Clean Footer with Enlarged Rahah Logo */}
      <footer className="pt-6 pb-2 text-center border-t border-rahaa-border text-xs text-rahaa-text-subtle font-tajawal flex flex-col items-center justify-center gap-2">
        <img
          src="/rahaa_logo.png"
          alt="شعار راحة"
          className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs"
        />
        <p className="font-semibold text-rahaa-navy">
          منظومة راحة الذكية للنقل والتأجير © {new Date().getFullYear()} - جميع الحقوق محفوظة
        </p>
        <span className="text-[11px] text-rahaa-text-muted">
          خدمات التاكسي • تأجير السيارات • شاحنات نقل البضائع • الدراجات النارية في أمانة العاصمة صنعاء
        </span>
      </footer>
    </div>
  );
};

export default PassengerHome;
