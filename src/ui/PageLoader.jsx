import { Loader2 } from 'lucide-react';

/**
 * PageLoader — Full-page loading indicator shown during page transitions.
 * Centered spinner + text, fills the viewport with a semi-transparent overlay.
 */
export default function PageLoader({ text = 'در حال بارگذاری...' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-900/80 backdrop-blur-sm"
      role="status"
      aria-label={text}
    >
      <Loader2 size={36} className="text-accent animate-spin mb-4" />
      <p className="text-dark-200 text-sm">{text}</p>
    </div>
  );
}
