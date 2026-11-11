import React from 'react';
import { Menu, Search, Bell, MapPin, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { StepBackButton } from '../common/StepBackButton';

export const Header = ({ onOpenSidebar, onRefresh }) => {
  return (
    <header className="h-20 bg-rahaa-card/90 backdrop-blur-xl border-b border-rahaa-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4 shadow-2xs">
      {/* Right Side (RTL): Drawer Toggle, Single-Step Back & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-rahaa-text-muted hover:bg-rahaa-bg lg:hidden"
          aria-label="افتح القائمة"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Single-Step Back Button */}
        <StepBackButton variant="compact" label="تراجع" />

        {/* Global Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث فوري عن رقم رحلة، مركبة، كابتن، أو راكب في صنعاء..."
            className="w-full h-10 pl-4 pr-10 bg-rahaa-bg border border-rahaa-border rounded-xl text-xs font-tajawal placeholder:text-rahaa-text-subtle focus:outline-none focus:border-rahaa-blue transition-all"
          />
        </div>
      </div>

      {/* Left Side (RTL): Live Status, Refresh, Notifications (Without Profile or Logout icons) */}
      <div className="flex items-center gap-3">
        {/* Sana'a Live Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-rahaa-emerald-bg border border-rahaa-emerald/25 rounded-full text-xs font-cairo font-semibold text-rahaa-emerald">
          <MapPin className="w-3.5 h-3.5" />
          <span>أمانة العاصمة - صنعاء (متصل)</span>
          <span className="w-2 h-2 rounded-full bg-rahaa-emerald animate-ping" />
        </div>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Manual Refresh Button */}
        <button
          type="button"
          onClick={() => (onRefresh ? onRefresh() : window.location.reload())}
          className="h-10 w-10 rounded-xl border border-rahaa-border text-rahaa-text-muted hover:bg-rahaa-bg hover:text-rahaa-blue flex items-center justify-center transition-colors"
          title="تحديث البيانات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="h-10 w-10 rounded-xl border border-rahaa-border text-rahaa-text-muted hover:bg-rahaa-bg hover:text-rahaa-blue flex items-center justify-center transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-rahaa-orange ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
