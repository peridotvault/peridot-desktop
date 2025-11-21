// @ts-ignore
import React from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LoadingPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full flex justify-center text-3xl animate-pulse opacity-80">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
      </div>
    </div>
  );
};
