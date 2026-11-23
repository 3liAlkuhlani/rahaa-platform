import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { navItems, secondaryNavItems } from '../../config/navigation';
import { X, LogOut } from 'lucide-react';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';
import { getCurrentUser, hasAdminPermission } from '../../services/api';
import { ThemeToggle } from '../common/ThemeToggle';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const currentUser = getCurrentUser();

  // Lock background/body scroll when the mobile sidebar drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleResizeToDesktop = (e) => {
      if (e.matches && onClose) {
        onClose();
      }
    };
    desktopMediaQuery.addEventListener('change', handleResizeToDesktop);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      desktopMediaQuery.removeEventListener('change', handleResizeToDesktop);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop Overlay (blocks touch/scroll events from passing through) */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-rahaa-navy/50 backdrop-blur-xs z-[55] lg:hidden transition-opacity touch-none overscroll-none"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container (independently scrollable with scroll-chaining prevention) */}
      <aside
        className={`fixed inset-y-0 right-0 h-[100dvh] max-h-[100dvh] w-72 bg-rahaa-card border-l border-rahaa-border z-[60] transform transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto overscroll-contain ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
      >
        {/* Top Header / Logo Section */}
        <div className="shrink-0 h-20 px-6 border-b border-rahaa-border flex items-center justify-between bg-rahaa-card sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <img
              src="/rahaa_logo.png"
              alt="شعار راحة"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm transition-all"
            />
            <div className="flex flex-col">
              <span className="font-cairo font-black text-xl text-rahaa-navy leading-tight">
                راحة{' '}
                <span className="text-xs font-tajawal font-bold text-rahaa-blue bg-rahaa-blue-light px-2.5 py-0.5 rounded-full mr-1">
                  الإدارة
                </span>
              </span>
              <span className="font-tajawal text-xs text-rahaa-text-subtle font-medium mt-0.5">
                إدارة النقل الذكي - صنعاء
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="p-2 rounded-lg text-rahaa-text-muted hover:bg-rahaa-bg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5">
            <div className="px-3 py-2 text-xs font-cairo font-semibold text-rahaa-text-subtle uppercase tracking-wider">
              القائمة الرئيسية
            </div>

            {navItems
              .filter((item) => {
                if (item.adminOnly && currentUser?.role !== 'admin') return false;
                if (item.permission && !hasAdminPermission(item.permission, currentUser)) return false;
                return true;
              })
              .map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/admin' && location.pathname === '/admin/');

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-cairo text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rahaa-blue text-white shadow-sm'
                      : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-rahaa-text-subtle'}`} />
                    <span>{item.title}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-tajawal ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-rahaa-blue-light text-rahaa-blue font-semibold'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-4 px-3 py-2 text-xs font-cairo font-semibold text-rahaa-text-subtle uppercase tracking-wider">
              النظام والمساندة
            </div>

            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-cairo text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rahaa-blue text-white shadow-sm'
                      : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-rahaa-text-subtle'}`} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* Admin Info & Logout Action */}
        <div className="shrink-0 mt-auto p-4 pb-6 border-t border-rahaa-border bg-rahaa-bg/50 space-y-2.5">
          {/* Theme Switcher in Sidebar */}
          <div className="flex justify-center">
            <ThemeToggle variant="segmented" className="w-full justify-around" />
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-rahaa-border">
            <div className="flex flex-col">
              <span className="font-cairo font-bold text-xs text-rahaa-navy">
                {currentUser?.name || 'علي نشوان'}
              </span>
              <span className="font-tajawal text-[11px] text-rahaa-emerald flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rahaa-emerald inline-block" />
                {currentUser?.role === 'admin' ? 'مدير النظام (أدمن)' : 'مشرف صلاحيات'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-cairo font-bold text-rahaa-rose hover:bg-rahaa-rose-bg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </>
  );
};
