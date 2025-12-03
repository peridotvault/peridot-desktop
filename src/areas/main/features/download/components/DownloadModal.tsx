import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
  leftClassName?: string; // ex: "left-20"
  title?: string;
};

export default function DownloadModal({
  open,
  onClose,
  leftClassName = 'left-24',
  title = 'Peri Chat',
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel (slide from left) */}
          <motion.div
            className={[
              'fixed bottom-0 h-full w-2xl bg-background border-x border-foreground/10 shadow-2xl top-12',
              'flex flex-col z-40',
              leftClassName,
            ].join(' ')}
            role="dialog"
            aria-label="Download Modal"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 42, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col bg-amber-800 justify-between h-full">
              <p>Download</p>
              <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi, odit.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
