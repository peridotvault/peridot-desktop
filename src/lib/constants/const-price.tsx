// @ts-ignore
import React from 'react';
import { ImagePERCoin } from './const-url';

export const PriceCoin = ({
  price,
  textSize = 'default',
}: {
  price: number;
  textSize?: 'default' | 'xl' | 'lg' | 'sm' | 'xs';
}) => {
  const textSizeClass = {
    default: '',
    xl: 'text-xl',
    lg: 'text-lg',
    sm: 'text-sm',
    xs: 'text-xs',
  }[textSize];
  const convertedPrice = Number(price) / 1e8;

  if (price <= 0) {
    return (
      <div className={textSizeClass + ' flex gap-2 items-center text-start'}>
        <p>FREE</p>
      </div>
    );
  }

  return (
    <div className={textSizeClass + ' flex gap-2 items-center text-start'}>
      <img src={ImagePERCoin} className="h-5 aspect-square object-contain" />
      <p>{convertedPrice} PER</p>
    </div>
  );
};
