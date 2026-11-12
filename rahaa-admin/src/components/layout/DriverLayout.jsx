import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Navigation, DollarSign, User, Car, Key, Truck, Bike } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { StepBackButton } from '../common/StepBackButton';
import { getCurrentUser, getDriverPrimaryService, getDriverPortalRoute } from '../../services/api';

const DRIVER_PORTAL_META = {
  taxi: {
    badge: 'كابتن تاكسي',
    subtitle: 'بوابة سيارات الأجرة والمشاوير الفورية - صنعاء',
    homeLabel: 'بوابة التاكسي والطلبات',
    badgeClass: 'text-[#0B58A8] bg-[#E8F2FC] border border-[#0B58A8]/25',
    activeNavClass: 'bg-rahaa-blue text-white shadow-rahaa-sm',
    icon: Car,
  },
  rental: {
    badge: 'تأجير السيارات',
    subtitle: 'بوابة ملاك ومؤجري السيارات الخاصة - صنعاء',
    homeLabel: 'بوابة التأجير والأسطول',
    badgeClass: 'text-[#D67E16] bg-[#FEF5E8] border border-[#EE9224]/30',
    activeNavClass: 'bg-[#EE9224] text-white shadow-rahaa-sm',
    icon: Key,
  },
  truck: {
    badge: 'شاحنات النقل',
    subtitle: 'بوابة كباتن شاحنات نقل البضائع والعفش - صنعاء',
    homeLabel: 'بوابة الشحن والحمولات',
    badgeClass: 'text-[#0D2D56] bg-[#E8F2FC] border border-[#0D2D56]/25',
    activeNavClass: 'bg-[#0D2D56] text-white shadow-rahaa-sm',
    icon: Truck,
  },
  motorcycle: {
    badge: 'كابتن دراجة',
    subtitle: 'بوابة الدراجات النارية والتوصيل السريع - صنعاء',
    homeLabel: 'بوابة التوصيل الفوري',
    badgeClass: 'text-[#0B58A8] bg-[#E8F2FC] border border-[#2984DF]/30',
    activeNavClass: 'bg-[#1668BE] text-white shadow-rahaa-sm',
    icon: Bike,
  },
};

export const DriverLayout = () => {
  const [isOnline, setIsOnline] = useState(true);
  const location = useLocation();
  const currentUser = getCurrentUser();
  const driverService = getDriverPrimaryService(currentUser);
  const driverHomeUrl = getDriverPortalRoute(currentUser);
  const meta = DRIVER_PORTAL_META[driverService] || DRIVER_PORTAL_META.taxi;
  const ModeIcon = meta.icon;

  const currentPath = (location.pathname || '').replace(/\/+$/, '');
  const homePath = (driverHomeUrl || '').replace(/\/+$/, '');
  const isDriverHome =
    currentPath === '/driver' ||
    currentPath === homePath ||
    currentPath === '/driver/taxi' ||
    currentPath === '/driver/rental' ||
    currentPath === '/driver/truck' ||
    currentPath === '/driver/motorcycle';
  const showBackButton = !isDriverHome;

  return (
    <div className="min-h-screen bg-rahaa-bg tech-mesh-bg flex flex-col font-tajawal" dir="rtl">
      {/* Top Header */}
      <header className="h-20 sm:h-22 bg-rahaa-card/90 backdrop-blur-xl border-b border-rahaa-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-rahaa-sm">
        {/* Brand Logo & Dedicated Vehicle Badge */}
        <div className="flex items-center gap-3.5">
          <img
            src="/rahaa_logo.png"
            alt="شعار راحة"
            className="h-16 sm:h-20 max-h-[72px] w-auto object-contain drop-shadow-sm transition-all"
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-cairo font-black text-lg text-rahaa-navy leading-tight flex items-center gap-2">
              <span>راحة</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${meta.badgeClass}`}>
                <ModeIcon className="w-3.5 h-3.5" />
                <span>{meta.badge}</span>
              </span>
            </span>
            <span className="text-[11px] text-rahaa-text-subtle font-medium mt-0.5">
              {meta.subtitle}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink
            to={driverHomeUrl}
            className={({ isActive }) =>
              `h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? meta.activeNavClass
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span>{meta.homeLabel}</span>
          </NavLink>

          {driverService === 'taxi' && (
            <NavLink
              to="/driver/active-trip"
              className={({ isActive }) =>
                `h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? meta.activeNavClass
                    : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
                }`
              }
            >
              <Navigation className="w-4 h-4" />
              <span>خريطة المشوار</span>
            </NavLink>
          )}

          <NavLink
            to="/driver/earnings"
            className={({ isActive }) =>
              `h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? meta.activeNavClass
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <DollarSign className="w-4 h-4" />
            <span>المحفظة والأرباح</span>
          </NavLink>

          <NavLink
            to="/driver/profile"
            className={({ isActive }) =>
              `h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? meta.activeNavClass
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>بيانات المركبة والحساب</span>
          </NavLink>
        </nav>

        {/* Actions: Single-Step Back (only on sub-pages), Theme Switcher & Online Status Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {showBackButton && <StepBackButton variant="compact" label="تراجع" />}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`h-10 px-3.5 rounded-xl font-cairo font-bold text-xs flex items-center gap-2 border transition-all ${
              isOnline
                ? 'bg-rahaa-emerald-bg border-rahaa-emerald/30 text-rahaa-emerald shadow-2xs'
                : 'bg-rahaa-bg border-rahaa-border text-rahaa-text-muted'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-rahaa-emerald animate-ping' : 'bg-gray-400'}`} />
            <span>{isOnline ? 'متصل (جاهز)' : 'غير متصل'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet context={{ isOnline, setIsOnline, driverService }} />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-rahaa-card border-t border-rahaa-border flex items-center justify-around z-40 px-2 shadow-lg">
        <NavLink
          to={driverHomeUrl}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-cairo">بوابتك</span>
        </NavLink>

        {driverService === 'taxi' && (
          <NavLink
            to="/driver/active-trip"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
              }`
            }
          >
            <Navigation className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-cairo">الخريطة</span>
          </NavLink>
        )}

        <NavLink
          to="/driver/earnings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-cairo">الأرباح</span>
        </NavLink>

        <NavLink
          to="/driver/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-cairo">حسابي</span>
        </NavLink>
      </nav>
    </div>
  );
};
