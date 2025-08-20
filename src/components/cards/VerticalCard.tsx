// @ts-ignore
import React from "react";
import { PriceCoin } from "./PriceCoin";
import { Link } from "react-router-dom";

export const VerticalCard = ({
  appId,
  imgUrl,
  title,
  price,
}: {
  appId: bigint;
  imgUrl: string;
  title: string;
  price: bigint;
}) => {
  const convertedPrice = Number(price) / 1e8;
  // const convertedPrice = Number(price);
  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, "_");
  };
  return (
    <Link
      to={`/${formatTitle(title)}/${Number(appId)}`}
      className="w-full max-w-[300px] flex flex-col gap-3 group"
    >
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
      <PriceCoin price={convertedPrice} />
    </Link>
  );
};
