import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'موردی یافت نشد',
  description = '',
  action,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-300" />
      </div>

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
