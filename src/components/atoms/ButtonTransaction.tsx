// @ts-ignore
import React from 'react';

export const ButtonTransaction = ({
  text,
  onClick,
  disabled = false,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-lg rounded-lg font bg-gradient-to-tr from-accent_primary to-accent_secondary p-2  duration-300 font-bold ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
