import { UserInterface } from 'src/interfaces/user/UserInterface';
import theCurrencies from '../assets/json/currencies.json';
import { getKvItem, setKvItem } from '@shared/storage/app-db';
import { KV_KEYS } from '@shared/storage/kv-keys';
import { Currency } from '@main/features/wallet/interfaces/Currency';
import { WalletInfo } from '@main/features/wallet/interfaces/Wallet';

// ✅ User
export async function saveUserInfo(user: UserInterface) {
  try {
    await setKvItem(KV_KEYS.userInfo, user);
  } catch (error) {
    console.error('Failed to save user info', error);
  }
}

export async function getUserInfo(): Promise<UserInterface | null> {
  return (await getKvItem<UserInterface>(KV_KEYS.userInfo)) ?? null;
}

// Currency
export async function getCurrency(): Promise<Currency[] | null> {
  let currency = await getKvItem<Currency[]>(KV_KEYS.currencies);
  if (!currency) {
    currency = theCurrencies as Currency[];
    await saveCurrency(theCurrencies);
  }
  return currency;
}

export async function getCurrencyByCode(code: string): Promise<Currency | undefined> {
  const allCurrency = (await getCurrency()) as Currency[];
  const currency = allCurrency.find((item) => item.currency === code);
  return currency;
}

export async function saveCurrency(currencies: Currency[]) {
  try {
    await setKvItem(KV_KEYS.currencies, currencies);
  } catch (error) {
    console.error('Failed to save currencies', error);
  }
}

export async function saveRatesByCode(
  code: string,
  rates: number,
): Promise<Currency[] | undefined> {
  const allCurrency = (await getCurrency()) as Currency[];
  const updated = allCurrency.map((item) => {
    if (item.currency === code) {
      return { ...item, rates };
    }
    return item;
  });
  await saveCurrency(updated);
  const result = updated.filter((item) => item.currency === code);
  return result;
}

// Wallet
export async function saveCurrencyToWallet(currency: Currency) {
  try {
    const wallet = { currency: currency } as WalletInfo;
    await setKvItem(KV_KEYS.walletInfo, wallet);
  } catch (error) {
    console.error('Failed to save wallet currency', error);
  }
}

export async function getWalletInfo(): Promise<WalletInfo | null> {
  return (await getKvItem<WalletInfo>(KV_KEYS.walletInfo)) ?? null;
}
