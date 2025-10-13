import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '../atoms/avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faGamepad,
  faGear,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

type Props = {
  open: boolean;
  onClose: () => void;
  leftClassName?: string; // ex: "left-20"
  title?: string;
  storageKey?: string;
};

export const MenuAvatar = ({ open, onClose, leftClassName = 'left-24' }: Props) => {
  const list = [
    {
      label: 'View Account',
      icon: faUser,
    },
    {
      label: 'Studio',
      icon: faGamepad,
    },
    {
      label: 'Settings',
      icon: faGear,
    },
  ];
  // Lock scroll belakang + ESC untuk close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // lock scroll behind modal (opsional)
  React.useEffect(() => {
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel (slide from left) */}
          <motion.div
            className={[
              'fixed bottom-4 w-60 p-4 bg-background border-foreground/10 rounded-lg',
              'flex flex-col gap-2 z-40',
              leftClassName,
            ].join(' ')}
            role="dialog"
            aria-label="Menu Avatar"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 42, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User  */}
            <section className="flex gap-4 items-center pb-1">
              <Avatar />
              <div className="flex flex-col gap-1">
                <span className="font-bold leading-4">Ifal</span>
                <span className="text-sm leading-3">m@example.com</span>
              </div>
            </section>
            <hr className="border-foreground/10" />
            {/* Main  */}
            <section className="flex flex-col">
              {list.map((item, index) => (
                <div key={index} className="hover:bg-foreground/10 rounded-lg flex items-center">
                  <div className="w-10 h-10 flex justify-center items-center text-muted-foreground">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <label htmlFor={item.label}>{item.label}</label>
                </div>
              ))}
            </section>
            <hr className="border-foreground/10" />
            <section className="hover:bg-foreground/10 rounded-lg flex items-center text-chart-5">
              <div className="w-10 h-10 flex justify-center items-center">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </div>
              <label htmlFor={'Log out'}>{'Log out'}</label>
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
