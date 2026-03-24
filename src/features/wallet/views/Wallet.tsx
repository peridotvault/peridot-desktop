import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavItem, WalletNavigation } from '../components/WalletNavigation';
import { Home } from './Home';
import { History } from './History';
import { Nft } from './Nft';
import { Settings } from './Settings';

interface WalletProps {
  open: boolean;
  onClose: () => void;
  leftClassName?: string; // sejajarkan dg lebar sidebar: "left-20" dll
}

export const Wallet: React.FC<WalletProps> = ({ open, onClose, leftClassName = 'left-24' }) => {
  const [activeNav, setActiveNav] = useState<NavItem>('home');

  // Lock scroll belakang + ESC untuk close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // lock scroll behind modal (opsional)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Wallet"
            className={[
              'fixed bottom-0 w-md bg-background border-r border-foreground/10 shadow-2xl top-12',
              'flex flex-col justify-between z-40', // di atas backdrop
              leftClassName,
            ].join(' ')}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 42, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CONTENT */}
            {activeNav === 'home' ? (
              <Home />
            ) : activeNav === 'nft' ? (
              <Nft />
            ) : activeNav === 'history' ? (
              <History />
            ) : activeNav === 'settings' ? (
              <Settings />
            ) : (
              <div />
            )}

            {/* NAVIGATION */}
            <WalletNavigation activeNav={activeNav} setActiveNav={setActiveNav} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
