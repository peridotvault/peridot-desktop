// @ts-ignore
import React from 'react';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const StarComponent = ({ rate }: { rate: number }) => {
  return (
    <div className="flex gap-2 text-sm items-center">
      <div className="flex gap-1">
        <FontAwesomeIcon
          icon={faStar}
          className={`${rate >= 1 ? 'text-accent_primary' : 'text-white/20'}`}
        />
        <FontAwesomeIcon
          icon={faStar}
          className={`${rate >= 2 ? 'text-accent_primary' : 'text-white/20'}`}
        />
        <FontAwesomeIcon
          icon={faStar}
          className={`${rate >= 3 ? 'text-accent_primary' : 'text-white/20'}`}
        />
        <FontAwesomeIcon
          icon={faStar}
          className={`${rate >= 4 ? 'text-accent_primary' : 'text-white/20'}`}
        />
        <FontAwesomeIcon
          icon={faStar}
          className={`${rate >= 5 ? 'text-accent_primary' : 'text-white/20'}`}
        />
      </div>
      <p>{rate}</p>
    </div>
  );
};
