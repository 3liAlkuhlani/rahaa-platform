import React, { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { api, removeToken, removeCurrentUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const LogoutConfirmModal = ({ isOpen, onClose, onConfirmSuccess }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Proceed with local token cleanup even if server token was already expired
    } finally {
      removeToken();
      removeCurrentUser();
      setIsLoggingOut(false);
      if (onClose) onClose();
      if (onConfirmSuccess) onConfirmSuccess();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-rahaa-border shadow-2xl space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoggingOut}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-rahaa-text-subtle hover:text-rahaa-navy hover:bg-rahaa-bg transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-rahaa-rose-bg text-rahaa-rose flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>

          <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
            تأكيد تسجيل الخروج
          </h3>

          <p className="font-tajawal text-sm text-rahaa-text-muted leading-relaxed">
            هل أنت متأكد أنك تريد تسجيل الخروج؟
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="h-11 px-4 rounded-xl border border-rahaa-border bg-white hover:bg-rahaa-bg text-rahaa-navy font-cairo font-bold text-xs transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="h-11 px-4 rounded-xl bg-rahaa-rose hover:opacity-95 text-white font-cairo font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;

