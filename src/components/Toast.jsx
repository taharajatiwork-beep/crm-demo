import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (visible) {
      const exitTimer = setTimeout(() => setVisible(false), 2700);
      return () => clearTimeout(exitTimer);
    }
  }, [visible]);

  const borderColor = {
    success: 'border-success',
    error: 'border-danger',
    info: 'border-info',
  }[toast.type] || 'border-info';

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  }[toast.type] || Info;

  const iconColor = {
    success: 'text-success',
    error: 'text-danger',
    info: 'text-info',
  }[toast.type] || 'text-info';

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 bg-dark-700 border ${borderColor} border-r-[3px] 
        rounded-lg shadow-xl shadow-black/30 min-w-[280px] max-w-[380px]
        transition-all duration-300 ease-out pointer-events-auto
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
      dir="rtl"
    >
      <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
      <span className="text-white text-sm flex-1 leading-relaxed">
        {toast.message}
      </span>
    </div>
  );
}

export function ToastContainer({ toasts = [] }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col-reverse gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

/* Standalone hook for managing toasts in any component */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, visible: false }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return { toasts, toast };
}
