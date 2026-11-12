import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  api,
  getToken,
  getCurrentUser,
  setCurrentUser,
  removeToken,
  removeCurrentUser,
  isAdminOrSupervisor,
  getAdminDefaultRoute,
  getDriverPortalRoute,
} from '../services/api';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    let isMounted = true;

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 20 : prev));
    }, 350);

    const checkAuthAndRedirect = async () => {
      const startTime = Date.now();
      const token = getToken();
      let resolvedUser = getCurrentUser();

      if (token) {
        try {
          const res = await api.me();
          if (res?.user) {
            resolvedUser = res.user;
            setCurrentUser(res.user);
          }
        } catch {
          removeToken();
          removeCurrentUser();
          resolvedUser = null;
        }
      }

      const elapsed = Date.now() - startTime;
      const minSplashDuration = 2000;
      const remainingWait = Math.max(0, minSplashDuration - elapsed);

      setTimeout(() => {
        if (!isMounted) return;
        setProgress(100);

        if (resolvedUser && getToken()) {
          if (isAdminOrSupervisor(resolvedUser)) {
            navigate(getAdminDefaultRoute(resolvedUser), { replace: true });
          } else if (resolvedUser.role === 'driver') {
            navigate(getDriverPortalRoute(resolvedUser), { replace: true });
          } else {
            navigate('/passenger', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      }, remainingWait);
    };

    checkAuthAndRedirect();

    return () => {
      isMounted = false;
      clearInterval(progressTimer);
    };
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-rahaa-bg flex flex-col items-center justify-center p-6 relative overflow-hidden select-none"
      dir="rtl"
    >
      {/* Floating Theme Switcher */}
      <div className="absolute top-5 left-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient Brand Accents */}
      <div className="absolute -top-36 -right-36 w-96 h-96 rounded-full bg-rahaa-blue/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-96 h-96 rounded-full bg-rahaa-orange/15 blur-3xl pointer-events-none" />

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* Logo Container */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-rahaa-card border border-rahaa-border/60 flex items-center justify-center transition-transform duration-500 hover:scale-105">
          <img
            src="/rahaa_logo.png"
            alt="Rahah Logo"
            className="h-44 sm:h-52 w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Required Welcome Phrase Below Logo */}
        <div className="space-y-2">
          <h1 className="font-cairo font-bold text-2xl sm:text-3xl text-rahaa-navy tracking-tight">
            مرحباً بك في منصة راحة
          </h1>
          <p className="font-tajawal text-sm text-rahaa-text-muted">
            سمارت للنقل المتكامل - أمانة العاصمة صنعاء
          </p>
        </div>

        {/* Smooth Progress Indicator */}
        <div className="w-48 h-1.5 bg-rahaa-blue-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-rahaa-blue to-rahaa-orange rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

