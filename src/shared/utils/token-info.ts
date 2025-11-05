import { ImagePERCoin } from '../../lib/constants/const-url';

export type TokenDisplayInfo = {
  principal: string;
  symbol: string;
  decimals: number;
  logo?: string;
  displayName?: string;
};

const TOKEN_REGISTRY: Record<string, TokenDisplayInfo> = {
  'b4osj-vyaaa-aaaap-an4bq-cai': {
    principal: 'b4osj-vyaaa-aaaap-an4bq-cai',
    symbol: 'PER',
    decimals: 8,
    logo: ImagePERCoin,
    displayName: 'Peridot',
  },
  'cngnf-vqaaa-aaaar-qag4q-cai': {
    principal: 'cngnf-vqaaa-aaaar-qag4q-cai',
    symbol: 'ckUSDT',
    decimals: 6,
    displayName: 'Chain-Key USDT',
  },
  'ryjl3-tyaaa-aaaaa-aaaba-cai': {
    principal: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    symbol: 'ICP',
    decimals: 8,
    displayName: 'Internet Computer',
  },
};

const DEFAULT_TOKEN: TokenDisplayInfo = {
  principal: '',
  symbol: 'PER',
  decimals: 8,
  logo: ImagePERCoin,
  displayName: 'Peridot',
};

const toNumber = (value: bigint | number | string | null | undefined): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const powerOfTen = (decimals: number): number => {
  if (decimals <= 0) return 1;
  if (decimals > 18) return 10 ** 18; // guard against overflow
  return 10 ** decimals;
};

export const resolveTokenInfo = (principal?: string | null): TokenDisplayInfo => {
  if (!principal) return DEFAULT_TOKEN;
  const normalized = principal.toLowerCase();
  return TOKEN_REGISTRY[normalized] ?? { ...DEFAULT_TOKEN, principal: normalized };
};

export const subunitsToNumber = (
  value: bigint | number | string | null | undefined,
  decimals: number,
): number => {
  const raw = toNumber(value);
  const divisor = powerOfTen(decimals);
  if (divisor === 0) return raw;
  return raw / divisor;
};

const clampFractionDigits = (decimals: number): number => {
  if (decimals <= 0) return 0;
  if (decimals <= 2) return decimals;
  return Math.min(decimals, 6);
};

export const formatTokenAmountFromRaw = (
  value: bigint | number | string | null | undefined,
  decimals: number,
): string => {
  const numeric = subunitsToNumber(value, decimals);
  if (numeric === 0) return '0';

  const maximumFractionDigits = clampFractionDigits(decimals);
  const minimumFractionDigits = numeric > 0 && numeric < 1 ? Math.min(4, maximumFractionDigits) : 0;

  return numeric.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

export const isZeroTokenAmount = (
  value: bigint | number | string | null | undefined,
  decimals: number,
): boolean => {
  return subunitsToNumber(value, decimals) <= 0;
};
