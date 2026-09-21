import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-accent hover:bg-accent-dark text-white shadow-md shadow-accent/20',
  secondary: 'bg-dark-700 hover:bg-dark-600 text-dark-100 border border-dark-500',
  danger: 'bg-danger/15 hover:bg-danger/25 text-danger border border-danger/30',
  ghost: 'bg-transparent hover:bg-dark-700 text-dark-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1 focus:ring-offset-dark-900
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}
