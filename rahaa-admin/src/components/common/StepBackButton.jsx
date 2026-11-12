import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { getCurrentUser, getDriverPortalRoute, getAdminDefaultRoute } from '../../services/api';

/**
 * Global registry so any active screen with internal multi-step state
 * (like ServiceWorkflowStepper, modals, or multi-step forms) can register
 * a single-step undo callback that runs before route history back.
 */
let activeInternalStepBackHandler = null;

export const useRegisterStepBack = (handler) => {
  useEffect(() => {
    activeInternalStepBackHandler = handler;
    return () => {
      if (activeInternalStepBackHandler === handler) {
        activeInternalStepBackHandler = null;
      }
    };
  }, [handler]);
};

export const triggerSingleStepBack = (navigate, location, customHandler = null) => {
  // 1. Check direct custom handler passed to the button
  if (typeof customHandler === 'function') {
    const handled = customHandler();
    if (handled === true) return;
  }

  // 2. Check screen-registered internal step handler (e.g., stepper step > 1 or open modal)
  if (typeof activeInternalStepBackHandler === 'function') {
    const handled = activeInternalStepBackHandler();
    if (handled === true) return;
  }

  // 3. Otherwise step back 1 route in browser history, with intelligent fallback
  const path = location?.pathname || '';
  const user = getCurrentUser();
  const driverRoot = getDriverPortalRoute(user);

  // If in-app history exists beyond initial entry, go back 1 step to the exact previous screen
  const hasInAppHistory =
    Boolean(window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0);

  if (hasInAppHistory) {
    navigate(-1);
    return;
  }

  // Fallback hierarchy (1 level up) if opened directly via deep link in a new tab
  if (path.startsWith('/passenger/') && path !== '/passenger') {
    navigate('/passenger', { replace: true });
  } else if (path.startsWith('/driver/') && path !== driverRoot) {
    navigate(driverRoot, { replace: true });
  } else if (path.startsWith('/admin/') && path !== '/admin') {
    navigate(getAdminDefaultRoute(user), { replace: true });
  } else if (path === '/register' || path === '/register/passenger' || path === '/register/driver') {
    navigate('/login', { replace: true });
  } else {
    navigate('/', { replace: true });
  }
};

export const StepBackButton = ({
  onStepBack = null,
  label = 'تراجع خطوة',
  variant = 'default', // 'default' | 'compact' | 'hero'
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    triggerSingleStepBack(navigate, location, onStepBack);
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title="تراجع خطوة واحدة للخلف"
        className={`group h-10 px-3.5 rounded-xl border border-rahaa-border bg-rahaa-bg/80 hover:bg-rahaa-primary hover:text-white hover:border-rahaa-primary text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-2xs active:scale-95 ${className}`}
      >
        <ArrowRight className="w-4 h-4 text-rahaa-primary group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5" />
        <span>{label}</span>
        <RotateCcw className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
      </button>
    );
  }

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title="تراجع خطوة واحدة للخلف"
        className={`group h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md font-cairo font-bold text-xs flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 ${className}`}
      >
        <ArrowRight className="w-4 h-4 text-sky-300 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="تراجع خطوة واحدة للخلف"
      className={`group h-10 px-4 rounded-xl border border-rahaa-border bg-rahaa-card hover:bg-rahaa-blue-soft hover:border-rahaa-primary/50 text-rahaa-navy hover:text-rahaa-primary font-cairo font-bold text-xs flex items-center gap-2 transition-all duration-200 shadow-rahaa-sm active:scale-95 ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-rahaa-primary/10 text-rahaa-primary group-hover:bg-rahaa-primary group-hover:text-white flex items-center justify-center transition-colors">
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
      <span>{label}</span>
    </button>
  );
};

export default StepBackButton;

