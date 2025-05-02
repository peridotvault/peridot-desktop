// @ts-ignore
import React from "react";

export const ButtonTransaction = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-lg rounded-lg font bg-gradient-to-tr from-accent_primary to-accent_secondary p-2 hover:scale-105 duration-300 font-bold"
    >
      {text}
    </button>
  );
};
