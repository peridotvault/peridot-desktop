// @ts-ignore
import React from 'react';
import {
  formatTokenAmountFromRaw,
  isZeroTokenAmount,
  resolveTokenInfo,
} from '@shared/utils/token-info';

type PriceCoinProps = {
  amount: number | string | bigint;
  tokenCanister?: string | null;
  tokenSymbol?: string;
  tokenDecimals?: number;
  tokenLogo?: string | null;
  textSize?: 'default' | 'xl' | 'lg' | 'sm' | 'xs';
};

export const PriceCoin = ({
  amount,
  tokenCanister,
  tokenSymbol,
  tokenDecimals,
  tokenLogo,
  textSize = 'default',
}: PriceCoinProps) => {
  const textSizeClass = {
    default: '',
    xl: 'text-xl',
    lg: 'text-lg',
    sm: 'text-sm',
    xs: 'text-xs',
  }[textSize];

  const resolved = resolveTokenInfo(tokenCanister ?? undefined);
  const decimals = tokenDecimals ?? resolved.decimals;
  const symbol = tokenSymbol ?? resolved.symbol;
  const logo = tokenLogo === null ? undefined : tokenLogo ?? resolved.logo;

  if (isZeroTokenAmount(amount, decimals)) {
    return (
      <div className={`${textSizeClass} flex gap-2 items-center text-start`}>
        <p>FREE</p>
      </div>
    );
  }

  const formatted = formatTokenAmountFromRaw(amount, decimals);

  return (
    <div className={`${textSizeClass} flex gap-2 items-center text-start`}>
      {logo ? <img src={logo} className="h-5 aspect-square object-contain" /> : null}
      <p>
        {formatted} {symbol}
      </p>
    </div>
  );
};
