// @ts-ignore
import React from 'react';

export const Nft = () => {
  const formatUsd = (value: string | null, decimalPlaces: number = 2): string => {
    if (value === null) return '';
    const number = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: decimalPlaces,
    }).format(number);
  };

  return (
    <div className="bg-background_primary h-full p-6 flex flex-col gap-8">
      {/* Header  */}
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold">NFTs</p>
      </div>

      {/* Content  */}
      <div className="flex flex-col gap-5">
        <button
          onClick={() => {}}
          className="flex gap-4 items-center justify-between hover:scale-105 duration-300"
        >
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 shadow-arise-sm rounded-xl flex justify-center items-center">
              <img src={''} className="size-5" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <p>{'Katana Sword'}</p>
              <p className="text-xs">{'Assassin Creed'}</p>
            </div>
          </div>

          {/* price  */}
          <div className="flex flex-col items-end">
            <p>{formatUsd((parseFloat('3829') * parseFloat('342')).toLocaleString(), 5)}</p>
            <p className="text-xs text-text_disabled">{formatUsd('3829')}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
