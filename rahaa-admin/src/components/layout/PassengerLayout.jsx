import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Car, Clock, MapPin, Bell, User, Key, Truck, Bike } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { StepBackButton } from '../common/StepBackButton';

export const PassengerLayout = () => {
  return (
    <div className="min-h-screen bg-rahaa-bg tech-mesh-bg flex flex-col font-tajawal" dir="rtl">
      {/* Top Header (Without Profile or Logout icons as required) */}
      <header className="h-20 sm:h-22 bg-rahaa-card/90 backdrop-blur-xl border-b border-rahaa-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-rahaa-sm">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <img
            src="/rahaa_logo.png"
            alt="شعار راحة"
            className="h-16 sm:h-20 max-h-[72px] w-auto object-contain drop-shadow-sm transition-all"
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-cairo font-black text-lg text-rahaa-navy leading-tight flex items-center gap-1.5">
              <span>راحة</span>
              <span className="text-xs text-rahaa-blue bg-rahaa-blue-light border border-rahaa-blue/20 px-2.5 py-0.5 rounded-full font-bold">
                بوابة الراكب الذكية
              </span>
            </span>
            <span className="text-[11px] text-rahaa-text-subtle font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>منظومة النقل الذكي - أمانة العاصمة صنعاء</span>
            </span>
          </div>
        </div>

        {/* Desktop Nav (With direct transitions to all multi-transport portals) */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink
            to="/passenger"
            end
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </NavLink>

          <NavLink
            to="/passenger/taxi"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <Car className="w-4 h-4" />
            <span>طلب تاكسي</span>
          </NavLink>

          <NavLink
            to="/passenger/rentals"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#EE9224] text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-[#FEF5E8] hover:text-[#D67E16]'
              }`
            }
          >
            <Key className="w-4 h-4" />
            <span>تأجير سيارات</span>
          </NavLink>

          <NavLink
            to="/passenger/trucks"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0D2D56] text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <Truck className="w-4 h-4" />
            <span>شاحنات نقل</span>
          </NavLink>

          <NavLink
            to="/passenger/motorcycles"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#1668BE] text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <Bike className="w-4 h-4" />
            <span>دراجات سريعة</span>
          </NavLink>

          <NavLink
            to="/passenger/map"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <MapPin className="w-4 h-4" />
            <span>خريطة التتبع</span>
          </NavLink>

          <NavLink
            to="/passenger/trips"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <Clock className="w-4 h-4" />
            <span>سجل الرحلات</span>
          </NavLink>

          <NavLink
            to="/passenger/profile"
            className={({ isActive }) =>
              `h-10 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>إعدادات الحساب</span>
          </NavLink>
        </nav>

        {/* Actions: Single-Step Back, Theme Switcher & Notifications */}
        <div className="flex items-center gap-2">
          <StepBackButton variant="compact" label="تراجع" />
          <ThemeToggle />
          <button
            type="button"
            className="h-10 w-10 rounded-xl border border-rahaa-border text-rahaa-text-muted hover:text-rahaa-blue hover:bg-rahaa-bg flex items-center justify-center transition-colors relative"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-rahaa-card border-t border-rahaa-border flex items-center justify-around z-40 px-2 shadow-lg">
        <NavLink
          to="/passenger"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-cairo">الرئيسية</span>
        </NavLink>

        <NavLink
          to="/passenger/map"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-cairo">الخريطة</span>
        </NavLink>

        <NavLink
          to="/passenger/trips"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-cairo">رحلاتي</span>
        </NavLink>

        <NavLink
          to="/passenger/profile"
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
