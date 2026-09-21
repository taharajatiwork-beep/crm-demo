import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState — Flexible empty/no-results placeholder.
 *
 * Props:
 *   icon        Lucide icon component (default: Inbox)
 *   title       Main heading (default: 'موردی یافت نشد')
 *   description Supporting text
 *   action      CTA button label
 *   onAction    CTA click handler
 *   illustration ReactNode — custom illustration/animation above the icon
 *   className
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'موردی یافت نشد',
  description = '',
  action,
  onAction,
  illustration,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Optional custom illustration (lottie / svg / image) */}
      {illustration && (
        <div className="mb-6 w-32 h-32 flex items-center justify-center">
          {illustration}
        </div>
      )}

      {/* Default icon fallback */}
      {!illustration && (
        <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center mb-4">
          <Icon size={28} className="text-dark-300" />
        </div>
      )}

      <h3 className="text-white font-semibold text-base mb-1">{title}</h3>

      {description && (
        <p className="text-dark-300 text-sm max-w-xs mb-4">{description}</p>
      )}

      {action && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
