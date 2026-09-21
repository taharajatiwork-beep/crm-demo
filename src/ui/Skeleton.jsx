/**
 * Skeleton — Shimmer loading placeholders for dark RTL theme.
 *
 * Exports:
 *   SkeletonText   – 1-N lines of text-shaped placeholders
 *   SkeletonCard   – Card-shaped placeholder (icon + text blocks)
 *   SkeletonTable  – Table rows with column-shaped bars
 *   SkeletonAvatar – Circle avatar placeholder
 *   Skeleton       – Base primitive (width/height/radius/className)
 */

/* ---------- base primitive ---------- */

export function Skeleton({
  width = '100%',
  height = 12,
  rounded = 'rounded-md',
  className = '',
  style,
  ...props
}) {
  return (
    <div
      className={`bg-dark-600 animate-pulse ${rounded} ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ---------- SkeletonText ---------- */

export function SkeletonText({ lines = 3, className = '' }) {
  const widths = ['100%', '85%', '70%', '90%', '60%'];
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={widths[i % widths.length]}
          height={12}
          rounded="rounded-md"
        />
      ))}
    </div>
  );
}

/* ---------- SkeletonAvatar ---------- */

export function SkeletonAvatar({ size = 40, className = '' }) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="rounded-full"
      className={className}
    />
  );
}

/* ---------- SkeletonCard ---------- */

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-dark-800 border border-dark-600 rounded-xl p-5 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/* ---------- SkeletonTable ---------- */

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  const colWidths = [30, 25, 20, 15]; // percentages for 4 cols
  return (
    <div
      className={`bg-dark-800 border border-dark-600 rounded-xl overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* header row */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-dark-600">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton
            key={c}
            width={`${colWidths[c % colWidths.length]}%`}
            height={10}
          />
        ))}
      </div>
      {/* body rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 px-4 py-3 border-b border-dark-700 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              width={`${colWidths[c % colWidths.length]}%`}
              height={12}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
