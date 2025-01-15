// @ts-ignore
import React from "react";

export const PriceCoin = ({ price }: { price: number }) => {
  if (price <= 0) {
    return (
      <div className="flex gap-2 items-center text-start">
        <p>FREE</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center text-start">
      <img
        src="./assets/coin-peridot.png"
        className="h-5 aspect-square object-contain"
      />
      <p>{price.toLocaleString()} PER</p>
    </div>
  );
};
