// @ts-ignore
import React from 'react';
import { faClock, faGear, faHouse, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface WalletNavigationProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const WalletNavigation: React.FC<WalletNavigationProps> = ({ activeNav, setActiveNav }) => {
  const navLists = [
    { title: 'home', icon: faHouse },
    { title: 'nft', icon: faShapes },
    { title: 'history', icon: faClock },
    { title: 'settings', icon: faGear },
  ];
  const getButtonClass = (name: string) =>
    `flex flex-col items-center justify-center gap-1 border-t-2 ${
      activeNav === name
        ? 'border-accent_primary text-accent_primary'
        : 'border-background_disabled/0 text-white/20'
    } text-2xl w-14 h-[4.5rem]`;
  return (
    <nav className=" shadow-flat-sm px-8 flex justify-between gap-4">
      {navLists.map((item, index) => (
        <button
          key={index}
          className={getButtonClass(item.title)}
          onClick={() => setActiveNav(item.title)}
        >
          <FontAwesomeIcon icon={item.icon} />
        </button>
      ))}
    </nav>
  );
};
