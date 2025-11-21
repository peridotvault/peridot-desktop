// @ts-ignore
import React, { useState } from 'react';
import {
  faArrowLeftLong,
  faGamepad,
  faShapes,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';

export const StudioSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const p = location.pathname;
  const isSectionActive = (base: string) => p === base || p.startsWith(base + '/');

  const linkSidebar = [
    {
      href: '/studio',
      isActive: p === '/studio' || isSectionActive('/studio/dashboard'),
      icon: faShapes,
      label: 'Dashboard',
    },
    {
      href: '/studio/game',
      isActive: isSectionActive('/studio/game'),
      icon: faGamepad,
      label: 'Game',
    },
    {
      href: '/studio/team',
      isActive: isSectionActive('/studio/team'),
      icon: faUserFriends,
      label: 'Team',
    },
  ];

  const base =
    'flex aspect-square rounded-lg text-xl items-center justify-center duration-300 active:-translate-y-1 hover:cursor-pointer';
  const active = 'text-foreground text-background bg-linear-to-tr from-accent to-accent-foreground';
  const inactive = 'hover:text-white text-muted-foreground hover:pointer-events-auto';

  return (
    <div className="fixed bg-background flex flex-col h-full shadow-flat-sm z-50 w-20 p-2">
      {/* List Path  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col p-1 gap-2 h-full">
          {/* Top  */}
          <ButtonWithSound className="w-14 h-10 mb-4">
            <Link
              to={'/'}
              className="w-full h-full rounded-xl flex items-center justify-center border border-foreground/10 text-muted-foreground duration-300 shadow-sunken-sm text-center text-lg  hover:text-foreground"
            >
              <FontAwesomeIcon icon={faArrowLeftLong} />
            </Link>
          </ButtonWithSound>

          {/* Actions  */}
          <div className="flex flex-col">
            {linkSidebar.map((item, index) => (
              <ButtonWithSound
                key={index}
                onClick={() => navigate(item.href)} // atau navigate('/')
                aria-label={item.label}
                aria-pressed={item.isActive}
                className={`${base} ${item.isActive ? active : inactive}`}
              >
                <FontAwesomeIcon icon={item.icon} />
              </ButtonWithSound>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
