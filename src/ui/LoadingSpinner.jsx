import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: { icon: 16, text: 'text-xs' },
  md: { icon: 24, text: 'text-sm' },
  lg: { icon: 36, text: 'text-base' },
};

/**
 * LoadingSpinner — Animated spinner with optional text.
 *
 * Props:
 *   size     'sm' | 'md' | 'lg'
 *   text     Persian label shown below spinner
 *   overlay  Full-viewport overlay mode (centered, semi-transparent bg)
 *   className
 */
export default function LoadingSpinner({
  size = 'md',
  text = '',
  overlay = false,
  className = '',
}) {
  const cfg = sizeMap[size] || sizeMap.md;

  const inner = (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
      <Loader2 size={cfg.icon} className="text-accent animate-spin" />
      {text && <p className={`text-dark-200 ${cfg.text}`}>{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/70 backdrop-blur-sm"
        role="status"
        aria-label={text || 'در حال بارگذاری...'}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={cfg.icon} className="text-accent animate-spin" />
          {text && <p className={`text-dark-200 ${cfg.text}`}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div role="status" aria-label={text || 'در حال بارگذاری...'}>
      {inner}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div
            className="h-4 bg-dark-600 rounded animate-shimmer"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}
