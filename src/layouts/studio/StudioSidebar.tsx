// @ts-ignore
import React, { useState } from 'react';
import { faGamepad, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

export const StudioSidebar = () => {
  const linkSidebar = [
    { link: '/studio', icon: faShapes, label: 'Dashboard', exact: true },
    { link: '/studio/create', icon: faGamepad, label: 'Create', exact: false },
  ];

  const base =
    'mx-4 my-2 flex aspect-square text-xl rounded-lg items-center justify-center duration-300 hover:shadow-flat-sm';

  const active = 'text-white shadow-flat-sm';
  const inactive = 'opacity-70 hover:opacity-100';

  return (
    <div className="flex flex-col h-full shadow-flat-sm z-10 py-4">
      {/* List Path  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col">
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
      </div>
    </div>
  );
};
