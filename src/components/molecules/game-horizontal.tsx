// @ts-ignore
import React from 'react';
import { PriceCoin } from '../../lib/constants/const-price';
import { Link } from 'react-router-dom';

export const GameHorizontal = ({
  gameId,
  gameName,
  imgUrl,
  price,
}: {
  gameId: string;
  gameName: string;
  imgUrl: string;
  price: number;
}) => {
  const convertedPrice = Number(price) / 1e8;
  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, '_');
  };
  return (
    <Link
      to={`/${formatTitle(gameName)}/${gameId}`}
      className="flex gap-3 items-center py-2 rounded-md h-32 group"
    >
      <div className="h-full aspect-[3/4] bg-background_disabled rounded-md overflow-hidden">
        <img
          src={imgUrl}
          alt={gameName}
          className="w-full h-full object-cover group-hover:scale-105 duration-300"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span aria-label="game-name" className="font-bold line-clamp-1">
          Peridot Game
        </span>
        {/* price  */}
        <PriceCoin price={convertedPrice} />
      </div>
    </Link>
  );
};
