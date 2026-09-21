import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: { icon: 16, text: 'text-xs' },
  md: { icon: 24, text: 'text-sm' },
  lg: { icon: 36, text: 'text-base' },
};

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
  const cfg = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
      <Loader2
        size={cfg.icon}
        className="text-accent animate-spin"
      />
      {text && (
        <p className={`text-dark-200 ${cfg.text}`}>{text}</p>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div
            className="h-4 bg-dark-700 rounded animate-pulse"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}
