import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'normal';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'normal',
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...options, isOpen: true });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const ConfirmDialog = useCallback(() => (
    <AnimatePresence>
      {state.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-text-main/20 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-soft-lg w-full max-w-sm p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              {state.variant === 'danger' && (
                <div className="p-2 bg-accent/10 rounded-xl flex-shrink-0">
                  <AlertTriangle size={18} className="text-accent" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-text-main">{state.title}</h3>
                <p className="text-sm text-text-sub mt-1">{state.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                {state.cancelText || '取消'}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className={state.variant === 'danger' ? 'bg-accent hover:bg-accent/90' : ''}
              >
                {state.confirmText || '确认'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  ), [state, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog };
}
