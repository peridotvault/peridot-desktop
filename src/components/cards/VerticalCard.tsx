// @ts-ignore
import React from 'react';
import { Link } from 'react-router-dom';
import { PriceCoin } from '@shared/lib/constants/const-price';

export const VerticalCard = ({
  gameId,
  gameName,
  imgUrl,
  price,
  tokenCanister,
  tokenSymbol,
  tokenDecimals,
  tokenLogo,
}: {
  gameId: string;
  gameName: string;
  imgUrl: string;
  price: number | string | bigint;
  tokenCanister?: string | null;
  tokenSymbol?: string;
  tokenDecimals?: number;
  tokenLogo?: string | null;
}) => {
  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, '_');
  };
  return (
    <Link
      to={`/vault/${formatTitle(gameName)}/${gameId}`}
      className="w-full max-w-[250px] flex flex-col gap-3 group"
    >
      <div className="w-full aspect-3/4 overflow-hidden bg-muted rounded-xl duration-300">
        <img
          src={imgUrl}
          alt={gameName}
          className="w-full h-full object-cover group-hover:scale-105 duration-300"
        />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <p className="text-sm text-disabled_text">Base Game</p>
        <p className="font-bold text-lg text-start line-clamp-2">{gameName}</p>
      </div>
      {/* price  */}
      <PriceCoin
        amount={price ?? 0}
        tokenCanister={tokenCanister}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
        tokenLogo={tokenLogo}
      />
    </Link>
  );
};
