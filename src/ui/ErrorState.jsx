import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'خطایی رخ داد',
  message = '',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-danger" />
      </div>

      <h3 className="text-white font-semibold text-base mb-1">{title}</h3>

      {message && (
        <p className="text-dark-300 text-sm max-w-sm mb-4">{message}</p>
      )}

      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          تلاش مجدد
        </Button>
      )}
    </div>
  );
}
