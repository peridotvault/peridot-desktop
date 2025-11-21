import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useMatch, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faImage,
  faBoxArchive,
  faUpload,
  // faBullhorn,
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';

interface GameProps {
  leftClassName?: string; // sejajarkan dg lebar sidebar: "left-20" dll
}

type Item = {
  segment: string; // 'details' | 'media' | 'builds' | 'market'
  label: string;
  icon: IconProp;
};

const items: Item[] = [
  { segment: 'details', label: 'Details', icon: faUser },
  { segment: 'media', label: 'Media Upload', icon: faImage },
  { segment: 'builds', label: 'Builds', icon: faBoxArchive },
  // { segment: 'market', label: 'Items Market', icon: faStore },
  { segment: 'publish', label: 'Publish', icon: faUpload },
  // { segment: 'announcements', label: 'Announcements', icon: faBullhorn },
];

export const StudioGameSidebar: React.FC<GameProps> = ({ leftClassName = 'left-20' }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const base = `/studio/game/${gameId}`; // base route untuk game ini

  const baseClass = 'duration-300 rounded-lg flex items-center py-1 px-1 ';
  const activeClass = 'text-foreground bg-gradient-to-tr from-accent to-accent-foreground';
  const inactiveClass = 'hover:text-foreground text-muted-foreground ';

  const NavItem: React.FC<{ item: Item }> = ({ item }) => {
    const to = `${base}/${item.segment}`;

    const matchSection = useMatch(`${base}/${item.segment}/*`);
    const matchIndex = useMatch(base); // index route
    const isActive = !!matchSection || (item.segment === 'details' && !!matchIndex);

    return (
      <ButtonWithSound>
        <NavLink
          to={to}
          className={isActive ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`}
          aria-label={item.label}
        >
          <div className="w-10 h-10 flex justify-center items-center">
            <FontAwesomeIcon icon={item.icon} />
          </div>
          <label className="cursor-pointer">{item.label}</label>
        </NavLink>
      </ButtonWithSound>
    );
  };

  return (
    <AnimatePresence>
      {/* Panel */}
      <motion.aside
        role="sidebar"
        aria-modal="true"
        aria-label="Studio Game"
        className={[
          'fixed top-0 h-full w-[220px] bg-background border-r border-foreground/10 shadow-2xl',
          'flex flex-col z-40 px-4',
          leftClassName,
        ].join(' ')}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 480, damping: 42, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-16" />
        <section className="flex flex-col">
          {items.map((it) => (
            <NavItem key={it.segment} item={it} />
          ))}
        </section>
      </motion.aside>
    </AnimatePresence>
  );
};
