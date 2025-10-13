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
import { ButtonWithSound } from '../../components/atoms/button-with-sound';
import { Avatar } from '../../components/atoms/avatar';

interface MainSidebarProps {
  onOpenWallet: () => void;
  onOpenPeri: () => void;
  onOpenMenuAvatar: () => void;
  walletActive?: boolean;
  periActive?: boolean;
  avatarActive?: boolean;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
  onOpenWallet,
  onOpenPeri,
  onOpenMenuAvatar,
  walletActive = false,
  periActive = false,
  avatarActive = false,
}) => {
  const linkSidebar = [
    { link: '/', icon: faDungeon, label: 'Vault', exact: true },
    { link: '/library', icon: faTableCellsLarge, label: 'Library', exact: false },
    { link: '/market', icon: faStore, label: 'Market', exact: false },
  ];

  const base =
    'flex aspect-square rounded-lg text-xl items-center justify-center duration-300 active:-translate-y-1 hover:cursor-pointer';
  const active = 'text-foreground text-background bg-linear-to-tr from-accent to-accent-foreground';
  const inactive = 'hover:text-white text-muted-foreground hover:pointer-events-auto';

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
    <ButtonWithSound
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className={`${base} ${isActive ? active : inactive}`}
    >
      <FontAwesomeIcon icon={icon} />
    </ButtonWithSound>
  );

  return (
    <div className="fixed bg-background flex flex-col h-full shadow-flat-sm z-50 w-20 p-2">
      {/* List Path  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col p-1 gap-2 justify-between h-full">
          {/* Top  */}
          <div className="flex flex-col">
            <div className="p-2 mb-10">
              <img src={ImagePeridotLogo} alt="" draggable={false} />
            </div>

            {/* Actions  */}
            {linkSidebar.map((item, index) => (
              <ButtonWithSound key={index}>
                <NavLink
                  to={item.link}
                  end={item.exact}
                  className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </NavLink>
              </ButtonWithSound>
            ))}
          </div>

          {/* Bottom  */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col bg-card rounded-lg border border-foreground/10 gap-2">
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
            <hr className="my-2 border-muted-foreground/50" />
            <ButtonWithSound
              type="button"
              onClick={onOpenMenuAvatar}
              aria-label={'Menu Avatar'}
              aria-pressed={avatarActive}
              title={'Menu Avatar'}
              className="hover:cursor-pointer"
            >
              <Avatar />
            </ButtonWithSound>
          </div>
        </div>
      </div>
    </div>
  );
};
