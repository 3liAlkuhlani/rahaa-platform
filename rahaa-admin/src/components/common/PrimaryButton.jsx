import React from 'react';

/**
 * PrimaryButton — مكون الزر الرئيسي الموحد
 *
 * Props:
 *  @param {React.ReactNode} children    - محتوى الزر (نص + أيقونة)
 *  @param {function}        onClick     - معالج النقر
 *  @param {'primary'|'secondary'|'ghost'} variant - نمط الزر (افتراضي: primary)
 *  @param {'sm'|'md'|'lg'}  size        - حجم الزر (افتراضي: md)
 *  @param {boolean}         disabled    - تعطيل الزر
 *  @param {string}          type        - نوع HTML للزر (افتراضي: button)
 *  @param {string}          className   - كلاسات إضافية للتخصيص
 */
export const PrimaryButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-cairo font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 shrink-0';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary:
      'bg-rahaa-blue hover:bg-rahaa-blue-hover text-white shadow-md shadow-rahaa-blue/20 hover:shadow-lg hover:shadow-rahaa-blue/25 hover:-translate-y-0.5 focus:ring-rahaa-blue/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
    secondary:
      'bg-white hover:bg-rahaa-bg text-rahaa-navy border border-rahaa-border shadow-rahaa-sm focus:ring-rahaa-border disabled:opacity-60 disabled:cursor-not-allowed',
    ghost:
      'text-rahaa-blue hover:bg-rahaa-blue-soft hover:text-rahaa-blue focus:ring-rahaa-blue/30 disabled:opacity-60 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
