const variantStyles = {
  success: {
    bg: 'bg-success/15',
    text: 'text-success',
    dot: 'bg-success',
  },
  warning: {
    bg: 'bg-warning/15',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  danger: {
    bg: 'bg-danger/15',
    text: 'text-danger',
    dot: 'bg-danger',
  },
  info: {
    bg: 'bg-info/15',
    text: 'text-info',
    dot: 'bg-info',
  },
  neutral: {
    bg: 'bg-dark-600',
    text: 'text-dark-200',
    dot: 'bg-dark-300',
  },
};

export default function Badge({
  variant = 'neutral',
  children,
  dot = false,
  className = '',
  ...props
}) {
  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${style.bg} ${style.text}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      )}
      {children}
    </span>
  );
}
