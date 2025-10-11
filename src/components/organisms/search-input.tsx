// @ts-ignore
import React from 'react';
import { LiquidGlassComponent } from '../atoms/liquid-glass';

export const SearchInput = () => {
  return (
    <input
      type="text"
      placeholder="Search Games..."
      className="placeholder:text-white font-normal text-base py-3 px-6 rounded-lg shadow-sunken-sm border border-white/10 outline-none focus:scale-105 duration-300 w-full bg-background_primary"
    />
  );
};
