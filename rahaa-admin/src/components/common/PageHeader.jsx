import React from 'react';
import { Sparkles } from 'lucide-react';
import { StepBackButton } from './StepBackButton';

export const PageHeader = ({ title, subtitle, badge, actions, showStepBack = true }) => {
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] p-5 sm:p-6 text-white shadow-rahaa-card border border-[#2984DF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      dir="rtl"
    >
      {/* Top Signature Rahah Logo Ribbon & Golden-Amber Accent Line */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-[#0B58A8] via-[#2984DF] to-[#EE9224]" />

      {/* Subtle Futuristic Tech Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px, rgba(238,146,36,0.45) 1.5px, transparent 0%), linear-gradient(to left, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-[#EE9224]/20 blur-3xl pointer-events-none" />

      {/* Right side: Title + Subtitle */}
      <div className="relative z-10 text-right space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="font-cairo font-black text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center gap-1.5 text-xs font-cairo font-bold bg-[#EE9224]/20 text-[#FDE68A] px-3 py-1 rounded-full border border-[#EE9224]/40 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#EE9224]" />
              <span>{badge}</span>
            </span>
          )}
        </div>
        {subtitle && (
          <p className="font-tajawal text-xs sm:text-sm text-sky-100/90 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Left side: Action buttons + Single-Step Back */}
      <div className="relative z-10 flex items-center gap-2.5 flex-wrap shrink-0">
        {actions}
        {showStepBack && <StepBackButton variant="hero" label="تراجع خطوة" />}
      </div>
    </div>
  );
};
