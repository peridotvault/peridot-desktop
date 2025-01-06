// @ts-ignore
import React from "react";
import { PriceCoin } from "./PriceCoin";
import { Link } from "react-router-dom";

export const VerticalCard = ({
  imgUrl,
  title,
  price,
}: {
  imgUrl: string;
  title: string;
  price: number;
}) => {
  return (
    <Link to="/gamename" className="w-full flex flex-col gap-3 group">
      <div className="w-full aspect-[3/4] overflow-hidden bg-white rounded-xl duration-300">
        <img
          src={imgUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 duration-300"
        />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <p className="text-sm text-disabled_text">Base Game</p>
        <p className="font-bold text-lg text-start line-clamp-2">{title}</p>
      </div>
      {/* price  */}
      <PriceCoin price={price} />
    </Link>
  );
};
