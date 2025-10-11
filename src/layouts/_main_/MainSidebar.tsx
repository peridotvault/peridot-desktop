// @ts-ignore
import React, { useState } from 'react';
import {
  faDungeon,
  faRobot,
  faStore,
  faTableCellsLarge,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { ImagePeridotLogo } from '../../lib/constants/const-url';

interface MainSidebarProps {
  onOpenWallet: () => void;
  onOpenPeri: () => void;
  walletActive?: boolean;
  periActive?: boolean;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
  onOpenWallet,
  onOpenPeri,
  walletActive = false,
  periActive = false,
}) => {
  const linkSidebar = [
    { link: '/', icon: faDungeon, label: 'Vault', exact: true },
    { link: '/library', icon: faTableCellsLarge, label: 'Library', exact: false },
    { link: '/market', icon: faStore, label: 'Market', exact: false },
  ];

  const base =
    'p-4 flex aspect-square rounded-lg text-xl items-center justify-center duration-300 text-text_disabled';
  const active =
    'text-white text-background_primary bg-gradient-to-tr from-accent_primary to-accent_secondary';
  const inactive = 'hover:text-white';

  const ActionBtn = ({
    icon,
    label,
    onClick,
    isActive,
  }: {
    icon: FontAwesomeIconProps['icon'];
    label: string;
    onClick: () => void;
    isActive: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className={`${base} ${isActive ? active : inactive}`}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );

  return (
    <div className="fixed bg-background_primary flex flex-col h-full shadow-flat-sm z-50 w-20 p-2">
      {/* List Path  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col p-2 gap-2 justify-between h-full">
          {/* Top  */}
          <div className="flex flex-col gap-2">
            <div className="p-2 mb-8">
              <img src={ImagePeridotLogo} alt="" />
            </div>

            {/* Actions  */}
            {linkSidebar.map((item, index) => (
              <NavLink
                key={index}
                to={item.link}
                end={item.exact}
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
                aria-label={item.label}
                title={item.label}
              >
                <FontAwesomeIcon icon={item.icon} />
              </NavLink>
            ))}
          </div>

          {/* Bottom  */}
          <div className="flex flex-col mb-2 gap-2">
            <ActionBtn
              icon={faRobot}
              label="Peri Chatbot"
              onClick={onOpenPeri}
              isActive={periActive}
            />
            <ActionBtn
              icon={faWallet}
              label="Wallet"
              onClick={onOpenWallet}
              isActive={walletActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
