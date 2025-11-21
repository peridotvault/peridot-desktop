// @ts-ignore
import React, { useState } from 'react';
import {
  faDownload,
  faHouse,
  faRobot,
  faStore,
  faTableCellsLarge,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { ButtonWithSound } from '../../shared/components/ui/ButtonWithSound';
import { Avatar } from '../../shared/components/ui/Avatar';

interface MainSidebarProps {
  onOpenWallet: () => void;
  onOpenPeri: () => void;
  onOpenMenuAvatar: () => void;
  walletActive?: boolean;
  periActive?: boolean;
  avatarActive?: boolean;
}

export const Sidebar: React.FC<MainSidebarProps> = ({
  onOpenWallet,
  onOpenPeri,
  onOpenMenuAvatar,
  walletActive = false,
  periActive = false,
  avatarActive = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const p = location.pathname;
  const isSectionActive = (base: string) => p === base || p.startsWith(base + '/');

  const linkSidebar = [
    {
      href: '/',
      isActive: p === '/' || isSectionActive('/vault'),
      icon: faHouse,
      label: 'Vault',
    },
    {
      href: '/library',
      isActive: isSectionActive('/library'),
      icon: faTableCellsLarge,
      label: 'Library',
    },
    {
      href: '/market',
      isActive: isSectionActive('/market'),
      icon: faStore,
      label: 'Market',
    },
    {
      href: '/download',
      isActive: isSectionActive('/download'),
      icon: faDownload,
      label: 'Download',
    },
  ];

  const active = 'text-accent-foreground text-2xl';
  const inactive = 'hover:text-white/80 text-muted-foreground hover:pointer-events-auto';

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
      className={`flex aspect-square w-full rounded text-xl items-center justify-center duration-300 active:-translate-y-1 overflow-hidden hover:cursor-pointer ${isActive ? 'text-foreground bg-linear-to-tr from-accent to-accent-foreground' : inactive}`}
    >
      <FontAwesomeIcon icon={icon} />
    </ButtonWithSound>
  );

  return (
    <div className="fixed top-12 left-0 bg-card flex flex-col z-50 w-16 h-[calc(100vh-3rem)]">
      {/* List Path  */}
      <aside className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-2 justify-between h-full">
          {/* Top  */}
          <div className="flex flex-col">
            {/* Actions  */}
            {linkSidebar.map((item, index) => (
              <ButtonWithSound
                key={index}
                onClick={() => navigate(item.href)}
                aria-label={item.label}
                aria-pressed={item.isActive}
                className={`flex aspect-5/4 w-full text-xl items-center justify-center duration-300 active:-translate-y-1 hover:cursor-pointer relative group ${item.isActive ? active : inactive}`}
              >
                <FontAwesomeIcon icon={item.icon} />
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] rounded-l-full bg-accent-foreground transition-all duration-200 ${item.isActive ? 'h-4/5 opacity-100' : 'h-0 opacity-0 group-hover:h-1/3 group-hover:opacity-100'} `}
                />
              </ButtonWithSound>
            ))}
          </div>

          {/* Bottom  */}
          <div className="flex flex-col gap-2 px-2">
            <div className="flex flex-col rounded border border-foreground/10">
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
      </aside>
    </div>
  );
};
