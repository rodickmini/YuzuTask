import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((toast: ToastItem) => void)[] = [];

export function showToast(message: string, type: ToastItem['type'] = 'success') {
  const toast: ToastItem = { id: Date.now().toString(), message, type };
  toastListeners.forEach(fn => fn(toast));
}

const icons = {
  success: <Check size={16} className="text-mint" />,
  error: <AlertCircle size={16} className="text-accent" />,
  info: <Info size={16} className="text-primary" />,
};

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (toast: ToastItem) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== handler);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-soft-lg text-sm text-text-main"
          >
            {icons[toast.type]}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
