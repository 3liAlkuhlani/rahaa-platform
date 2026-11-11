import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { navItems, secondaryNavItems } from '../../config/navigation';
import { X, LogOut } from 'lucide-react';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';
import { getCurrentUser } from '../../services/api';
import { ThemeToggle } from '../common/ThemeToggle';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const currentUser = getCurrentUser();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-rahaa-navy/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-rahaa-card border-l border-rahaa-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Logo Section */}
        <div>
          <div className="h-20 px-6 border-b border-rahaa-border flex items-center justify-between">
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
              onClick={onClose}
              className="p-2 rounded-lg text-rahaa-text-muted hover:bg-rahaa-bg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-cairo font-semibold text-rahaa-text-subtle uppercase tracking-wider">
              القائمة الرئيسية
            </div>

            {navItems.map((item) => {
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
          </div>
        </div>

        {/* Admin Info & Logout Action */}
        <div className="p-4 border-t border-rahaa-border bg-rahaa-bg/50 space-y-2.5">
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
                المشرف الإداري
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
