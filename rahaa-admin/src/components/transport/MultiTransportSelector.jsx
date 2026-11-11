import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Key, Truck, Bike, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const MultiTransportSelector = ({ onSelectService, activeService = 'taxi' }) => {
  const navigate = useNavigate();

  const transportModes = [
    {
      id: 'taxi',
      title: 'سيارات الأجرة (تاكسي)',
      subtitle: 'تنقل فوري ومباشر',
      description: 'أسرع وسيلة للتنقل داخل صنعاء مع أمهر السائقين وبأسعار معتمدة ودقيقة.',
      badge: 'فوري ومباشر',
      icon: Car,
      accentColor: 'text-rahaa-primary',
      bgLight: 'bg-blue-50/80',
      tagBg: 'bg-blue-50 text-rahaa-primary border-blue-200/60',
      gradientBar: 'from-[#0B1B36] via-[#122B56] to-[#1D4ED8]',
      // Requirement #3: Navy Blue to Blue Gradient
      buttonBg: 'bg-gradient-to-l from-[#0B1B36] via-[#122B56] to-[#1D4ED8] hover:from-[#081326] hover:via-[#0F2244] hover:to-[#1E40AF] text-white shadow-md shadow-blue-900/25',
      actionText: 'بدء طلب تاكسي',
      route: '/passenger/taxi',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'rental',
      title: 'تأجير السيارات الخاصة',
      subtitle: 'يومي وأسبوعي وفاره',
      description: 'استأجر سيارتك المفضلة (سيدان، دفع رباعي، فاخرة) بقيادتك الذاتية أو مع سائق خاص.',
      badge: 'تأجير مرن',
      icon: Key,
      accentColor: 'text-[#EE9224]',
      bgLight: 'bg-[#FEF5E8]',
      tagBg: 'bg-[#FEF5E8] text-[#D67E16] border-[#EE9224]/30',
      gradientBar: 'from-[#0D2D56] via-[#0B58A8] to-[#EE9224]',
      buttonBg: 'bg-gradient-to-l from-[#0D2D56] via-[#B45309] to-[#EE9224] hover:from-[#071932] hover:to-[#D67E16] text-white shadow-md shadow-amber-900/20',
      actionText: 'بدء حجز سيارة',
      route: '/passenger/rentals',
      image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'truck',
      title: 'شاحنات نقل البضائع',
      subtitle: 'عفش ومواد ثقيلة',
      description: 'شاحنات مختلفة الأحجام (دينا مغلقة، ونش، قاطرة) لنقل الأثاث والبضائع بأمان.',
      badge: 'حمولة عالية',
      icon: Truck,
      accentColor: 'text-[#0B58A8]',
      bgLight: 'bg-[#E8F2FC]',
      tagBg: 'bg-[#FEF5E8] text-[#D67E16] border-[#EE9224]/30',
      gradientBar: 'from-[#0D2D56] via-[#0B58A8] to-[#EE9224]',
      buttonBg: 'bg-gradient-to-l from-[#071932] via-[#0D2D56] to-[#0B58A8] hover:from-[#051124] hover:to-[#1668BE] text-white shadow-md shadow-blue-950/25',
      actionText: 'بدء طلب شاحنة',
      route: '/passenger/trucks',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'motorcycle',
      title: 'الدراجات النارية',
      subtitle: 'مشاوير وتوصيل طرود',
      description: 'تجاوز الاختناقات المرورية في دقائق؛ نقل سريع للركاب وتوصيل فوري للطرود والطلبات.',
      badge: 'فائق السرعة',
      icon: Bike,
      accentColor: 'text-cyan-600',
      bgLight: 'bg-cyan-50/80',
      tagBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
      // Requirement #3: Strictly Navy Blue to Cyan Blue (NO ORANGE AT ALL)
      gradientBar: 'from-[#0B1B36] via-[#0369A1] to-[#06B6D4]',
      buttonBg: 'bg-gradient-to-l from-[#0B1B36] via-[#0369A1] to-[#06B6D4] hover:from-[#081326] hover:via-[#0284C7] hover:to-[#0891B2] text-white shadow-md shadow-cyan-900/25',
      actionText: 'بدء طلب دراجة',
      route: '/passenger/motorcycles',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80',
    },
  ];

  // Navigate to dedicated service page
  const handleSelectServiceCard = (mode) => {
    if (onSelectService) {
      onSelectService(mode.id);
    }
    navigate(mode.route);
  };

  return (
    <section className="font-tajawal animate-fadeIn" dir="rtl">
      {/* Section Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0B1B36] via-[#0F284E] to-[#0B58A8] p-5 sm:p-6 mb-6 text-white shadow-rahaa-card border border-sky-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20px 20px, rgba(56,189,248,0.4) 1.5px, transparent 0%), linear-gradient(to left, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative z-10 text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 border border-sky-300/30 text-sky-200 text-xs font-bold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>منظومة النقل واللوجستيات الذكية المتكاملة</span>
          </div>
          <h2 className="font-cairo font-black text-xl sm:text-2xl text-white">
            اختر وسيلة النقل المناسبة لك
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/85 mt-1 max-w-xl leading-relaxed">
            انتقل بضغطة واحدة إلى البوابة الذكية المخصصة لخدمتك مع تسعير فوري وتتبع مباشر عبر الأقمار الصناعية.
          </p>
        </div>
        <div className="relative z-10 hidden md:flex items-center gap-2.5 bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl backdrop-blur-md text-xs font-cairo font-bold text-sky-100 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>جميع الأساطيل متصلة ومفعّلة</span>
        </div>
      </div>

      {/* 4 Cards Grid - Strictly 2 Cards Per Row (2 Columns) on all screens */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 items-stretch">
        {transportModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeService === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => handleSelectServiceCard(mode)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectServiceCard(mode);
                }
              }}
              className={`group bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden border shadow-rahaa-sm hover:shadow-rahaa-lg hover:-translate-y-1 ${
                isSelected
                  ? 'border-rahaa-primary/50 ring-2 ring-rahaa-primary shadow-rahaa-md'
                  : 'border-rahaa-border hover:border-rahaa-primary/40'
              }`}
            >
              {/* Dynamic Gradient Top Accent Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r ${mode.gradientBar} transition-opacity duration-300 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />

              {/* 1. Card Image Banner with Floating Badge */}
              <div className="h-28 sm:h-40 md:h-48 w-full rounded-xl sm:rounded-2xl overflow-hidden relative mb-3 sm:mb-4 bg-slate-100 shrink-0 shadow-inner">
                <img
                  src={mode.image}
                  alt={mode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />

                {/* Floating Top Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] md:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 text-slate-800 shadow-sm backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3 text-rahaa-primary shrink-0" />
                    <span>{mode.badge}</span>
                  </span>
                </div>
              </div>

              {/* 2. Card Content: Icon on the Right + Title & Explanation Directly Next to It */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-start gap-2.5 sm:gap-3.5 text-right mb-3 sm:mb-4">
                  {/* Right Side: Service Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${mode.bgLight} ${mode.accentColor} border border-current/15 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Directly Next to Icon: Title, Subtitle & Description (الشرح) */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <h3 className="font-cairo font-bold text-xs sm:text-base md:text-lg text-rahaa-navy group-hover:text-rahaa-primary transition-colors leading-tight">
                        {mode.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold border ${mode.tagBg}`}
                      >
                        {mode.subtitle}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs md:text-sm text-rahaa-text-muted leading-relaxed line-clamp-2">
                      {mode.description}
                    </p>
                  </div>
                </div>

                {/* 3. Action Button with High Contrast & Signature Gradient */}
                <div className="pt-1">
                  <button
                    type="button"
                    className={`w-full h-9 sm:h-11 md:h-12 rounded-xl font-cairo font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all ${mode.buttonBg}`}
                  >
                    <span>{mode.actionText}</span>
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MultiTransportSelector;
