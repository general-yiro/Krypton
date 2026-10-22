import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[90vh]',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative w-full lg:max-w-xl ${maxHeight} bg-[#0c1220] border border-slate-800 rounded-t-3xl lg:rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden text-slate-100`}
          >
            {/* Grab handle for mobile touch */}
            <div className="w-full pt-3 pb-1 flex justify-center lg:hidden">
              <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
            </div>

            {/* Header */}
            {(title || subtitle) && (
              <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div>
                  {title && (
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
