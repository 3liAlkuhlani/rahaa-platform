import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  isPositive = true,
  icon: Icon,
  iconBgColor = 'bg-rahaa-blue-light',
  iconColor = 'text-rahaa-blue',
}) => {
  return (
    <div
      className="group relative overflow-hidden bg-rahaa-card p-5 rounded-3xl border border-rahaa-border shadow-rahaa-card hover:shadow-rahaa-lg hover:-translate-y-1 transition-all duration-300 flex items-start gap-4 h-full text-right"
      dir="rtl"
    >
      {/* Top Tech Gradient Line (Rahah Logo Navy -> Ribbon Blue -> Golden Amber) */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-[#0D2D56] via-[#0B58A8] to-[#EE9224] opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Subtle Ambient Corner Glow */}
      <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-rahaa-primary/5 blur-2xl pointer-events-none group-hover:bg-rahaa-primary/10 transition-colors" />

      {/* Right Side: Icon Container */}
      <div
        className={`w-12 h-12 rounded-2xl ${iconBgColor} ${iconColor} border border-current/15 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>

      {/* Directly Next to Icon: Title, Value, Subtitle & Trend */}
      <div className="flex-1 min-w-0 text-right relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-cairo font-bold text-rahaa-text-muted truncate">
            {title}
          </span>

          {trend && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-cairo font-bold shrink-0 ${
                isPositive
                  ? 'bg-rahaa-emerald-bg text-rahaa-emerald border border-rahaa-emerald/25'
                  : 'bg-rahaa-orange-light text-rahaa-orange border border-rahaa-orange/25'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-rahaa-emerald' : 'bg-rahaa-orange'}`} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div className="text-2xl font-cairo font-black text-rahaa-navy tracking-tight mt-1.5">
          {value}
        </div>

        {subtitle && (
          <p className="text-[11px] font-tajawal text-rahaa-text-subtle mt-1 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
