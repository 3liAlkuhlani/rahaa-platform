import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Navigation, DollarSign, User, Car, Key, Truck, Bike, ClipboardList, BellRing, X } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { StepBackButton } from '../common/StepBackButton';
import { api, getCurrentUser, getDriverPrimaryService, getDriverPortalRoute } from '../../services/api';

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
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const driverService = getDriverPrimaryService(currentUser);
  const driverHomeUrl = getDriverPortalRoute(currentUser);
  const meta = DRIVER_PORTAL_META[driverService] || DRIVER_PORTAL_META.taxi;
  const ModeIcon = meta.icon;

  // Live Driver Requests State & Real-Time Polling
  const [requestsPayload, setRequestsPayload] = useState({
    requests: [],
    counts: { new: 0, accepted: 0, previous: 0, total: 0 },
    driver_services: [],
  });
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [newAlert, setNewAlert] = useState(null);
  const seenUidsRef = useRef(new Set());
  const initializedRef = useRef(false);

  const refreshRequests = useCallback(async (silent = false) => {
    if (!silent) {
      setRequestsLoading(true);
    }
    try {
      const res = await api.getDriverRequests('all');
      if (res?.success) {
        const list = Array.isArray(res.requests) ? res.requests : [];
        const newOnly = list.filter((item) => item.request_status === 'new');

        if (!initializedRef.current) {
          newOnly.forEach((item) => seenUidsRef.current.add(item.uid));
          initializedRef.current = true;
        } else {
          const fresh = newOnly.filter((item) => !seenUidsRef.current.has(item.uid));
          if (fresh.length > 0) {
            fresh.forEach((item) => seenUidsRef.current.add(item.uid));
            setNewAlert(fresh[0]);
          }
        }

        setRequestsPayload({
          requests: list,
          counts: res.counts || { new: newOnly.length, accepted: 0, previous: 0, total: list.length },
          driver_services: res.driver_services || [],
        });
        setRequestsError('');
      }
    } catch (err) {
      setRequestsError(err?.message || 'تعذر الاتصال بالخادم لجلب الطلبات');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRequests(false);
  }, [refreshRequests]);

  useEffect(() => {
    if (!isOnline) return undefined;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshRequests(true);
      }
    }, 4000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshRequests(true);
      }
    };
    const handleOnline = () => refreshRequests(true);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, [isOnline, refreshRequests]);

  const newRequestsCount = requestsPayload.counts?.new || 0;

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

          <NavLink
            to="/driver/requests"
            className={({ isActive }) =>
              `h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all flex items-center gap-2 relative ${
                isActive
                  ? meta.activeNavClass
                  : 'text-rahaa-text-muted hover:bg-rahaa-blue-soft hover:text-rahaa-blue'
              }`
            }
          >
            <ClipboardList className="w-4 h-4" />
            <span>طلباتي</span>
            {newRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 min-w-[20px] text-center rounded-full text-[10px] font-black bg-[#EE9224] text-white">
                {newRequestsCount}
              </span>
            )}
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

      {/* In-App Real-Time New Request Notification */}
      {newAlert && (
        <div className="fixed top-22 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-50 bg-rahaa-card border-2 border-[#EE9224] rounded-2xl shadow-2xl p-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF5E8] text-[#D67E16] flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cairo font-black text-xs text-rahaa-navy">
              طلب {newAlert.service_label} جديد!
            </p>
            <p className="text-[11px] text-rahaa-text-muted truncate mt-0.5">
              {newAlert.customer?.name || 'عميل'} • {newAlert.pickup_name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  const target = newAlert;
                  setNewAlert(null);
                  navigate(`/driver/requests/${target.request_type}/${target.id}`);
                }}
                className="px-3 py-1 rounded-lg bg-rahaa-blue text-white text-[11px] font-bold hover:opacity-90"
              >
                عرض التفاصيل
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewAlert(null);
                  navigate('/driver/requests');
                }}
                className="px-2.5 py-1 rounded-lg bg-rahaa-bg text-rahaa-navy text-[11px] font-bold border border-rahaa-border"
              >
                كل الطلبات
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewAlert(null)}
            className="text-rahaa-text-subtle hover:text-rahaa-navy p-1"
            aria-label="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet
          context={{
            isOnline,
            setIsOnline,
            driverService,
            requestsPayload,
            requestsLoading,
            requestsError,
            refreshRequests,
          }}
        />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-rahaa-card border-t border-rahaa-border flex items-center justify-around z-40 px-1 shadow-lg">
        <NavLink
          to={driverHomeUrl}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-cairo whitespace-nowrap">بوابتك</span>
        </NavLink>

        <NavLink
          to="/driver/requests"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5 mb-0.5" />
            {newRequestsCount > 0 && (
              <span className="absolute -top-1.5 -left-2 min-w-[16px] h-4 px-1 rounded-full bg-[#EE9224] text-white text-[9px] font-black flex items-center justify-center leading-none shadow-xs">
                {newRequestsCount > 99 ? '99+' : newRequestsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-cairo whitespace-nowrap">طلباتي</span>
        </NavLink>

        {driverService === 'taxi' && (
          <NavLink
            to="/driver/active-trip"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-xl transition-all ${
                isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
              }`
            }
          >
            <Navigation className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] font-cairo whitespace-nowrap">الخريطة</span>
          </NavLink>
        )}

        <NavLink
          to="/driver/earnings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-cairo whitespace-nowrap">الأرباح</span>
        </NavLink>

        <NavLink
          to="/driver/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-xl transition-all ${
              isActive ? 'text-rahaa-blue font-bold' : 'text-rahaa-text-subtle font-medium'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-cairo whitespace-nowrap">حسابي</span>
        </NavLink>
      </nav>
    </div>
  );
};
