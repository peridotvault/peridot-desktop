// @ts-ignore
import React from 'react';
import { faClock, faGear, faHouse, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';

interface WalletNavigationProps {
  activeNav: string;
  setActiveNav: React.Dispatch<React.SetStateAction<NavItem>>;
}

export type NavItem = 'home' | 'nft' | 'history' | 'settings';

export const WalletNavigation: React.FC<WalletNavigationProps> = ({ activeNav, setActiveNav }) => {
  const navLists: { title: NavItem; icon: any }[] = [
    { title: 'home', icon: faHouse },
    { title: 'nft', icon: faShapes },
    { title: 'history', icon: faClock },
    { title: 'settings', icon: faGear },
  ];

  const baseBtn =
    'relative flex flex-col items-center justify-center gap-1 w-14 h-[4.5rem] text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent_primary/60 rounded-md transition-colors';
  const inactiveBtn = 'text-white/30 hover:text-white/60';
  const activeBtn = 'text-accent_primary';

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const idx = navLists.findIndex((n) => n.title === activeNav);
    if (idx < 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveNav(navLists[(idx + 1) % navLists.length].title);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveNav(navLists[(idx - 1 + navLists.length) % navLists.length].title);
    }
  };

  return (
    <nav
      className="shadow-flat-sm px-8 flex justify-between gap-4 border-t border-white/10 bg-background_primary"
      role="tablist"
      aria-label="Wallet navigation"
      onKeyDown={onKeyDown}
    >
      {navLists.map((item) => {
        const isActive = activeNav === item.title;
        return (
          <button
            key={item.title}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            title={item.title}
            className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
            onClick={() => setActiveNav(item.title)}
          >
            {/* indikator aktif di TOP dengan animasi shared layoutId */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="wallet-nav-indicator"
                  className="absolute left-0 right-0 top-0 h-0.5 bg-accent_primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </AnimatePresence>

            <FontAwesomeIcon icon={item.icon} />
          </button>
        );
      })}
    </nav>
  );
};
